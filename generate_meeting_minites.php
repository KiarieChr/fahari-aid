<?php
require_once 'includes/connection.php';
require_once 'MeetingMinutesPDF.php';

// Check if meeting ID is provided
$meetingId = $_GET['id'] ?? 0;
if (empty($meetingId)) {
    die('No meeting specified');
}

// Database connection


// Fetch meeting details
$stmt = $db->prepare("
    SELECT m.*, mt.first_name as facilitator_name 
    FROM meeting m
    LEFT JOIN users u ON m.facilitator = u.id join member mt on u.member_id = mt.id
    WHERE m.id = ?
");
$stmt->execute([$meetingId]);
$meetingData = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$meetingData) {
    die('Meeting not found');
}

// Fetch meeting minutes
$stmt = $db->prepare("
    SELECT mm.*, m.first_name as fname, m.last_name, u.member_id
    FROM meeting_minutes mm
    LEFT JOIN users u ON mm.personnel = u.id join member m on u.member_id = m.id
    WHERE mm.meeting_id = ?
    ORDER BY mm.id DESC
    LIMIT 1
");
$stmt->execute([$meetingId]);
$minutesData = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$minutesData) {
    die('No minutes found for this meeting');
}

// Path to your logo
$logoPath = '../assets/img/jen.png';

// Generate PDF
$pdf = new MeetingMinutesPDF($meetingData, $minutesData, $logoPath);
$pdf->generatePDF();
?>