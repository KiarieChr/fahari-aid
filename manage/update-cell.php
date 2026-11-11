<?php
require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';
require_once 'functions.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if(isset($_POST['re-assign'])){

    $member = $_POST['member'];
  
    $cell = $_POST['cell']; 

   

    try {
        // Fetch old cell_id for audit logging
        $old_stmt = $db->prepare("SELECT cell_id FROM member WHERE id = :member_id");
        $old_stmt->execute([':member_id' => $member]);
        $old_cell_id = $old_stmt->fetchColumn();
        if ($old_cell_id !== false) {
            $old_cell_id = ($old_cell_id !== null) ? intval($old_cell_id) : null;
        } else {
            $old_cell_id = null;
        }

        echo "UPDATE member SET cell_id = $cell WHERE id=$member";
        $stmt = $db->prepare("UPDATE member SET cell_id = :cell_id WHERE id=:member_id");
        $stmt->bindParam(":cell_id",$cell,PDO::PARAM_INT);
        $stmt->bindParam(":member_id", $member,PDO::PARAM_INT);

        $stmt->execute();
      
        // Log Audit Trail
        $current_user_id = isset($_COOKIE['jen_idd']) ? intval($_COOKIE['jen_idd']) : 0;
        log_audit_trail($db, 'member', intval($member), 'update', ['cell_id' => $old_cell_id], ['cell_id' => intval($cell)], $current_user_id);


        echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'Cell Re-assigned Successfully.',
                                text: 'Successful.. Redirecting...',
                                type: 'success',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.location.href = '../assign_cell.php?cid=$cell';
                            }, 2000);
                        });
                    </script>";
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Unique constraint error
            echo " <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'An Error Occured',
                                text: 'The permission may already be in the system.',
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
elseif(isset($_POST['remove'])){
    $member = $_POST['member'];
    try {
        // Fetch old cell_id for audit logging
        $old_stmt = $db->prepare("SELECT cell_id FROM member WHERE id = :member_id");
        $old_stmt->execute([':member_id' => $member]);
        $old_cell_id = $old_stmt->fetchColumn();
        if ($old_cell_id !== false) {
            $old_cell_id = ($old_cell_id !== null) ? intval($old_cell_id) : null;
        } else {
            $old_cell_id = null;
        }

        echo "UPDATE member SET cell_id = NULL WHERE id=$member";
        $stmt = $db->prepare("UPDATE member SET cell_id = NULL WHERE id=:member_id");
        
        $stmt->bindParam(":member_id", $member,PDO::PARAM_INT);

        $stmt->execute();
      
        // Log Audit Trail
        $current_user_id = isset($_COOKIE['jen_idd']) ? intval($_COOKIE['jen_idd']) : 0;
        log_audit_trail($db, 'member', intval($member), 'update', ['cell_id' => $old_cell_id], ['cell_id' => null], $current_user_id);


        echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'Cell Removed Successfully.',
                                text: 'Successful.. Redirecting...',
                                type: 'success',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function() {
                                window.location.href = '../assign_cell.php';
                            }, 2000);
                        });
                    </script>";
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Unique constraint error
            echo " <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'An Error Occured',
                                text: 'The permission may already be in the system.',
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
