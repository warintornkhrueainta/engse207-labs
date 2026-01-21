// server.js
// Main Application Entry Point - N-Tier Architecture

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import modules
const taskRoutes = require('./src/routes/taskRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const { healthCheck, closePool } = require('./src/config/database');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// MIDDLEWARE
// ===========================================

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Static files (for development - in production, Nginx serves these)
app.use(express.static(path.join(__dirname, 'public')));

// ===========================================
// ROUTES
// ===========================================

// Health check endpoint
app.get('/api/health', async (req, res) => {
    const dbHealth = await healthCheck();
    const status = dbHealth.status === 'healthy' ? 200 : 503;
    
    res.status(status).json({
        success: dbHealth.status === 'healthy',
        service: 'Task Board API',
        version: '1.0.0',
        architecture: 'N-Tier (Week 6)',
        timestamp: new Date().toISOString(),
        database: dbHealth
    });
});

// API routes
app.use('/api', taskRoutes);

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Error handler
app.use(errorHandler);

// ===========================================
// SERVER START
// ===========================================

const server = app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  🏗️  N-TIER ARCHITECTURE - TASK BOARD API');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  📡 Server running on port ${PORT}`);
    console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  🗄️  Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('  📍 Endpoints:');
    console.log(`     GET    /api/health`);
    console.log(`     GET    /api/tasks`);
    console.log(`     GET    /api/tasks/stats`);
    console.log(`     GET    /api/tasks/:id`);
    console.log(`     POST   /api/tasks`);
    console.log(`     PUT    /api/tasks/:id`);
    console.log(`     PATCH  /api/tasks/:id/status`);
    console.log(`     PATCH  /api/tasks/:id/next`);
    console.log(`     DELETE /api/tasks/:id`);
    console.log('═══════════════════════════════════════════════════════');
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);
    
    server.close(async () => {
        console.log('🔌 HTTP server closed');
        await closePool();
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error('⚠️ Forcing shutdown...');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;