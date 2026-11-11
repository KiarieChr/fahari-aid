<?php
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');
include("includes/get_user.php");
require_once('tcpdf/tcpdf.php');

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

// Custom PDF class with styling
class AssimilationPDF extends TCPDF {
    private $titleText;
    private $subtitleText;
    private $logoPath;
    private $primaryColor = [67, 56, 202]; // Indigo/purple matches header color

    public function __construct($titleText = 'Member Assimilation Report', $subtitleText = '', $logoPath = null) {
        parent::__construct('L', PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $this->titleText = $titleText;
        $this->subtitleText = $subtitleText;
        $this->logoPath = $logoPath;

        $this->SetCreator(PDF_CREATOR);
        $this->SetAuthor('JEN System');
        $this->SetTitle($titleText);

        // Modern Margins
        $this->SetMargins(15, 35, 15);
        $this->SetHeaderMargin(10);
        $this->SetFooterMargin(15);
        $this->SetAutoPageBreak(true, 20);
    }

    public function Header() {
        // Safe logo width and height calculations
        $logoY = 8;
        $logoHeight = 14; 
        $logoWidth = 40;  
        $logoX = 15; // Left align logo

        if ($this->logoPath && file_exists($this->logoPath)) {
            $imgSize = @getimagesize($this->logoPath);
            if ($imgSize) {
                $origW = $imgSize[0];
                $origH = $imgSize[1];
                if ($origH > 0) {
                    $logoWidth = ($origW / $origH) * $logoHeight;
                    if ($logoWidth > 45) {
                        $logoWidth = 45;
                        $logoHeight = ($origH / $origW) * $logoWidth;
                    }
                }
            }
            $logoData = @file_get_contents($this->logoPath);
            if ($logoData !== false) {
                $this->Image('@' . $logoData, $logoX, $logoY, $logoWidth, $logoHeight, '', '', 'T', false, 300, '', false, false, 0, false, false, false);
            }
        }

        // Title - Right Aligned
        $this->SetFont('helvetica', 'B', 16);
        $this->SetTextColor(20, 24, 60); // Dark Navy
        $this->SetXY(60, 10);
        $this->Cell($this->getPageWidth() - 75, 8, $this->titleText, 0, 1, 'R');

        // Subtitle - Right Aligned
        $this->SetFont('helvetica', '', 9);
        $this->SetTextColor(100, 116, 139); // Slate Gray
        $this->SetXY(60, 18);
        $this->Cell($this->getPageWidth() - 75, 5, $this->subtitleText, 0, 1, 'R');

        // Accent Line at the bottom of header
        $this->SetLineStyle(['width' => 0.8, 'color' => [14, 194, 230]]); // Cyan
        $this->Line(15, 28, $this->getPageWidth() - 15, 28);
    }

    public function Footer() {
        $this->SetY(-15);
        $this->SetFont('helvetica', '', 8);
        $this->SetTextColor(100, 116, 139); 

        // Divider
        $this->SetLineStyle(['width' => 0.2, 'color' => [139, 92, 246]]); // Purple
        $this->Line(15, $this->GetY() - 2, $this->getPageWidth() - 15, $this->GetY() - 2);

        $this->Cell(0, 10, 'JEN Church Management System', 0, 0, 'L');

        // Styled Page Number
        $this->SetFont('helvetica', 'B', 8.5);
        $this->SetTextColor(14, 194, 230); // Cyan
        $pageTextFormatted = 'PAGE ' . $this->getAliasNumPage() . ' OF ' . $this->getAliasNbPages();
        $this->Cell(0, 10, $pageTextFormatted, 0, 0, 'R');
    }
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
    
    $filterDetails = [];
    $filterDetails[] = "Time Range: " . date('M j, Y', strtotime($startDate)) . " to " . date('M j, Y', strtotime($endDate));

    if ($filterStatus) { 
        $where .= " AND a.assimilation_status = :status"; 
        $params[':status'] = $filterStatus;
        $filterDetails[] = "Status: " . ucwords(str_replace('_', ' ', $filterStatus));
    }
    if ($search !== '') { 
        $where .= " AND (m.first_name LIKE :s OR m.last_name LIKE :s OR m.phone_no LIKE :s)"; 
        $params[':s'] = "%$search%";
        $filterDetails[] = "Search Term: '" . htmlspecialchars($search) . "'";
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

    $subtitle = implode(' | ', $filterDetails) . " (Total Records: " . count($membersList) . ")";
    
    $logoPath = __DIR__ . '/assets/img/logo/logo-dark.jpeg';
    // Create PDF
    $pdf = new AssimilationPDF('Member Assimilation - Filtered List', $subtitle, $logoPath);
    $pdf->AddPage();
    $pdf->SetFont('helvetica', '', 9);

    // Build the HTML Table
    $html = '
    <table cellpadding="8" cellspacing="0" style="width:100%; font-family:helvetica;">
        <thead>
            <tr style="background-color:#14183c; color:#ffffff; text-align:left;">
                <th style="width:20%; font-weight:bold; font-size:10px;">Member Name</th>
                <th style="width:20%; font-weight:bold; font-size:10px;">Email</th>
                <th style="width:12%; font-weight:bold; font-size:10px;">Phone</th>
                <th style="width:12%; font-weight:bold; font-size:10px;">Joined On</th>
                <th style="width:14%; font-weight:bold; font-size:10px;">Decision Type</th>
                <th style="width:10%; font-weight:bold; font-size:10px;">Status</th>
                <th style="width:12%; font-weight:bold; font-size:10px;">Assigned To</th>
            </tr>
        </thead>
        <tbody>';

    if (empty($membersList)) {
        $html .= '
            <tr style="background-color:#fdfbf7;">
                <td colspan="7" style="text-align:center; padding:20px; color:#64748b;">No matching new members found.</td>
            </tr>';
    } else {
        $fill = false;
        foreach ($membersList as $row) {
            $fullName = htmlspecialchars(trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')));
            $email = htmlspecialchars($row['email'] ?? '—');
            $phone = htmlspecialchars($row['phone_no'] ?? '—');
            $joined = $row['joined_on'] ? date('M j, Y', strtotime($row['joined_on'])) : '—';
            $decision = htmlspecialchars(decisionLabel($row['decision_type'] ?? ''));
            $status = ucwords(str_replace('_', ' ', $row['assimilation_status'] ?? ''));
            
            // Status styling
            $statusColor = '#64748b'; // default
            if ($row['assimilation_status'] === 'uncontacted') $statusColor = '#dc2626';
            elseif ($row['assimilation_status'] === 'attempted') $statusColor = '#d97706';
            elseif ($row['assimilation_status'] === 'contacted') $statusColor = '#059669';
            elseif ($row['assimilation_status'] === 'cell_assigned') $statusColor = '#2563eb';

            $assigned = htmlspecialchars($row['assigned_to_name']);
            
            // SLA alert if breached
            $slaMarker = $row['sla_breached'] ? '<br/><span style="color:#ef4444; font-size:8px;"><b>⚠ SLA BREACHED</b></span>' : '';

            $bg = $fill ? 'background-color:#fdfbf7;' : 'background-color:#ffffff;';
            $fill = !$fill;

            $html .= '
            <tr style="'.$bg.' border-bottom: 1px solid #e2e8f0;">
                <td style="width:20%; font-weight:bold; font-size:9px; border-bottom: 1px solid #e2e8f0;">' . $fullName . $slaMarker . '</td>
                <td style="width:20%; font-size:9px; border-bottom: 1px solid #e2e8f0;">' . $email . '</td>
                <td style="width:12%; font-size:9px; border-bottom: 1px solid #e2e8f0;">' . $phone . '</td>
                <td style="width:12%; font-size:9px; border-bottom: 1px solid #e2e8f0;">' . $joined . '</td>
                <td style="width:14%; font-size:9px; border-bottom: 1px solid #e2e8f0;">' . $decision . '</td>
                <td style="width:10%; color:' . $statusColor . '; font-weight:bold; font-size:9px; border-bottom: 1px solid #e2e8f0;">' . $status . '</td>
                <td style="width:12%; font-size:9px; border-bottom: 1px solid #e2e8f0;">' . $assigned . '</td>
            </tr>';
        }
    }

    $html .= '
        </tbody>
    </table>';

    $pdf->writeHTML($html, true, false, true, false, '');
    
    // Output PDF to browser
    $pdf->Output('assimilation_filtered_' . date('Ymd_His') . '.pdf', 'I');
    exit;

} catch (Exception $e) {
    error_log("Assimilation PDF export error: " . $e->getMessage());
    echo "An error occurred while generating the PDF file. Please contact the administrator.";
    exit;
}
?>
