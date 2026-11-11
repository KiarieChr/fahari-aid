<?php
/**
 * Event Budget & Expenditure System - Database Migration
 * Run once: GET /api/create_event_budget_tables.php
 * 
 * Creates:
 * - event_budget (versioned budgets with approval workflow)
 * - event_budget_item (line items with estimated + actual)
 * - event_budget_receipt (receipt file attachments)
 * - event_budget_audit (full audit trail)
 * - GL sub-accounts under 5030 (Event Expenses) for each category
 */

require_once __DIR__ . '/config.php';

try {
    // DDL statements auto-commit in MySQL, so we run them first without a transaction
    // ── event_budget ──────────────────────────────────────────
    $db->exec("
        CREATE TABLE IF NOT EXISTS event_budget (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_id INT NOT NULL,
            version INT NOT NULL DEFAULT 1,
            budget_name VARCHAR(255) NOT NULL,
            status ENUM('draft','pending_approval','approved','rejected','closed') NOT NULL DEFAULT 'draft',
            total_estimated DECIMAL(15,2) NOT NULL DEFAULT 0.00,
            total_actual DECIMAL(15,2) NOT NULL DEFAULT 0.00,
            notes TEXT DEFAULT NULL,
            created_by INT NOT NULL,
            approved_by INT DEFAULT NULL,
            approved_at DATETIME DEFAULT NULL,
            rejection_reason TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
            INDEX idx_event_version (event_id, version),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // ── event_budget_item ─────────────────────────────────────
    $db->exec("
        CREATE TABLE IF NOT EXISTS event_budget_item (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_budget_id INT NOT NULL,
            category ENUM('venue','catering','transport','sound_av','printing','decoration','speaker_honorarium','marketing','accommodation','miscellaneous') NOT NULL DEFAULT 'miscellaneous',
            description VARCHAR(500) NOT NULL,
            estimated_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
            actual_amount DECIMAL(15,2) DEFAULT NULL,
            vendor VARCHAR(255) DEFAULT NULL,
            receipt_ref VARCHAR(100) DEFAULT NULL,
            receipt_ref_verified TINYINT(1) DEFAULT 0,
            payment_date DATE DEFAULT NULL,
            payment_method VARCHAR(50) DEFAULT NULL,
            gl_account_id INT DEFAULT NULL,
            journal_entry_id INT DEFAULT NULL,
            status ENUM('planned','paid','cancelled') NOT NULL DEFAULT 'planned',
            notes TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (event_budget_id) REFERENCES event_budget(id) ON DELETE CASCADE,
            INDEX idx_budget (event_budget_id),
            INDEX idx_category (category),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // ── event_budget_receipt ──────────────────────────────────
    $db->exec("
        CREATE TABLE IF NOT EXISTS event_budget_receipt (
            id INT AUTO_INCREMENT PRIMARY KEY,
            budget_item_id INT NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_type VARCHAR(50) NOT NULL,
            file_size INT NOT NULL DEFAULT 0,
            ocr_text TEXT DEFAULT NULL,
            ocr_receipt_number VARCHAR(100) DEFAULT NULL,
            ocr_verified TINYINT(1) DEFAULT 0,
            uploaded_by INT NOT NULL,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (budget_item_id) REFERENCES event_budget_item(id) ON DELETE CASCADE,
            INDEX idx_item (budget_item_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // ── event_budget_audit ────────────────────────────────────
    $db->exec("
        CREATE TABLE IF NOT EXISTS event_budget_audit (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_budget_id INT NOT NULL,
            action ENUM('created','updated','submitted','approved','rejected','expense_recorded','expense_cancelled','receipt_uploaded','receipt_verified','closed') NOT NULL,
            details TEXT DEFAULT NULL,
            performed_by INT NOT NULL,
            performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_budget_id) REFERENCES event_budget(id) ON DELETE CASCADE,
            INDEX idx_budget_audit (event_budget_id, performed_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // ── GL Sub-accounts under 5030 (Event Expenses) ──────────
    // Check if 5030 exists
    $stmt = $db->query("SELECT id FROM account WHERE account_code = '5030'");
    $parentAccount = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($parentAccount) {
        $parentId = $parentAccount['id'];

        $subAccounts = [
            ['5031', 'Event - Venue & Facilities', 'venue'],
            ['5032', 'Event - Catering', 'catering'],
            ['5033', 'Event - Transport & Logistics', 'transport'],
            ['5034', 'Event - Sound & AV', 'sound_av'],
            ['5035', 'Event - Printing & Stationery', 'printing'],
            ['5036', 'Event - Decoration', 'decoration'],
            ['5037', 'Event - Speaker Honorarium', 'speaker_honorarium'],
            ['5038', 'Event - Marketing & Publicity', 'marketing'],
            ['5039', 'Event - Accommodation', 'accommodation'],
            ['50301', 'Event - Miscellaneous', 'miscellaneous'],
        ];

        $insertStmt = $db->prepare("
            INSERT IGNORE INTO account (account_code, account_name, account_type, parent_id, is_active, description, normal_balance)
            VALUES (:code, :name, 'Expense', :parent_id, 1, :desc, 'Debit')
        ");

        foreach ($subAccounts as $sa) {
            $insertStmt->execute([
                ':code' => $sa[0],
                ':name' => $sa[1],
                ':parent_id' => $parentId,
                ':desc' => "Event budget category: {$sa[2]}"
            ]);
        }
    }

    // ── Create uploads directory ──────────────────────────────
    $uploadDir = __DIR__ . '/../uploads/receipts';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Event budget tables and GL sub-accounts created',
        'tables' => ['event_budget', 'event_budget_item', 'event_budget_receipt', 'event_budget_audit'],
        'sub_accounts_parent' => $parentAccount ? $parentId : 'NOT FOUND - create account 5030 first'
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
