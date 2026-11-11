<?php
require_once '../tcpdf/tcpdf.php';
require_once '../includes/connection.php';

class ComprehensivePDF extends TCPDF {
    public function Header() {
        $this->SetFont('helvetica', 'B', 16);
        $this->Cell(0, 15, 'Comprehensive Pledge Report', 0, false, 'C', 0, '', 0, false, 'M', 'M');
        $this->Ln(10);
        
        $this->SetFont('helvetica', '', 10);
        $this->Cell(0, 10, 'Generated on: ' . date('F d, Y H:i:s'), 0, false, 'R');
        $this->Ln(15);
    }
    
    public function Footer() {
        $this->SetY(-15);
        $this->SetFont('helvetica', 'I', 8);
        $this->Cell(0, 10, 'Page ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, false, 'C');
    }
    
    public function ChapterTitle($title) {
        $this->SetFont('helvetica', 'B', 14);
        $this->SetFillColor(240, 240, 240);
        $this->Cell(0, 10, $title, 1, 1, 'L', true);
        $this->Ln(5);
    }
}

try {
    $pdf = new ComprehensivePDF();
    $pdf->SetCreator('Pledge Management System');
    $pdf->SetTitle('Comprehensive Pledge Report');
    
    $pdf->SetMargins(15, 30, 15);
    $pdf->AddPage();
    
    // Overall Statistics
    $stmt = $db->query("
        SELECT 
            COUNT(*) as total_pledges,
            SUM(pledges_amount) as total_amount,
            AVG(pledges_amount) as avg_pledge,
            COUNT(CASE WHEN status = 1 THEN 1 END) as active_pledges,
            COUNT(CASE WHEN recurring = 1 THEN 1 END) as recurring_pledges
        FROM pledges
    ");
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $pdf->ChapterTitle('Executive Dashboard');
    
    // Create statistics table
    $pdf->SetFont('helvetica', '', 11);
    $statsData = [
        ['Metric', 'Value'],
        ['Total Pledges', number_format($stats['total_pledges'])],
        ['Total Pledge Amount', 'KES ' . number_format($stats['total_amount'], 2)],
        ['Average Pledge', 'KES ' . number_format($stats['avg_pledge'], 2)],
        ['Active Pledges', number_format($stats['active_pledges'])],
        ['Recurring Pledges', number_format($stats['recurring_pledges'])]
    ];
    
    foreach ($statsData as $i => $row) {
        if ($i == 0) {
            $pdf->SetFont('helvetica', 'B', 11);
            $pdf->SetFillColor(220, 220, 220);
            $fill = true;
        } else {
            $pdf->SetFont('helvetica', '', 10);
            $pdf->SetFillColor(255, 255, 255);
            $fill = false;
        }
        
        $pdf->Cell(80, 8, $row[0], 1, 0, 'L', $fill);
        $pdf->Cell(80, 8, $row[1], 1, 1, 'R', $fill);
    }
    
    $pdf->Ln(10);
    
    // Purpose Analysis
    $pdf->ChapterTitle('Analysis by Purpose');
    
    $stmt = $db->query("
        SELECT 
            purpose,
            COUNT(*) as count,
            SUM(pledges_amount) as total,
            AVG(pledges_amount) as average
        FROM pledges 
        GROUP BY purpose 
        ORDER BY total DESC
    ");
    $purposeData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(40, 8, 'Purpose', 1, 0, 'C', true);
    $pdf->Cell(30, 8, 'Count', 1, 0, 'C', true);
    $pdf->Cell(50, 8, 'Total Amount', 1, 0, 'C', true);
    $pdf->Cell(50, 8, 'Average', 1, 1, 'C', true);
    
    $pdf->SetFont('helvetica', '', 9);
    foreach ($purposeData as $row) {
        $pdf->Cell(40, 6, ucfirst($row['purpose']), 1, 0, 'L');
        $pdf->Cell(30, 6, number_format($row['count']), 1, 0, 'C');
        $pdf->Cell(50, 6, 'KES ' . number_format($row['total'], 2), 1, 0, 'R');
        $pdf->Cell(50, 6, 'KES ' . number_format($row['average'], 2), 1, 1, 'R');
    }
    
    $pdf->AddPage();
    
    // Top Donors
    $pdf->ChapterTitle('Top 10 Donors');
    
    $stmt = $db->query("
        SELECT 
            full_name,
            email,
            COUNT(*) as pledge_count,
            SUM(pledges_amount) as total_pledged,
            MAX(date) as last_pledge
        FROM pledges 
        GROUP BY full_name, email
        ORDER BY total_pledged DESC
        LIMIT 10
    ");
    $topDonors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $pdf->SetFont('helvetica', 'B', 9);
    $pdf->Cell(50, 8, 'Name', 1, 0, 'C', true);
    $pdf->Cell(30, 8, 'Pledges', 1, 0, 'C', true);
    $pdf->Cell(50, 8, 'Total Amount', 1, 0, 'C', true);
    $pdf->Cell(40, 8, 'Last Pledge', 1, 1, 'C', true);
    
    $pdf->SetFont('helvetica', '', 8);
    foreach ($topDonors as $donor) {
        $pdf->Cell(50, 6, substr($donor['full_name'], 0, 25), 1, 0, 'L');
        $pdf->Cell(30, 6, number_format($donor['pledge_count']), 1, 0, 'C');
        $pdf->Cell(50, 6, 'KES ' . number_format($donor['total_pledged'], 2), 1, 0, 'R');
        $pdf->Cell(40, 6, date('M d, Y', strtotime($donor['last_pledge'])), 1, 1, 'C');
    }
    
    $pdf->Output('comprehensive_report_' . date('Y-m-d') . '.pdf', 'I');
    
} catch (Exception $e) {
    http_response_code(500);
    echo 'Error generating comprehensive report: ' . $e->getMessage();
}
?>