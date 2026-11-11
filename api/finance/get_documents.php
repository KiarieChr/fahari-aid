<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware.php';

$user = authenticate();

try {
    // We will combine records from finance_documents, payment_vouchers, imprest_vouchers, and bills (which acts as supplier invoices)
    
    // For this example, let's just return raw vouchers for the UI directly
    $documents = [];
    
    // 1. Payment Vouchers
    $stmt1 = $db->query("
        SELECT id, voucher_number as doc_number, vendor_name as reference_name, amount, date as doc_date, description, status, 'Payment Voucher' as doc_type, 'payment_voucher' as type_code
        FROM payment_vouchers
        ORDER BY date DESC
    ");
    $pv = $stmt1->fetchAll(PDO::FETCH_ASSOC);
    $documents = array_merge($documents, $pv);

    // 2. Imprest Vouchers
    $stmt2 = $db->query("
        SELECT id, voucher_number as doc_number, recipient_name as reference_name, amount_requested as amount, date_needed as doc_date, purpose as description, status, 'Imprest Voucher' as doc_type, 'imprest_voucher' as type_code
        FROM imprest_vouchers
        ORDER BY date_needed DESC
    ");
    $iv = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    $documents = array_merge($documents, $iv);

    // 3. Supplier Invoices (Bills)
    $stmt3 = $db->query("
        SELECT id, bill_number as doc_number, vendor_name as reference_name, amount, bill_date as doc_date, description, status, 'Supplier Invoice' as doc_type, 'supplier_invoice' as type_code
        FROM bills
        WHERE delete_status = 0
        ORDER BY bill_date DESC
    ");
    $bills = $stmt3->fetchAll(PDO::FETCH_ASSOC);
    $documents = array_merge($documents, $bills);
    
    // Sort combined by date descending
    usort($documents, function($a, $b) {
        return strtotime($b['doc_date']) - strtotime($a['doc_date']);
    });

    apiSuccess($documents, 'Documents retrieved successfully');
} catch (Exception $e) {
    error_log("Get documents API error: " . $e->getMessage());
    apiError($e->getMessage(), 500);
}
