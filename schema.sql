-- ============================================================
-- Modern Todo App Schema
-- Compatible with MySQL 5.7, 8.0, 8.4+, MariaDB, AWS RDS, PlanetScale, Aiven
-- ============================================================

CREATE DATABASE IF NOT EXISTS todo_db;
USE todo_db;

CREATE TABLE IF NOT EXISTS todos (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  due_date DATETIME NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at DATETIME NULL,
  subtasks JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_todos_status (completed),
  INDEX idx_todos_priority (priority),
  INDEX idx_todos_category (category),
  INDEX idx_todos_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Initial Data (optional seed)
INSERT IGNORE INTO todos (id, title, description, priority, category, due_date, completed, subtasks) VALUES
('todo-1', 'Finalize Mobile UI Design System', 'Ensure 48px touch targets, bottom action sheet, and fluid glassmorphic cards.', 'high', 'Design', DATE_ADD(NOW(), INTERVAL 1 DAY), FALSE, '[{"id":"sub-1","title":"Audit safe area insets","completed":true},{"id":"sub-2","title":"Create bottom navigation bar","completed":true},{"id":"sub-3","title":"Add tactile tap micro-animations","completed":false}]'),
('todo-2', 'Configure Remote MySQL Database', 'Set up remote database credentials in .env.local (Host, User, Password, SSL).', 'urgent', 'DevOps', DATE_ADD(NOW(), INTERVAL 2 HOUR), FALSE, '[{"id":"sub-4","title":"Set environment variables","completed":false},{"id":"sub-5","title":"Test latency & SSL handshake","completed":false}]'),
('todo-3', 'Review Capacitor / Native App Integration', 'Test wrapping the web responsive view into an Android / iOS hybrid shell.', 'medium', 'Development', DATE_ADD(NOW(), INTERVAL 3 DAY), FALSE, '[{"id":"sub-6","title":"Verify viewport-fit=cover","completed":false},{"id":"sub-7","title":"Test offline SQLite/remote sync","completed":false}]'),
('todo-4', 'Design Brand Accent Palette', 'Selected cosmic violet, electric indigo, emerald success, and coral urgency.', 'low', 'Personal', NULL, TRUE, '[]');
