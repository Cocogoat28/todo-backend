const service = require('../services/taskService');
exports.listTasks = async (req, res, next) => {
  try {
    const out = await service.list(req.query);
    res.json(out);
  } catch (e) { next(e); }
};
exports.getTask = async (req, res, next) => {
  try {
    const t = await service.get(req.params.id);
    if (!t) return res.status(404).json({ error: 'Task not found' });
    res.json(t);
  } catch (e) { next(e); }
};
exports.createTask = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
};
exports.updateTask = async (req, res, next) => {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  } catch (e) { next(e); }
};
exports.updateStatus = async (req, res, next) => {
  try {
    const { completed } = req.body;
    const updated = await service.updateStatus(req.params.id, completed);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  } catch (e) { next(e); }
};
exports.deleteTask = async (req, res, next) => {
  try {
    const removed = await service.remove(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (e) { next(e); }
};
