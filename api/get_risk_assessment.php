<?php
header('Content-Type: application/json');
require_once '../includes/connection.php';

try {
    $riskAssessment = [];
    
    // Check for old unpaid pledges (high risk)
    $stmt = $db->query("
        SELECT COUNT(*) as count 
        FROM pledges 
        WHERE status = 1 AND date < DATE_SUB(NOW(), INTERVAL 90 DAY)
    ");
    $oldPledges = $stmt->fetch()['count'];
    
    if ($oldPledges > 0) {
        $riskAssessment[] = [
            'title' => 'Overdue Pledges',
            'description' => 'Pledges older than 90 days without fulfillment',
            'count' => $oldPledges,
            'level' => 'high',
            'impact' => 'revenue'
        ];
    }
    
    // Check for large unfulfilled pledges (medium risk)
    $stmt = $db->query("
        SELECT COUNT(*) as count, AVG(pledges_amount) as avg_amount
        FROM pledges 
        WHERE status = 1 AND pledges_amount > (
            SELECT AVG(pledges_amount) * 2 FROM pledges
        )
    ");
    $largePledges = $stmt->fetch();
    
    if ($largePledges['count'] > 0) {
        $riskAssessment[] = [
            'title' => 'High-Value Pledges at Risk',
            'description' => 'Large pledges that may be difficult to collect',
            'count' => $largePledges['count'],
            'level' => 'medium',
            'impact' => 'revenue'
        ];
    }
    
    // Check for inactive donors (medium risk)
    $stmt = $db->query("
        SELECT COUNT(DISTINCT email) as count 
        FROM pledges 
        WHERE date < DATE_SUB(NOW(), INTERVAL 180 DAY)
        AND email NOT IN (
            SELECT DISTINCT email FROM pledges 
            WHERE date >= DATE_SUB(NOW(), INTERVAL 180 DAY)
        )
    ");
    $inactiveDonors = $stmt->fetch()['count'];
    
    if ($inactiveDonors > 0) {
        $riskAssessment[] = [
            'title' => 'Donor Retention Risk',
            'description' => 'Donors with no recent activity (6+ months)',
            'count' => $inactiveDonors,
            'level' => 'medium',
            'impact' => 'retention'
        ];
    }
    
    // Check for data quality issues (low risk)
    $stmt = $db->query("
        SELECT COUNT(*) as count 
        FROM pledges 
        WHERE email IS NULL OR email = '' OR phone_no IS NULL OR phone_no = ''
    ");
    $dataQualityIssues = $stmt->fetch()['count'];
    
    if ($dataQualityIssues > 0) {
        $riskAssessment[] = [
            'title' => 'Data Quality Issues',
            'description' => 'Records with missing contact information',
            'count' => $dataQualityIssues,
            'level' => 'low',
            'impact' => 'operations'
        ];
    }
    
    // Check for single large donors (concentration risk)
    $stmt = $db->query("
        SELECT email, SUM(pledges_amount) as total_pledged,
               (SUM(pledges_amount) / (SELECT SUM(pledges_amount) FROM pledges)) * 100 as percentage
        FROM pledges 
        GROUP BY email 
        HAVING percentage > 20
    ");
    $concentrationRisk = $stmt->fetchAll();
    
    if (count($concentrationRisk) > 0) {
        $riskAssessment[] = [
            'title' => 'Donor Concentration Risk',
            'description' => 'Heavy dependence on single large donors',
            'count' => count($concentrationRisk),
            'level' => 'high',
            'impact' => 'sustainability'
        ];
    }
    
    echo json_encode($riskAssessment);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>