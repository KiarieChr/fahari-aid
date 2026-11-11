<?php
/**
 * Create Meeting API
 * POST /api/create_meeting.php
 * 
 * Body: { title, meeting_type, date, time, end_time, facilitator, meeting_link, description, banner (base64) }
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

$user = authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

// Handle both JSON and multipart/form-data (for file upload)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

if (strpos($contentType, 'multipart/form-data') !== false) {
    $data = $_POST;
    $bannerFile = $_FILES['banner'] ?? null;
} else {
    $data = getJsonBody();
    $bannerFile = null;
}

$title = trim($data['title'] ?? '');
$meetingType = (int)($data['meeting_type'] ?? 0);
$date = trim($data['date'] ?? '');
$time = trim($data['time'] ?? '');
$endTime = trim($data['end_time'] ?? '');
$facilitator = (int)($data['facilitator'] ?? 0);
$meetingLink = trim($data['meeting_link'] ?? '');
$description = trim($data['description'] ?? '');

// Validation
if (empty($title)) apiError('Meeting title is required');
if (empty($date)) apiError('Date is required');
if (empty($time)) apiError('Start time is required');

$startTimestamp = $date . ' ' . $time . ':00';
$endTimestamp = $endTime ? $date . ' ' . $endTime . ':00' : date('Y-m-d H:i:s', strtotime($startTimestamp . ' +2 hours'));

// Handle banner upload
$bannerPath = null;
if ($bannerFile && $bannerFile['error'] === UPLOAD_ERR_OK) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!in_array($bannerFile['type'], $allowedTypes)) {
        apiError('Invalid image type. Allowed: JPG, PNG, WebP, GIF');
    }
    if ($bannerFile['size'] > 5 * 1024 * 1024) {
        apiError('Banner image must be under 5MB');
    }
    
    $uploadDir = __DIR__ . '/../uploads/banners/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $ext = pathinfo($bannerFile['name'], PATHINFO_EXTENSION);
    $filename = 'meeting_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $destination = $uploadDir . $filename;
    
    if (move_uploaded_file($bannerFile['tmp_name'], $destination)) {
        $bannerPath = 'uploads/banners/' . $filename;
    }
}

try {
    $db->exec("SET sql_mode = ''");
    
    // Resolve facilitator: meeting.facilitator references users.id (NOT NULL)
    if ($facilitator > 0) {
        // Check if $facilitator matches a valid users.id
        $chkUser = $db->prepare("SELECT id FROM users WHERE id = :id");
        $chkUser->execute([':id' => $facilitator]);
        $validUserId = $chkUser->fetchColumn();

        if (!$validUserId) {
            // Check if $facilitator is a member_id instead
            $chkMember = $db->prepare("SELECT id FROM users WHERE member_id = :mid LIMIT 1");
            $chkMember->execute([':mid' => $facilitator]);
            $validUserId = $chkMember->fetchColumn();
        }

        $facilitator = $validUserId ? (int)$validUserId : (int)($user['id'] ?? 1);
    } else {
        // Fallback to the authenticated user creating the meeting
        $facilitator = (int)($user['id'] ?? 1);
    }

    $stmt = $db->prepare("
        INSERT INTO meeting (name, start_time, end_time, facilitator, meeting_link, meeting_type, description, banner)
        VALUES (:name, :start_time, :end_time, :facilitator, :meeting_link, :meeting_type, :description, :banner)
    ");
    
    $stmt->execute([
        ':name' => $title,
        ':start_time' => $startTimestamp,
        ':end_time' => $endTimestamp,
        ':facilitator' => $facilitator,
        ':meeting_link' => $meetingLink ?: null,
        ':meeting_type' => $meetingType ?: null,
        ':description' => $description ?: null,
        ':banner' => $bannerPath
    ]);
    
    $meetingId = (int)$db->lastInsertId();
    
    apiSuccess(['meeting_id' => $meetingId], 'Meeting created successfully');
    
} catch (PDOException $e) {
    error_log("Create meeting error: " . $e->getMessage());
    apiError('Failed to create meeting: ' . $e->getMessage(), 500);
}
