<?php 
include('../includes/connection.php');
include("functions.php");
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['token'];
    //echo $token;
    $new_password = $_POST['password'];

    // Validate password
    // if (strlen($new_password) < 6) {
    //     setcookie('error', "Password Length should be at least 6 characters", time() + 60, "/");
    //     header("Location: ../reset-password.php?token=$token");
    //     exit();
    // }

    // Get email from token
    $stmt = $db->prepare("SELECT email FROM password_resets WHERE token = :token");
    $stmt->bindParam(":token", $token, PDO::PARAM_STR);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (empty($result)) {
        setcookie('error', "Invalid Token or Expired Token! Request Again", time() + 60, "/");
        header("Location: ../reset-password.php"); 
        exit();//
    }

    //$row = $result->fetch_assoc();
    $email = $result['email'];

    // Hash new password
    $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);

    // Update password in users table
    $stmt2 = $db->prepare("UPDATE users SET password = :password WHERE email = :email");
    $stmt2->bindParam(":password", $hashed_password, PDO::PARAM_STR);
    $stmt2->bindParam(":email", $email, PDO::PARAM_STR);
    
    $stmt2->execute();
    // notify user 
    $title = "Password Changed";

    $gid = $db->prepare("SELECT u.id,m.first_name from users u join member m on u.member_id = m.id  where u.email=:email limit 1");
    $gid->bindParam(':email',$email,PDO::PARAM_STR);
    $res = $gid->fetch(PDO::FETCH_ASSOC);

    
    $user_id = $res['id'];
    $name = $res['first_name'];
    $message = "Hello $name, you have changed your password successfully ";

    //push notification
    createUserNotification($db, $title,$message,$type="success",$user_id);
    // Delete token
    $stmt3 = $db->prepare("DELETE FROM password_resets WHERE email = :email");
    $stmt3->bindParam(":email", $email, PDO::PARAM_STR);
    
    $stmt3->execute();
    setcookie('reset-success', "Password Reset Successfully", time() + 60, "/");
    
    echo "<script> window.location.href = '../login.php'</script>";
}
?>