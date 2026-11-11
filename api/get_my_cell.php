<?php
/**
 * Get User's Cell Information API
 * GET /api/get_my_cell.php
 * 
 * Returns user's cell details and members
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

// Require authentication
$user = authenticate();

try {
    $data = [];
    
    $member_id = $user->member_id;
    
    if (!$member_id) {
        apiSuccess(['assigned' => false, 'message' => 'Member profile not found'], 'Cell data retrieved');
        exit;
    }
    
    // Get user's cell_id
    $stmt = $db->prepare("SELECT cell_id FROM member WHERE id = :member_id");
    $stmt->execute([':member_id' => $member_id]);
    $memberRow = $stmt->fetch();
    
    if (!$memberRow || !$memberRow['cell_id']) {
        apiSuccess(['assigned' => false, 'message' => 'Not assigned to a cell yet'], 'Cell data retrieved');
        exit;
    }
    
    $cell_id = $memberRow['cell_id'];
    
    // Get cell details with leader info
    try {
        $stmt = $db->prepare("
            SELECT c.id, c.code, c.code as cell_name, c.status,
                   m.first_name as leader_first_name, 
                   m.last_name as leader_last_name,
                   m.phone_no as leader_phone
            FROM cells c 
            LEFT JOIN member m ON c.cell_leader = m.id 
            WHERE c.id = :cell_id
        ");
        $stmt->execute([':cell_id' => $cell_id]);
        $cellInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Try simpler query without leader join
        $stmt = $db->prepare("SELECT id, code, code as cell_name, status FROM cells WHERE id = :cell_id");
        $stmt->execute([':cell_id' => $cell_id]);
        $cellInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    $data['assigned'] = true;
    $data['cell'] = $cellInfo ?: null;
    
    // Get cell members (try with delete_status, fallback without)
    try {
        $stmt = $db->prepare("
            SELECT id, first_name, last_name, phone_no, email, location
            FROM member 
            WHERE cell_id = :cell_id
            AND (delete_status IS NULL OR delete_status = 0)
            ORDER BY first_name ASC
        ");
        $stmt->execute([':cell_id' => $cell_id]);
        $data['members'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Fallback without delete_status filter
        $stmt = $db->prepare("
            SELECT id, first_name, last_name, phone_no, email, location
            FROM member 
            WHERE cell_id = :cell_id
            ORDER BY first_name ASC
        ");
        $stmt->execute([':cell_id' => $cell_id]);
        $data['members'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    $data['member_count'] = count($data['members']);
    
    apiSuccess($data, 'Cell data retrieved');
    
} catch (PDOException $e) {
    error_log("Cell API error: " . $e->getMessage());
    apiError('Failed to retrieve cell data: ' . $e->getMessage(), 500);
}
