<?php
/**
 * Upload Receipt for Budget Item
 * POST /api/upload_receipt.php (multipart/form-data)
 * 
 * Fields: budget_item_id, receipt (file)
 * 
 * Accepts: JPEG, PNG, PDF, WEBP
 * After upload, attempts OCR via Tesseract (if available) to extract receipt number.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/middleware.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$user = authenticate();

$itemId = (int)($_POST['budget_item_id'] ?? 0);
if ($itemId <= 0) {
    apiError('Budget item ID is required', 400);
}

// Validate file
if (!isset($_FILES['receipt']) || $_FILES['receipt']['error'] !== UPLOAD_ERR_OK) {
    $errorMap = [
        UPLOAD_ERR_INI_SIZE => 'File exceeds server max size',
        UPLOAD_ERR_FORM_SIZE => 'File exceeds form max size',
        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
    ];
    $err = $_FILES['receipt']['error'] ?? UPLOAD_ERR_NO_FILE;
    apiError($errorMap[$err] ?? 'File upload error', 400);
}

$file = $_FILES['receipt'];

// Validate type
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

if (!in_array($mimeType, $allowedTypes)) {
    apiError('Invalid file type. Allowed: JPEG, PNG, WEBP, PDF', 400);
}

// Validate size (10MB max)
if ($file['size'] > 10 * 1024 * 1024) {
    apiError('File too large. Max 10MB', 400);
}

// Validate item exists
$stmt = $db->prepare("
    SELECT ebi.id, ebi.event_budget_id, ebi.receipt_ref
    FROM event_budget_item ebi
    WHERE ebi.id = :id
");
$stmt->execute([':id' => $itemId]);
$item = $stmt->fetch();

if (!$item) apiError('Budget item not found', 404);

try {
    // Create upload directory
    $uploadDir = __DIR__ . '/../uploads/receipts/' . $item['event_budget_id'];
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
    $safeFilename = 'receipt_' . $itemId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $filePath = $uploadDir . '/' . $safeFilename;
    $relativePath = 'uploads/receipts/' . $item['event_budget_id'] . '/' . $safeFilename;

    // Move file
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        apiError('Failed to save file', 500);
    }

    // Attempt OCR for images
    $ocrText = null;
    $ocrReceiptNumber = null;
    $ocrVerified = false;

    if (in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp'])) {
        $ocrText = attemptOcr($filePath);
        if ($ocrText) {
            $ocrReceiptNumber = extractReceiptNumber($ocrText);

            // Verify against manual receipt_ref if present
            if ($ocrReceiptNumber && $item['receipt_ref']) {
                $ocrVerified = strtolower(trim($ocrReceiptNumber)) === strtolower(trim($item['receipt_ref']));

                // Update verification status on item
                $db->prepare("UPDATE event_budget_item SET receipt_ref_verified = :v WHERE id = :id")
                    ->execute([':v' => $ocrVerified ? 1 : 0, ':id' => $itemId]);
            }
        }
    }

    // Save receipt record
    $stmt = $db->prepare("
        INSERT INTO event_budget_receipt (budget_item_id, file_name, file_path, file_type, file_size, ocr_text, ocr_receipt_number, ocr_verified, uploaded_by)
        VALUES (:item_id, :file_name, :file_path, :file_type, :file_size, :ocr_text, :ocr_num, :ocr_verified, :user_id)
    ");
    $stmt->execute([
        ':item_id' => $itemId,
        ':file_name' => $file['name'],
        ':file_path' => $relativePath,
        ':file_type' => $mimeType,
        ':file_size' => $file['size'],
        ':ocr_text' => $ocrText,
        ':ocr_num' => $ocrReceiptNumber,
        ':ocr_verified' => $ocrVerified ? 1 : 0,
        ':user_id' => $user->id
    ]);
    $receiptId = (int)$db->lastInsertId();

    // Audit
    $db->prepare("
        INSERT INTO event_budget_audit (event_budget_id, action, details, performed_by)
        VALUES (:bid, 'receipt_uploaded', :details, :uid)
    ")->execute([
        ':bid' => $item['event_budget_id'],
        ':details' => "Receipt uploaded for item #{$itemId}: {$file['name']}" . ($ocrReceiptNumber ? " (OCR: $ocrReceiptNumber)" : ""),
        ':uid' => $user->id
    ]);

    apiSuccess([
        'receipt_id' => $receiptId,
        'file_path' => $relativePath,
        'ocr_text' => $ocrText ? substr($ocrText, 0, 500) : null,
        'ocr_receipt_number' => $ocrReceiptNumber,
        'ocr_verified' => $ocrVerified,
        'verification_note' => $ocrReceiptNumber && $item['receipt_ref']
            ? ($ocrVerified ? 'Receipt number matches manual entry' : 'Receipt number DOES NOT match manual entry (' . $item['receipt_ref'] . ' vs OCR: ' . $ocrReceiptNumber . ')')
            : ($ocrReceiptNumber ? 'OCR detected receipt number: ' . $ocrReceiptNumber : 'No receipt number detected via OCR')
    ], 'Receipt uploaded');

} catch (\Exception $e) {
    error_log("Upload receipt error: " . $e->getMessage());
    apiError('Failed to upload receipt', 500);
}

/**
 * Attempt OCR using Tesseract if available, otherwise return null.
 */
function attemptOcr(string $imagePath): ?string {
    // Check Tesseract availability
    $tesseract = null;
    $paths = ['tesseract', 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe', '/usr/bin/tesseract'];
    foreach ($paths as $p) {
        $check = shell_exec(escapeshellarg($p) . ' --version 2>&1');
        if ($check && str_contains($check, 'tesseract')) {
            $tesseract = $p;
            break;
        }
    }

    if (!$tesseract) {
        // Tesseract not available — skip OCR silently
        return null;
    }

    $tmpOutput = tempnam(sys_get_temp_dir(), 'ocr_');
    $cmd = escapeshellarg($tesseract) . ' ' . escapeshellarg($imagePath) . ' ' . escapeshellarg($tmpOutput) . ' 2>&1';
    exec($cmd, $output, $exitCode);

    $ocrFile = $tmpOutput . '.txt';
    if ($exitCode === 0 && file_exists($ocrFile)) {
        $text = file_get_contents($ocrFile);
        unlink($ocrFile);
        if (file_exists($tmpOutput)) unlink($tmpOutput);
        return trim($text) ?: null;
    }

    // Cleanup
    if (file_exists($ocrFile)) unlink($ocrFile);
    if (file_exists($tmpOutput)) unlink($tmpOutput);
    return null;
}

/**
 * Extract receipt/invoice number from OCR text using regex.
 */
function extractReceiptNumber(?string $text): ?string {
    if (!$text) return null;

    // Common patterns: Receipt No: XXX, Invoice #XXX, Ref: XXX, etc.
    $patterns = [
        '/(?:receipt|rcpt|invoice|inv|ref|reference|transaction|trans|txn)\s*(?:no|number|#|:)\s*[:#]?\s*([A-Z0-9][\w\-\/]{2,30})/i',
        '/(?:receipt|invoice)\s*:\s*([A-Z0-9][\w\-\/]{2,30})/i',
        '/\b([A-Z]{2,4}\d{4,})\b/',  // Common format: XX12345
    ];

    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $text, $matches)) {
            return trim($matches[1]);
        }
    }

    return null;
}
