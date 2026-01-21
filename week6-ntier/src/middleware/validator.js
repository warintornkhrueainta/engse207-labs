// src/middleware/validator.js
// Request Validation Middleware

const validateTaskCreate = (req, res, next) => {
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Title is required'
        });
    }

    next();
};

const validateTaskUpdate = (req, res, next) => {
    // At least one field should be provided
    const { title, description, status, priority } = req.body;
    
    if (title === undefined && description === undefined && 
        status === undefined && priority === undefined) {
        return res.status(400).json({
            success: false,
            error: 'At least one field is required for update'
        });
    }

    next();
};

module.exports = {
    validateTaskCreate,
    validateTaskUpdate
};