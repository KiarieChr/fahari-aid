<?php
// Ensure no output before headers
if (ob_get_level()) ob_end_clean();

// Set JSON header
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

// Enable error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../PHPMailer/src/Exception.php';
require '../PHPMailer/src/PHPMailer.php';
require '../PHPMailer/src/SMTP.php';
try {
    session_start();
    require_once('../includes/connection.php');
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use POST to submit login.'
    ]));
    }

    $names = trim($_POST['names'] ?? '');
    $phone_no = trim($_POST['phone_no'] ?? '');
    $email= trim($_POST['email'] ?? '');
    $residence = trim($_POST['residence'] ?? '');
    $gender= trim($_POST['gender'] ?? '');
    $event_id = trim($_POST['event_id'] ?? '');
    $area_travel_from = trim($_POST['area_travel_from'] ?? '');
    $attendees = trim($_POST['attendees'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $specialNeeds = trim($_POST['specialNeeds'] ?? '');
     $serve            = isset($_POST['serve']) && $_POST['serve'] ? 1 : 0; 
    $prayer = trim($_POST['prayer'] ?? '');
    $guardian_telno = trim($_POST['guardian_telno']) ?? '';
    $sponsorship = trim($_POST['sponsorship']) ?? '';
    

    // check wther the user has registered again
    $stmt = $db->prepare("
        SELECT id FROM event_registration 
        WHERE email = :email AND event_id = :event_id 
        LIMIT 1
    ");
    $stmt->execute([':email' => $email, ':event_id' => $event_id]);

    if ($stmt->fetch()) {
        throw new Exception('Your registration for this event has already been captured.', 409);
    }
    

    
    // Insert new registration
    $insert = $db->prepare("
        INSERT INTO event_registration 
        (names, gender, email, phone_no, residence, event_id, travelling_from, serve, special_needs, category, prayer, attendees, guardian_telno, sponsorship) 
        VALUES 
        (:names, :gender, :email, :phone_no, :residence, :event_id, :travelling_from, :serve, :special_needs, :category, :prayer, :attendees, :guardian_telno,:sponsorship)
    ");
    
    $insert->execute([
        ':names'          => $names,
        ':gender'         => $gender,
        ':email'          => $email,
        ':phone_no'       => $phone_no,
        ':residence'      => $residence,
        ':event_id'       => $event_id,
        ':travelling_from'=> $area_travel_from,
        ':serve'          => $serve,
        ':special_needs'  => $specialNeeds,
        ':category'       => $category,
        ':prayer'         => $prayer,
        ':attendees'      => $attendees,
        ':guardian_telno' => $guardian_telno,
        ':sponsorship'    => $sponsorship,
    ]);
    $host = $_SERVER['HTTP_HOST'];
    $current_year = date("Y");
    $mail = new PHPMailer(true);
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
                <title>Thank You for Your Generous Pledge</title>
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
                                            Your a solution to Generation
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Main Content -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        
                                        <!-- Personal Greeting -->
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <h2 style="color: #2d3748; font-size: 24px; margin: 0 0 15px 0; font-weight: 600;">
                                                Hello $names,
                                            </h2>
                                            <p style="color: #4a5568; font-size: 18px; line-height: 1.6; margin: 0;">
                                                Praise the LORD Jesus,
                                                We have gracefully received your commitment to attend our conference. We are happy to have you. One of our annointed support team will reach to you. The facilitation fee is  <strong style="color: #667eea; font-size: 20px;">Ksh 1,500 </strong>.  
                                            </p>
                                        </div>
                                        
                                        
                                        
                                        <!-- Heartfelt Message -->
                                        <div style="background-color: #fff5f5; border-left: 4px solid #fc8181; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                                            <p style="color: #2d3748; font-size: 16px; line-height: 1.8; margin: 0 0 15px 0; font-style: italic;">
                                                "Out of his own will has he begotten us in love and truth..." - James 1:15
                                            </p>
                                            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0;">
                                                Your commitment to attending the conference shows that surely God is in a work in our generation that no man can stop. We are in move of God in our times that is going to outlive us, All we say is 'We are ready Lord!'. 
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
                                                    <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 600;">In Purpose, We maintain our ranks</p>
                                                </div>
                                                <div style="text-align: center; margin: 10px; min-width: 120px;">
                                                    <div style="background-color: #f0fff4; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 10px auto; display: flex; align-items: center; justify-content: center; border: 3px solid #48bb78;text-align:center;">
                                                        <span style="font-size: 24px; text-align:center;">👑</span>
                                                    </div>
                                                    <p style="color: #4a5568; font-size: 14px; margin: 0; font-weight: 600;">In Unity, We Care</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                       
                                        
                                       
                                        
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #f7fafc, #edf2f7); padding: 30px; border-top: 1px solid #e2e8f0;">
                                        
                                        <!-- Prayer Section -->
                                        <div style="text-align: center; margin-bottom: 25px; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                                            <p style="color: #2d3748; font-size: 16px; font-style: italic; margin: 0; line-height: 1.6;">
                                                "The Lord Bless you as you purpose to attend the conference. We are continually praying for you."
                                            </p>
                                            <p style="color: #4a5568; font-size: 14px; margin: 10px 0 0 0; font-weight: 600;">
                                                -The Leadership Team
                                            </p>
                                        </div>
                                        
                                        <!-- Contact Info -->
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <h4 style="color: #2d3748; font-size: 16px; margin: 0 0 10px 0;">We're Here for You 🤝</h4>
                                            <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0;">
                                                Questions about the Event?
                                            </p>
                                            <p style="color: #4a5568; font-size: 14px; margin: 0;">
                                                📩 <a href="mailto:jesusenthronednetwork@gmail.com" style="color: #667eea; text-decoration: none;">jesusenthronednetwork@gmail.com</a> | 
                                                📞 <a href="tel:+254702761913" style="color: #667eea; text-decoration: none;">+254(0)702 761913</a>
                                            </p>
                                        </div>
                                        
                                        <!-- Social Media -->
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0;">Stay Connected:</p>
                                            <a href="#" style="display: inline-block; margin: 0 10px; color: #4267B2; text-decoration: none; font-size: 24px;"><img src="" style="width:40px"/></a>
                                            <a href="https://www.instagram.com/jesusenthroned/" style="display: inline-block; margin: 0 10px; color: #E4405F; text-decoration: none; font-size: 24px;"><img src="" style="width:40px"/></a>
                                            <a href="https://x.com/jesusenthroned?t=Fm38TTcSweJBeZhR1AQ50w&s=09" style="display: inline-block; margin: 0 10px; color: #1DA1F2; text-decoration: none; font-size: 24px;"><img src="" style="width:40px"/></a>
                                            <a href="#" style="display: inline-block; margin: 0 10px; color: #FF0000; text-decoration: none; font-size: 24px;"><img src="" style="width:40px"/></a>
                                        </div>
                                        
                                        <!-- Automated Notice -->
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
                $response['message'] = 'Pledge submitted successfully! However, we were unable to send the confirmation email.';
                $response['pledge_id'] = $db->lastInsertId();
                $response['email_error'] = 'Mailer Error: ' . $mail->ErrorInfo;
            }


        }
        catch (Exception $ee){
            $response['success'] = true;
            $response['message'] = 'Pledge submitted successfully! However, we encountered an issue sending the confirmation email.';
            $response['pledge_id'] = $db->lastInsertId();
            $response['email_error'] = 'Mailer Error: ' . $ee->getMessage();
        }


    die(json_encode([
        'success' => true,
        'message' => 'Registration successful! We\’ve captured your details.'
    ]));

} catch (Exception $e) {
    $code = is_numeric($e->getCode()) ? (int)$e->getCode() : 500;
    http_response_code($code);

    die(json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]));
}
?>