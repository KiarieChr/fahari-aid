<?php
// Start output buffering
ob_start();

try {
    require_once('../includes/connection.php');
    
    // Set JSON header
    header('Content-Type: application/json; charset=utf-8');
    
    // Get POST data
    $member_id = $_POST['member_id'] ?? null;
    $message = $_POST['message'] ?? '';
    $send_sms = $_POST['send_sms'] ?? false;
    $send_email = $_POST['send_email'] ?? false;
    
    // Validate inputs
    if (!$member_id || empty($message)) {
        throw new Exception('Member ID and message are required');
    }
    
    if (!is_numeric($member_id)) {
        throw new Exception('Invalid Member ID format');
    }
    
    // Get member contact info
    $stmt = $db->prepare("SELECT first_name, last_name, phone_no, email FROM member WHERE id = :id");
    $stmt->bindParam(':id', $member_id, PDO::PARAM_INT);
    $stmt->execute();
    $member = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$member) {
        throw new Exception('Member not found');
    }
    
    // Log the follow-up
    $log_stmt = $db->prepare("
        INSERT INTO followups (member_id, message, sent_by, sent_at) 
        VALUES (:member_id, :message, :sent_by, NOW())
    ");
    $log_stmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
    $log_stmt->bindParam(':message', $message, PDO::PARAM_STR);
    $log_stmt->bindParam(':sent_by', $_SESSION['user_id'], PDO::PARAM_INT);
    
    if (!$log_stmt->execute()) {
        throw new Exception('Failed to log follow-up');
    }
    
    $response = [
        'success' => true,
        'message' => 'Follow-up logged successfully',
        'data' => [
            'member' => $member['first_name'] . ' ' . $member['last_name'],
            'sent_via' => [
                'sms' => (bool)$send_sms,
                'email' => (bool)$send_email
            ]
        ]
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    $response = [
        'success' => false,
        'error' => 'Database error',
        'message' => $e->getMessage()
    ];
    echo json_encode($response);
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'error' => 'Application error',
        'message' => $e->getMessage()
    ];
    echo json_encode($response);
}

ob_end_flush();
?>