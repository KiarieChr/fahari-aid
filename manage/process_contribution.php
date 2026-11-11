<?php

// php file to record pledge redemptionn and also record in the collections table
ob_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once('../includes/connection.php');
if($_SERVER['REQUEST_METHOD'] === 'POST'){
    // we need to retrieve the pledge information of the contributor
    $pledge_id = trim($_POST['contributors'] ?? '');
    $amount = trim($_POST['amount'] ?? '');
    $transaction_id = trim($_POST['transaction_id'] ?? '');
    
    if(empty($pledge_id) || empty($amount) || empty($transaction_id)){
       echo json_encode(['success' => false, 'message' => 'All fields are required.']);
       exit();
    }
    // Fields that are needed
    // reference, payee, description, payment_mode,  collection_type, amount, payment_for,transaction_id, recorded_by
    //feth the payee name and details
    $stmt = $db->prepare("SELECT * FROM pledges WHERE id = ?");
    $stmt->execute([$pledge_id]);
    $pledge = $stmt->fetch(PDO::FETCH_ASSOC);
    if(!$pledge){
        // Return json response
        echo json_encode(['success' => false, 'message' => 'Pledge record with id ' . $pledge_id . ' not found.']);
        exit();
    }
    $payee = $pledge['full_name'];
    $description = "Redemption of commitment by " . $payee;
    $payment_for = "Pledge Redemption";
    $reference = $pledge_id;
    $payment_mode = "MPESA";
    $collection_type = "pledges";
    $recorded_by = trim($_POST['user_id'] ?? ''); 
    $phone_no = $pledge['phone_no'];

    try {
        // start transaction
        $db->beginTransaction();
        // insert into pledges_redeem table
        $stmt = $db->prepare("INSERT INTO pledges_redeem (pledge_id, redeemed_amount, mpesa_code, phone_no, recorded_by, verified) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$pledge_id, $amount, $transaction_id, $phone_no, $recorded_by, 1]);

        //get the last inserted id
        $redeem_id = $db->lastInsertId();

        // insert into collections table
        $stmt = $db->prepare("INSERT INTO collections (reference, payee, description, payment_mode, collection_type, amount, payment_for, transaction_id, recorded_by, doc_reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$reference, $payee, $description, $payment_mode, $collection_type, $amount, $payment_for, $transaction_id, $recorded_by, $redeem_id]);

        $collection_id = $db->lastInsertId();

        // Ledger Integration: call JournalService to post general ledger entries
        require_once('../api/JournalService.php');
        $journalService = new JournalService($db);
        $jeId = $journalService->recordPledgeRedemption(
            date('Y-m-d'),
            floatval($amount),
            $payee,
            $payment_mode,
            (int)$recorded_by,
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
                'redeemed_amount' => $amount,
                'mpesa_code' => $transaction_id,
                'recorded_by' => $recorded_by
            ],
            (int)$recorded_by
        );
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
                'transaction_id' => $transaction_id,
                'collection_type' => $collection_type,
                'recorded_on' => date('Y-m-d')
            ],
            (int)$recorded_by
        );

        // commit transaction
        $db->commit();
        // retunr json response for hadnling via ajax
        echo json_encode(['success' => true, 'message' => 'Pledge redemption recorded successfully.']);
        exit();
    } catch (PDOException $e) {
        // rollback transaction on error
        $db->rollBack();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        exit();
    }


}