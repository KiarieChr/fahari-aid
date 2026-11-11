<?php
/**
 * Send Event QR Code Email API
 * POST /api/send_event_qr_email.php
 * 
 * Single:
 * { "registration_id": 140 }
 * 
 * Bulk (all registrants for an event):
 * { "event_id": 9 }
 * 
 * Sends an invitation email with event details and an inline QR code for check-in.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/mail_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$user = authenticate();
$body = getJsonBody();

$registrationId = (int)($body['registration_id'] ?? 0);
$eventId = (int)($body['event_id'] ?? 0);

if ($registrationId <= 0 && $eventId <= 0) {
    apiError('Either registration_id or event_id is required', 400);
}

if (!isMailConfigured()) {
    apiError('Email is not configured. Please set SMTP credentials in mail_config.php', 500);
}

try {
    // Build list of registrations to email
    $registrations = [];

    if ($registrationId > 0) {
        // Single
        $stmt = $db->prepare("
            SELECT r.id, r.names, r.email, r.phone_no, r.qr_token, r.event_id,
                   e.ename, e.start_date, e.end_date, e.branch as venue, e.notes
            FROM event_registration r
            JOIN event e ON r.event_id = e.id
            WHERE r.id = :id
        ");
        $stmt->execute([':id' => $registrationId]);
        $reg = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$reg) {
            apiError('Registration not found', 404);
        }
        if (empty($reg['email'])) {
            apiError('This registrant has no email address', 400);
        }
        $registrations[] = $reg;
    } else {
        // Bulk — all registrants for an event
        $stmt = $db->prepare("
            SELECT r.id, r.names, r.email, r.phone_no, r.qr_token, r.event_id,
                   e.ename, e.start_date, e.end_date, e.branch as venue, e.notes
            FROM event_registration r
            JOIN event e ON r.event_id = e.id
            WHERE r.event_id = :event_id AND r.email IS NOT NULL AND r.email != ''
            ORDER BY r.names ASC
        ");
        $stmt->execute([':event_id' => $eventId]);
        $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (empty($registrations)) {
            apiError('No registrations with email addresses found for this event', 404);
        }
    }

    // Load QR code generator
    require_once __DIR__ . '/../tcpdf/tcpdf_barcodes_2d.php';

    $sent = 0;
    $failed = 0;
    $errors = [];

    foreach ($registrations as $reg) {
        // Ensure qr_token
        if (empty($reg['qr_token'])) {
            $token = bin2hex(random_bytes(16));
            $upd = $db->prepare("UPDATE event_registration SET qr_token = :t WHERE id = :id");
            $upd->execute([':t' => $token, ':id' => $reg['id']]);
            $reg['qr_token'] = $token;
        }

        $qrString = "EVT-{$reg['event_id']}-REG-{$reg['id']}-{$reg['qr_token']}";

        // Generate QR code PNG (scale 3, error correction M for smaller file size)
        $barcodeObj = new TCPDF2DBarcode($qrString, 'QRCODE,M');
        $qrPng = $barcodeObj->getBarcodePngData(3, 3, [0, 0, 0]);

        if (empty($qrPng)) {
            error_log("QR PNG generation failed for reg #{$reg['id']} - GD may not be loaded");
            $failed++;
            $errors[] = "{$reg['names']} ({$reg['email']}): QR code generation failed (GD extension required)";
            continue;
        }

        // Format dates
        $startDate = date('l, F j, Y', strtotime($reg['start_date']));
        $startTime = date('g:i A', strtotime($reg['start_date']));
        $endDate = date('l, F j, Y', strtotime($reg['end_date']));

        $firstName = explode(' ', trim($reg['names']))[0];
        $venue = htmlspecialchars($reg['venue'] ?: 'TBA', ENT_QUOTES, 'UTF-8');
        $eventName = htmlspecialchars($reg['ename'], ENT_QUOTES, 'UTF-8');
        $eventNotes = htmlspecialchars($reg['notes'] ?: '', ENT_QUOTES, 'UTF-8');

        // HTML email body
        $htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f4f7;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding:30px 40px; text-align:center;">
    <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">You're Invited! 🎉</h1>
    <p style="margin:8px 0 0; color:rgba(255,255,255,0.9); font-size:14px;">Jesus Enthroned Network</p>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:30px 40px;">
    <p style="font-size:16px; color:#333; margin:0 0 20px;">
        Dear <strong>{$firstName}</strong>,
    </p>
    <p style="font-size:15px; color:#555; line-height:1.6; margin:0 0 20px;">
        We are thrilled to invite you to our upcoming event! Your registration has been confirmed and we look forward to seeing you there.
    </p>

    <!-- Event Details Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5ff; border-radius:10px; border:1px solid #e9e0ff; margin:0 0 25px;">
    <tr><td style="padding:20px 25px;">
        <h2 style="margin:0 0 15px; color:#7c3aed; font-size:20px;">{$eventName}</h2>
        <table cellpadding="0" cellspacing="0">
        <tr>
            <td style="padding:4px 0; color:#888; font-size:13px; width:80px;">📅 Date</td>
            <td style="padding:4px 0 4px 10px; color:#333; font-size:14px; font-weight:500;">{$startDate}</td>
        </tr>
        <tr>
            <td style="padding:4px 0; color:#888; font-size:13px;">🕐 Time</td>
            <td style="padding:4px 0 4px 10px; color:#333; font-size:14px; font-weight:500;">{$startTime}</td>
        </tr>
        <tr>
            <td style="padding:4px 0; color:#888; font-size:13px;">📍 Venue</td>
            <td style="padding:4px 0 4px 10px; color:#333; font-size:14px; font-weight:500;">{$venue}</td>
        </tr>
        <tr>
            <td style="padding:4px 0; color:#888; font-size:13px;">📅 Ends</td>
            <td style="padding:4px 0 4px 10px; color:#333; font-size:14px; font-weight:500;">{$endDate}</td>
        </tr>
        </table>
HTML;

        if (!empty($eventNotes)) {
            $htmlBody .= <<<HTML
        <p style="margin:12px 0 0; color:#666; font-size:13px; line-height:1.5; border-top:1px solid #e9e0ff; padding-top:12px;">
            {$eventNotes}
        </p>
HTML;
        }

        $htmlBody .= <<<HTML
    </td></tr>
    </table>

    <!-- QR Code Section -->
    <div style="text-align:center; margin:25px 0; background-color:#ffffff; border-radius:12px; padding:25px 15px; border:2px solid #e9e0ff;">
        <p style="font-size:15px; color:#333; font-weight:600; margin:0 0 10px;">Your Check-in QR Code</p>
        <p style="font-size:13px; color:#888; margin:0 0 15px;">
            Present this QR code at the event entrance for a quick check-in
        </p>
        <div style="display:inline-block; background:#ffffff; border:1px solid #ddd; border-radius:8px; padding:15px;">
            <img src="cid:qrcode_{$reg['id']}" width="180" height="180" alt="QR Check-in Code" style="display:block; background-color:#ffffff;" />
        </div>
        <p style="font-size:11px; color:#aaa; margin:10px 0 0;">Registration #{$reg['id']}</p>
    </div>

    <hr style="border:none; border-top:1px solid #eee; margin:25px 0;" />

    <p style="font-size:14px; color:#555; line-height:1.6; margin:0 0 10px;">
        ✨ <strong>What to expect:</strong> Worship, fellowship, and spiritual growth with the body of Christ!
    </p>
    <p style="font-size:14px; color:#555; line-height:1.6; margin:0;">
        If you have any questions, feel free to reach out to us. We are praying for you!
    </p>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background-color:#f8f5ff; padding:20px 40px; text-align:center; border-top:1px solid #e9e0ff;">
    <p style="margin:0 0 5px; color:#7c3aed; font-size:14px; font-weight:600;">Jesus Enthroned Ministry</p>
    <p style="margin:0; color:#999; font-size:12px;">Building a community of faith, hope, and love.</p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>
HTML;

        // Send email
        try {
            $mail = createMailer();
            $mail->addAddress($reg['email'], $reg['names']);
            $mail->Subject = "🎉 You're Invited: {$reg['ename']} — Your QR Check-in Code";
            $mail->Body = $htmlBody;
            
            // Plain text fallback
            $mail->AltBody = "Dear {$firstName},\n\n"
                . "You are invited to {$reg['ename']}!\n\n"
                . "Date: {$startDate} at {$startTime}\n"
                . "Venue: {$venue}\n"
                . "Ends: {$endDate}\n\n"
                . "Your QR check-in code will be available at the event registration desk.\n\n"
                . "We look forward to seeing you!\n"
                . "— Jesus Enthroned Ministry";

            // Attach QR code as inline image (raw binary from TCPDF)
            $mail->addStringEmbeddedImage($qrPng, "qrcode_{$reg['id']}", "qrcode.png", PHPMailer\PHPMailer\PHPMailer::ENCODING_BASE64, 'image/png');

            // Enable SMTP debug output to error_log on failure
            $mail->SMTPDebug = 0;
            $mail->Debugoutput = function($str, $level) {
                error_log("SMTP DEBUG [$level]: $str");
            };

            $mail->send();
            $sent++;

            // Small delay between sends to avoid Gmail rate limiting
            if (count($registrations) > 1) {
                usleep(500000); // 0.5 seconds
            }
        } catch (\Exception $e) {
            $failed++;
            $errorMsg = $e->getMessage();
            
            // Log detailed SMTP info on failure
            error_log("QR email failed for reg #{$reg['id']} ({$reg['email']}): " . $errorMsg);
            if (isset($mail) && $mail->ErrorInfo) {
                error_log("PHPMailer ErrorInfo: " . $mail->ErrorInfo);
            }
            
            $errors[] = "{$reg['names']} ({$reg['email']}): " . $errorMsg;
        }
    }

    $total = count($registrations);
    $message = $sent === 1
        ? "QR code email sent to {$registrations[0]['names']}!"
        : "Sent {$sent} of {$total} emails successfully.";

    if ($failed > 0) {
        $message .= " {$failed} failed.";
    }

    apiSuccess([
        'total' => $total,
        'sent' => $sent,
        'failed' => $failed,
        'errors' => $errors
    ], $message);

} catch (PDOException $e) {
    error_log("Send QR email error: " . $e->getMessage());
    apiError('Failed to send QR emails', 500);
}
