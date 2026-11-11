<?php
session_start();
error_reporting(0);
include('../includes/connection.php');
@include('../includes/sweetalert.html');
if(!empty($_POST["phone_no"])) {
  $phone_no= $_POST["phone_no"];
 
  $sql ="SELECT * FROM member WHERE phone_no=:phone_no";
  $query= $db -> prepare($sql);
  $query-> bindParam(':phone_no', $phone_no, PDO::PARAM_STR);
  $query-> execute();
  $results = $query -> fetchAll(PDO::FETCH_OBJ);
  $cnt=1;
  
  if($query -> rowCount() <= 0)
  {
      echo "<script> document.addEventListener('DOMContentLoaded', function() {
              Swal.fire({
        title: 'Please Contact, the one who referred you!',
        text: 'Redirecting back to Sign up',
        type: 'info',
        icon: 'info',
        confirmButtonText: 'OK,Proceed',
        confirmButtonColor: '#57a94f'
        }); setTimeout(function() {
              window.location.href = '../user_register.php';
          }, 2000);
          });
        </script>";
} else
{
    //check if the user is already registered
      $email=$_POST['email'];
      $s ="SELECT * FROM users WHERE email=:email";
      $q= $db -> prepare($s);
      $q-> bindParam(':email', $email, PDO::PARAM_STR);
      $q-> execute();
      $user = $q -> fetchAll(PDO::FETCH_OBJ);
      if($q -> rowCount() <= 0)
      {
        $member = $results[0]; // First matching member row
        $member_id = $member->id; 
        $dob = $_POST['dob'];
        $residence = $_POST['location'];
        $empl_status = $_POST['emp_status'];
        
        
        $password=password_hash($_POST['password'], PASSWORD_DEFAULT); 
        $sql="INSERT INTO  users(member_id,email,password) VALUES(:member_id,:email,:password)";
        $query = $db->prepare($sql);
        $query->bindParam(':member_id',$member_id,PDO::PARAM_INT);
        $query->bindParam(':email',$email,PDO::PARAM_STR);
        $query->bindParam(':password',$password,PDO::PARAM_STR);
        $query->execute();
        $lastInsertId = $db->lastInsertId();
        if($lastInsertId)
        {
          //update the members table
          $updateMemberSql = "UPDATE member SET bod = :bod, emp_status = :emp_status,location =:location WHERE id = :member_id";
          $updateMember = $db->prepare($updateMemberSql);
          $updateMember->bindParam(':bod', $dob, PDO::PARAM_STR);
          $updateMember->bindParam(':emp_status', $empl_status, PDO::PARAM_STR);
          $updateMember->bindParam(':location', $residence, PDO::PARAM_STR);
          $updateMember->bindParam(':member_id', $member_id, PDO::PARAM_INT);
          $updateMember->execute();
            echo "<script> document.addEventListener('DOMContentLoaded', function() {
                   Swal.fire({
              title: 'Registration Success',
              text: 'Successfully Registered in.. Redirecting...',
              type: 'success',
              icon: 'success',
              confirmButtonText: 'OK, Proceed',
              confirmButtonColor: '#57a94f'
            }); setTimeout(function() {
                    window.location.href = '../login.php';
                }, 2000);
                });
            </script>";
             
        }
        else 
        {
          echo "<script> document.addEventListener('DOMContentLoaded', function() {
            Swal.fire({
              title: 'Error! Something Went Wrong',
              text: 'Redirecting Back Redirecting...',
              type: 'warning',
              icon: 'warning',
              confirmButtonText: 'OK,Proceed',
              confirmButtonColor: '#57a94f'
            }); setTimeout(function() {
                    window.location.href = '../user_register.php';
                }, 2000);
                });
            </script>";
        }
      }
      else{
        echo "<script> document.addEventListener('DOMContentLoaded', function() {
          Swal.fire({
          title: 'User Exists! Please Login',
          text: 'Redirecting...',
          type: 'info',
          icon: 'info',
          confirmButtonText: 'OK,Proceed',
          confirmButtonColor: '#57a94f'
          }); setTimeout(function() {
              window.location.href = '../login.php';
          }, 2000);
          });
          </script>";
      }
    
}
}else{
  echo "<script> document.addEventListener('DOMContentLoaded', function() {
    Swal.fire({
    title: 'Form Error! Check your Form',
    text: 'Going Back.. Redirecting...',
    type: 'error',
    icon: 'error',
    confirmButtonText: 'OK,Proceed',
    confirmButtonColor: '#57a94f'
    }); setTimeout(function() {
        window.location.href = '../user_register.php';
    }, 2000);
    });
    </script>";
}?>