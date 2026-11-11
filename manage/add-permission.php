<?php
if(ob_get_level()) ob_end_clean();

header("content-Type: application/json");
header("Cache-Control: no-cache, must-revalidate");

require '../includes/connection.php'; // Include database connection


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
  
    $category = $_POST['category']; 

   

    try {
        $stmt = $db->prepare("INSERT INTO permissions (name,category) VALUES (:name, :category)");
      
        $stmt->execute([
            ':name' => $name,
            ':category' => $category
        ]);

        $response = ['success'=>true, 'message'=>'Permssion Added Successfully!'];

        
    } 
    catch (PDOException $e)
     {
        if ($e->getCode() == 23000) { // Unique constraint error
             $response = ['success'=>false, 'message'=>'The permission may already be added!'];
           
                
            }

        else {
                $response = ['success'=>false, 'message'=>'Couldn\'t Connect to the Database Redirecting back for you to check!'];
                
        }
    }
} 
else 
{
    $response = ['success'=>false, 'message'=>'Could not authenticate your Request!'];
 }
 echo json_encode($response, JSON_PRETTY_PRINT);
?>
