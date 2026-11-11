<?php
/**
 * Public Add Pledge
 * POST /api/public_add_pledge.php
 * Body: { full_name, email, phone_no, pledges_amount, purpose, date, notes?, recurring?, pledge_type?, attendees_sponsored? }
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/JournalService.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();

$full_name = trim($body['full_name'] ?? '');
$email = trim($body['email'] ?? '');
$phone_no = trim($body['phone_no'] ?? '');
$pledges_amount = (float)($body['pledges_amount'] ?? 0);
$purpose = trim($body['purpose'] ?? 'General');
$date = trim($body['date'] ?? date('Y-m-d'));
$notes = trim($body['notes'] ?? 'Public Form Submission');
$recurring = (int)($body['recurring'] ?? 0);
$pledge_type = trim($body['pledge_type'] ?? 'One-time');
$attendees_sponsored = (int)($body['attendees_sponsored'] ?? 0);

if (empty($full_name) || $pledges_amount <= 0 || empty($date)) {
    apiError('Name, amount, and date are required', 400);
}

if (empty($email) && empty($phone_no)) {
    apiError('Email or Phone Number is required', 400);
}

try {
    $db->beginTransaction();

    $stmt = $db->prepare("
        INSERT INTO pledges (full_name, member, email, phone_no, pledges_amount, total_pledges, purpose, date, notes, recurring, pledge_type, attendees_sponsored, status)
        VALUES (:full_name, :member, :email, :phone_no, :amount, :total, :purpose, :date, :notes, :recurring, :pledge_type, :attendees, 1)
    ");
    $stmt->execute([
        ':full_name' => $full_name,
        ':member' => $full_name,
        ':email' => $email,
        ':phone_no' => $phone_no,
        ':amount' => $pledges_amount,
        ':total' => $pledges_amount,
        ':purpose' => $purpose,
        ':date' => $date,
        ':notes' => $notes,
        ':recurring' => $recurring,
        ':pledge_type' => $pledge_type,
        ':attendees' => $attendees_sponsored,
    ]);
    $pledgeId = (int)$db->lastInsertId();

    // Create double-entry journal entry
    // Note: since this is public, we don't have a user ID. We use 0 or a system user ID.
    $systemUserId = 0; 
    $js = new JournalService($db);
    $jeId = $js->recordPledge($date, $pledges_amount, $full_name, $systemUserId, $pledgeId);

    $js->audit('pledge', $pledgeId, 'create', null, [
        'full_name' => $full_name,
        'amount' => $pledges_amount,
        'purpose' => $purpose,
        'date' => $date,
        'source' => 'Public Form'
    ], $systemUserId);

    $db->commit();
    apiSuccess(['id' => $pledgeId, 'journal_entry_id' => $jeId], 'Pledge recorded successfully');

} catch (Exception $e) {
    $db->rollBack();
    error_log("Public add pledge error: " . $e->getMessage());
    apiError('Failed to record pledge', 500);
}
