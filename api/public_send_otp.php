<?php
/**
 * Public Send OTP
 * POST /api/public_send_otp.php
 * Body: { search_term }
 */
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();
$search_term = trim($body['search_term'] ?? '');

if (empty($search_term)) {
    apiError('Email or Phone Number is required', 400);
}

try {
    // 1. Check if pledges exist for the search term and get user details
    $stmt = $db->prepare("SELECT email, full_name FROM pledges WHERE email = :search1 OR phone_no = :search2 LIMIT 1");
    $stmt->execute([
        ':search1' => $search_term,
        ':search2' => $search_term
    ]);
    $pledge = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pledge) {
        apiError('No pledges found for this email/phone number.', 404);
    }

    $email = trim($pledge['email'] ?? '');
    if (empty($email)) {
        apiError('No email address is associated with this pledge. Please contact support.', 400);
    }

    // 2. Generate a secure 6-digit OTP
    $otp_code = sprintf("%06d", mt_rand(0, 999999));

    // 3. Create or adapt schema dynamically
    $db->exec("CREATE TABLE IF NOT EXISTS pledge_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    try {
        $db->exec("ALTER TABLE pledge_verifications ADD COLUMN search_term VARCHAR(255) NULL");
    } catch (Exception $e) {}
    try {
        $db->exec("ALTER TABLE pledge_verifications ADD COLUMN token VARCHAR(64) NULL");
    } catch (Exception $e) {}

    // 4. Delete old active OTPs for this search term
    $deleteStmt = $db->prepare("DELETE FROM pledge_verifications WHERE search_term = :term OR email = :email");
    $deleteStmt->execute([':term' => $search_term, ':email' => $email]);

    // 5. Insert new OTP
    $expires_at = date('Y-m-d H:i:s', time() + 600); // 10 minutes expiry
    $insertStmt = $db->prepare("INSERT INTO pledge_verifications (search_term, email, code, expires_at) VALUES (:term, :email, :otp, :expires)");
    $insertStmt->execute([
        ':term' => $search_term,
        ':email' => $email,
        ':otp' => $otp_code,
        ':expires' => $expires_at
    ]);

    // 6. Send Email using PHPMailer
    require_once __DIR__ . '/mail_config.php';
    $mail = createMailer();
    $mail->addAddress($email);
    $mail->Subject = 'Verification Code - Jesus Enthroned Network';
    
    $name = htmlspecialchars($pledge['full_name'] ?? 'Partner');
    $mail->Body = "
        <div style='font-family: Arial, sans-serif; padding: 30px; color: #120D20; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;'>
            <h2 style='color: #22c1e6; text-align: center;'>Pledge Search Verification</h2>
            <p>Hello {$name},</p>
            <p>You requested to access your pledge history on the Jesus Enthroned Network Member Portal. Please use the verification code below to verify your identity:</p>
            <div style='background: linear-gradient(135deg, #120D20 0%, #22c1e6 100%); color: white; padding: 15px; font-size: 28px; font-weight: bold; letter-spacing: 6px; text-align: center; border-radius: 8px; margin: 20px 0;'>
                {$otp_code}
            </div>
            <p style='color: #64748b; font-size: 0.9rem;'>This code is valid for 10 minutes. If you did not make this request, you can safely ignore this email.</p>
            <hr style='border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;'>
            <p style='font-size: 0.85rem; color: #94a3b8; text-align: center;'>Blessings,<br>Jesus Enthroned Network</p>
        </div>
    ";

    $mail->send();

    // 7. Mask email to display back to the client
    $maskedEmail = maskEmailAddress($email);
    apiSuccess(['email' => $maskedEmail], 'Verification code sent to your email.');

} catch (Exception $e) {
    error_log("OTP generation error: " . $e->getMessage());
    apiError('Failed to send verification code. ' . $e->getMessage(), 500);
}

function maskEmailAddress($email) {
    $parts = explode('@', $email);
    $name = $parts[0];
    $domain = $parts[1];
    $len = strlen($name);
    if ($len <= 2) {
        $masked = $name[0] . str_repeat('*', $len - 1);
    } else {
        $masked = $name[0] . str_repeat('*', $len - 2) . $name[$len - 1];
    }
    return $masked . '@' . $domain;
}
