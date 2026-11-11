<?php
ob_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

session_start();
require_once('../includes/connection.php');

$response = [
    'success' => false,
    'message' => 'An unexpected error occurred. Please try again later.'
];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        $email            = trim($_POST['email'] ?? '');
        $phone_number     = trim($_POST['payment_phone_number'] ?? '');
        $mpesa_code       = trim($_POST['mpesa_code'] ?? '');
        $redeemed_amount  = trim($_POST['redeemed_amount'] ?? '');
        $pledge_id        = trim($_POST['commitment_id'] ?? '');

        if (empty($email) || empty($phone_number) || empty($mpesa_code) || empty($redeemed_amount) || empty($pledge_id)) {
            throw new Exception('Missing required fields');
        }

        // Verify commitment
        $stmt = $db->prepare("SELECT * FROM pledges WHERE id = ?");
        $stmt->execute([$pledge_id]);
        $commitment = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($commitment) {
            // start transaction
            $db->beginTransaction();

            // Mark commitment as redeemed
            $updateStmt = $db->prepare("UPDATE pledges SET status = 1 WHERE id = ?");
            $updateStmt->execute([$pledge_id]);

            // Insert redemption record
            $insertStmt = $db->prepare("
                INSERT INTO pledges_redeem 
                (pledge_id, email, phone_no, mpesa_code, redeemed_amount, recorded_on)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $insertStmt->execute([$pledge_id, $email, $phone_number, $mpesa_code, $redeemed_amount]);
            $redeem_id = $db->lastInsertId();

            // Ledger Integration: call JournalService to post general ledger entries
            require_once('../api/JournalService.php');
            $journalService = new JournalService($db);
            $jeId = $journalService->recordPledgeRedemption(
                date('Y-m-d'),
                floatval($redeemed_amount),
                $commitment['full_name'],
                'MPESA',
                $_SESSION['user_id'] ?? 1,
                $redeem_id
            );
            // Link journal entry back to pledges_redeem
            $updateRedeemJE = $db->prepare("UPDATE pledges_redeem SET journal_entry_id = ? WHERE id = ?");
            $updateRedeemJE->execute([$jeId, $redeem_id]);

            // Audit Logging
            $journalService->audit(
                'pledges_redeem',
                (int)$redeem_id,
                'CREATE',
                null,
                [
                    'pledge_id' => $pledge_id,
                    'email' => $email,
                    'phone_no' => $phone_number,
                    'mpesa_code' => $mpesa_code,
                    'redeemed_amount' => $redeemed_amount,
                    'recorded_by' => $_SESSION['user_id'] ?? 1
                ],
                (int)($_SESSION['user_id'] ?? 1)
            );

            $db->commit();

            $response['success'] = true;
            $response['message'] = 'Commitment redeemed successfully.';
            $response['commitment'] = $commitment;

        } else {
            $response['message'] = 'No valid commitment found for the provided ID.';
        }

    } else {
        http_response_code(405);
        $response['message'] = 'Invalid request method. Please use POST.';
    }

} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    $response['message'] = 'Error: ' . $e->getMessage();
}

ob_end_clean();
echo json_encode($response);
exit;
?>
