-- database/init.sql
-- Task Board PostgreSQL Schema

-- Drop existing table
DROP TABLE IF EXISTS tasks;

-- Create tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'TODO',
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_status CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
    CONSTRAINT chk_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT chk_title_length CHECK (LENGTH(title) >= 3 AND LENGTH(title) <= 200)
);

-- Create indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_timestamp
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert sample data
INSERT INTO tasks (title, description, status, priority) VALUES
('Setup PostgreSQL', 'Install and configure PostgreSQL database', 'DONE', 'HIGH'),
('Configure Nginx', 'Setup Nginx as reverse proxy with SSL', 'DONE', 'HIGH'),
('Create Backend API', 'Implement REST API with Express.js', 'IN_PROGRESS', 'HIGH'),
('Build Frontend', 'Create Task Board UI', 'IN_PROGRESS', 'MEDIUM'),
('Test HTTPS', 'Verify SSL certificate works', 'TODO', 'MEDIUM'),
('Write Documentation', 'Complete ANALYSIS.md', 'TODO', 'LOW'),
('Deploy to Production', 'Final deployment and testing', 'TODO', 'HIGH');

-- Verify
SELECT * FROM tasks ORDER BY id;