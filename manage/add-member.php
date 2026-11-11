<?php
require '../includes/connection.php';
date_default_timezone_set('Africa/Nairobi');

// Set header for JSON response
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Initialize response array
    $response = [
        'success' => false,
        'message' => '',
        'redirect' => '',
        'type' => 'error',
        'title' => 'Error'
    ];

    try {
        // Validate required fields
        $requiredFields = ['first_name', 'last_name', 'email', 'phone_no', 'residence', 'invited_by', 'marital_status', 'emp_status', 'dob'];
        foreach ($requiredFields as $field) {
            if (empty($_POST[$field])) {
                throw new Exception("Please fill in all required fields");
            }
        }

        $fname = $_POST['first_name'];
        $last_name = $_POST['last_name'];
        $email = $_POST['email'];
        $phone_no = $_POST['phone_no'];
        $residence = $_POST['residence'];
        $invited_by = $_POST['invited_by'];
        $marital_status = $_POST['marital_status'];
        $emp_status = $_POST['emp_status'];
        $bod = $_POST['dob'];

        function normalizePhoneNumber($number) {
            $number = preg_replace('/\D/', '', $number);
            if (substr($number, 0, 1) === '0') {
                $number = substr($number, 1);
            }
            return $number;
        }

        // Validate and format date
        $dob = trim($bod);
        if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $dob)) {
            throw new Exception("Invalid date format. Please use MM/DD/YYYY");
        }
        
        $date = DateTime::createFromFormat('m/d/Y', $dob);
        if (!$date) {
            throw new Exception("Invalid date. Please check your input");
        }
        $formattedDate = $date->format('Y-m-d');

        // Check if member exists
        $sql = "SELECT * FROM member WHERE phone_no=:phone_no OR email=:email LIMIT 1";
        $query = $db->prepare($sql);
        $query->bindParam(':phone_no', $phone_no, PDO::PARAM_STR);
        $query->bindParam(':email', $email, PDO::PARAM_STR);
        $query->execute();

        if ($query->rowCount() > 0) {
            $result = $query->fetch(PDO::FETCH_OBJ);
            $user_id = $result->id;
            
            if (isset($_POST['meeting_id'])) {
                $meeting_id = $_POST['meeting_id'];
                $meeting_l = $db->prepare("SELECT * FROM meeting WHERE id=:meeting_id");
                $meeting_l->bindParam(':meeting_id', $meeting_id, PDO::PARAM_INT);
                $meeting_l->execute();
                $res = $meeting_l->fetch(PDO::FETCH_OBJ);
                
                if ($res) {
                    // Mark attendance
                    $attend = $db->prepare("INSERT INTO attendance (member_id, meeting_id) VALUES (:member_id, :meeting_id)");
                    $attend->execute([':member_id' => $user_id, ':meeting_id' => $meeting_id]);
                    
                    $response = [
                        'success' => true,
                        'message' => 'You already exist in our system. Redirecting to meeting...',
                        'redirect' => $res->meeting_link,
                        'type' => 'success',
                        'title' => 'Welcome Back!'
                    ];
                }
            } else {
                $response = [
                    'success' => true,
                    'message' => 'Member already exists in the system',
                    'redirect' => 'view-members.php',
                    'type' => 'success',
                    'title' => 'Member Exists'
                ];
            }
        } else {
            // Insert new member
            $phone_norm = normalizePhoneNumber($phone_no);
            $stmt = $db->prepare("INSERT INTO member (first_name, last_name, email, phone_no, location, department, marital, emp_status, bod) 
                                VALUES (:fname, :lname, :email, :phone_no, :location, :invited_by, :marital, :emp_status, :bod)");
            
            $stmt->execute([
                ':fname' => $fname,
                ':lname' => $last_name,
                ':email' => $email,
                ':phone_no' => $phone_no,
                ':location' => $residence,
                ':invited_by' => $invited_by,
                ':marital' => $marital_status,
                ':emp_status' => $emp_status,
                ':bod' => $formattedDate
            ]);
            
            $user_id = $db->lastInsertId();
            
            // Push notifications to admins
            // $grole = $db->prepare("SELECT id from roles WHERE name='Administrator' or name='General Admin'");
            // $grole->execute();
            // $roles = $grole->fetchAll(PDO::FETCH_ASSOC);

            // if (!empty($roles)) {
            //     foreach ($roles as $row) {
            //         $id = $row['id'];
            //         $title = "New Member added $fname $last_name";
            //         $message = "A new member has joined the platform. You can assign them to a cell";
            //         $type = "info";
            //         createRoleNotification($db, $title, $message, $type, $id);
            //     }
            // }

            if (isset($_POST['meeting_id'])) {
                $meeting_id = $_POST['meeting_id'];
                $meeting_l = $db->prepare("SELECT * FROM meeting WHERE id=:meeting_id");
                $meeting_l->bindParam(':meeting_id', $meeting_id, PDO::PARAM_INT);
                $meeting_l->execute();
                $res = $meeting_l->fetch(PDO::FETCH_OBJ);
                
                if ($res) {
                    // Mark attendance
                    $attend = $db->prepare("INSERT INTO attendance (member_id, meeting_id) VALUES (:member_id, :meeting_id)");
                    $attend->execute([':member_id' => $user_id, ':meeting_id' => $meeting_id]);
                    
                    $response = [
                        'success' => true,
                        'message' => 'Member added successfully. Redirecting to meeting...',
                        'redirect' => $res->meeting_link,
                        'type' => 'success',
                        'title' => 'Success!'
                    ];
                }
            } else {
                $response = [
                    'success' => true,
                    'message' => 'Member added successfully',
                    'redirect' => 'view_members.php',
                    'type' => 'success',
                    'title' => 'Success!'
                ];
            }
        }
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            $response = [
                'success' => false,
                'message' => 'Duplicate entry. This email or phone number already exists.',
                'type' => 'error',
                'title' => 'Duplicate Entry'
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage(),
                'type' => 'error',
                'title' => 'Database Error'
            ];
        }
    } catch (Exception $e) {
        $response = [
            'success' => false,
            'message' => $e->getMessage(),
            'type' => 'error',
            'title' => 'Error'
        ];
    }
} else {
    $response = [
        'success' => false,
        'message' => 'Invalid request method',
        'type' => 'error',
        'title' => 'Invalid Request'
    ];
}

echo json_encode($response);
exit;
?>