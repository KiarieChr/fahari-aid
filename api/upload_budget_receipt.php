<?php
/**
 * Upload Budget Receipt
 * POST /api/upload_budget_receipt.php
 * 
 * Multipart form upload: { item_id, receipt (file) }
 * Stores file and optionally extracts OCR text for verification.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

$itemId = (int)($_POST['item_id'] ?? 0);
if ($itemId <= 0) {
    apiError('Item ID is required', 400);
}

// Validate file
if (empty($_FILES['receipt']) || $_FILES['receipt']['error'] !== UPLOAD_ERR_OK) {
    apiError('Receipt file is required', 400);
}

$file = $_FILES['receipt'];
$maxSize = 10 * 1024 * 1024; // 10MB
if ($file['size'] > $maxSize) {
    apiError('File too large. Maximum 10MB', 400);
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
if (!in_array($mimeType, $allowedTypes)) {
    apiError('Invalid file type. Allowed: JPEG, PNG, WebP, PDF', 400);
}

try {
    // Verify item exists and budget is approved
    $stmt = $db->prepare("
        SELECT ebi.*, eb.status AS budget_status, eb.id AS budget_id
        FROM event_budget_item ebi
        JOIN event_budget eb ON eb.id = ebi.event_budget_id
        WHERE ebi.id = :id
    ");
    $stmt->execute([':id' => $itemId]);
    $item = $stmt->fetch();

    if (!$item) apiError('Budget item not found', 404);
    if (!in_array($item['budget_status'], ['approved', 'closed'])) {
        apiError('Budget must be approved before uploading receipts', 400);
    }

    // Create upload directory
    $uploadDir = __DIR__ . '/../assets/uploads/receipts/' . date('Y/m');
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate safe filename
    $ext = match($mimeType) {
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf',
        default => 'bin'
    };
    $safeFileName = 'receipt_' . $itemId . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $filePath = $uploadDir . '/' . $safeFileName;
    $relativePath = 'assets/uploads/receipts/' . date('Y/m') . '/' . $safeFileName;

    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        apiError('Failed to save file', 500);
    }

    // Simple OCR placeholder — extract text if image (future: integrate Tesseract or cloud OCR)
    $ocrText = null;
    if (str_starts_with($mimeType, 'image/')) {
        // Basic: store null, actual OCR would be called here
        $ocrText = null;
    }

    $db->beginTransaction();

    // Save receipt record
    $stmt = $db->prepare("
        INSERT INTO event_budget_receipt (budget_item_id, file_name, file_path, file_type, file_size, ocr_text, uploaded_by)
        VALUES (:item_id, :fname, :fpath, :ftype, :fsize, :ocr, :uid)
    ");
    $stmt->execute([
        ':item_id' => $itemId,
        ':fname' => $file['name'],
        ':fpath' => $relativePath,
        ':ftype' => $mimeType,
        ':fsize' => $file['size'],
        ':ocr' => $ocrText,
        ':uid' => $user->id
    ]);
    $receiptId = (int)$db->lastInsertId();

    // Audit
    $db->prepare("
        INSERT INTO event_budget_audit (event_budget_id, action, details, performed_by)
        VALUES (:bid, 'receipt_uploaded', :details, :uid)
    ")->execute([
        ':bid' => $item['budget_id'],
        ':details' => "Receipt uploaded for \"{$item['description']}\": {$file['name']} (" . round($file['size'] / 1024) . " KB)",
        ':uid' => $user->id
    ]);

    $db->commit();

    apiSuccess([
        'receipt_id' => $receiptId,
        'file_name' => $file['name'],
        'file_path' => $relativePath,
        'file_size' => $file['size'],
        'ocr_text' => $ocrText
    ], 'Receipt uploaded successfully');

} catch (\Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    // Clean up uploaded file on error
    if (isset($filePath) && file_exists($filePath)) {
        unlink($filePath);
    }
    error_log("Upload receipt error: " . $e->getMessage());
    apiError('Failed to upload receipt: ' . $e->getMessage(), 500);
}
