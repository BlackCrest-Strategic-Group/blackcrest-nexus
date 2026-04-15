function formatDate(dateValue) {
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function buildBlanketStructure(rows = []) {
  if (!rows.length) {
    return {
      header: null,
      lines: []
    };
  }

  const releaseDates = rows
    .map((row) => formatDate(row.releaseDate))
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b));

  const header = {
    supplier: rows[0].supplier,
    startDate: releaseDates[0] || null,
    endDate: releaseDates[releaseDates.length - 1] || null,
    lineCount: rows.length
  };

  const grouped = rows.reduce((acc, row) => {
    const groupKey = [row.partNumber, row.description, row.uom, row.unitPrice].join("|");
    if (!acc[groupKey]) {
      acc[groupKey] = {
        partNumber: row.partNumber,
        description: row.description,
        uom: row.uom,
        unitPrice: row.unitPrice,
        totalQty: 0,
        totalValue: 0,
        releases: []
      };
    }

    const group = acc[groupKey];
    group.totalQty += row.qty;
    group.totalValue += row.qty * row.unitPrice;
    group.releases.push({
      releaseDate: formatDate(row.releaseDate),
      qty: row.qty,
      lineValue: row.qty * row.unitPrice,
      rowNumber: row.rowNumber
    });

    return acc;
  }, {});

  const lines = Object.values(grouped)
    .map((line) => ({
      ...line,
      releases: line.releases.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
    }))
    .sort((a, b) => a.partNumber.localeCompare(b.partNumber));

  return {
    header,
    lines
  };
}
