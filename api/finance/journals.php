<?php
/**
 * Journals API
 * /api/finance/journals.php
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware.php';
require_once __DIR__ . '/../JournalService.php';

$user = authenticate();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Fetch recent journal entries
        $stmt = $db->query("
            SELECT je.id, je.entry_date, je.reference_no, je.description, je.source_type, je.is_posted
            FROM journal_entry je
            ORDER BY je.entry_date DESC, je.id DESC
            LIMIT 100
        ");
        $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Fetch lines for each entry
        if (!empty($entries)) {
            $ids = array_column($entries, 'id');
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            
            $lineStmt = $db->prepare("
                SELECT jel.journal_entry_id, jel.debit, jel.credit, jel.description, a.account_name, a.account_code
                FROM journal_entry_line jel
                JOIN account a ON jel.account_id = a.id
                WHERE jel.journal_entry_id IN ($placeholders)
            ");
            $lineStmt->execute($ids);
            $lines = $lineStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Group lines by entry_id
            $linesByEntry = [];
            foreach ($lines as $line) {
                $linesByEntry[$line['journal_entry_id']][] = $line;
            }
            
            foreach ($entries as &$entry) {
                $entry['lines'] = $linesByEntry[$entry['id']] ?? [];
                
                // Calculate total
                $total = 0;
                foreach ($entry['lines'] as $l) {
                    $total += (float)$l['debit'];
                }
                $entry['total'] = $total;
            }
        }
        
        apiSuccess($entries, 'Journal entries retrieved successfully');
    } 
    
    elseif ($method === 'POST') {
        $data = getJsonBody();
        
        $entryDate = $data['entry_date'] ?? date('Y-m-d');
        $description = $data['description'] ?? 'Manual Entry';
        $lines = $data['lines'] ?? [];
        
        $js = new JournalService($db);
        $jeId = $js->createEntry(
            $entryDate,
            $description,
            'adjustment', // Manual journal entries are typically marked as adjustment
            null,
            $user->id,
            $lines
        );
        
        apiSuccess(['id' => $jeId], 'Journal entry created successfully');
    }
    
} catch (Exception $e) {
    error_log("Journals API error: " . $e->getMessage());
    apiError($e->getMessage(), 500);
}
