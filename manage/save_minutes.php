<?php

require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';
//date_default_timezone_set('Africa/Nairobi');
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $personnel = $_POST['personnel'];
    $meeting_id = $_POST['meeting_id'];
    $minutes = $_POST['minutes'];
 
  
        try {
            $stmt = $db->prepare("INSERT INTO meeting_minutes (meeting_id, personnel,minutes) 
                                  VALUES (:meeting_id, :personnel, :minutes)");
            
            $stmt->execute([
                ':meeting_id' => $meeting_id,
                ':personnel' => $personnel,
                ':minutes' => $minutes
                
            ]);
                
            echo "<script>
                    document.addEventListener('DOMContentLoaded', function() {
                        Swal.fire({
                            title: 'Minutes Added Successfully',
                            text: 'Redirecting to the view page...',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#57a94f'
                        });
                        setTimeout(function() {
                            window.location.href = '../meetingMin.php';
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
   
 else {
    echo "<script>
        document.addEventListener('DOMContentLoaded', function() {
            Swal.fire({
                title: 'Invalid Request',
                text: 'Could not authenticate your request.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#57a94f'
            });
            setTimeout(function() {
                window.history.back();
            }, 5000);
        });
    </script>";
}
?>
