<?php
/**
 * Get Single Member API
 * GET /api/get_member.php
 * 
 * Query params: id
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

try {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        apiError('Member ID is required', 400);
    }

    // Count total meetings once
    $meetingCountStmt = $db->query("SELECT COUNT(id) as total FROM meeting");
    $total_meetings = (int)$meetingCountStmt->fetch()['total'];

    // Fetch single member with cell name, admin details, and attendance subquery
    $sql = "
        SELECT m.id, m.first_name, m.last_name, m.phone_no, m.email, 
               'Active' AS status, m.cell_id, c.name as cell_name,
               m.location, m.department, m.marital, m.emp_status, m.bod, m.joined_on,
               (SELECT COUNT(DISTINCT a.meeting_id) FROM attendance a WHERE a.member_id = m.id) as attended_count,
               :total_meetings as total_meetings
        FROM member m
        LEFT JOIN cells c ON m.cell_id = c.id
        WHERE m.id = :id
        LIMIT 1
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->bindValue(':total_meetings', $total_meetings, PDO::PARAM_INT);
    $stmt->execute();
    
    $member = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$member) {
        apiError('Member not found', 404);
    }

    echo json_encode([
        'success' => true,
        'data' => $member
    ]);

} catch (PDOException $e) {
    error_log("Get member error: " . $e->getMessage());
    apiError('Failed to retrieve member', 500);
}
