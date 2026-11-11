<?php
// manage/post_collection.php
// Posts a collection record to the General Ledger (journal_entry) and marks it as posted.

ob_start();
require_once('../includes/checklogin.php');
ob_clean();
header('Content-Type: application/json; charset=utf-8');

$response = ['success' => false, 'message' => 'An unexpected error occurred.'];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method. Use POST.');
    }

    $collectionId  = trim($_POST['collection_id'] ?? '');
    $entryDate     = trim($_POST['entry_date'] ?? '');
    $userId        = $_SESSION['user_id'] ?? 1;

    if (empty($collectionId)) {
        throw new Exception('Collection ID is required.');
    }
    if (empty($entryDate) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $entryDate)) {
        throw new Exception('A valid transaction date (YYYY-MM-DD) is required.');
    }

    require_once('../api/JournalService.php');
    $journalService = new JournalService($db);

    // Determine if this is a pledges_redeem record or a collections record
    $isPledgeRedeem = (strpos($collectionId, 'PR-') === 0);

    if ($isPledgeRedeem) {
        // --- Pledge Redemption path ---
        $prId = (int)str_replace('PR-', '', $collectionId);

        // Fetch pledge redeem record
        $stmt = $db->prepare("
            SELECT pr.*, p.full_name AS payee 
            FROM pledges_redeem pr
            JOIN pledges p ON pr.pledge_id = p.id
            WHERE pr.id = ?
        ");
        $stmt->execute([$prId]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            throw new Exception("Pledge redemption record #$prId not found.");
        }
        if (!empty($record['journal_entry_id'])) {
            throw new Exception('This pledge redemption has already been posted to the journal (JE #' . $record['journal_entry_id'] . ').');
        }

        $db->beginTransaction();

        $jeId = $journalService->recordPledgeRedemption(
            $entryDate,
            (float)$record['redeemed_amount'],
            $record['payee'],
            'MPESA',
            (int)$userId,
            $prId
        );

        // Mark as posted
        $db->prepare("UPDATE pledges_redeem SET journal_entry_id = ? WHERE id = ?")
           ->execute([$jeId, $prId]);

        // Audit
        $journalService->audit(
            'pledges_redeem',
            $prId,
            'POST_TO_JOURNAL',
            null,
            ['journal_entry_id' => $jeId, 'entry_date' => $entryDate, 'posted_by' => $userId],
            (int)$userId
        );

        $db->commit();

        $response = [
            'success' => true,
            'message' => 'Pledge redemption posted to journal successfully.',
            'data'    => ['journal_entry_id' => $jeId]
        ];

    } else {
        // --- Collections path ---
        $colId = (int)$collectionId;

        // Fetch collection record
        $stmt = $db->prepare("SELECT * FROM collections WHERE id = ?");
        $stmt->execute([$colId]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            throw new Exception("Collection record #$colId not found.");
        }
        if (!empty($record['journal_entry_id'])) {
            throw new Exception('This collection has already been posted to the journal (JE #' . $record['journal_entry_id'] . ').');
        }

        $db->beginTransaction();

        // Map payment_for to income type key
        $incomeTypeKey = 'donation';
        $pf = $record['payment_for'];
        if ($pf === 'Event Registration')  $incomeTypeKey = 'event';
        elseif ($pf === 'Partnership')     $incomeTypeKey = 'partnership';
        elseif ($pf === 'Tithe')           $incomeTypeKey = 'tithe';
        elseif ($pf === 'Offering')        $incomeTypeKey = 'offering';
        elseif ($pf === 'Pledge Redemption' || $pf === 'Commitment Redemption') $incomeTypeKey = 'pledge';

        $jeId = $journalService->recordIncome(
            $entryDate,
            (float)$record['amount'],
            $incomeTypeKey,
            $record['payment_mode'],
            $record['description'] ?: $pf,
            (int)$userId,
            $colId
        );

        // Mark collection as posted
        $db->prepare("UPDATE collections SET journal_entry_id = ? WHERE id = ?")
           ->execute([$jeId, $colId]);

        // Audit
        $journalService->audit(
            'collections',
            $colId,
            'POST_TO_JOURNAL',
            null,
            ['journal_entry_id' => $jeId, 'entry_date' => $entryDate, 'posted_by' => $userId],
            (int)$userId
        );

        $db->commit();

        $response = [
            'success' => true,
            'message' => 'Collection posted to journal successfully.',
            'data'    => ['journal_entry_id' => $jeId]
        ];
    }

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    $response = [
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ];
}

echo json_encode($response);
exit;
?>
