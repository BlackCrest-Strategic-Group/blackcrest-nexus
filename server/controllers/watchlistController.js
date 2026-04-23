import WatchlistItem from '../models/WatchlistItem.js';

export async function listWatchlist(req, res) {
  const items = await WatchlistItem.find({ userId: req.user._id, tenantId: req.user.tenantId }).sort({ updatedAt: -1 });
  return res.json(items);
}

export async function upsertWatchlist(req, res) {
  const { itemType, itemId, label, status, notes } = req.body;
  const item = await WatchlistItem.findOneAndUpdate(
    { userId: req.user._id, tenantId: req.user.tenantId, itemType, itemId },
    { label, status, notes, tenantId: req.user.tenantId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return res.status(201).json(item);
}

export async function deleteWatchlist(req, res) {
  await WatchlistItem.deleteOne({ _id: req.params.id, userId: req.user._id, tenantId: req.user.tenantId });
  return res.json({ success: true });
}
