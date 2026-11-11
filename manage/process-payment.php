<?php 
include('../includes/connection.php');
include('../m-pesa/Mpesa.php');

function normalizePhoneNumber($number) {
    $number = preg_replace('/\D/', '', $number);
    if (substr($number, 0, 1) === '0') {
        $number = substr($number, 1);
    }
    return '254' . $number;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id   = $_POST['user_id'];
    $reference = $_POST['reference'];
    $phone_no  = $_POST['phone_no'];
    $amount    = $_POST['amount'];

    // Normalize phone
    $phone = (preg_match('/^2547\d{8}$/', $phone_no)) ? $phone_no : normalizePhoneNumber($phone_no);

    // Initialize Mpesa
    $mpesa = new Mpesa();

    // STK Push
    $response = $mpesa->stkPush($phoneNo, $amount, $reference, "M-Pesa Giving", $user_id);


    if (isset($response['ResponseCode']) && $response['ResponseCode'] == '0') {
        $merchantRequestID = $response['MerchantRequestID'];
        $checkoutRequestID = $response['CheckoutRequestID'];

        // Insert into pending_stk_requests
        $stmt = $db->prepare("INSERT INTO pending_stk_requests (user_id, phone, amount, reference, merchant_request_id, checkout_request_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $phone, $amount, $reference, $merchantRequestID, $checkoutRequestID]);

        // Feedback
        echo "<script>
            alert('STK Push Sent to $phone. Complete the payment on your phone.');
            window.location.href = '../dashboard.php'; // change to your desired page
        </script>";

    } else {
        // Error feedback
        $message = $response['errorMessage'] ?? $response['error'] ?? 'STK Push failed. Try again.';
        echo "<script>
            alert('Payment Failed: $message');
            window.history.back();
        </script>";
    }
}
