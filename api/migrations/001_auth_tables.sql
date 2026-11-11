-- Migration: Add refresh_tokens table for JWT authentication
-- Run this SQL on your database to support the new auth system
-- NOTE: Most tables already exist - only run what's missing

-- Create refresh_tokens table (REQUIRED for JWT refresh)
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `revoked` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_token` (`token`),
    INDEX `idx_user_expires` (`user_id`, `expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- EXISTING TABLES (reference only - DO NOT RUN if they exist):
-- roles table uses column `name` (not role_name)
-- CREATE TABLE IF NOT EXISTS `roles` (
--     `id` INT AUTO_INCREMENT PRIMARY KEY,
--     `name` VARCHAR(100) NOT NULL,
--     `description` VARCHAR(200) NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- user_roles junction table (many-to-many relationship)
-- CREATE TABLE IF NOT EXISTS `user_roles` (
--     `id` INT AUTO_INCREMENT PRIMARY KEY,
--     `user_id` INT NOT NULL,
--     `role_id` INT NOT NULL,
--     FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
--     FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: Create permissions table if needed
CREATE TABLE IF NOT EXISTS `permissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `permission_name` VARCHAR(100) NOT NULL,
    `permission_code` VARCHAR(50) NOT NULL UNIQUE,
    `description` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: Create role_permissions junction table
CREATE TABLE IF NOT EXISTS `role_permissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_id` INT NOT NULL,
    `permission_id` INT NOT NULL,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_role_permission` (`role_id`, `permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default roles
INSERT IGNORE INTO `roles` (`id`, `role_name`, `description`) VALUES 
(1, 'Admin', 'System Administrator with full access'),
(2, 'Leader', 'Cell or Department Leader'),
(3, 'Member', 'Regular member');

-- Insert default permissions
INSERT IGNORE INTO `permissions` (`permission_code`, `permission_name`, `description`) VALUES
('view_dashboard', 'View Dashboard', 'Can view the main dashboard'),
('manage_members', 'Manage Members', 'Can add/edit/delete members'),
('manage_cells', 'Manage Cells', 'Can manage cell groups'),
('manage_events', 'Manage Events', 'Can create and manage events'),
('manage_meetings', 'Manage Meetings', 'Can schedule and manage meetings'),
('manage_pledges', 'Manage Pledges', 'Can view and manage pledges'),
('manage_users', 'Manage Users', 'Can manage user accounts'),
('view_reports', 'View Reports', 'Can view reports and analytics');

-- Assign all permissions to Admin role
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions`;

-- Cleanup old sessions (optional - if you want to migrate away from session-based auth)
-- DELETE FROM user_sessions WHERE expires_at < NOW();
