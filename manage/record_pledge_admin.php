<?php
// manage/record_pledge_admin.php
// Admin-authenticated endpoint for recording a new pledge from within the dashboard.
// Unlike the public make-pledge.php form, this does NOT send emails.
// Posts a pledge commitment to the General Ledger via JournalService.

ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

$response = ['success' => false, 'message' => 'An unexpected error occurred.'];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method. Use POST.');
    }

    $full_name   = trim($_POST['full_name'] ?? '');
    $phone_no    = trim($_POST['phone_no'] ?? '');
    $email       = trim($_POST['email'] ?? '');
    $purpose     = trim($_POST['purpose'] ?? '');
    $amount      = floatval($_POST['amount'] ?? 0);
    $pledge_type = trim($_POST['pledge_type'] ?? 'cash'); // cash | attendee | general
    $notes       = trim($_POST['notes'] ?? '');
    $recurring   = (int)($_POST['recurring'] ?? 0);
    $pledge_date = trim($_POST['pledge_date'] ?? date('Y-m-d'));
    $userId      = $_SESSION['user_id'] ?? 1;

    if (empty($full_name)) throw new Exception('Full name is required.');
    if (empty($purpose))   throw new Exception('Purpose is required.');
    if ($amount <= 0)      throw new Exception('Pledge amount must be greater than zero.');

    // Validate email if provided
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address format.');
    }

    $db->beginTransaction();

    // Insert pledge
    $stmt = $db->prepare("
        INSERT INTO pledges
            (full_name, purpose, member, pledges_amount, recurring, notes, phone_no,
             total_pledges, status, member_id, email, pledge_type, attendees_sponsored, date)
        VALUES
            (:full_name, :purpose, :member, :pledges_amount, :recurring, :notes, :phone_no,
             :total_pledges, 0, :member_id, :email, :pledge_type, 0, :date)
    ");
    $stmt->execute([
        ':full_name'      => $full_name,
        ':purpose'        => $purpose,
        ':member'         => $full_name,
        ':pledges_amount' => $amount,
        ':recurring'      => $recurring,
        ':notes'          => $notes,
        ':phone_no'       => $phone_no,
        ':total_pledges'  => $amount,
        ':member_id'      => null,
        ':email'          => $email ?: null,
        ':pledge_type'    => $pledge_type,
        ':date'           => $pledge_date . ' ' . date('H:i:s'),
    ]);
    $pledgeId = (int)$db->lastInsertId();

    // Post pledge commitment to General Ledger
    require_once('../api/JournalService.php');
    $journalService = new JournalService($db);

    $jeId = $journalService->recordPledge(
        $pledge_date,
        $amount,
        $full_name,
        (int)$userId,
        $pledgeId
    );

    // Audit log
    $journalService->audit(
        'pledges',
        $pledgeId,
        'CREATE',
        null,
        [
            'full_name'   => $full_name,
            'purpose'     => $purpose,
            'amount'      => $amount,
            'pledge_type' => $pledge_type,
            'recurring'   => $recurring,
            'phone_no'    => $phone_no,
            'email'       => $email,
            'pledge_date' => $pledge_date,
            'journal_entry_id' => $jeId,
        ],
        (int)$userId
    );

    $db->commit();

    $response = [
        'success' => true,
        'message' => 'Pledge recorded successfully.',
        'data'    => [
            'pledge_id'       => $pledgeId,
            'journal_entry_id'=> $jeId,
        ]
    ];

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    $response = ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
}

echo json_encode($response);
exit;
?>
