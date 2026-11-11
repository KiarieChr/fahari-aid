<?php
// record_collection.php

ob_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
session_start();
require_once('../includes/connection.php');

$response = ['success' => false, 'message' => 'An unexpected error occurred.'];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method. Use POST.');
    }

    // Gather POST data safely
    $payee          = trim($_POST['payee'] ?? '');
    $payment_mode   = trim($_POST['payment_mode'] ?? '');
    $payment_for    = trim($_POST['payment_for'] ?? '');
    $transaction_id = trim($_POST['transaction_id'] ?? '');
    $amount         = floatval($_POST['amount'] ?? 0);
    $recorded_on    = $_POST['recorded_on'] ?? date('Y-m-d');
    $recorded_by    = $_SESSION['user_id'] ?? 1; // fallback to admin ID=1 if no session user

    // purpose-specific fields
    $event_id   = $_POST['event_id'] ?? null;
    $pledge_id  = $_POST['pledge_id'] ?? null;
    $partnership_note = $_POST['partnership_note'] ?? null;
    $other_purpose    = $_POST['other_purpose'] ?? null;

    if (!$payee || !$payment_mode || !$payment_for || $amount <= 0) {
        throw new Exception('Please fill in all required fields.');
    }

    // Build description dynamically
    $description = '';
    if ($payment_for === 'Event Registration' && $event_id) {
        $description = "Registration Fee for Event #$event_id";
        $collection_type = 'facilitation_fee';
    } elseif ($payment_for === 'Pledge Redemption' && $pledge_id) {
        $description = "Commitment Redemption for Pledge #$pledge_id";
         $collection_type = 'pledges';
    } elseif ($payment_for === 'Partnership') {
        $description = "Partnership Support: " . ($partnership_note ?? '');
         $collection_type = 'partnership';
    } elseif ($payment_for === 'Tithe') {
        $description = "Tithe Collection";
        $collection_type = 'tithe';
    } elseif ($payment_for === 'Offering') {
        $description = "Offering Collection";
        $collection_type = 'offering';
    } else {
        $description = "General Collection: " . ($other_purpose ?? '');
         $collection_type = 'giving';
    }

    // Start transaction
    $db->beginTransaction();

    $refCode = strtoupper(substr(md5(uniqid()), 0, 8)); // unique reference

    // If payment_for = Event Registration, also record in registration_fee
    if ($payment_for === 'Event Registration' && $event_id) {
        $insertRegFee = $db->prepare("
            INSERT INTO registration_fee 
            (email, verified, transaction_id, registration_id, phone_no, amount, recorded_on, recorded_by, actual_date, event_id)
            VALUES (:email, 1, :transaction_id, :registration_id, :phone_no, :amount, NOW(), :recorded_by, NOW(), :event_id)
        ");

        $insertRegFee->execute([
            ':email'          => null,
            ':transaction_id' => $transaction_id ?: $refCode,
            ':registration_id'=> 0, // if no specific registration record linked
            ':phone_no'       => null,
            ':amount'         => $amount,
            ':recorded_by'    => $recorded_by,
            ':event_id'       => $event_id
        ]);
    } elseif ($payment_for === 'Pledge Redemption' && $pledge_id) {
        // Fetch pledge details
        $pledgeStmt = $db->prepare("SELECT email, phone_no FROM pledges WHERE id = ?");
        $pledgeStmt->execute([$pledge_id]);
        $pledgeInfo = $pledgeStmt->fetch(PDO::FETCH_ASSOC);
        $pledgeEmail = $pledgeInfo['email'] ?? null;
        $pledgePhone = $pledgeInfo['phone_no'] ?? null;

        // Insert into pledges_redeem
        $insertRedeem = $db->prepare("
            INSERT INTO pledges_redeem 
            (pledge_id, email, phone_no, mpesa_code, redeemed_amount, recorded_on, recorded_by)
            VALUES (:pledge_id, :email, :phone_no, :mpesa_code, :amount, NOW(), :recorded_by)
        ");
        $insertRedeem->execute([
            ':pledge_id'   => $pledge_id,
            ':email'       => $pledgeEmail,
            ':phone_no'    => $pledgePhone,
            ':mpesa_code'  => $transaction_id ?: $refCode,
            ':amount'      => $amount,
            ':recorded_by' => $recorded_by
        ]);
        
        // Mark commitment as redeemed (status = 1)
        $updatePledge = $db->prepare("UPDATE pledges SET status = 1 WHERE id = ?");
        $updatePledge->execute([$pledge_id]);
    }

    $document_ref = $db->lastInsertId() ?: '0';

    // Insert into collections table
    $insertCollection = $db->prepare("
        INSERT INTO collections 
        (payee, description, doc_reference, payment_mode, payment_for, cancelled, recorded_on, 
         reference, actual_date, collection_type, recorded_by, transaction_id, amount)
        VALUES 
        (:payee, :description, :doc_reference, :payment_mode, :payment_for, 0, :recorded_on,
         :reference, NOW(), :collection_type, :recorded_by, :transaction_id, :amount)
    ");

    $insertCollection->execute([
        ':payee'         => $payee,
        ':description'   => $description,
        ':doc_reference' => $document_ref,
        ':payment_mode'  => $payment_mode,
        ':payment_for'   => $payment_for,
        ':recorded_on'   => $recorded_on,
        ':reference'     => $event_id ?: ($pledge_id ?: $refCode),
        ':collection_type'=> $collection_type,
        ':recorded_by'   => $recorded_by,
        ':transaction_id'=> $transaction_id ?: $refCode,
        ':amount'        => $amount
    ]);

    $collection_id = $db->lastInsertId();

    // Ledger Integration: call JournalService to post general ledger entries
    require_once('../api/JournalService.php');
    $journalService = new JournalService($db);

    if ($payment_for === 'Pledge Redemption' && $pledge_id) {
        $jeId = $journalService->recordPledgeRedemption(
            $recorded_on,
            $amount,
            $payee,
            $payment_mode,
            $recorded_by,
            (int)$document_ref
        );
        $updateRedeemJE = $db->prepare("UPDATE pledges_redeem SET journal_entry_id = ? WHERE id = ?");
        $updateRedeemJE->execute([$jeId, (int)$document_ref]);
    } else {
        $incomeTypeKey = 'donation'; // default fallback
        if ($payment_for === 'Event Registration') {
            $incomeTypeKey = 'event';
        } elseif ($payment_for === 'Partnership') {
            $incomeTypeKey = 'partnership';
        } elseif ($payment_for === 'Tithe') {
            $incomeTypeKey = 'tithe';
        } elseif ($payment_for === 'Offering') {
            $incomeTypeKey = 'offering';
        }
        
        $journalService->recordIncome(
            $recorded_on,
            $amount,
            $incomeTypeKey,
            $payment_mode,
            $description,
            $recorded_by,
            $collection_id
        );
    }

    // Audit Logging
    $journalService->audit(
        'collections',
        (int)$collection_id,
        'CREATE',
        null,
        [
            'payee' => $payee,
            'amount' => $amount,
            'payment_mode' => $payment_mode,
            'payment_for' => $payment_for,
            'description' => $description,
            'transaction_id' => $transaction_id ?: $refCode,
            'collection_type' => $collection_type,
            'recorded_on' => $recorded_on
        ],
        (int)$recorded_by
    );

    if ($payment_for === 'Pledge Redemption' && $pledge_id) {
        $journalService->audit(
            'pledges_redeem',
            (int)$document_ref,
            'CREATE',
            null,
            [
                'pledge_id' => $pledge_id,
                'redeemed_amount' => $amount,
                'mpesa_code' => $transaction_id ?: $refCode,
                'recorded_by' => $recorded_by
            ],
            (int)$recorded_by
        );
    }
  
    // Commit transaction
    $db->commit();
    
    $response = [
        'success' => true,
        'message' => 'Collection recorded successfully.',
        'data' => [
            'reference' => $refCode,
            'amount' => $amount,
            'purpose' => $payment_for,
            'mode' => $payment_mode
        ]
    ];

} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    $response = [
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ];
}

echo json_encode($response);
exit;
?>
