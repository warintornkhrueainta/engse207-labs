// src/services/taskService.js
// Business Logic Layer

const taskRepository = require('../repositories/taskRepository');
const Task = require('../models/Task');

class TaskService {
    
    // Get all tasks
    async getAllTasks(filters = {}) {
        return await taskRepository.findAll(filters);
    }

    // Get task by ID
    async getTaskById(id) {
        const task = await taskRepository.findById(id);
        if (!task) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            throw error;
        }
        return task;
    }

    // Get tasks by status
    async getTasksByStatus(status) {
        if (!Task.VALID_STATUSES.includes(status)) {
            const error = new Error(`Invalid status. Must be one of: ${Task.VALID_STATUSES.join(', ')}`);
            error.statusCode = 400;
            throw error;
        }
        return await taskRepository.findByStatus(status);
    }

    // Create new task
    async createTask(taskData) {
        const task = new Task(taskData);
        
        // Validate
        const validation = task.validate();
        if (!validation.valid) {
            const error = new Error(validation.errors.join(', '));
            error.statusCode = 400;
            throw error;
        }

        return await taskRepository.create(task.toJSON());
    }

    // Update task
    async updateTask(id, taskData) {
        // Check if task exists
        const existingTask = await taskRepository.findById(id);
        if (!existingTask) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            throw error;
        }

        // Create updated task for validation
        const updatedData = {
            ...existingTask.toJSON(),
            ...taskData
        };
        const task = new Task(updatedData);

        // Validate
        const validation = task.validate();
        if (!validation.valid) {
            const error = new Error(validation.errors.join(', '));
            error.statusCode = 400;
            throw error;
        }

        // Check status transition if status is being changed
        if (taskData.status && taskData.status !== existingTask.status) {
            if (!existingTask.canTransitionTo(taskData.status)) {
                const error = new Error(
                    `Invalid status transition from ${existingTask.status} to ${taskData.status}. ` +
                    `Allowed: ${existingTask.getNextStatuses().join(', ') || 'none'}`
                );
                error.statusCode = 400;
                throw error;
            }
        }

        return await taskRepository.update(id, taskData);
    }

    // Update status only
    async updateTaskStatus(id, status) {
        // Check if task exists
        const existingTask = await taskRepository.findById(id);
        if (!existingTask) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            throw error;
        }

        // Validate status
        if (!Task.VALID_STATUSES.includes(status)) {
            const error = new Error(`Invalid status. Must be one of: ${Task.VALID_STATUSES.join(', ')}`);
            error.statusCode = 400;
            throw error;
        }

        // Check transition
        if (!existingTask.canTransitionTo(status)) {
            const error = new Error(
                `Invalid status transition from ${existingTask.status} to ${status}. ` +
                `Allowed: ${existingTask.getNextStatuses().join(', ') || 'none'}`
            );
            error.statusCode = 400;
            throw error;
        }

        return await taskRepository.updateStatus(id, status);
    }

    // Move to next status
    async moveToNextStatus(id) {
        const task = await taskRepository.findById(id);
        if (!task) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            throw error;
        }

        const nextStatuses = task.getNextStatuses();
        if (nextStatuses.length === 0) {
            const error = new Error(`Task is already at final status: ${task.status}`);
            error.statusCode = 400;
            throw error;
        }

        // Move to first available next status
        const nextStatus = nextStatuses[0];
        return await taskRepository.updateStatus(id, nextStatus);
    }

    // Delete task
    async deleteTask(id) {
        // Check if task exists
        const task = await taskRepository.findById(id);
        if (!task) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            throw error;
        }

        // Business rule: Cannot delete IN_PROGRESS tasks
        if (task.status === 'IN_PROGRESS') {
            const error = new Error('Cannot delete task that is IN_PROGRESS. Move to TODO or DONE first.');
            error.statusCode = 400;
            throw error;
        }

        const deleted = await taskRepository.delete(id);
        return deleted;
    }

    // Get statistics
    async getStatistics() {
        return await taskRepository.getStatistics();
    }
}

module.exports = new TaskService();