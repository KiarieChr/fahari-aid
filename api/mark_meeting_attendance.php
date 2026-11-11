<?php
/**
 * Mark Meeting Attendance API (Website/Public)
 * POST /api/mark_meeting_attendance.php
 * 
 * For existing members:
 * { "contact": "email@example.com or 0712345678", "meeting_id": 1 }
 * 
 * For new members (auto-register):
 * { "meeting_id": 1, "register_new": true, "first_name": "John", "last_name": "Doe",
 *   "phone_no": "0712345678", "email": "john@example.com", "gender": "Male" }
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();
$meetingId = (int)($body['meeting_id'] ?? 0);

if ($meetingId <= 0) {
    apiError('Meeting ID is required', 400);
}

try {
    // Verify meeting exists
    $stmt = $db->prepare("SELECT id, name FROM meeting WHERE id = :id");
    $stmt->execute([':id' => $meetingId]);
    $meeting = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$meeting) {
        apiError('Meeting not found', 404);
    }

    $registerNew = !empty($body['register_new']);

    if ($registerNew) {
        // === NEW MEMBER REGISTRATION + ATTENDANCE ===
        $firstName = trim($body['first_name'] ?? '');
        $lastName  = trim($body['last_name'] ?? '');
        $phoneNo   = trim($body['phone_no'] ?? '');
        $email     = trim($body['email'] ?? '');
        $gender    = trim($body['gender'] ?? '');

        if (empty($firstName) || empty($phoneNo)) {
            apiError('First name and phone number are required', 400);
        }

        // Check if phone already exists
        $stmt = $db->prepare("SELECT id, first_name, last_name FROM member WHERE phone_no = :phone LIMIT 1");
        $stmt->execute([':phone' => $phoneNo]);
        $existingMember = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existingMember) {
            // Member already exists with this phone — just mark attendance
            $memberId = (int)$existingMember['id'];
            $memberName = trim($existingMember['first_name'] . ' ' . $existingMember['last_name']);
            $isNew = false;
        } else {
            // Also check by email if provided
            if (!empty($email)) {
                $stmt = $db->prepare("SELECT id, first_name, last_name FROM member WHERE email = :email LIMIT 1");
                $stmt->execute([':email' => $email]);
                $existingMember = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            if ($existingMember) {
                $memberId = (int)$existingMember['id'];
                $memberName = trim($existingMember['first_name'] . ' ' . $existingMember['last_name']);
                $isNew = false;
            } else {
                // Create new member
                $db->beginTransaction();

                $stmt = $db->prepare("
                    INSERT INTO member (first_name, last_name, phone_no, email, gender, joined_on, delete_status)
                    VALUES (:first_name, :last_name, :phone_no, :email, :gender, NOW(), 'Active')
                ");
                $stmt->execute([
                    ':first_name' => $firstName,
                    ':last_name'  => $lastName,
                    ':phone_no'   => $phoneNo,
                    ':email'      => !empty($email) ? $email : '',
                    ':gender'     => $gender
                ]);
                $memberId = (int)$db->lastInsertId();
                $memberName = trim("$firstName $lastName");

                // Create user account with default password
                $defaultPassword = 'JEN@2026';
                $hashedPassword = password_hash($defaultPassword, PASSWORD_DEFAULT);
                $userEmail = !empty($email) ? $email : $phoneNo . '@jen.local';

                // Check if user email not taken
                $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
                $stmt->execute([':email' => $userEmail]);
                if (!$stmt->fetch()) {
                    $stmt = $db->prepare("
                        INSERT INTO users (member_id, email, password, status)
                        VALUES (:member_id, :email, :password, 1)
                    ");
                    $stmt->execute([
                        ':member_id' => $memberId,
                        ':email'     => $userEmail,
                        ':password'  => $hashedPassword
                    ]);
                }

                $db->commit();
                $isNew = true;
            }
        }
    } else {
        // === EXISTING MEMBER LOOKUP BY CONTACT ===
        $contact = trim($body['contact'] ?? '');
        if (empty($contact)) {
            apiError('Contact (email or phone) is required', 400);
        }

        $member = null;

        if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
            $stmt = $db->prepare("SELECT id, first_name, last_name FROM member WHERE email = :email LIMIT 1");
            $stmt->execute([':email' => $contact]);
            $member = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        if (!$member) {
            $cleanPhone = preg_replace('/[^0-9]/', '', $contact);
            $altPhone = '';
            if (str_starts_with($cleanPhone, '254') && strlen($cleanPhone) === 12) {
                $altPhone = '0' . substr($cleanPhone, 3);
            } elseif (str_starts_with($cleanPhone, '0') && strlen($cleanPhone) === 10) {
                $altPhone = '254' . substr($cleanPhone, 1);
            }

            $stmt = $db->prepare("SELECT id, first_name, last_name FROM member WHERE phone_no = :p1 OR phone_no = :p2 OR phone_no = :p3 LIMIT 1");
            $stmt->execute([':p1' => $contact, ':p2' => $cleanPhone, ':p3' => ($altPhone ?: $cleanPhone)]);
            $member = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        if (!$member) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'not_found' => true,
                'message' => 'Member not found. You can register as a new member below.'
            ]);
            exit;
        }

        $memberId = (int)$member['id'];
        $memberName = trim($member['first_name'] . ' ' . $member['last_name']);
        $isNew = false;
    }

    // Check if already marked attendance
    $stmt = $db->prepare("SELECT id FROM attendance WHERE member_id = :member_id AND meeting_id = :meeting_id LIMIT 1");
    $stmt->execute([':member_id' => $memberId, ':meeting_id' => $meetingId]);

    if ($stmt->fetch()) {
        echo json_encode([
            'success' => true,
            'already_marked' => true,
            'message' => "Attendance was already recorded for $memberName."
        ]);
        exit;
    }

    // Insert attendance
    $stmt = $db->prepare("
        INSERT INTO attendance (member_id, meeting_id, login_time)
        VALUES (:member_id, :meeting_id, NOW())
    ");
    $stmt->execute([
        ':member_id' => $memberId,
        ':meeting_id' => $meetingId
    ]);

    $response = [
        'success' => true,
        'message' => $isNew 
            ? "Welcome $memberName! You've been registered and attendance marked. Default password: JEN@2026"
            : "Attendance marked successfully for $memberName!"
    ];

    if ($isNew) {
        $response['is_new_member'] = true;
        $response['default_password'] = 'JEN@2026';
    }

    echo json_encode($response);

} catch (PDOException $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log("Mark meeting attendance error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not mark attendance. Please try again.'
    ]);
}
