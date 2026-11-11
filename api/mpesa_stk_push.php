<?php
/**
 * M-Pesa STK Push (Lipa Na M-Pesa Online)
 * POST /api/mpesa_stk_push.php
 *
 * Body: { phone, amount, pledge_id, description? }
 *
 * Required env/config constants (add to config.php):
 *   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET,
 *   MPESA_SHORTCODE, MPESA_PASSKEY,
 *   MPESA_CALLBACK_URL   (publicly reachable URL, e.g. https://yourdomain.com/api/mpesa_stk_callback.php)
 *   MPESA_ENV            'sandbox' | 'production'
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiError('Method not allowed', 405);
}

$body       = getJsonBody();
$phone      = trim($body['phone']      ?? '');
$amount     = (int)($body['amount']    ?? 0);
$pledge_id  = (int)($body['pledge_id'] ?? 0);
$description = trim($body['description'] ?? 'JEN Pledge Payment');

if (empty($phone) || $amount <= 0 || $pledge_id <= 0) {
    apiError('phone, amount, and pledge_id are required', 400);
}

// ── Safaricom constants ────────────────────────────────────────────────────────
$isSandbox    = (defined('MPESA_ENV') ? MPESA_ENV : 'sandbox') === 'sandbox';
$baseUrl      = $isSandbox
    ? 'https://sandbox.safaricom.co.ke'
    : 'https://api.safaricom.co.ke';
$consumerKey  = defined('MPESA_CONSUMER_KEY')    ? MPESA_CONSUMER_KEY    : '';
$consumerSec  = defined('MPESA_CONSUMER_SECRET') ? MPESA_CONSUMER_SECRET : '';
$shortcode    = defined('MPESA_SHORTCODE')        ? MPESA_SHORTCODE        : '';
$passkey      = defined('MPESA_PASSKEY')          ? MPESA_PASSKEY          : '';
$callbackUrl  = defined('MPESA_CALLBACK_URL')     ? MPESA_CALLBACK_URL     : '';

if (empty($consumerKey) || empty($consumerSec) || empty($shortcode) || empty($passkey) || empty($callbackUrl)) {
    apiError('M-Pesa is not configured on this server', 503);
}

// ── 1. Get OAuth access token ─────────────────────────────────────────────────
function mpesaGetToken($baseUrl, $key, $secret) {
    $ch = curl_init("$baseUrl/oauth/v1/generate?grant_type=client_credentials");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPAUTH       => CURLAUTH_BASIC,
        CURLOPT_USERPWD        => "$key:$secret",
    ]);
    $resp = curl_exec($ch);
    $err  = curl_error($ch);
    curl_close($ch);
    if ($err) throw new Exception("M-Pesa token curl error: $err");
    $data = json_decode($resp, true);
    return $data['access_token'] ?? null;
}

try {
    $token = mpesaGetToken($baseUrl, $consumerKey, $consumerSec);
    if (!$token) {
        apiError('Failed to authenticate with M-Pesa', 502);
    }

    // ── 2. Build STK Push payload ─────────────────────────────────────────────
    $timestamp = date('YmdHis');
    $password  = base64_encode($shortcode . $passkey . $timestamp);

    $payload = [
        'BusinessShortCode' => $shortcode,
        'Password'          => $password,
        'Timestamp'         => $timestamp,
        'TransactionType'   => 'CustomerPayBillOnline',
        'Amount'            => $amount,
        'PartyA'            => $phone,
        'PartyB'            => $shortcode,
        'PhoneNumber'       => $phone,
        'CallBackURL'       => $callbackUrl,
        'AccountReference'  => 'JEN-' . $pledge_id,
        'TransactionDesc'   => substr($description, 0, 13), // max 13 chars
    ];

    // ── 3. Send STK Push request ──────────────────────────────────────────────
    $ch = curl_init("$baseUrl/mpesa/stkpush/v1/processrequest");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
        ],
    ]);
    $resp = curl_exec($ch);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($err) throw new Exception("STK Push curl error: $err");

    $result = json_decode($resp, true);

    if (!isset($result['CheckoutRequestID'])) {
        $msg = $result['errorMessage'] ?? ($result['ResponseDescription'] ?? 'STK Push failed');
        apiError($msg, 400);
    }

    // ── 4. Persist pending transaction so the callback can link it ────────────
    try {
        $db->prepare("
            INSERT INTO mpesa_stk_requests
                (checkout_request_id, merchant_request_id, pledge_id, phone, amount, status, created_at)
            VALUES (:cr, :mr, :pid, :ph, :am, 'pending', NOW())
            ON DUPLICATE KEY UPDATE status = 'pending', created_at = NOW()
        ")->execute([
            ':cr'  => $result['CheckoutRequestID'],
            ':mr'  => $result['MerchantRequestID'] ?? '',
            ':pid' => $pledge_id,
            ':ph'  => $phone,
            ':am'  => $amount,
        ]);
    } catch (PDOException $e) {
        // Table might not exist yet — log but don't block the push response
        error_log("mpesa_stk_requests insert error: " . $e->getMessage());
    }

    apiSuccess([
        'CheckoutRequestID'  => $result['CheckoutRequestID'],
        'MerchantRequestID'  => $result['MerchantRequestID'] ?? '',
        'ResponseDescription'=> $result['ResponseDescription'] ?? 'Success',
    ], 'STK Push sent. Prompt your customer to check their phone.');

} catch (Exception $e) {
    error_log("STK Push error: " . $e->getMessage());
    apiError('Failed to initiate M-Pesa payment: ' . $e->getMessage(), 500);
}
