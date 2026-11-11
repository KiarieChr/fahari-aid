<?php
/**
 * Get My Pledges API
 * GET /api/get_my_pledges.php
 * 
 * Returns current user's pledges and giving history
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

// Require authentication
$user = authenticate();

try {
    $memberId = $user->member_id;
    $data = [];
    
    // Get user's active pledges
    $stmt = $db->prepare("
        SELECT 
            id,
            purpose as title,
            pledges_amount as amount,
            recurring as frequency,
            date as start_date,
            notes,
            date as created_at
        FROM pledges
        WHERE member = :member_id OR email = (SELECT email FROM users WHERE id = :user_id LIMIT 1)
        ORDER BY id DESC
    ");
    $stmt->execute([
        ':member_id' => $memberId,
        ':user_id' => $user->id
    ]);
    $data['pledges'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate totals
    $totalPledged = 0;
    foreach ($data['pledges'] as &$pledge) {
        $totalPledged += floatval($pledge['amount']);
        $pledge['end_date'] = null; // Mock end_date since it doesn't exist
    }
    $data['total_pledged'] = $totalPledged;
    
    // Get YTD giving (assuming there's a giving/contributions table)
    // If not exists, we'll try to calculate from pledges
    try {
        $stmt = $db->prepare("
            SELECT COALESCE(SUM(amount), 0) as ytd_giving
            FROM contribution
            WHERE member = :member_id
            AND YEAR(contribution_date) = YEAR(CURDATE())
        ");
        $stmt->execute([':member_id' => $memberId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $data['ytd_giving'] = floatval($result['ytd_giving']);
    } catch (PDOException $e) {
        // Table might not exist, use pledges data
        $data['ytd_giving'] = 0;
    }
    
    // Get giving summary by category (if applicable)
    $data['summary'] = [
        'total_pledges' => count($data['pledges']),
        'active_pledges' => count(array_filter($data['pledges'], function($p) {
            return empty($p['end_date']) || strtotime($p['end_date']) >= time();
        })),
        'total_pledged' => $totalPledged,
        'ytd_giving' => $data['ytd_giving']
    ];
    
    apiSuccess($data, 'Pledges retrieved successfully');
    
} catch (PDOException $e) {
    error_log("Pledges API error: " . $e->getMessage());
    apiError('Failed to retrieve pledges', 500);
}
