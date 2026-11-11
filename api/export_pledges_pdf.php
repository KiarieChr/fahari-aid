<?php
require_once '../tcpdf/tcpdf.php';
require_once '../includes/connection.php';

class PledgesPDF extends TCPDF {
    public function Header() {
        $this->SetFont('helvetica', 'B', 16);
        $this->Cell(0, 15, 'Pledges Report', 0, false, 'C', 0, '', 0, false, 'M', 'M');
        $this->Ln(10);
        
        // Add generation date
        $this->SetFont('helvetica', '', 10);
        $this->Cell(0, 10, 'Generated on: ' . date('F d, Y H:i:s'), 0, false, 'R');
        $this->Ln(15);
    }
    
    public function Footer() {
        $this->SetY(-15);
        $this->SetFont('helvetica', 'I', 8);
        $this->Cell(0, 10, 'Page ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, false, 'C');
    }
}

try {
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    $pledges = $input['pledges'] ?? [];
    $filters = $input['filters'] ?? [];
    
    // If no data provided, get all from database
    if (empty($pledges)) {
        $sql = "SELECT * FROM pledges ORDER BY date DESC";
        $stmt = $db->query($sql);
        $pledges = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    // Create PDF
    $pdf = new PledgesPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
    
    // Set document information
    $pdf->SetCreator('Pledge Management System');
    $pdf->SetAuthor('Jesus Enthroned Network');
    $pdf->SetTitle('Pledges Report');
    $pdf->SetSubject('Pledge Management Report');
    
    // Set margins
    $pdf->SetMargins(15, 30, 15);
    $pdf->SetHeaderMargin(5);
    $pdf->SetFooterMargin(10);
    
    // Add a page
    $pdf->AddPage();
    
    // Add summary statistics
    $totalPledges = count($pledges);
    $totalAmount = array_sum(array_column($pledges, 'pledges_amount'));
    $avgAmount = $totalPledges > 0 ? $totalAmount / $totalPledges : 0;
    $activePledges = count(array_filter($pledges, function($p) { return $p['status'] == 1; }));
    
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 10, 'Summary Statistics', 0, 1);
    $pdf->Ln(5);
    
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(50, 8, 'Total Pledges:', 1, 0, 'L', false);
    $pdf->Cell(40, 8, number_format($totalPledges), 1, 1, 'R', false);
    
    $pdf->Cell(50, 8, 'Total Amount:', 1, 0, 'L', false);
    $pdf->Cell(40, 8, 'KES ' . number_format($totalAmount, 2), 1, 1, 'R', false);
    
    $pdf->Cell(50, 8, 'Average Pledge:', 1, 0, 'L', false);
    $pdf->Cell(40, 8, 'KES ' . number_format($avgAmount, 2), 1, 1, 'R', false);
    
    $pdf->Cell(50, 8, 'Active Pledges:', 1, 0, 'L', false);
    $pdf->Cell(40, 8, number_format($activePledges), 1, 1, 'R', false);
    
    $pdf->Ln(10);
    
    // Add filters information if any
    if (!empty($filters) && (isset($filters['search']) || isset($filters['purpose']) || isset($filters['status']))) {
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(0, 8, 'Applied Filters:', 0, 1);
        $pdf->SetFont('helvetica', '', 9);
        
        if (!empty($filters['search'])) {
            $pdf->Cell(0, 6, '• Search: ' . $filters['search'], 0, 1);
        }
        if (!empty($filters['purpose'])) {
            $pdf->Cell(0, 6, '• Purpose: ' . ucfirst($filters['purpose']), 0, 1);
        }
        if (!empty($filters['status'])) {
            $pdf->Cell(0, 6, '• Status: ' . ($filters['status'] == '1' ? 'Active' : 'Inactive'), 0, 1);
        }
        $pdf->Ln(5);
    }
    
    // Table header
    $pdf->SetFont('helvetica', 'B', 9);
    $pdf->SetFillColor(240, 240, 240);
    
    $pdf->Cell(35, 8, 'Name', 1, 0, 'C', true);
    $pdf->Cell(25, 8, 'Purpose', 1, 0, 'C', true);
    $pdf->Cell(25, 8, 'Amount', 1, 0, 'C', true);
    $pdf->Cell(25, 8, 'Date', 1, 0, 'C', true);
    $pdf->Cell(20, 8, 'Status', 1, 0, 'C', true);
    $pdf->Cell(50, 8, 'Contact', 1, 1, 'C', true);
    
    // Table data
    $pdf->SetFont('helvetica', '', 8);
    $pdf->SetFillColor(255, 255, 255);
    
    foreach ($pledges as $pledge) {
        // Check if we need a new page
        if ($pdf->GetY() > 250) {
            $pdf->AddPage();
        }
        
        $pdf->Cell(35, 6, substr($pledge['full_name'], 0, 20), 1, 0, 'L');
        $pdf->Cell(25, 6, ucfirst($pledge['purpose']), 1, 0, 'C');
        $pdf->Cell(25, 6, 'KES ' . number_format($pledge['pledges_amount'], 0), 1, 0, 'R');
        $pdf->Cell(25, 6, date('M d, Y', strtotime($pledge['date'])), 1, 0, 'C');
        $pdf->Cell(20, 6, $pledge['status'] == 1 ? 'Active' : 'Inactive', 1, 0, 'C');
        $pdf->Cell(50, 6, substr($pledge['email'], 0, 25), 1, 1, 'L');
    }
    
    // Output PDF
    $pdf->Output('pledges_report_' . date('Y-m-d') . '.pdf', 'D');
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>