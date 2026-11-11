<?php
ob_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once '../includes/connection.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../PHPMailer/src/Exception.php';
require '../PHPMailer/src/PHPMailer.php';
require '../PHPMailer/src/SMTP.php';

// Initialize response array
$response = ['success' => false, 'message' => ''];

try {
    // Validate required fields
    if (!isset($_POST['purpose']) || empty($_POST['purpose'])) {
        throw new Exception('Purpose is required');
    }
    
    if (!isset($_POST['full_name']) || empty($_POST['full_name'])) {
        throw new Exception('Full name is required');
    }
    
    if (!isset($_POST['phone_no']) || empty($_POST['phone_no'])) {
        throw new Exception('Phone number is required');
    }
    
    if (!isset($_POST['email']) || empty($_POST['email'])) {
        throw new Exception('Email is required');
    }
    
    if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // Get form data
    $purpose = $_POST['purpose'];
    $full_name = $_POST['full_name'];
    $phone_no = $_POST['phone_no'];
    $email = $_POST['email'];
    $notes = isset($_POST['notes']) ? $_POST['notes'] : '';
    
    // Initialize pledge-specific variables
    $pledges_amount = 0;
    $attendees_sponsored = 0;
    $recurring = 0;
    $sponsorship_type = '';
    $pledge_type = 'general';
    $mail = new PHPMailer(true);
    
    // Handle different pledge types
    if ($purpose === 'conference') {
        if (!isset($_POST['sponsorship_type'])) {
            throw new Exception('Sponsorship type is required for conference pledges');
        }
        
        $sponsorship_type = $_POST['sponsorship_type'];
        
        if ($sponsorship_type === 'cash') {
            if (!isset($_POST['amount']) || empty($_POST['amount'])) {
                throw new Exception('Amount is required for cash sponsorship');
            }
            $pledges_amount = (float)$_POST['amount']; // Changed to float for decimal
            $pledge_type = 'conference_cash';
        } 
        elseif ($sponsorship_type === 'attendee') {
            if (!isset($_POST['attendees']) || empty($_POST['attendees'])) {
                throw new Exception('Number of attendees is required for attendee sponsorship');
            }
            $attendees_sponsored = (int)$_POST['attendees'];
            $pledge_type = 'conference_attendee';
            
            // Calculate amount based on attendees
            $pledges_amount = $attendees_sponsored * 1500;
        }
    } else {
        // For non-conference pledges, expect a direct amount
        if (!isset($_POST['amount']) || empty($_POST['amount'])) {
            throw new Exception('Amount is required');
        }
        $pledges_amount = (float)$_POST['amount']; // Changed to float for decimal
        $pledge_type = 'general';
    }
    
    // Handle recurring pledge
    if (isset($_POST['recurring']) && $_POST['recurring'] === '1') {
        $recurring = 1;
    }
    
    // Calculate total pledges (matching decimal type)
    $total_pledges = (float)$pledges_amount;
    
    // Default status is active
    $status = 1;
    
    // Prepare SQL statement - REMOVE date field since it has default
    $sql = "INSERT INTO pledges (
        full_name, purpose, member, pledges_amount, 
        recurring, notes, phone_no, total_pledges, 
        status, member_id, email, pledge_type, attendees_sponsored
    ) VALUES (
        :full_name, :purpose, :member, :pledges_amount, 
        :recurring, :notes, :phone_no, :total_pledges, 
        :status, :member_id, :email, :pledge_type, :attendees_sponsored
    )";
    
    $stmt = $db->prepare($sql);
    
    // Execute the statement
    $result = $stmt->execute([
        ':full_name' => $full_name,
        ':purpose' => $purpose,
        ':member' => $full_name,
        ':pledges_amount' => $pledges_amount,
        ':recurring' => $recurring,
        ':notes' => $notes,
        ':phone_no' => $phone_no,
        ':total_pledges' => $total_pledges,
        ':status' => $status,
        ':member_id' => null,
        ':email' => $email,
        ':pledge_type' => $sponsorship_type,
        ':attendees_sponsored' => $attendees_sponsored
    ]);
    $pledge_date = date("Y-m-d H:i:s");
    $host = $_SERVER['HTTP_HOST'];
    $current_year = date("Y");
    if($sponsorship_type == 'attendee'){
        $pledges_amount = $attendees_sponsored." attendees sponsorship";
    }
    
    if ($result) {
        try{
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'jesusenthronednetwork@gmail.com';
            $mail->Password = 'dixakfrfuhgqimgt';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;
            $mail->SMTPDebug = 0;
            $mail->Debugoutput = 'html';
            $mail->setFrom('jesusenthronednetwork@gmail.com', 'Jesus Enthroned Network Communications');
            $mail->addAddress($email);
            $mail->isHTML(true);
            $mail->Subject = "COMMITMENT SUPPORT RECEIVED";
            $mail->Body = <<<EOD
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Thank You for Your Generous Commitment</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9ff;">
                
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9ff; padding: 20px;">
                    <tr>
                        <td align="center">
                            
                            <!-- Main Container -->
                            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); overflow: hidden; max-width: 100%;">
                                
                                <!-- Header with Gratitude Theme -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; position: relative;">
                                        
                                        <div style="position: absolute; top: 10px; left: 20px; color: rgba(255,255,255,0.2); font-size: 24px;">✨</div>
                                        <div style="position: absolute; top: 20px; right: 30px; color: rgba(255,255,255,0.2); font-size: 20px;">🙏</div>
                                        <div style="position: absolute; bottom: 15px; left: 40px; color: rgba(255,255,255,0.2); font-size: 18px;">💝</div>
                                        
                                        <img src="https://$host/assets/img/logo/logo-light.png" alt="Jesus Enthroned Network" width="120" style="margin-bottom: 20px;" />
                                        <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 10px 0; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                            Thank You! 🙏
                                        </h1>
                                        <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; font-weight: 300; letter-spacing: 0.5px;">
                                            Your generous heart makes a difference
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Main Content -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        
                                        <!-- Personal Greeting -->
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <h2 style="color: #2d3748; font-size: 24px; margin: 0 0 15px 0; font-weight: 600;">
                                                Hello $full_name,
                                            </h2>
                                            <p style="color: #4a5568; font-size: 18px; line-height: 1.6; margin: 0;">
                                                Praise the LORD Jesus,
                                                Your Commitment of <strong style="color: #667eea; font-size: 20px;">$pledges_amount </strong> has been received with immense gratitude! 
                                            </p>
                                        </div>
                                        
                                        <!-- Pledge Details Card -->
                                        <div style="background: linear-gradient(135deg, #f7fafc, #edf2f7); border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                                            <div style="display: inline-block;text-align:center; background-color: #667eea; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; font-size: 20px;">
                                                💒
                                            </div>
                                            <h3 style="color: #2d3748;text-align:center; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">
                                                Commitment Details
                                            </h3>
                                            <table width="100%" cellpadding="8" cellspacing="0" border="0" style="margin: 0 auto;">
                                                <tr>
                                                    <td style="color: #4a5568; font-weight: 600; text-align: left; border-bottom: 1px solid #e2e8f0; padding: 8px 0;">Purpose:</td>
                                                    <td style="color: #2d3748; font-weight: 500; text-transform:capitalize;text-align: right; border-bottom: 1px solid #e2e8f0; padding: 8px 0;">$purpose</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #4a5568; font-weight: 600; text-align: left; border-bottom: 1px solid #e2e8f0; padding: 8px 0;">Commitment Amount:</td>
                                                    <td style="color: #48bb78; font-weight: 700; font-size: 16px; text-align: right; border-bottom: 1px solid #e2e8f0; padding: 8px 0;">$pledges_amount</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #4a5568; font-weight: 600; text-align: left; border-bottom: 1px solid #e2e8f0; padding: 8px 0;">Committed On:</td>
                                                    <td style="color: #2d3748; font-weight: 500; text-align: right; border-bottom: 1px solid #e2e8f0; padding: 8px 0;">$pledge_date</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #4a5568; font-weight: 600; text-align: left; padding: 8px 0;">Reminder Schedule:</td>
                                                    <td style="color: #2d3748; font-weight: 500; text-align: right; padding: 8px 0;">In $notes</td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <!-- Heartfelt Message -->
                                        <div style="background-color: #fff5f5; border-left: 4px solid #fc8181; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                                            <p style="color: #2d3748; font-size: 16px; line-height: 1.8; margin: 0 0 15px 0; font-style: italic;">
                                                "Every generous act of giving and every perfect gift is from above..." - James 1:17
                                            </p>
                                            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0;">
                                                Your commitment to God's work through Jesus Enthroned Network is truly inspiring. Through your generous commitment, lives will be transformed, communities will be strengthened, and God's kingdom will advance.
                                            </p>
                                        </div>
                                        
                                        <!-- Impact Message -->
                                        <div style="text-align: center; margin: 30px 0;">
                                            <h3 style="color: #2d3748; font-size: 20px; margin: 0 0 15px 0;">Your Impact 🌟</h3>
                                            <div style="display: flex; justify-content: space-around; flex-wrap: wrap; margin: 20px 0;">
                                                <div style="text-align: center; margin: 10px; min-width: 120px;">
                                                    <div style="background-color: #e6fffa; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 10px auto; display: flex; align-items: center; justify-content: center; text-align:center;border: 3px solid #38b2ac;">
                                                        <span style="font-size: 24px; text-align:center;">🏠</span>
                                                    </div>
                                                    <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 600;">In Kingdom, We Build Systems</p>
                                                </div>
                                                <div style="text-align: center; margin: 10px; min-width: 120px;">
                                                    <div style="background-color: #fef5e7; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 10px auto; display: flex; align-items: center; justify-content: center; border: 3px solid #ed8936;text-align:center;">
                                                        <span style="font-size: 24px; text-align:center">🧍‍♂️</span>
                                                    </div>
                                                    <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 600;">In Purpose, We keep our ranks</p>
                                                </div>
                                                <div style="text-align: center; margin: 10px; min-width: 120px;">
                                                    <div style="background-color: #f0fff4; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 10px auto; display: flex; align-items: center; justify-content: center; border: 3px solid #48bb78;text-align:center;">
                                                        <span style="font-size: 24px; text-align:center;">👑</span>
                                                    </div>
                                                    <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 600;">In Unity, We Dominate</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Next Steps -->
                                        <div style="background-color: #edf2f7; border-radius: 8px; padding: 25px; margin: 30px 0;">
                                            <h4 style="color: #2d3748; font-size: 18px; margin: 0 0 15px 0; text-align: center;">What Happens Next? 📋</h4>
                                            <ul style="color: #4a5568; font-size: 15px; margin: 0; padding-left: 20px; line-height: 1.8;">
                                                <li style="margin-bottom: 8px;"><strong>Confirmation:</strong> This our confirmation email, Kindly put it in your record</li>
                                                <li style="margin-bottom: 8px;"><strong>Reminders:</strong> We'll send gentle reminders or contact you based on your chosen reminder days.</li>
                                                <li style="margin-bottom: 8px;"><strong>Updates:</strong> We will offer regular updates on how your contribution has been utilized</li>
                                                <li><strong>Recognition:</strong> You may see/receive optional acknowledgment in our ministry/organizations reports (let us know your preference)</li>
                                            </ul>
                                        </div>
                                        
                                        <!-- Payment Options -->
                                        <div style="text-align: center; margin: 30px 0;">
                                            <h4 style="color: #2d3748; font-size: 18px; margin: 0 0 20px 0;">Ready to Make Your First Redemption? 💳</h4>
                                            <a href="http://$host/make-payment.php#" 
                                            style="display: inline-block; background: linear-gradient(135deg, #48bb78, #38a169); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 5px; box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);">
                                                💰 Redeem Now
                                            </a>
                                            <br>
                                            <a href="http://$host/pledge-details.php#" 
                                            style="display: inline-block; background-color: transparent; color: #667eea; text-decoration: none; padding: 12px 25px; border: 2px solid #667eea; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 10px 5px 0 5px;text-align:center;">
                                                📄 View Commitment Details
                                            </a>
                                        </div>
                                        
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #f7fafc, #edf2f7); padding: 30px; border-top: 1px solid #e2e8f0;">
                                        
                                        <!-- Prayer Section -->
                                        <div style="text-align: center; margin-bottom: 25px; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                                            <p style="color: #2d3748; font-size: 16px; font-style: italic; margin: 0; line-height: 1.6;">
                                                "May God bless you and multiply your generosity. We are praying for you and your family, that His abundant grace and favor will rest upon you. You will not lack any good thing from God"
                                            </p>
                                            <p style="color: #4a5568; font-size: 14px; margin: 10px 0 0 0; font-weight: 600;">
                                                -The Leadership Team
                                            </p>
                                        </div>
                                        
                                        <!-- Contact Info -->
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <h4 style="color: #2d3748; font-size: 16px; margin: 0 0 10px 0;">We're Here for You 🤝</h4>
                                            <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0;">
                                                Questions about your commitment or need assistance?
                                            </p>
                                            <p style="color: #4a5568; font-size: 14px; margin: 0;">
                                                📧 <a href="mailto:jesusenthronednetwork@gmail.com" style="color: #667eea; text-decoration: none;">jesusenthronednetwork@gmail.com</a> | 
                                                📞 <a href="tel:+254702761913" style="color: #667eea; text-decoration: none;">+254(0)702 761913</a>
                                            </p>
                                        </div>
                                        
                                        <!-- Social Media -->
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0;">Stay Connected:</p>
                                            <a href="#" style="display: inline-block; margin: 0 10px; color: #4267B2; text-decoration: none; font-size: 24px;">📘</a>
                                            <a href="https://www.instagram.com/jesusenthroned/" style="display: inline-block; margin: 0 10px; color: #E4405F; text-decoration: none; font-size: 24px;">📷</a>
                                            <a href="https://x.com/jesusenthroned?t=Fm38TTcSweJBeZhR1AQ50w&s=09" style="display: inline-block; margin: 0 10px; color: #1DA1F2; text-decoration: none; font-size: 24px;">🐦</a>
                                            <a href="#" style="display: inline-block; margin: 0 10px; color: #FF0000; text-decoration: none; font-size: 24px;">📺</a>
                                        </div>
                                        
                                        <!-- Legal & Automated Notice -->
                                        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                                            <div style="background-color: #edf2f7; border: 1px solid #cbd5e0; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                                                <p style="color: #4a5568; font-size: 12px; margin: 0; font-weight: 500;">
                                                    📧 This is an automated confirmation. Please keep this email for your records.
                                                </p>
                                            </div>
                                            
                                            <p style="color: #a0aec0; font-size: 11px; margin: 0 0 5px 0;">
                                                <strong>Tax Compliance:</strong> We shall update you momentarily on our tax compliance.
                                            </p>
                                            <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                                                © $current_year Jesus Enthroned Network. Kingdom | Unity | Purpose. 🙏
                                            </p>
                                        </div>
                                        
                                    </td>
                                </tr>
                                
                            </table>
                            
                        </td>
                    </tr>
                </table>
                
            </body>
            </html>
            EOD;
            if($mail->send()){
                $response['success'] = true;
                $response['message'] = 'Commitment submitted successfully!';
                $response['pledge_id'] = $db->lastInsertId();

            }
            else{
                $response['success'] = true;
                $response['message'] = 'Commitment submitted successfully! However, we were unable to send the confirmation email.';
                $response['pledge_id'] = $db->lastInsertId();
                $response['email_error'] = 'Mailer Error: ' . $mail->ErrorInfo;
            }


        }
        catch (Exception $ee){
            $response['success'] = true;
            $response['message'] = 'Commitment submitted successfully! However, we encountered an issue sending the confirmation email.';
            $response['pledge_id'] = $db->lastInsertId();
            $response['email_error'] = 'Mailer Error: ' . $e->getMessage();
        }
        
    } else {
        // Get more detailed error information
        $errorInfo = $stmt->errorInfo();
        throw new Exception('Database error: ' . $errorInfo[2]);
    }
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

// Ensure no output before this
ob_end_clean();
echo json_encode($response,JSON_UNESCAPED_UNICODE);
exit;
?>