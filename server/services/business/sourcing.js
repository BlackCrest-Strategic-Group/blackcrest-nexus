export function handleSourcing(message) {
  const qtyMatch = message.match(/(\d+)/);
  const quantity = qtyMatch ? Number(qtyMatch[1]) : 100;
  const part = message.split(' ').slice(0, 6).join(' ');

  return {
    text: `TJ sourcing brief: For ${part} (qty ${quantity}), prioritize dual-source coverage with staggered lead times.`,
    cards: [
      { supplier: 'ForgeLine Industrial', riskLevel: 'Low', leadTime: '12 days', notes: 'Best baseline pricing for repeat orders.' },
      { supplier: 'TitanWorks Supply', riskLevel: 'Medium', leadTime: '9 days', notes: 'Faster lane; add quality check on first batch.' },
      { supplier: 'North Harbor Components', riskLevel: 'Low', leadTime: '15 days', notes: 'Strong compliance history and stable fill rates.' }
    ]
  };
}
