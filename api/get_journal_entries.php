<?php
/**
 * Get Journal Entries
 * GET /api/get_journal_entries.php?page=1&limit=20&source_type=&start_date=&end_date=&search=
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    $sourceType = $_GET['source_type'] ?? '';
    $startDate = $_GET['start_date'] ?? '';
    $endDate = $_GET['end_date'] ?? '';
    $search = trim($_GET['search'] ?? '');

    $where = "WHERE 1=1";
    $params = [];

    if (!empty($sourceType)) {
        $where .= " AND je.source_type = :source_type";
        $params[':source_type'] = $sourceType;
    }
    if (!empty($startDate)) {
        $where .= " AND je.entry_date >= :start";
        $params[':start'] = $startDate;
    }
    if (!empty($endDate)) {
        $where .= " AND je.entry_date <= :end";
        $params[':end'] = $endDate;
    }
    if (!empty($search)) {
        $where .= " AND (je.reference_no LIKE :search OR je.description LIKE :search)";
        $params[':search'] = "%$search%";
    }

    // Count
    $countSql = "SELECT COUNT(*) FROM journal_entry je $where";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    // Fetch entries
    $sql = "SELECT je.id, je.entry_date, je.reference_no, je.description, je.source_type,
                   je.source_id, je.is_posted, je.is_reversed, je.created_by, je.created_at,
                   ap.name AS period_name
            FROM journal_entry je
            LEFT JOIN accounting_period ap ON ap.id = je.accounting_period_id
            $where
            ORDER BY je.entry_date DESC, je.id DESC
            LIMIT :limit OFFSET :offset";
    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch lines for each entry
    $lineStmt = $db->prepare("
        SELECT jel.id, jel.account_id, a.account_code, a.account_name, a.account_type,
               jel.debit, jel.credit, jel.description, jel.fund_id, f.name AS fund_name
        FROM journal_entry_line jel
        JOIN account a ON a.id = jel.account_id
        LEFT JOIN fund f ON f.id = jel.fund_id
        WHERE jel.journal_entry_id = :je_id
        ORDER BY jel.debit DESC, jel.id ASC
    ");

    foreach ($entries as &$entry) {
        $entry['id'] = (int)$entry['id'];
        $entry['is_posted'] = (bool)$entry['is_posted'];
        $entry['is_reversed'] = (bool)$entry['is_reversed'];
        $entry['source_id'] = $entry['source_id'] ? (int)$entry['source_id'] : null;
        $entry['created_by'] = (int)$entry['created_by'];

        $lineStmt->execute([':je_id' => $entry['id']]);
        $lines = $lineStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($lines as &$line) {
            $line['debit'] = (float)$line['debit'];
            $line['credit'] = (float)$line['credit'];
            $line['account_id'] = (int)$line['account_id'];
        }
        $entry['lines'] = $lines;
    }

    apiSuccess([
        'entries' => $entries,
        'pagination' => [
            'total' => $total,
            'total_pages' => max(1, ceil($total / $limit)),
            'page' => $page,
            'limit' => $limit,
        ]
    ], 'Journal entries retrieved');

} catch (PDOException $e) {
    error_log("Journal entries error: " . $e->getMessage());
    apiError('Failed to retrieve journal entries', 500);
}
