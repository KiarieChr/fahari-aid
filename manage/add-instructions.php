<?php
require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $purpose = $_POST['purpose'];
    $title = $_POST['title'];
    $prophecy = $_POST['prophecy'];
    $status = $_POST['status'];
   

    //echo "INSERT INTO prophecies (purpose, title,prophecy,status) VALUES ('$purpose','$title','$prophecy','$status')";
    
    try {
        $stmt = $db->prepare("INSERT INTO prophecies (purpose, title,prophecy,status,dates) VALUES ('$purpose','$title','$prophecy','$status', CURDATE())");
      
        $stmt->execute();
        // push notification to a admin,general admin
        //the roles id for admin and general Admin
        $grole = $db->prepare("SELECT id from roles WHERE name='Administrator' or name='General Admin'");
        $grole->execute();
        $roles=$grole->fetchAll(PDO::FETCH_ASSOC);

        if(!empty($roles)){
            foreach($roles as $index=>$row):
                $id = $row['id'];
                $title = "Prophecy Added $title.";
                $message = "A prophecy has been added to the system. Check out under prophecies";
                $type = "info";

                createRoleNotification($db, $title,$message,$type,$id);
            endforeach;
        }

        echo "<script>
                    document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'Prophecy Added Successfully',
                                text: 'Successful.. Redirecting...',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.location.href = '../instructions.php';
                            }, 2000);
                        });
                    </script>";
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Unique constraint error
            echo " <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'An Error Occured',
                                text: 'Redirecting back for you to check',
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
             else {
                echo "<script>
                document.addEventListener('DOMContentLoaded', function() {
                    Swal.fire({
                        title: 'Database Error',
                        text: 'Couldn\\'t Connect to the Database. Redirecting back for you to check.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#57a94f'
                    });
                });
                </script>";
                
        }
    }
} else 
{
    echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'Invalid Request',
                                text: 'Could not authenticate your Request',
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
