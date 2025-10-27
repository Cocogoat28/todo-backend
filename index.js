// Simple Task Manager App using Express + MongoDB + EJS
// Built just for testing and learning 

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- Middleware setup ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// --- Mongo Connection ---
mongoose.connect(process.env.MONGO_URI || '', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('Mongo connection error:', err.message));

// --- Schema & Model ---
const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// --- Routes --- //

// Home route 
app.get('/', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    const tasks = await Task.find({}).sort({ createdAt: -1 });

    res.render('index', { today, tasks });
  } catch (e) {
    console.error('Error rendering home:', e.message);
    res.status(500).send('Server error');
  }
});

// Add a new task
app.post('/', async (req, res) => {
  try {
    const name = req.body.newTask;

    if (name && name.trim()) {
      await Task.create({ name: name.trim() });
    }
    res.redirect('/');
  } catch (e) {
    console.error('Add task error:', e.message);
    res.status(500).send('Could not save');
  }
});

// Delete a task
app.post('/delete', async (req, res) => {
  try {
    const id = req.body.checkbox;
    if (id) await Task.findByIdAndDelete(id);
    res.redirect('/');
  } catch (e) {
    console.error('Delete task error:', e.message);
    res.status(500).send('Could not delete');
  }
});




// Get all tasks or search
app.get('/api/tasks', async (req, res) => {
  try {
    const q = req.query.search;
    const filter = q ? { name: new RegExp(q, 'i') } : {};

    const docs = await Task.find(filter).sort({ createdAt: -1 });
    res.json(docs);
  } catch (e) {
    console.error('Fetch tasks failed:', e.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Add new task via API
app.post('/api/tasks', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });

    const created = await Task.create({ name: name.trim() });
    res.status(201).json(created);
  } catch (e) {
    console.error('Create task failed:', e.message);
    res.status(500).json({ error: 'Could not create task' });
  }
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });

    res.json(updated);
  } catch (e) {
    console.error('Update task failed:', e.message);
    res.status(500).json({ error: 'Could not update task' });
  }
});

// Toggle completion status
app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { completed } = req.body;
    const updated = await Task.findByIdAndUpdate(req.params.id, { completed }, { new: true });

    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    console.error('Update status failed:', e.message);
    res.status(500).json({ error: 'Could not update status' });
  }
});

// Delete a task (API)
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const removed = await Task.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Not found' });

    res.json({ success: true });
  } catch (e) {
    console.error('Delete failed:', e.message);
    res.status(500).json({ error: 'Could not delete' });
  }
});

// --- Start Server ---
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server running on http://127.0.0.1:${port}/`);
});
