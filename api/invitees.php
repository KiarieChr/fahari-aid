<?php

// the page to handle invitee adding via ajax request
ob_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);   
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once('../includes/connection.php');
$response = [
    'success' => false,
    'message' => 'An unexpected error occurred. Please try again later.'
];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action       = trim($_POST['action'] ?? '');
        if($action === 'add_invitee'){
        $event_id     = trim($_POST['event_id'] ?? '');
        $invitee_name = trim($_POST['fullname'] ?? '');
        $contact        = trim($_POST['contact'] ?? '');
        $relationship = trim($_POST['relationship'] ?? '');
        $gender       = trim($_POST['gender'] ?? '');
        $invited_by   = trim($_POST['email'] ?? '');

        // validate inputs
        if (empty($action) || $action !== 'add_invitee' || empty($event_id) || empty($invitee_name) || empty($contact) || empty($relationship) || empty($gender) || empty($invited_by)) {
            throw new Exception('All fields are required.');
        }
        // insert invitee into database
        $stmt = $db->prepare("INSERT INTO invitees (event_id, fullname, contact, residence, gender, invited_by) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$event_id, $invitee_name, $contact, $relationship, $gender, $invited_by]);  
        
        $response['success'] = true;
        $response['message'] = 'Invitee added successfully.'; 
    }
    elseif($action ==='get_action'){
        $email = trim($_POST['email']) ?? '';
        $event_id = trim($_POST['event_id']) ?? '';

        // retrieve from invitees
        $stmt = $db->prepare('SELECT *FROM invitees WHERE event_id=? and invited_by=? ORDER BY created_at DESC');
        $stmt->execute([$event_id, $email]);
        $invitees->fetch(PDO::FETCH_ASSOC);
        if($invitees){
            echo json_encode($invitees);
            
        }
    }  
    } else {
        http_response_code(405);
        $response['message'] = 'Invalid request method. Use POST.';
    }
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}
ob_end_clean();
echo json_encode($response);
?>