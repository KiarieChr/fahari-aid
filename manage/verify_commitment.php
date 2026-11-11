<?php
ob_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
include('../includes/connection.php');


# initialize response array
$response = ['success' => false, 'message' => 'An unexpected error occurred. Please try again later.'];

try{
    if($_SERVER['REQUEST_METHOD'] == 'POST'){
        $email = $_POST['email'];
        $phone_number   = $_POST['phone_number'];

        # get the commitment details from the database table pledges this should fetch all the pledges made by the request user to give a summary of their commitments
        $stmt = $db->prepare("SELECT * FROM pledges WHERE email = ? AND phone_no = ?");
        $stmt->execute([$email, $phone_number]);
        $commitments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        # if the commitments are found return success response and the commitment details
        if($commitments){
            $response['success'] = true;
            $response['commitments'] = $commitments;
            $response['total_commitments'] = count($commitments);
            $response['total_amount'] = array_sum(array_column($commitments, 'amount'));
            $response['email'] = $email;
            $response['phone_number'] = $phone_number;
            $response['message'] = 'Commitments retrieved successfully.';
        }else{
            $response['message'] = 'No commitments found for the provided email and phone number.'; 
        }
    }
}catch(Exception $e){
    $response['message'] = 'Error: ' . $e->getMessage(); 
}
echo json_encode($response);
?>