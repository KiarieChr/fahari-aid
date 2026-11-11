<?php
require '../includes/connection.php'; // Include database connection
include '../includes/sweetalert.html';
include('functions.php');
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['cell_leader'];
  
   // Generate unique cell_code
   function generateCellCode($db,$prefix = "JEN") {
    

    // Get the last inserted code 
    $stmtt=$db->query("SELECT code from cells order by id desc limit 1");
    $last_code = $stmtt->fetchColumn();

    if($last_code === false){
        $newCode = $prefix . "-001";
    }else{
        $split = explode('-',$last_code);
        
        $no = (int) $split[1];
        $next = $no +1;

        $newCode = $prefix."-".str_pad($next,3,'0',STR_PAD_LEFT);
    }

    return $newCode;
}

    $cell_code = generateCellCode($db);

   

    try {
        $stmt = $db->prepare("INSERT INTO cells (cell_leader,code) VALUES (:cell_leader,:code)");
        $stmt->bindParam(':cell_leader', $name, PDO::PARAM_INT);
        $stmt->bindParam(':code',$cell_code, PDO::PARAM_STR);
        $stmt->execute();
        $lastInsertId = $db->lastInsertId();
        
        // Log Audit Trail
        $current_user_id = isset($_COOKIE['jen_idd']) ? intval($_COOKIE['jen_idd']) : 0;
        $new_values = [
            'cell_leader' => $name,
            'code' => $cell_code,
            'status' => 1
        ];
        log_audit_trail($db, 'cells', $lastInsertId, 'create', null, $new_values, $current_user_id);

        // UPDATE THE CELL LEADER TO HAVE A CELL ID IN THE  MEMBER TABLE
        $stm = $db->prepare("UPDATE member set cell_id=:cell where id=:m_id");
        $stm->bindParam(':cell', $lastInsertId,PDO::PARAM_INT);
        $stm->bindParam(':m_id',$name,PDO::PARAM_INT);
        $stm->execute();

        // push notification to a admin,general admin
        //the roles id for admin and general Admin
        $grole = $db->prepare("SELECT id from roles WHERE name='Administrator' or name='General Admin'");
        $grole->execute();
        $roles=$grole->fetchAll(PDO::FETCH_ASSOC);

        if(!empty($roles)){
            foreach($roles as $index=>$row):
                $id = $row['id'];
                $title = "Cell Created $cell_code.";
                $message = "A cell has successfully been added. To assign members to cell Management.";
                $type = "info";

                createRoleNotification($db, $title,$message,$type,$id);
            endforeach;
        }


        echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            Swal.fire({
                                title: 'You have Added a Cell of code {$cell_code} Successfully',
                                text: 'Successful.. Redirecting...',
                               
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#57a94f'
                            }); 
                            setTimeout(function(){
                            window.location.href= '../cells.php';
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
                            }, 2000);
                        });
                    </script>";
                
                
            }
             else {
                echo " <script>
                document.addEventListener('DOMContentLoaded', function() 
                {
                    swal({
                        title: 'Database Error',
                        text: 'Couldn\'t Connect to the Database Redirecting back for you to check',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#57a94f'
                    }); 
                    setTimeout(function() {
                        window.history.back();
                    }, 2000);
                });
            </script>";
        }
    }
} else 
{
    echo "<script>
                        document.addEventListener('DOMContentLoaded', function() {
                            swal({
                                title: 'Invalid Request',
                                text: 'Could not authenticate your Request',
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
