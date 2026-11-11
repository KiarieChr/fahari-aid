<?php
require 'api/config.php';

$queries = [
    "CREATE TABLE IF NOT EXISTS `finance_documents` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `document_type` enum('payment_voucher','imprest_voucher','supplier_invoice','general_receipt') NOT NULL,
      `reference_id` int(11) DEFAULT NULL,
      `file_path` varchar(255) NOT NULL,
      `file_name` varchar(255) NOT NULL,
      `file_type` varchar(50) NOT NULL,
      `uploaded_by` int(11) NOT NULL,
      `branch_id` int(11) DEFAULT NULL,
      `uploaded_at` datetime DEFAULT current_timestamp(),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;",

    "CREATE TABLE IF NOT EXISTS `payment_vouchers` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `voucher_number` varchar(100) NOT NULL,
      `vendor_name` varchar(255) NOT NULL,
      `amount` decimal(15,2) NOT NULL,
      `date` date NOT NULL,
      `description` text DEFAULT NULL,
      `gl_account_id` int(11) DEFAULT NULL,
      `status` enum('draft','approved','paid') DEFAULT 'draft',
      `prepared_by` int(11) NOT NULL,
      `authorized_by` int(11) DEFAULT NULL,
      `branch_id` int(11) DEFAULT NULL,
      `created_at` datetime DEFAULT current_timestamp(),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;",

    "CREATE TABLE IF NOT EXISTS `imprest_vouchers` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `voucher_number` varchar(100) NOT NULL,
      `recipient_name` varchar(255) NOT NULL,
      `amount_requested` decimal(15,2) NOT NULL,
      `amount_approved` decimal(15,2) DEFAULT NULL,
      `date_needed` date NOT NULL,
      `purpose` text NOT NULL,
      `status` enum('requested','approved','retired','partially_retired') DEFAULT 'requested',
      `date_retired` date DEFAULT NULL,
      `balance_returned` decimal(15,2) DEFAULT NULL,
      `prepared_by` int(11) NOT NULL,
      `branch_id` int(11) DEFAULT NULL,
      `created_at` datetime DEFAULT current_timestamp(),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;"
];

foreach ($queries as $query) {
    try {
        $db->exec($query);
        echo "Successfully executed query.\n";
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
