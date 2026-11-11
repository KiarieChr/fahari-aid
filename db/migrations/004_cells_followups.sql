-- ============================================================
-- Migration 004: Cell Management & Follow-up System
-- Run this against the `jen` database
-- ============================================================

-- 1. Enhance the cells table with new columns needed by React UI
ALTER TABLE cells ADD COLUMN name VARCHAR(100) NULL AFTER code;
ALTER TABLE cells ADD COLUMN category VARCHAR(50) DEFAULT 'General' AFTER name;
ALTER TABLE cells ADD COLUMN meeting_day VARCHAR(20) NULL AFTER category;
ALTER TABLE cells ADD COLUMN meeting_time TIME NULL AFTER meeting_day;
ALTER TABLE cells ADD COLUMN location VARCHAR(200) NULL AFTER meeting_time;
ALTER TABLE cells ADD COLUMN capacity INT DEFAULT 15 AFTER location;
ALTER TABLE cells ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER status;

-- 2. Create followups table (referenced by send_followup.php but doesn't exist)
CREATE TABLE IF NOT EXISTS followups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    message TEXT NOT NULL,
    followup_type ENUM('general', 'attendance', 'welfare', 'new_member') DEFAULT 'general',
    sent_by INT NULL,
    sent_via_sms TINYINT(1) DEFAULT 0,
    sent_via_email TINYINT(1) DEFAULT 0,
    status ENUM('pending', 'completed', 'no_response') DEFAULT 'pending',
    notes TEXT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE,
    INDEX idx_member (member_id),
    INDEX idx_sent_by (sent_by),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create cell_attendance table for cell-specific meeting attendance
CREATE TABLE IF NOT EXISTS cell_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cell_id INT NOT NULL,
    member_id INT NOT NULL,
    meeting_date DATE NOT NULL,
    present TINYINT(1) DEFAULT 1,
    recorded_by INT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cell_id) REFERENCES cells(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cell_member_date (cell_id, member_id, meeting_date),
    INDEX idx_cell_date (cell_id, meeting_date),
    INDEX idx_member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
