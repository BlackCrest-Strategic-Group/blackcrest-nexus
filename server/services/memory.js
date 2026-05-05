import Message from '../models/Message.js';

export async function getRecentHistory(userId) {
  const rows = await Message.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();
  return rows.reverse().map((m) => ({ role: m.role, text: m.text, mode: m.mode }));
}

export async function storeMessage({ userId, mode, role, text }) {
  await Message.create({ userId, mode, role, text });
}
