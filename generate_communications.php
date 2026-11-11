<?php
require_once 'includes/connection.php';
require_once 'CommunicationsPDF.php';

// 1. Get all communications from database (most recent first)

$logoPath = '../assets/img/jen.png';
$stmt = $db->prepare("SELECT * FROM communications ORDER BY created_at DESC");
$stmt->execute();
$communications = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($communications)) {
    die('No communications found');
}

// 2. Generate PDF
$pdf = new ChurchCommunicationsPDF($communications,$logoPath);
 
$pdf->generatePDF();
?>