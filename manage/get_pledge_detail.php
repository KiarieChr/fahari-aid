<?php
// manage/get_pledge_detail.php
// Returns the full detail for a single pledge including its redemption history.

ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    $pledgeId = (int)($_GET['id'] ?? 0);
    if ($pledgeId <= 0) throw new Exception('Invalid pledge ID.');

    // Fetch pledge
    $pledgeStmt = $db->prepare("SELECT * FROM pledges WHERE id = ?");
    $pledgeStmt->execute([$pledgeId]);
    $pledge = $pledgeStmt->fetch(PDO::FETCH_ASSOC);
    if (!$pledge) throw new Exception('Pledge not found.');

    // Fetch redemptions
    $redeemStmt = $db->prepare("
        SELECT pr.*, je.reference_no AS journal_ref
        FROM pledges_redeem pr
        LEFT JOIN journal_entry je ON je.id = pr.journal_entry_id
        WHERE pr.pledge_id = ?
        ORDER BY pr.recorded_on ASC
    ");
    $redeemStmt->execute([$pledgeId]);
    $redemptions = $redeemStmt->fetchAll(PDO::FETCH_ASSOC);

    $totalRedeemed = array_sum(array_column($redemptions, 'redeemed_amount'));
    $balance = (float)$pledge['pledges_amount'] - (float)$totalRedeemed;

    echo json_encode([
        'success' => true,
        'data' => [
            'pledge'       => $pledge,
            'redemptions'  => $redemptions,
            'total_redeemed' => (float)$totalRedeemed,
            'balance'      => max(0, $balance),
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
