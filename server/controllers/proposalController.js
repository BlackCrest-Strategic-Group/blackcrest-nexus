import { PassThrough } from 'stream';

const REQUIRED_KEYS = ['partNumber', 'description', 'quantity', 'cost', 'markup', 'mfgLeadTime', 'deliveryLeadTime'];

const HEADERS_MAP = {
  partnumber: 'partNumber',
  part_number: 'partNumber',
  pn: 'partNumber',
  description: 'description',
  desc: 'description',
  quantity: 'quantity',
  qty: 'quantity',
  cost: 'cost',
  unitcost: 'cost',
  markup: 'markup',
  markuppercent: 'markup',
  mfgleadtime: 'mfgLeadTime',
  manufactureleadtime: 'mfgLeadTime',
  deliveryleadtime: 'deliveryLeadTime',
  shipleadtime: 'deliveryLeadTime'
};

const normalizeHeader = (h = '') => h.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
const toNum = (v) => Number.parseFloat(v || 0) || 0;

function calcItem(item) {
  const quantity = toNum(item.quantity);
  const cost = toNum(item.cost);
  const markup = toNum(item.markup);
  const mfgLeadTime = toNum(item.mfgLeadTime);
  const deliveryLeadTime = toNum(item.deliveryLeadTime);
  const sellPrice = cost * (1 + markup);
  const extendedPrice = quantity * sellPrice;
  const totalLeadTime = mfgLeadTime + deliveryLeadTime;

  return { ...item, quantity, cost, markup, mfgLeadTime, deliveryLeadTime, sellPrice, extendedPrice, totalLeadTime };
}

function normalizeRows(rows = []) {
  return rows
    .map((row) => {
      const mapped = {};
      Object.entries(row || {}).forEach(([k, v]) => {
        const key = HEADERS_MAP[normalizeHeader(k)] || k;
        mapped[key] = v;
      });
      REQUIRED_KEYS.forEach((key) => {
        if (!(key in mapped)) mapped[key] = key === 'description' || key === 'partNumber' ? '' : 0;
      });
      return calcItem(mapped);
    })
    .filter((row) => row.partNumber || row.description);
}

async function loadXlsxModule() {
  try {
    return await import('xlsx');
  } catch (_error) {
    const err = new Error('xlsx package is required for spreadsheet parsing');
    err.code = 'MISSING_XLSX';
    throw err;
  }
}

export async function uploadProposal(req, res) {
  try {
    if (!req.file?.buffer) return res.status(400).json({ success: false, error: 'Spreadsheet file is required' });
    const XLSX = await loadXlsxModule();
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const name = wb.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' });
    const lineItems = normalizeRows(rows);
    return res.json({ success: true, sheetName: name, lineItems });
  } catch (error) {
    return res.status(error.code === 'MISSING_XLSX' ? 503 : 500).json({ success: false, error: error.message });
  }
}

export async function generateProposal(req, res) {
  const lineItems = normalizeRows(req.body?.lineItems || []);
  const totalProposalValue = lineItems.reduce((sum, item) => sum + item.extendedPrice, 0);
  const maxLeadTime = lineItems.reduce((max, item) => Math.max(max, item.totalLeadTime), 0);

  const enhancedLineItems = lineItems.map((item) => ({
    ...item,
    aiDescription: item.description ? `${item.description}`.replace(/\s+/g, ' ').trim() : 'No description provided',
    suggestedMarkup: item.markup < 0.15 ? 0.15 : item.markup
  }));

  const summary = `BlackCrest Nexus prepared a ${lineItems.length}-line proposal valued at $${totalProposalValue.toFixed(2)} with up to ${maxLeadTime} days total lead time.`;
  const proposalText = {
    terms: 'Pricing valid for 30 days. Taxes, duties, and expedited logistics are excluded unless explicitly noted.',
    delivery: `Standard delivery aligns to aggregated lead time profile, with an estimated maximum of ${maxLeadTime} days after award.`,
    scope: 'Scope includes sourcing, fulfillment coordination, QA validation, and delivery tracking for all listed line items.'
  };

  return res.json({
    success: true,
    proposal: {
      lineItems: enhancedLineItems,
      totals: { totalProposalValue, totalLeadTime: maxLeadTime },
      executiveSummary: summary,
      language: proposalText,
      fundingOpportunity: totalProposalValue > Number(req.body?.fundingThreshold || 100000)
        ? { eligible: true, reason: 'Proposal value exceeds funding threshold for financing options.' }
        : { eligible: false }
    }
  });
}

export async function downloadProposalPdf(req, res) {
  try {
    const PDFKit = (await import('pdfkit')).default;
    const { proposal } = req.body || {};
    if (!proposal) return res.status(400).json({ success: false, error: 'proposal payload is required' });

    const doc = new PDFKit({ margin: 50, size: 'A4' });
    const stream = new PassThrough();
    doc.pipe(stream);

    doc.fontSize(20).text('BlackCrest Nexus Proposal', { align: 'left' });
    doc.moveDown(0.5).fontSize(11).fillColor('#555').text(new Date().toISOString().slice(0, 10));
    doc.moveDown().fillColor('#000').fontSize(12).text(proposal.executiveSummary || '');

    doc.moveDown().fontSize(13).text('Line Items', { underline: true });
    (proposal.lineItems || []).forEach((item) => {
      doc.fontSize(10).text(`${item.partNumber} | ${item.aiDescription} | Qty ${item.quantity} | $${item.extendedPrice.toFixed(2)}`);
    });

    doc.moveDown().fontSize(12).text(`Total Proposal Value: $${(proposal.totals?.totalProposalValue || 0).toFixed(2)}`);
    doc.text(`Lead Time: ${proposal.totals?.totalLeadTime || 0} days`);
    doc.moveDown().text('Terms', { underline: true }).fontSize(10).text(proposal.language?.terms || '');
    doc.text('Delivery', { underline: true }).text(proposal.language?.delivery || '');
    doc.text('Scope', { underline: true }).text(proposal.language?.scope || '');
    doc.end();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=proposal.pdf');
    stream.pipe(res);
  } catch (error) {
    return res.status(503).json({ success: false, error: 'pdfkit package is required for PDF generation' });
  }
}
