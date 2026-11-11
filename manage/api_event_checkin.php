<?php
session_start();
require_once('../includes/connection.php');
include('../includes/checklogin.php');

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data && isset($_POST['action'])) {
    $data = $_POST;
}

$action = $data['action'] ?? '';

try {
    if ($action === 'checkin_qr') {
        $qr_token = trim($data['qr_token']);
        $event_id = intval($data['event_id']);
        
        // Find registration
        $stmt = $db->prepare("SELECT id FROM event_registration WHERE qr_token = :token AND event_id = :ev");
        $stmt->execute([':token' => $qr_token, ':ev' => $event_id]);
        $reg = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$reg) {
            echo json_encode(['success' => false, 'error' => 'Invalid QR token for this event.']);
            exit;
        }
        
        // Check if already checked in
        $chk = $db->prepare("SELECT id FROM event_attendance WHERE registration_id = :rid");
        $chk->execute([':rid' => $reg['id']]);
        if ($chk->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Already checked in!']);
            exit;
        }
        
        // Mark check-in
        $ins = $db->prepare("INSERT INTO event_attendance (event_id, registration_id, check_in_method, checked_in_by) VALUES (:ev, :rid, 'qr', :uid)");
        $ins->execute([':ev' => $event_id, ':rid' => $reg['id'], ':uid' => $_SESSION['user_id']]);
        
        echo json_encode(['success' => true, 'message' => 'Check-in successful!']);
        
    } elseif ($action === 'checkin_manual') {
        $reg_id = intval($data['registration_id']);
        $event_id = intval($data['event_id']);
        
        // Check if already checked in
        $chk = $db->prepare("SELECT id FROM event_attendance WHERE registration_id = :rid");
        $chk->execute([':rid' => $reg_id]);
        if ($chk->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Already checked in!']);
            exit;
        }
        
        $ins = $db->prepare("INSERT INTO event_attendance (event_id, registration_id, check_in_method, checked_in_by) VALUES (:ev, :rid, 'manual', :uid)");
        $ins->execute([':ev' => $event_id, ':rid' => $reg_id, ':uid' => $_SESSION['user_id']]);
        
        echo json_encode(['success' => true, 'message' => 'Manual check-in successful!']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
