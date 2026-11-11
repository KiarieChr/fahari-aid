<?php
require_once __DIR__ . '/config.php';

try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS `age_categories` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `name` VARCHAR(50) NOT NULL,
          `min_age` INT NOT NULL DEFAULT 0,
          `max_age` INT NULL,
          UNIQUE KEY `unique_name` (`name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    
    $db->exec("
        INSERT IGNORE INTO `age_categories` (`name`, `min_age`, `max_age`) VALUES 
        ('Child', 0, 12),
        ('Youth', 13, 25),
        ('Adult', 26, 150);
    ");
    echo "Migration successful.";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
