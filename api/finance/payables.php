<?php
/**
 * Payables API
 * /api/finance/payables.php
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware.php';

$user = authenticate();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'list';
        
        if ($action === 'list') {
            $stmt = $db->query("
                SELECT b.id, b.vendor_name, b.bill_number, b.bill_date, b.due_date,
                       b.amount, b.balance_due as balance, b.description, b.status
                FROM bills b
                WHERE b.delete_status = 0
                ORDER BY b.bill_date DESC
            ");
            $payables = $stmt->fetchAll(PDO::FETCH_ASSOC);
            apiSuccess($payables, 'Payables retrieved successfully');
        } 
        elseif ($action === 'generate_pdf') {
            $id = $_GET['id'] ?? null;
            if (!$id) apiError('Bill ID required');
            
            $stmt = $db->prepare("
                SELECT b.*, a.account_name
                FROM bills b
                LEFT JOIN account a ON b.gl_account_id = a.id
                WHERE b.id = :id AND b.delete_status = 0
            ");
            $stmt->execute([':id' => $id]);
            $bill = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$bill) apiError('Record not found', 404);
            
            // Generate PDF using TCPDF
            require_once __DIR__ . '/../../tcpdf/tcpdf.php';
            
            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
            $pdf->SetCreator(PDF_CREATOR);
            $pdf->SetAuthor('Fahari Eklesia');
            $pdf->SetTitle('Bill / Voucher #' . $bill['bill_number']);
            $pdf->SetHeaderData('', 0, 'Fahari Eklesia', "Payment Voucher\nGenerated on " . date('Y-m-d'));
            
            $pdf->setHeaderFont(Array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
            $pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));
            $pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);
            $pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
            $pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
            $pdf->SetFooterMargin(PDF_MARGIN_FOOTER);
            $pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);
            $pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);
            $pdf->AddPage();
            
            $html = '
            <h2>Payment Voucher / Bill</h2>
            <table border="0" cellpadding="4">
                <tr>
                    <td width="30%"><strong>Vendor Name:</strong></td>
                    <td width="70%">' . htmlspecialchars($bill['vendor_name']) . '</td>
                </tr>
                <tr>
                    <td><strong>Bill Number:</strong></td>
                    <td>' . htmlspecialchars($bill['bill_number']) . '</td>
                </tr>
                <tr>
                    <td><strong>Bill Date:</strong></td>
                    <td>' . $bill['bill_date'] . '</td>
                </tr>
                <tr>
                    <td><strong>Due Date:</strong></td>
                    <td>' . $bill['due_date'] . '</td>
                </tr>
            </table>
            <br/><br/>
            <table border="1" cellpadding="5">
                <tr style="background-color:#f0f0f0;">
                    <th width="50%"><strong>Description</strong></th>
                    <th width="20%"><strong>Account</strong></th>
                    <th width="30%" align="right"><strong>Amount (KES)</strong></th>
                </tr>
                <tr>
                    <td>' . htmlspecialchars($bill['description']) . '</td>
                    <td>' . htmlspecialchars($bill['account_name']) . '</td>
                    <td align="right">' . number_format($bill['amount'], 2) . '</td>
                </tr>
                <tr>
                    <td colspan="2" align="right"><strong>Total Amount:</strong></td>
                    <td align="right"><strong>' . number_format($bill['amount'], 2) . '</strong></td>
                </tr>
                <tr>
                    <td colspan="2" align="right"><strong>Balance Due:</strong></td>
                    <td align="right"><strong>' . number_format($bill['balance_due'], 2) . '</strong></td>
                </tr>
            </table>
            <br/><br/>
            <table border="0" cellpadding="4">
                <tr>
                    <td width="33%">Prepared By: _________________</td>
                    <td width="33%">Checked By: _________________</td>
                    <td width="33%">Authorized By: _________________</td>
                </tr>
            </table>
            ';
            
            $pdf->writeHTML($html, true, false, true, false, '');
            
            // Clear output buffers to prevent corruption
            while (ob_get_level()) {
                ob_end_clean();
            }
            
            $pdf->Output('bill_' . $bill['bill_number'] . '.pdf', 'D');
            exit;
        }
    }
} catch (Exception $e) {
    error_log("Payables API error: " . $e->getMessage());
    apiError($e->getMessage(), 500);
}
