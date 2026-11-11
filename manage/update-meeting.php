<?php
require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

  

    $description = $_POST['description'];
  
    $meeting_id = $_POST['meeting_id']; 

   

    try {
        echo "UPDATE meeting SET description = '$description' WHERE id=$meeting_id";
        
        $stmt = $db->prepare("UPDATE meeting SET description = :description WHERE id=:meeting_id");
        $stmt->bindParam(":description",$description,PDO::PARAM_STR);
        $stmt->bindParam(":meeting_id", $meeting_id,PDO::PARAM_INT);

        $stmt->execute();
      

        echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'Updated Successfully.',
                                text: 'Successful.. Redirecting...',
                                type: 'success',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.location.href = '../view_meetings.php';
                            }, 2000);
                        });
                    </script>";
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Unique constraint error
            echo " <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'An Error Occured',
                                text: 'The Update failed. Kindly try again',
                                type: 'error',
                                icon: 'error',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.history.back();
                            }, 3000);
                        });
                    </script>";
                
                
            }
             else {
                echo " <script>
                document.addEventListener('DOMContentLoaded', function() 
                {
                    Swal.fire({
                        title: 'Database Error',
                        text: 'Couldn\'t Connect to the Database Redirecting back for you to check',
                        type: 'error',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#57a94f'
                    }); 
                    setTimeout(function() {
                        window.history.back();
                    }, 3000);
                });
            </script>";
        }
    
}



} 
else 
{
    echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'Invalid Request',
                                text: 'Could not authenticate your Request',
                                type: 'error',
                                icon: 'warning',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.history.back();
                            }, 3000);
                        });
                    </script>";
                }
?>
