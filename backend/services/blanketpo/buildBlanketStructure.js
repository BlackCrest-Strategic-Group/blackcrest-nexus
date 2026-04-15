function formatIso(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function buildBlanketStructure(rows = []) {
  const blanketMap = new Map();

  rows.forEach((row) => {
    const supplierKey = row.supplier.trim();

    if (!blanketMap.has(supplierKey)) {
      blanketMap.set(supplierKey, {
        supplier: row.supplier,
        blanketStartDate: formatIso(row.blanketStartDate || row.releaseDate),
        blanketEndDate: formatIso(row.blanketEndDate || row.releaseDate),
        itemsMap: new Map(),
        releaseCount: 0,
        totalValue: 0
      });
    }

    const blanket = blanketMap.get(supplierKey);

    const effectiveStart = formatIso(row.blanketStartDate || row.releaseDate);
    const effectiveEnd = formatIso(row.blanketEndDate || row.releaseDate);

    if (effectiveStart && (!blanket.blanketStartDate || new Date(effectiveStart) < new Date(blanket.blanketStartDate))) {
      blanket.blanketStartDate = effectiveStart;
    }

    if (effectiveEnd && (!blanket.blanketEndDate || new Date(effectiveEnd) > new Date(blanket.blanketEndDate))) {
      blanket.blanketEndDate = effectiveEnd;
    }

    const itemKey = `${row.item}|${row.unitPrice}|${row.uom || ""}`;

    if (!blanket.itemsMap.has(itemKey)) {
      blanket.itemsMap.set(itemKey, {
        item: row.item,
        description: row.description || null,
        uom: row.uom || null,
        unitPrice: row.unitPrice,
        totalQty: 0,
        totalValue: 0,
        releases: []
      });
    }

    const itemGroup = blanket.itemsMap.get(itemKey);
    const lineValue = row.qty * row.unitPrice;

    itemGroup.totalQty += row.qty;
    itemGroup.totalValue += lineValue;
    itemGroup.releases.push({
      rowNumber: row.rowNumber,
      releaseDate: formatIso(row.releaseDate),
      qty: row.qty,
      lineValue
    });

    blanket.releaseCount += 1;
    blanket.totalValue += lineValue;
  });

  const blankets = [...blanketMap.values()].map((blanket) => {
    const items = [...blanket.itemsMap.values()]
      .map((item) => ({
        ...item,
        releases: item.releases.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
      }))
      .sort((a, b) => a.item.localeCompare(b.item));

    return {
      supplier: blanket.supplier,
      blanketStartDate: blanket.blanketStartDate,
      blanketEndDate: blanket.blanketEndDate,
      releaseCount: blanket.releaseCount,
      itemCount: items.length,
      totalValue: blanket.totalValue,
      items
    };
  });

  const summary = {
    suppliers: blankets.length,
    totalItems: blankets.reduce((sum, blanket) => sum + blanket.itemCount, 0),
    totalReleases: blankets.reduce((sum, blanket) => sum + blanket.releaseCount, 0),
    totalValue: blankets.reduce((sum, blanket) => sum + blanket.totalValue, 0)
  };

  return { blankets, summary };
}
