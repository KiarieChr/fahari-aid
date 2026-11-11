CREATE DATABASE IF NOT EXISTS `jen`;
USE `jen`;

CREATE TABLE IF NOT EXISTS `tenants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_name` VARCHAR(255) NOT NULL,
  `domain` VARCHAR(255) NOT NULL UNIQUE,
  `db_name` VARCHAR(255) NOT NULL UNIQUE,
  `db_user` VARCHAR(255) DEFAULT 'root',
  `db_pass` VARCHAR(255) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('active', 'suspended') DEFAULT 'active'
);

-- Insert a default tenant for testing
INSERT IGNORE INTO `tenants` (`tenant_name`, `domain`, `db_name`) 
VALUES ('Main Church', 'localhost', 'jen');

INSERT IGNORE INTO `tenants` (`tenant_name`, `domain`, `db_name`) 
VALUES ('Main Church Frontend', 'localhost:5173', 'jen');

-- If testing with custom domains like tenant1.local
INSERT IGNORE INTO `tenants` (`tenant_name`, `domain`, `db_name`) 
VALUES ('Tenant 1', 'tenant1.local', 'jen_tenant1');
