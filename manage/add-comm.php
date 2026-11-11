<?php

require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';
//date_default_timezone_set('Africa/Nairobi');
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $communication = $_POST['communication'];
   
        try {
            $stmt = $db->prepare("INSERT INTO communications (communication) 
                                  VALUES (:communication)");
            
            $stmt->execute([
                ':communication' => $communication
                
            ]);
                
            echo "<script>
                    document.addEventListener('DOMContentLoaded', function() {
                        Swal.fire({
                            title: 'Communication Added Successfully',
                            text: 'Redirecting to the view page...',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#57a94f'
                        });
                        setTimeout(function() {
                            window.location.href = '../login.php';
                        }, 2000);
                    });
                </script>";
            
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Unique constraint error
                echo "<script>
                    document.addEventListener('DOMContentLoaded', function() {
                        Swal.fire({
                            title: 'An Error Occurred',
                            text: 'Duplicate entry. Redirecting back...',
                            icon: 'error',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#57a94f'
                        });
                        setTimeout(function() {
                            window.history.back();
                        }, 5000);
                    });
                </script>";
            } else {
                echo "<script>
                    document.addEventListener('DOMContentLoaded', function() {
                        Swal.fire({
                            title: 'Database Error',
                            text: 'Couldn\'t connect to the database. Redirecting back...',
                            icon: 'error',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#57a94f'
                        });
                        setTimeout(function() {
                            window.history.back();
                        }, 5000);
                    });
                </script>";
            }
        }}