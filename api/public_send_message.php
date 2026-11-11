<?php
/**
 * Public Send Message
 * POST /api/public_send_message.php
 * Body: { full_name, email, phone, subject, message }
 */
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body = getJsonBody();
$full_name = trim($body['full_name'] ?? '');
$email = trim($body['email'] ?? '');
$phone = trim($body['phone'] ?? '');
$subject = trim($body['subject'] ?? '');
$message = trim($body['message'] ?? '');

if (empty($full_name) || empty($email) || empty($subject) || empty($message)) {
    apiError('Full Name, Email, Subject and Message are required', 400);
}

try {
    // 1. Create table dynamically if not exists
    $db->exec("CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // 2. Insert message details
    $stmt = $db->prepare("INSERT INTO contact_messages (full_name, email, phone, subject, message) VALUES (:name, :email, :phone, :subject, :msg)");
    $stmt->execute([
        ':name' => $full_name,
        ':email' => $email,
        ':phone' => $phone,
        ':subject' => $subject,
        ':msg' => $message
    ]);

    // 3. Send Notification Email to Admin
    require_once __DIR__ . '/mail_config.php';
    $mail = createMailer();
    
    // Send to admin email address
    $mail->addAddress(SMTP_USERNAME); // send to admin
    $mail->Subject = 'New Contact Inquiry: ' . htmlspecialchars($subject);
    
    $clean_name = htmlspecialchars($full_name);
    $clean_email = htmlspecialchars($email);
    $clean_phone = htmlspecialchars($phone ? $phone : 'Not provided');
    $clean_msg = nl2br(htmlspecialchars($message));
    
    $mail->Body = "
        <div style='font-family: Arial, sans-serif; padding: 30px; color: #120D20; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;'>
            <h2 style='color: #22c1e6; margin-top: 0;'>New Website Inquiry</h2>
            <p>You have received a new contact submission from the website member portal.</p>
            <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                <tr style='background: #f8fafc;'><td style='padding: 10px; font-weight: bold; width: 120px;'>From:</td><td style='padding: 10px;'>{$clean_name}</td></tr>
                <tr><td style='padding: 10px; font-weight: bold;'>Email:</td><td style='padding: 10px;'>{$clean_email}</td></tr>
                <tr style='background: #f8fafc;'><td style='padding: 10px; font-weight: bold;'>Phone:</td><td style='padding: 10px;'>{$clean_phone}</td></tr>
                <tr><td style='padding: 10px; font-weight: bold;'>Subject:</td><td style='padding: 10px;'>{$clean_name}</td></tr>
            </table>
            <div style='background: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 10px;'>
                <strong style='color: #120D20;'>Message:</strong><br><br>
                <div style='color: #475569; font-size: 0.95rem; line-height: 1.5;'>{$clean_msg}</div>
            </div>
            <hr style='border: none; border-top: 1px solid #cbd5e1; margin: 25px 0;'>
            <p style='font-size: 0.85rem; color: #94a3b8; text-align: center;'>This is an automated notification from Jesus Enthroned Network Member Portal.</p>
        </div>
    ";
    
    $mail->send();

    apiSuccess(null, 'Message sent successfully! We will get back to you soon.');

} catch (Exception $e) {
    error_log("Contact message submission error: " . $e->getMessage());
    apiError('Failed to send your message. Please try again later.', 500);
}
