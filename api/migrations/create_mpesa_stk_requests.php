<?php
/**
 * Migration: Create mpesa_stk_requests table
 * Run once: http://localhost/jesusenthroned/api/migrations/create_mpesa_stk_requests.php
 */
require_once __DIR__ . '/../config.php';

try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS mpesa_stk_requests (
            id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            checkout_request_id  VARCHAR(100) NOT NULL UNIQUE,
            merchant_request_id  VARCHAR(100),
            pledge_id            INT NOT NULL,
            phone                VARCHAR(20),
            amount               DECIMAL(12,2) NOT NULL,
            status               ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
            result_code          INT,
            mpesa_code           VARCHAR(20),
            created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at           DATETIME ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_pledge     (pledge_id),
            INDEX idx_status     (status),
            INDEX idx_mpesa_code (mpesa_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    echo json_encode(['success' => true, 'message' => 'mpesa_stk_requests table created']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
