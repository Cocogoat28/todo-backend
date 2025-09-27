require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Mongo connected');
  } catch (err) {
    console.error('Mongo connection failed', err);
    process.exit(1);
  }
}
connectDB();

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

app.get('/', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.render('index', { today, tasks });
  } catch (e) {
    res.status(500).send('Server error');
  }
});

app.post('/', async (req, res) => {
  try {
    const name = req.body.newTask;
    if (name && name.trim()) await Task.create({ name: name.trim() });
    res.redirect('/');
  } catch (e) {
    res.status(500).send('Could not save');
  }
});

app.post('/delete', async (req, res) => {
  try {
    const id = req.body.checkbox;
    if (id) await Task.findByIdAndDelete(id);
    res.redirect('/');
  } catch (e) {
    res.status(500).send('Could not delete');
  }
}

);

app.get('/api/tasks', async (req, res) => {
  try {
    const q = req.query.search;
    const filter = q ? { name: new RegExp(q, 'i') } : {};
    const docs = await Task.find(filter).sort({ createdAt: -1 });
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
    const created = await Task.create({ name: name.trim() });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'Could not create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Could not update task' });
  }
});

app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { completed } = req.body;
    const updated = await Task.findByIdAndUpdate(req.params.id, { completed }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Could not update status' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const removed = await Task.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Could not delete' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
