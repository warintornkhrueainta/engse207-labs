// src/config/database.js
// PostgreSQL Database Connection with Connection Pooling

const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'taskboard_db',
    user: process.env.DB_USER || 'taskboard',
    password: process.env.DB_PASSWORD || 'taskboard123',
    
    // Pool settings
    max: 10,                      // Maximum connections in pool
    idleTimeoutMillis: 30000,     // Close idle connections after 30s
    connectionTimeoutMillis: 5000  // Timeout after 5s
});

// Connection events
pool.on('connect', (client) => {
    console.log('✅ New client connected to PostgreSQL');
});

pool.on('error', (err, client) => {
    console.error('❌ PostgreSQL pool error:', err.message);
});

// Query helper with logging
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`📊 Query executed: ${duration}ms | Rows: ${result.rowCount}`);
        return result;
    } catch (error) {
        console.error('❌ Query error:', error.message);
        throw error;
    }
};

// Health check
const healthCheck = async () => {
    try {
        const result = await pool.query('SELECT NOW() as time, current_database() as database');
        return {
            status: 'healthy',
            database: result.rows[0].database,
            timestamp: result.rows[0].time,
            poolSize: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
};

// Graceful shutdown
const closePool = async () => {
    console.log('🔄 Closing database pool...');
    await pool.end();
    console.log('✅ Database pool closed');
};

module.exports = {
    pool,
    query,
    healthCheck,
    closePool
};