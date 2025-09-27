const express = require('express');
const router = express.Router();
const controller = require('../controllers/taskController');

router.get('/api/tasks', controller.listTasks);
router.get('/api/tasks/:id', controller.getTask);
router.post('/api/tasks', controller.createTask);
router.put('/api/tasks/:id', controller.updateTask);
router.patch('/api/tasks/:id/status', controller.updateStatus);
router.delete('/api/tasks/:id', controller.deleteTask);

module.exports = router;
