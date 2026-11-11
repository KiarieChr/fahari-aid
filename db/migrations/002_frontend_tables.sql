-- ============================================
-- Migration 002: New tables for JEN frontend
-- Run this SQL against the nprfojqc_jenc database
-- ============================================

-- =====================
-- DEVOTIONALS MODULE
-- =====================

CREATE TABLE IF NOT EXISTS devotional_authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS devotionals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    devotional_date DATE NOT NULL,
    scripture_reference VARCHAR(255) DEFAULT NULL,
    scripture_text TEXT DEFAULT NULL,
    message TEXT DEFAULT NULL,
    author_id INT DEFAULT NULL,
    featured_image VARCHAR(500) DEFAULT NULL,
    featured TINYINT(1) DEFAULT 0,
    status ENUM('draft','published') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_slug (slug),
    KEY idx_date (devotional_date),
    KEY idx_status (status),
    KEY idx_author (author_id),
    CONSTRAINT fk_devotional_author FOREIGN KEY (author_id) REFERENCES devotional_authors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS devotional_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS devotional_category_map (
    devotional_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (devotional_id, category_id),
    CONSTRAINT fk_dcm_devotional FOREIGN KEY (devotional_id) REFERENCES devotionals(id) ON DELETE CASCADE,
    CONSTRAINT fk_dcm_category FOREIGN KEY (category_id) REFERENCES devotional_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- LIVE STREAMS
-- =====================

CREATE TABLE IF NOT EXISTS live_streams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    stream_url VARCHAR(500) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- PASSWORD RESETS
-- =====================

CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_token (token),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- ANNOUNCEMENTS (for homepage)
-- =====================

CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    expires_at DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- SERMONS (for homepage)
-- =====================

CREATE TABLE IF NOT EXISTS sermons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    speaker VARCHAR(255) DEFAULT NULL,
    sermon_date DATE NOT NULL,
    video_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_date (sermon_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- SITE SETTINGS (optional, for homepage hero text)
-- =====================

CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
('hero_title', 'Jesus Enthroned'),
('hero_subtitle', 'Welcome to our community');

-- =====================
-- MEETING TYPES (optional, if meeting.type column is not sufficient)
-- =====================

CREATE TABLE IF NOT EXISTS meeting_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================
-- ALTER EXISTING TABLES (safe - only adds if missing)
-- =====================

-- Add 'type' column to meeting table if it doesn't exist
-- (run manually if needed; ALTER IGNORE not supported in all MySQL versions)
-- ALTER TABLE meeting ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT NULL;
-- ALTER TABLE meeting ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT NULL;
-- ALTER TABLE meeting ADD COLUMN IF NOT EXISTS facilitator_id INT DEFAULT NULL;

-- Add 'image' column to event table if it doesn't exist
-- ALTER TABLE event ADD COLUMN IF NOT EXISTS image VARCHAR(500) DEFAULT NULL;
-- ALTER TABLE event ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT NULL;
-- ALTER TABLE event ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT NULL;

-- Add 'location' column to member table if it doesn't exist
-- ALTER TABLE member ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL;
