<?php
function userHasPermission(PDO $db, $userId, $permissionName) {
    // Step 1: Get permission ID by name
    $permStmt = $db->prepare("SELECT id FROM permissions WHERE name = ?");
    $permStmt->execute([$permissionName]);
    $permission = $permStmt->fetch(PDO::FETCH_ASSOC);

    if (!$permission) {
        return false; // Permission doesn't exist
    }

    $permissionId = $permission['id'];

    // Step 2: Check if the user's roles have this permission
    $stmt = $db->prepare("
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        WHERE ur.user_id = ? AND rp.permission_id = ?
        LIMIT 1
    ");
    $stmt->execute([$userId, $permissionId]);

    return $stmt->fetchColumn() ? true : false;
}

function createUserNotification($db, $title, $message, $type, $user_id) {
    $stmt = $db->prepare("INSERT INTO notifications (title, message, type, user_id) VALUES (?, ?, ?, ?)");
    $stmt->execute([$title, $message, $type, $user_id]);
    
}

function createRoleNotification($db, $title, $message, $type, $role_id) {
    $stmt = $db->prepare("INSERT INTO notifications (title, message, type, role_id) VALUES (?, ?, ?, ?)");
    $stmt->execute([$title, $message, $type, $role_id]);
    
}

function createGeneralNotification($db, $title, $message, $type) {
    $stmt = $db->prepare("INSERT INTO notifications (title, message, type, role_based) VALUES (?, ?, ?, 0)");
    $stmt->execute([$title, $message, $type]);
    
}
function sendMail($mail,$sendTo,$subject,$body, $receivedFrom, $redirect){
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com'; // Set your SMTP server
        $mail->SMTPAuth = true;
        $mail->Username = 'jesusenthronednetwork@gmail.com';
        $mail->Password = 'kbtqkebodlbexuaf'; // Use App Password if 2FA is enabled
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Use TLS
        $mail->Port = 587; // Port for TLS

        $mail->SMTPDebug = 0; // Set to 0 when in production
        $mail->Debugoutput = 'html';

        $mail->setFrom($receivedFrom, 'Jesus Enthroned Network Communications');
        $mail->addAddress($sendTo);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        
        // Send email
        if ($mail->send()) {
            setcookie('sent', "A reset link has been sent to your email.\nCheck your Email.", time() + 60, "/");
            header("Location: ".$redirect); 
            exit();// 
        } else {
            setcookie('error', "Failed to send email. Try Again Later", time() + 60, "/");
            header("Location: ".$redirect); 
            exit();
        }
        
    } catch (Exception $e) {
        setcookie('error', "Mailer Error: " . $mail->ErrorInfo, time() + 60, "/");
            header("Location: ".$redirect); 
            exit();
        $_SESSION['error'] = "Mailer Error: " . $mail->ErrorInfo;
    }
    
    
}
function savePendingRequest($pdo, $phone, $amount, $accountRef, $checkoutRequestID) {
    $stmt = $pdo->prepare("INSERT INTO pending_stk_requests 
        (phone, amount, account_reference, checkout_request_id, status)
        VALUES (:phone, :amount, :ref, :checkout, 'pending')");
    
    $stmt->execute([
        'phone'    => $phone,
        'amount'   => $amount,
        'ref'      => $accountRef,
        'checkout' => $checkoutRequestID
    ]);
}


function assignNotificationToRoles($db, $notificationId, $roleIds) {
    $stmt = $db->prepare("INSERT INTO notification_roles (notification_id, role_id) VALUES (?, ?)");
    foreach ($roleIds as $roleId) {
        $stmt->execute([$notificationId, $roleId]);
    }
}
function getUserNotifications($db, $user_id) {
    $stmt = $db->prepare("
        SELECT n.id, n.title, n.message, n.created_at, nu.is_read
        FROM notification_users nu
        JOIN notifications n ON nu.notification_id = n.id
        WHERE nu.user_id = ?
        ORDER BY n.created_at DESC
    ");
    $stmt->execute([$user_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function log_audit_trail(PDO $db, string $tableName, int $recordId, string $action, ?array $oldValues, ?array $newValues, int $userId): void {
    $stmt = $db->prepare("
        INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id, ip_address)
        VALUES (:table, :record_id, :action, :old_val, :new_val, :user_id, :ip)
    ");
    $stmt->execute([
        ':table' => $tableName,
        ':record_id' => $recordId,
        ':action' => $action,
        ':old_val' => $oldValues ? json_encode($oldValues) : null,
        ':new_val' => $newValues ? json_encode($newValues) : null,
        ':user_id' => $userId,
        ':ip' => $_SERVER['REMOTE_ADDR'] ?? null,
    ]);
}
?>

