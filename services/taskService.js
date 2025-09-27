const Task = require('../models/Task');
exports.list = async ({ search, page = 1, limit = 50 }) => {
  const filter = search ? { name: new RegExp(search, 'i') } : {};
  const skip = (page - 1) * limit;
  const docs = await Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  const total = await Task.countDocuments(filter);
  return { data: docs, meta: { total, page: Number(page), limit: Number(limit) } };
};
exports.get = async (id) => Task.findById(id);
exports.create = async (payload) => Task.create(payload);
exports.update = async (id, payload) => Task.findByIdAndUpdate(id, payload, { new: true });
exports.updateStatus = async (id, completed) => Task.findByIdAndUpdate(id, { completed }, { new: true });
exports.remove = async (id) => Task.findByIdAndDelete(id);
