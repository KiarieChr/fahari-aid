<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware.php';

// The user must be authenticated. But wait, since it's a direct browser download via window.open, we need a token query parameter.
$token = $_GET['token'] ?? null;
if (!$token) {
    die("Authentication token required");
}

try {
    require_once __DIR__ . '/../jwt.php';
    $result = JWT::validate($token);
    if (!$result['valid']) {
        die("Invalid token: " . ($result['error'] ?? ''));
    }
    $payload = $result['payload'];
    $user = $payload['data'] ?? [];
} catch (Exception $e) {
    die("Invalid token");
}

try {
    $type = $_GET['type'] ?? '';
    $id = $_GET['id'] ?? '';
    if (!$type || !$id) die("Document type and ID required");

    $doc = null;
    $title = '';

    if ($type === 'payment_voucher') {
        $stmt = $db->prepare("SELECT * FROM payment_vouchers WHERE id = ?");
        $stmt->execute([$id]);
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);
        $title = 'Payment Voucher #' . ($doc['voucher_number'] ?? $id);
    } elseif ($type === 'imprest_voucher') {
        $stmt = $db->prepare("SELECT * FROM imprest_vouchers WHERE id = ?");
        $stmt->execute([$id]);
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);
        $title = 'Imprest Voucher #' . ($doc['voucher_number'] ?? $id);
    } elseif ($type === 'supplier_invoice') {
        $stmt = $db->prepare("SELECT * FROM bills WHERE id = ?");
        $stmt->execute([$id]);
        $doc = $stmt->fetch(PDO::FETCH_ASSOC);
        $title = 'Supplier Invoice / Bill #' . ($doc['bill_number'] ?? $id);
    } else {
        die("Invalid document type");
    }

    if (!$doc) die("Document not found");

    // Fetch Organization Details
    $orgName = 'Fahari Eklesia';
    try {
        $orgStmt = $db->query("SELECT org_name FROM organization_settings WHERE id = 1");
        $org = $orgStmt->fetch(PDO::FETCH_ASSOC);
        if ($org && !empty($org['org_name'])) {
            $orgName = $org['org_name'];
        }
    } catch (Exception $e) {}

    // Fetch Branch Details
    $branchName = 'Headquarters';
    if (!empty($user['branch_id'])) {
        $bStmt = $db->prepare("SELECT branch_name FROM branch WHERE b_id = ?");
        $bStmt->execute([$user['branch_id']]);
        if ($b = $bStmt->fetch(PDO::FETCH_ASSOC)) {
            $branchName = $b['branch_name'];
        }
    }

    // Generate PDF using TCPDF
    require_once __DIR__ . '/../../tcpdf/tcpdf.php';
    
    $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
    $pdf->SetCreator(PDF_CREATOR);
    $pdf->SetAuthor($orgName);
    $pdf->SetTitle($title);
    
    // Header Data: Organization Name and Branch
    $headerString = "Branch: " . $branchName . "\nGenerated on " . date('Y-m-d');
    $pdf->SetHeaderData('', 0, $orgName, $headerString);
    
    $pdf->setHeaderFont(Array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
    $pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));
    $pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);
    $pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
    $pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
    $pdf->SetFooterMargin(PDF_MARGIN_FOOTER);
    $pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);
    $pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);
    $pdf->AddPage();
    
    $html = '<h2>' . $title . '</h2>';
    $html .= '<table border="0" cellpadding="4">';
    
    if ($type === 'payment_voucher' || $type === 'supplier_invoice') {
        $vendor = $doc['vendor_name'] ?? '';
        $amount = $doc['amount'] ?? 0;
        $desc = $doc['description'] ?? '';
        $date = $doc['date'] ?? ($doc['bill_date'] ?? '');
        $status = $doc['status'] ?? '';
        
        $html .= '
            <tr><td width="30%"><strong>Vendor/Payee:</strong></td><td width="70%">' . htmlspecialchars($vendor) . '</td></tr>
            <tr><td><strong>Date:</strong></td><td>' . $date . '</td></tr>
            <tr><td><strong>Amount:</strong></td><td>KES ' . number_format($amount, 2) . '</td></tr>
            <tr><td><strong>Status:</strong></td><td>' . strtoupper($status) . '</td></tr>
            <tr><td><strong>Description:</strong></td><td>' . htmlspecialchars($desc) . '</td></tr>
        ';
    } elseif ($type === 'imprest_voucher') {
        $html .= '
            <tr><td width="30%"><strong>Recipient:</strong></td><td width="70%">' . htmlspecialchars($doc['recipient_name']) . '</td></tr>
            <tr><td><strong>Date Needed:</strong></td><td>' . $doc['date_needed'] . '</td></tr>
            <tr><td><strong>Amount Requested:</strong></td><td>KES ' . number_format($doc['amount_requested'], 2) . '</td></tr>
            <tr><td><strong>Amount Approved:</strong></td><td>KES ' . number_format((float)$doc['amount_approved'], 2) . '</td></tr>
            <tr><td><strong>Status:</strong></td><td>' . strtoupper($doc['status']) . '</td></tr>
            <tr><td><strong>Purpose:</strong></td><td>' . htmlspecialchars($doc['purpose']) . '</td></tr>
        ';
    }
    
    $html .= '</table>';
    
    $html .= '<br/><br/><br/>
    <table border="0" cellpadding="4">
        <tr>
            <td width="33%">Prepared By: _________________</td>
            <td width="33%">Checked By: _________________</td>
            <td width="33%">Authorized By: _________________</td>
        </tr>
    </table>';
    
    $pdf->writeHTML($html, true, false, true, false, '');
    
    while (ob_get_level()) ob_end_clean();
    $pdf->Output(str_replace(' ', '_', $title) . '.pdf', 'I');
    exit;

} catch (Exception $e) {
    die("Error generating PDF: " . $e->getMessage());
}
