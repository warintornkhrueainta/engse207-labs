// src/models/Task.js
// Task Data Model with Validation

class Task {
    constructor(data) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.description = data.description || '';
        this.status = data.status || 'TODO';
        this.priority = data.priority || 'MEDIUM';
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    // Valid status values
    static VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
    
    // Valid priority values
    static VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

    // Status transitions (finite state machine)
    static STATUS_TRANSITIONS = {
        'TODO': ['IN_PROGRESS'],
        'IN_PROGRESS': ['TODO', 'DONE'],
        'DONE': ['IN_PROGRESS']
    };

    // Validate the task
    validate() {
        const errors = [];

        // Title validation
        if (!this.title || typeof this.title !== 'string') {
            errors.push('Title is required');
        } else if (this.title.trim().length < 3) {
            errors.push('Title must be at least 3 characters');
        } else if (this.title.trim().length > 200) {
            errors.push('Title must be less than 200 characters');
        }

        // Status validation
        if (!Task.VALID_STATUSES.includes(this.status)) {
            errors.push(`Status must be one of: ${Task.VALID_STATUSES.join(', ')}`);
        }

        // Priority validation
        if (!Task.VALID_PRIORITIES.includes(this.priority)) {
            errors.push(`Priority must be one of: ${Task.VALID_PRIORITIES.join(', ')}`);
        }

        // Business rule: HIGH priority tasks should have description
        if (this.priority === 'HIGH' && (!this.description || this.description.trim() === '')) {
            errors.push('HIGH priority tasks should have a description');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Check if status transition is valid
    canTransitionTo(newStatus) {
        if (!Task.VALID_STATUSES.includes(newStatus)) {
            return false;
        }
        const allowedTransitions = Task.STATUS_TRANSITIONS[this.status] || [];
        return allowedTransitions.includes(newStatus);
    }

    // Get next possible statuses
    getNextStatuses() {
        return Task.STATUS_TRANSITIONS[this.status] || [];
    }

    // Convert to plain object
    toJSON() {
        return {
            id: this.id,
            title: this.title.trim(),
            description: this.description ? this.description.trim() : '',
            status: this.status,
            priority: this.priority,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    // Create from database row
    static fromDatabase(row) {
        return new Task({
            id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            priority: row.priority,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = Task;