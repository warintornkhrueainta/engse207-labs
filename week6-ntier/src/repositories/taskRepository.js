// src/repositories/taskRepository.js
// Data Access Layer - PostgreSQL Operations

const { query } = require('../config/database');
const Task = require('../models/Task');

class TaskRepository {
    
    // Get all tasks with optional filtering
    async findAll(filters = {}) {
        let sql = `
            SELECT id, title, description, status, priority, 
                   created_at, updated_at 
            FROM tasks
        `;
        const params = [];
        const conditions = [];

        // Filter by status
        if (filters.status) {
            conditions.push(`status = $${params.length + 1}`);
            params.push(filters.status);
        }

        // Filter by priority
        if (filters.priority) {
            conditions.push(`priority = $${params.length + 1}`);
            params.push(filters.priority);
        }

        // Add WHERE clause if conditions exist
        if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(' AND ')}`;
        }

        // Order by priority (HIGH first) then by created_at
        sql += `
            ORDER BY 
                CASE priority 
                    WHEN 'HIGH' THEN 1 
                    WHEN 'MEDIUM' THEN 2 
                    WHEN 'LOW' THEN 3 
                END,
                created_at DESC
        `;

        const result = await query(sql, params);
        return result.rows.map(row => Task.fromDatabase(row));
    }

    // Get task by ID
    async findById(id) {
        const sql = `
            SELECT id, title, description, status, priority, 
                   created_at, updated_at 
            FROM tasks 
            WHERE id = $1
        `;
        const result = await query(sql, [id]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return Task.fromDatabase(result.rows[0]);
    }

    // Get tasks by status
    async findByStatus(status) {
        const sql = `
            SELECT id, title, description, status, priority, 
                   created_at, updated_at 
            FROM tasks 
            WHERE status = $1
            ORDER BY 
                CASE priority 
                    WHEN 'HIGH' THEN 1 
                    WHEN 'MEDIUM' THEN 2 
                    WHEN 'LOW' THEN 3 
                END,
                created_at DESC
        `;
        const result = await query(sql, [status]);
        return result.rows.map(row => Task.fromDatabase(row));
    }

    // Create new task
    async create(taskData) {
        const sql = `
            INSERT INTO tasks (title, description, status, priority) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, title, description, status, priority, created_at, updated_at
        `;
        const params = [
            taskData.title.trim(),
            taskData.description ? taskData.description.trim() : '',
            taskData.status || 'TODO',
            taskData.priority || 'MEDIUM'
        ];
        
        const result = await query(sql, params);
        return Task.fromDatabase(result.rows[0]);
    }

    // Update task
    async update(id, taskData) {
        // Build dynamic update query
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (taskData.title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            params.push(taskData.title.trim());
        }
        if (taskData.description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            params.push(taskData.description ? taskData.description.trim() : '');
        }
        if (taskData.status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            params.push(taskData.status);
        }
        if (taskData.priority !== undefined) {
            updates.push(`priority = $${paramIndex++}`);
            params.push(taskData.priority);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        params.push(id);
        const sql = `
            UPDATE tasks 
            SET ${updates.join(', ')} 
            WHERE id = $${paramIndex} 
            RETURNING id, title, description, status, priority, created_at, updated_at
        `;

        const result = await query(sql, params);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return Task.fromDatabase(result.rows[0]);
    }

    // Update status only
    async updateStatus(id, status) {
        const sql = `
            UPDATE tasks 
            SET status = $1 
            WHERE id = $2 
            RETURNING id, title, description, status, priority, created_at, updated_at
        `;
        const result = await query(sql, [status, id]);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return Task.fromDatabase(result.rows[0]);
    }

    // Delete task
    async delete(id) {
        const sql = 'DELETE FROM tasks WHERE id = $1 RETURNING id';
        const result = await query(sql, [id]);
        return result.rowCount > 0;
    }

    // Get statistics
    async getStatistics() {
        const sql = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'TODO') as todo,
                COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
                COUNT(*) FILTER (WHERE status = 'DONE') as done,
                COUNT(*) FILTER (WHERE priority = 'HIGH') as high_priority,
                COUNT(*) FILTER (WHERE priority = 'MEDIUM') as medium_priority,
                COUNT(*) FILTER (WHERE priority = 'LOW') as low_priority
            FROM tasks
        `;
        const result = await query(sql);
        return result.rows[0];
    }
}

module.exports = new TaskRepository();