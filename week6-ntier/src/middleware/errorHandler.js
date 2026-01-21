// src/middleware/errorHandler.js
// Global Error Handler

const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // PostgreSQL errors
    if (err.code) {
        switch (err.code) {
            case '23505': // Unique violation
                statusCode = 409;
                message = 'Duplicate entry';
                break;
            case '23503': // Foreign key violation
                statusCode = 400;
                message = 'Invalid reference';
                break;
            case '23502': // Not null violation
                statusCode = 400;
                message = 'Required field missing';
                break;
            case '22P02': // Invalid text representation
                statusCode = 400;
                message = 'Invalid data format';
                break;
            case 'ECONNREFUSED':
                statusCode = 503;
                message = 'Database connection refused';
                break;
        }
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            code: err.code
        })
    });
};

module.exports = errorHandler;