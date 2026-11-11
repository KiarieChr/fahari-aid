<?php
require_once '../tcpdf/tcpdf.php';
require_once '../includes/connection.php';

class RiskPDF extends TCPDF {
    public function Header() {
        $this->SetFont('helvetica', 'B', 16);
        $this->Cell(0, 15, 'Risk Assessment Report', 0, false, 'C', 0, '', 0, false, 'M', 'M');
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
}

try {
    $pdf = new RiskPDF();
    $pdf->SetCreator('Pledge Management System');
    $pdf->SetAuthor('Jesus Enthroned Network');
    $pdf->SetTitle('Risk Assessment Report');
    
    $pdf->SetMargins(15, 30, 15);
    $pdf->SetHeaderMargin(5);
    $pdf->SetFooterMargin(10);
    
    $pdf->AddPage();
    
    // Get risk data
    $riskData = [];
    
    // Overdue pledges analysis
    $stmt = $db->query("
        SELECT COUNT(*) as count, SUM(pledges_amount) as total_amount
        FROM pledges 
        WHERE status = 1 AND date < DATE_SUB(NOW(), INTERVAL 90 DAY)
    ");
    $overdue = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($overdue['count'] > 0) {
        $riskData[] = [
            'title' => 'Overdue Pledges (90+ days)',
            'level' => 'HIGH',
            'count' => $overdue['count'],
            'amount' => $overdue['total_amount'],
            'description' => 'Pledges that are overdue for more than 90 days pose significant collection risk.'
        ];
    }
    
    // Large pledges at risk
    $stmt = $db->query("
        SELECT COUNT(*) as count, SUM(pledges_amount) as total_amount, AVG(pledges_amount) as avg_amount
        FROM pledges 
        WHERE status = 1 AND pledges_amount > (
            SELECT AVG(pledges_amount) * 2 FROM pledges
        )
    ");
    $largePledges = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($largePledges['count'] > 0) {
        $riskData[] = [
            'title' => 'High-Value Pledges at Risk',
            'level' => 'MEDIUM',
            'count' => $largePledges['count'],
            'amount' => $largePledges['total_amount'],
            'description' => 'Large pledges that may face collection difficulties due to their size.'
        ];
    }
    
    // Donor concentration risk
    $stmt = $db->query("
        SELECT email, SUM(pledges_amount) as total_pledged,
               (SUM(pledges_amount) / (SELECT SUM(pledges_amount) FROM pledges)) * 100 as percentage
        FROM pledges 
        GROUP BY email 
        HAVING percentage > 15
        ORDER BY percentage DESC
    ");
    $concentrationRisks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($concentrationRisks) > 0) {
        $totalConcentration = array_sum(array_column($concentrationRisks, 'total_pledged'));
        $riskData[] = [
            'title' => 'Donor Concentration Risk',
            'level' => 'HIGH',
            'count' => count($concentrationRisks),
            'amount' => $totalConcentration,
            'description' => 'Heavy dependence on few donors creates sustainability risk.'
        ];
    }
    
    // Executive Summary
    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->Cell(0, 10, 'Executive Summary', 0, 1);
    $pdf->Ln(5);
    
    $pdf->SetFont('helvetica', '', 11);
    $totalRisks = count($riskData);
    $highRisks = count(array_filter($riskData, function($r) { return $r['level'] == 'HIGH'; }));
    $totalAtRisk = array_sum(array_column($riskData, 'amount'));
    
    $pdf->MultiCell(0, 6, "This report identifies $totalRisks risk factors affecting the pledge portfolio. $highRisks high-priority risks require immediate attention. Total amount at risk: KES " . number_format($totalAtRisk, 2), 0, 'L');
    $pdf->Ln(10);
    
    // Risk Details
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 10, 'Risk Analysis Details', 0, 1);
    $pdf->Ln(5);
    
    foreach ($riskData as $risk) {
        // Risk level color
        $fillColor = [255, 255, 255]; // white
        if ($risk['level'] == 'HIGH') $fillColor = [255, 200, 200]; // light red
        elseif ($risk['level'] == 'MEDIUM') $fillColor = [255, 255, 200]; // light yellow
        
        $pdf->SetFillColor($fillColor[0], $fillColor[1], $fillColor[2]);
        
        // Risk header
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(0, 8, $risk['title'], 1, 1, 'L', true);
        
        // Risk details
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(40, 6, 'Risk Level:', 1, 0, 'L');
        $pdf->Cell(40, 6, $risk['level'], 1, 0, 'L');
        $pdf->Cell(40, 6, 'Items Affected:', 1, 0, 'L');
        $pdf->Cell(60, 6, number_format($risk['count']), 1, 1, 'L');
        
        if ($risk['amount'] > 0) {
            $pdf->Cell(40, 6, 'Amount at Risk:', 1, 0, 'L');
            $pdf->Cell(140, 6, 'KES ' . number_format($risk['amount'], 2), 1, 1, 'L');
        }
        
        // Description
        $pdf->Cell(40, 6, 'Description:', 1, 0, 'L');
        $pdf->Cell(140, 6, '', 1, 1, 'L'); // Empty cell for alignment
        $pdf->SetXY($pdf->GetX(), $pdf->GetY() - 6);
        $pdf->Cell(40, 6, '', 0, 0); // Skip first column
        $pdf->MultiCell(140, 6, $risk['description'], 1, 'L');
        
        $pdf->Ln(5);
    }
    
    // Recommendations
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 10, 'Recommendations', 0, 1);
    $pdf->Ln(5);
    
    $pdf->SetFont('helvetica', '', 10);
    $recommendations = [
        '1. Implement follow-up procedures for pledges older than 60 days',
        '2. Diversify donor base to reduce concentration risk',
        '3. Establish payment reminder system for large pledges',
        '4. Regular donor engagement to improve retention',
        '5. Monitor pledge-to-payment conversion rates monthly'
    ];
    
    foreach ($recommendations as $rec) {
        $pdf->Cell(0, 6, $rec, 0, 1);
    }
    
    $pdf->Output('risk_assessment_' . date('Y-m-d') . '.pdf', 'I');
    
} catch (Exception $e) {
    http_response_code(500);
    echo 'Error generating risk report: ' . $e->getMessage();
}
?>