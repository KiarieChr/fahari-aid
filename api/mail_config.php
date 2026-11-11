<?php
/**
 * Mail Configuration & Helper
 * Centralized PHPMailer configuration for all email sending
 * 
 * Update SMTP credentials here — they apply everywhere.
 */

// SMTP Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'jesusenthronednetwork@gmail.com');   // Gmail address, e.g. yourname@gmail.com
define('SMTP_PASSWORD', 'dhcu btig zwne uqds');   // Gmail App Password (16 chars)
define('SMTP_ENCRYPTION', 'tls');
define('MAIL_FROM_ADDRESS', 'jesusenthronednetwork@gmail.com');
define('MAIL_FROM_NAME', 'Jesus Enthroned Network Communications');

/**
 * Create and return a configured PHPMailer instance
 * @return PHPMailer\PHPMailer\PHPMailer
 * @throws Exception if PHPMailer files not found
 */
function createMailer() {
    $basePath = __DIR__ . '/../PHPMailer/src';
    
    require_once $basePath . '/PHPMailer.php';
    require_once $basePath . '/SMTP.php';
    require_once $basePath . '/Exception.php';
    
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';
    
    $mail->setFrom(MAIL_FROM_ADDRESS, MAIL_FROM_NAME);
    $mail->isHTML(true);
    
    return $mail;
}

/**
 * Check if SMTP is configured (credentials are set)
 * @return bool
 */
function isMailConfigured() {
    return !empty(SMTP_USERNAME) && !empty(SMTP_PASSWORD);
}
