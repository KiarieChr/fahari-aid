<?php

if(ob_get_level()) ob_end_clean();

header("Content-Type: application/json");
header("Cache-Control: no-cache, must-revalidate");

require '../includes/connection.php'; // Include database connection


    
if ($_SERVER["REQUEST_METHOD"] == "POST") 
    {
        $name = $_POST['name']; 
        try {
            $stmt = $db->prepare("INSERT INTO permission_category (name) VALUES (:name)");
        
            $stmt->execute([
                ':name' => $name
            ]);

            $response = ['success'=>true, 'message'=> 'Permission Category Added Successfully'];
        } catch (PDOException $e) {
            if ($e->getCode() == 23000)
                    { // Unique constraint error
                    $response = ['success'=>false, 'message'=>'An error occurred, Kindly check if the category exists and try again!'];
                    
                }
            else {
                $response = ['success'=>false, 'message'=>'An error occurred, We could not contact the server, Give us a minute!'];
                }
        }
    }
else 
    {
    $response = ['success'=>false, 'message'=>'Invalid Request! Wrong request method, kindly try again!'];
    }
echo json_encode($response);
?>
