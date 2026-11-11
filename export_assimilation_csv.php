<?php
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');
include("includes/get_user.php");

// Helper: decision label
function decisionLabel($val) {
    $map = [
        'raised_hand' => 'Raised Hand',
        'connection_card' => 'Connection Card',
        'personal_invite' => 'Personal Invite',
        'online_form' => 'Online Form',
        'salvation_decision' => 'Salvation Decision',
        'other' => 'Other'
    ];
    return $map[$val] ?? ucwords(str_replace('_', ' ', $val));
}

try {
    $filterStatus = isset($_GET['status']) && in_array($_GET['status'], ['uncontacted', 'attempted', 'contacted', 'cell_assigned']) ? $_GET['status'] : '';
    $search = trim($_GET['search'] ?? '');
    $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
    $endDate = $_GET['end_date'] ?? date('Y-m-d');
    
    $startD = date('Y-m-d 00:00:00', strtotime($startDate));
    $endD = date('Y-m-d 23:59:59', strtotime($endDate));

    $where = "WHERE a.created_at >= '$startD' AND a.created_at <= '$endD'";
    $params = [];

    if ($filterStatus) { 
        $where .= " AND a.assimilation_status = :status"; 
        $params[':status'] = $filterStatus; 
    }
    if ($search !== '') { 
        $where .= " AND (m.first_name LIKE :s OR m.last_name LIKE :s OR m.phone_no LIKE :s)"; 
        $params[':s'] = "%$search%"; 
    }

    $listStmt = $db->prepare("
        SELECT a.id AS assimilation_id, a.assimilation_status, a.decision_type, a.sla_breached,
               TIMESTAMPDIFF(HOUR, a.created_at, NOW()) AS hours_since_added,
               m.id AS member_id, m.first_name, m.last_name, m.phone_no, m.email, m.joined_on,
               COALESCE(u.email, 'Unassigned') AS assigned_to_name,
               (SELECT COUNT(*) FROM assimilation_followups f WHERE f.assimilation_id = a.id) AS followup_count
        FROM new_member_assimilation a
        JOIN member m ON m.id = a.member_id
        LEFT JOIN users u ON u.id = a.assigned_to
        $where
        ORDER BY a.created_at DESC
    ");
    $listStmt->execute($params);
    $membersList = $listStmt->fetchAll(PDO::FETCH_ASSOC);

    // Set headers for download
    $filename = "assimilation_members_" . date("Ymd_His") . ".csv";
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    // Open standard output stream
    $output = fopen('php://output', 'w');
    
    // Output BOM for Excel UTF-8 compatibility
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // CSV Header row
    fputcsv($output, [
        'Member Name', 
        'Email', 
        'Phone Number', 
        'Date Joined', 
        'Hours Since Added',
        'Decision Type', 
        'Status', 
        'Assigned To', 
        'Follow-Ups',
        'SLA Breached'
    ]);
    
    // Data rows
    foreach ($membersList as $row) {
        $fullName = ($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '');
        $status = str_replace('_', ' ', $row['assimilation_status'] ?? '');
        $sla = $row['sla_breached'] ? 'Yes' : 'No';
        $hoursAgo = $row['hours_since_added'] < 24 
            ? $row['hours_since_added'] . ' hours' 
            : floor($row['hours_since_added'] / 24) . ' days';
            
        fputcsv($output, [
            trim($fullName),
            $row['email'] ?? '—',
            $row['phone_no'] ?? '—',
            $row['joined_on'] ? date('Y-m-d', strtotime($row['joined_on'])) : '—',
            $hoursAgo,
            decisionLabel($row['decision_type'] ?? ''),
            ucwords($status),
            $row['assigned_to_name'],
            $row['followup_count'] . ' log(s)',
            $sla
        ]);
    }
    
    fclose($output);
    exit;

} catch (PDOException $e) {
    error_log("Assimilation CSV export error: " . $e->getMessage());
    echo "An error occurred while generating the CSV file. Please contact the administrator.";
    exit;
}
?>
