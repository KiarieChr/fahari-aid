<?php
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
        $email        = trim($_POST['email'] ?? '');
        $phone_number = trim($_POST['phone_number'] ?? '');
        $event_id     = trim($_POST['event_id'] ?? '');

        // Basic validation
        if (empty($email) || empty($phone_number) || empty($event_id)) {
            throw new Exception('Please provide email, phone number, and event ID.');
        }

        // Fetch registration details
        $stmt = $db->prepare("
            SELECT e.ename, r.* 
            FROM event_registration r
            JOIN event e ON r.event_id = e.id
            WHERE r.email = ? AND r.phone_no = ? AND r.event_id = ?
            LIMIT 1
        ");
        $stmt->execute([$email, $phone_number, $event_id]);
        $registration = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($registration) {
            $response['success'] = true;
            $response['registration'] = $registration;
            $response['event_name'] = $registration['ename'];
            $response['invitees'] = $registration['attendees'];
            $response['message'] = 'Registration retrieved successfully.';
        } else {
            $response['message'] = 'Seems you have not registered for this event.';
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
exit;
?>
