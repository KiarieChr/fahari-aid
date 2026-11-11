<?php
/**
 * Generate Event QR Code API
 * GET /api/generate_event_qr.php?registration_id=X
 * GET /api/generate_event_qr.php?event_id=X (bulk - returns JSON with QR data strings)
 * 
 * Returns QR code as PNG image for single, or JSON array for bulk
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

$registrationId = isset($_GET['registration_id']) ? (int)$_GET['registration_id'] : 0;
$eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;
$format = $_GET['format'] ?? 'json'; // 'json' or 'image'

try {
    if ($registrationId > 0) {
        // Single registration QR
        $stmt = $db->prepare("
            SELECT r.id, r.names, r.phone_no, r.email, r.event_id, r.qr_token, e.ename
            FROM event_registration r
            JOIN event e ON r.event_id = e.id
            WHERE r.id = :id
        ");
        $stmt->execute([':id' => $registrationId]);
        $reg = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$reg) {
            apiError('Registration not found', 404);
        }
        
        // Ensure qr_token exists
        if (empty($reg['qr_token'])) {
            $token = bin2hex(random_bytes(16));
            $update = $db->prepare("UPDATE event_registration SET qr_token = :token WHERE id = :id");
            $update->execute([':token' => $token, ':id' => $reg['id']]);
            $reg['qr_token'] = $token;
        }
        
        $qrData = "EVT-{$reg['event_id']}-REG-{$reg['id']}-{$reg['qr_token']}";
        
        if ($format === 'image') {
            // Generate QR code image using TCPDF
            require_once __DIR__ . '/../tcpdf/tcpdf_barcodes_2d.php';
            
            $barcodeObj = new TCPDF2DBarcode($qrData, 'QRCODE,H');
            $png = $barcodeObj->getBarcodePngData(6, 6, [0, 0, 0]);
            
            header('Content-Type: image/png');
            header('Content-Disposition: inline; filename="qr_' . $reg['id'] . '.png"');
            echo $png;
            exit();
        }
        
        apiSuccess([
            'registration_id' => $reg['id'],
            'names' => $reg['names'],
            'event_name' => $reg['ename'],
            'qr_data' => $qrData
        ]);
        
    } elseif ($eventId > 0) {
        // Bulk QR data for all registrations in an event
        $stmt = $db->prepare("
            SELECT r.id, r.names, r.phone_no, r.email, r.event_id, r.qr_token
            FROM event_registration r
            WHERE r.event_id = :event_id
            ORDER BY r.names ASC
        ");
        $stmt->execute([':event_id' => $eventId]);
        $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $qrList = [];
        foreach ($registrations as $reg) {
            // Ensure token exists
            if (empty($reg['qr_token'])) {
                $token = bin2hex(random_bytes(16));
                $update = $db->prepare("UPDATE event_registration SET qr_token = :token WHERE id = :id");
                $update->execute([':token' => $token, ':id' => $reg['id']]);
                $reg['qr_token'] = $token;
            }
            
            $qrList[] = [
                'registration_id' => $reg['id'],
                'names' => $reg['names'],
                'phone_no' => $reg['phone_no'],
                'email' => $reg['email'],
                'qr_data' => "EVT-{$reg['event_id']}-REG-{$reg['id']}-{$reg['qr_token']}"
            ];
        }
        
        // Get event name
        $evtStmt = $db->prepare("SELECT ename FROM event WHERE id = :id");
        $evtStmt->execute([':id' => $eventId]);
        $eventName = $evtStmt->fetchColumn();
        
        apiSuccess([
            'event_id' => $eventId,
            'event_name' => $eventName,
            'total' => count($qrList),
            'registrations' => $qrList
        ]);
        
    } else {
        apiError('Either registration_id or event_id is required', 400);
    }
    
} catch (PDOException $e) {
    error_log("Generate QR error: " . $e->getMessage());
    apiError('Failed to generate QR data', 500);
}
