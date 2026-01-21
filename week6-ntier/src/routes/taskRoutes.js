// src/routes/taskRoutes.js
// API Route Definitions

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Task routes
router.get('/tasks', (req, res, next) => taskController.getAllTasks(req, res, next));
router.get('/tasks/stats', (req, res, next) => taskController.getStatistics(req, res, next));
router.get('/tasks/:id', (req, res, next) => taskController.getTaskById(req, res, next));
router.post('/tasks', (req, res, next) => taskController.createTask(req, res, next));
router.put('/tasks/:id', (req, res, next) => taskController.updateTask(req, res, next));
router.patch('/tasks/:id/status', (req, res, next) => taskController.updateTaskStatus(req, res, next));
router.patch('/tasks/:id/next', (req, res, next) => taskController.moveToNextStatus(req, res, next));
router.delete('/tasks/:id', (req, res, next) => taskController.deleteTask(req, res, next));

module.exports = router;