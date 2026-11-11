<?php
session_start();
error_reporting(1);
include('../includes/connection.php');

// Set header for JSON response
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = trim($_POST['phone_no']);
    $meeting = trim($_POST['meeting_id']);
    
    function normalizePhoneNumber($number) {
        $number = preg_replace('/\D/', '', $number);
        if (substr($number, 0, 1) === '0') {
            $number = substr($number, 1);
        }
        return $number;
    }
    
    $phone_no = normalizePhoneNumber($username);
    
    try {
        // Get meeting link
        $meeting_l = $db->prepare("SELECT * FROM meeting WHERE id = :meeting_id");
        $meeting_l->bindParam(':meeting_id', $meeting, PDO::PARAM_INT);
        $meeting_l->execute();
        $res = $meeting_l->fetch(PDO::FETCH_OBJ);
        
        if (!$res) {
            echo json_encode([
                'success' => false,
                'title' => 'Error',
                'message' => 'Meeting not found',
                'type' => 'danger'
            ]);
            exit;
        }
        
        $meeting_link = $res->meeting_link;
        
        // Check for the phone number in the users
        $sql = "SELECT * FROM member WHERE phone_no = :username OR phone_no = :phone_no LIMIT 1";
        $query = $db->prepare($sql);
        $query->bindParam(':username', $username, PDO::PARAM_STR);
        $query->bindParam(':phone_no', $phone_no, PDO::PARAM_STR);
        $query->execute();
        $result = $query->fetch(PDO::FETCH_OBJ);
        
        if ($result) {
            $user_id = $result->id;
            $name = $result->first_name ?? 'Guest';
            
            // Check if attendance already exists
            $check_attendance = $db->prepare("SELECT * FROM attendance WHERE meeting_id = :meeting_id AND member_id = :member_id");
            $check_attendance->bindParam(':meeting_id', $meeting, PDO::PARAM_INT);
            $check_attendance->bindParam(':member_id', $user_id, PDO::PARAM_INT);
            $check_attendance->execute();
            $attendance = $check_attendance->fetch(PDO::FETCH_OBJ);
            
            if ($attendance) {
                echo json_encode([
                    'success' => true,
                    'title' => 'Welcome back!',
                    'message' => 'Hello ' . $name . ', you already marked your attendance -- Redirecting to meeting',
                    'redirect' => $meeting_link,
                    'type' => 'success'
                ]);
                exit;
            } else {
                // Mark attendance
                $stmt = $db->prepare("INSERT INTO attendance (member_id, meeting_id) VALUES (:member_id, :meeting_id)");
                $stmt->execute([
                    ':member_id' => $user_id,
                    ':meeting_id' => $meeting
                ]);
                
                echo json_encode([
                    'success' => true,
                    'title' => 'Welcome!',
                    'message' => 'Hello ' . $name . ', your attendance has been marked -- Redirecting to meet',
                    'redirect' => $meeting_link,
                    'type' => 'success'
                ]);
                exit;
            }
        } else {
            echo json_encode([
                'success' => false,
                'title' => 'New Member',
                'message' => 'Seems it is your first time to fellowship with us, you are being redirected to fill your details.',
                'redirect' => 'add-member.php?meeting_id=' . $meeting,
                'type' => 'info'
            ]);
            exit;
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'title' => 'Error',
            'message' => 'Database error occurred',
            'type' => 'danger'
        ]);
        exit;
    }
} else {
    echo json_encode([
        'success' => false,
        'title' => 'Error',
        'message' => 'Invalid request method',
        'type' => 'danger'
    ]);
    exit;
}
?>