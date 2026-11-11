<?php
session_start();

include '../includes/connection.php'; // Database connection

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../PHPMailer/src/Exception.php';
require '../PHPMailer/src/PHPMailer.php';
require '../PHPMailer/src/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $eemail = trim($_POST['email']);
    
    // Validate email
    if (!filter_var($eemail, FILTER_VALIDATE_EMAIL)) {
        setcookie('error', "Invalid Email", time() + 60, "/"); // 
        header("Location: forgot-password.php");
        exit();
    }

    // Check if email exists
    $stmt = $db->prepare("SELECT email FROM users WHERE email = :email");
    
    $stmt->bindParam(":email", $eemail, PDO::PARAM_STR);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($result)) {
        setcookie('error', "Email Does not Exist", time() + 60, "/"); // valid for one minute

        header("Location: ../reset-password.php");
        exit();
    }

    // Generate secure token
    $token = bin2hex(random_bytes(32));
    $expires_at = date("Y-m-d H:i:s", strtotime("+15 minutes"));

    // Store token
    $stmt2 = $db->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (:email, :token, :expires)");
    $stmt2->bindParam(":email", $eemail,PDO::PARAM_STR);
    $stmt2->bindParam(":token", $token,PDO::PARAM_STR);
    $stmt2->bindParam(":expires", $expires_at, PDO::PARAM_STR);
    $stmt2->execute();

    // Log the request
    $user_agent = $_SERVER['HTTP_USER_AGENT'];
    $ip_address= $_SERVER['REMOTE_ADDR'];
    $stmt2 = $db->prepare("INSERT INTO reset_logs (email, ip_address, user_agent) VALUES (:email, :ip_address, :user_agent)");
    //echo "INSERT INTO reset_logs (email, ip_address, user_agent) VALUES ('$email', '$ip_address', '$user_agent');";
    $stmt2->bindParam(":email", $eemail,PDO::PARAM_STR);
    $stmt2->bindParam(":ip_address",$ip_address,PDO::PARAM_STR);
    $stmt2->bindParam(":user_agent", $user_agent, PDO::PARAM_STR);
    $stmt2->execute();
    $host = $_SERVER['HTTP_HOST'];

    // Send email
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com'; // Set your SMTP server
        $mail->SMTPAuth = true;
        $mail->Username = 'jesusenthronednetwork@gmail.com';
        $mail->Password = 'iplmupiblbrvtqjp'; // Use App Password if 2FA is enabled
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Use TLS
        $mail->Port = 587; // Port for TLS

        $mail->SMTPDebug = 0; // Set to 0 when in production
        $mail->Debugoutput = 'html';

        $mail->setFrom('jesusenthronednetwork@gmail.com', 'Jesus Enthroned Network Communications');
        $mail->addAddress($eemail);
        $mail->isHTML(true);
        $mail->Subject = "PASSWORD RESET REQUEST";
        $mail->Body = "
            <div style='max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                <div style='background-color: #696cff; padding: 20px; text-align: center;'>
                    <h2 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;'>Jesus Enthroned Network</h2>
                </div>
                <div style='padding: 30px; background-color: #ffffff;'>
                    <h3 style='color: #333333; margin-top: 0;'>Hello,</h3>
                    <p style='color: #555555; font-size: 16px; line-height: 1.5;'>We received a request to reset the password associated with this email address ($eemail). If you made this request, please click the button below to securely reset your password:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='http://$host/jesusenthroned/reset-password.php?token=$token' 
                           style='display: inline-block; padding: 14px 28px; background-color: #696cff; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;'>
                           Reset Password
                        </a>
                    </div>
                    <p style='color: #555555; font-size: 14px; margin-bottom: 5px;'>Or copy and paste this link into your browser:</p>
                    <p style='background-color: #f8f9fa; padding: 12px; border-radius: 5px; word-break: break-all; color: #696cff; font-size: 13px; margin-top: 0; border: 1px dashed #d9dee3;'>
                        http://$host/jesusenthroned/reset-password.php?token=$token
                    </p>
                    <p style='color: #777777; font-size: 14px; margin-top: 25px;'>If you did not request a password reset, you can safely ignore this email. For your security, this link will expire in 15 minutes.</p>
                </div>
                <div style='background-color: #f8f9fa; padding: 15px 30px; text-align: center; border-top: 1px solid #e0e0e0;'>
                    <p style='font-size: 12px; color: #888888; margin: 0; line-height: 1.6;'>
                        &copy; " . date('Y') . " Jesus Enthroned Network. All rights reserved.<br>
                        This is an automated message. Please do not reply.
                    </p>
                </div>
            </div>
        ";
        
        // Send email
        if ($mail->send()) {
            setcookie('sent', "A reset link has been sent to your email.\nCheck your Email. Note  the link will expire in 15mins", time() + 60, "/");
            header("Location: ../reset-password.php"); 
            exit();// 
        } else {
            setcookie('error', "Failed to send email. Try Again Later", time() + 60, "/");
            header("Location: ../reset-password.php"); 
            exit();
        }
        
    } catch (Exception $e) {
        setcookie('error', "Mailer Error: " . $mail->ErrorInfo, time() + 60, "/");
            header("Location: ../reset-password.php"); 
            exit();
        $_SESSION['error'] = "Mailer Error: " . $mail->ErrorInfo;
    }
    
    
}
?>