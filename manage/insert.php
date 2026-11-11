<?php
include('../includes/connection.php');
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $email = $_POST["email"];


        // Prepare SQL statement with placeholders
        $stmt = $pdo->prepare("INSERT INTO users (name, email) VALUES (:name, :email)");
        
        // Bind parameters securely
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);

        // Execute the statement
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "name" => $name, "email" => $email]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to insert data"]);
        }
    
}
?>
