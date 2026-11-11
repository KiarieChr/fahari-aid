<?php
require_once(__DIR__ . '/connection.php');

function check_login($db) {
    if (!isset($_COOKIE['auth_token'])) {
        @include('sweetalert.html');
        if (isset($_COOKIE['temp_auth'])) {
        // JS-set cookie is present → delay fallback behavior slightly
        sleep(10); // optional wait
    }
       echo "<script>
                document.addEventListener('DOMContentLoaded', function() {
                    Swal.fire({
                        title: 'No Active Session! Kindly Login to your Account',
                        text: ' Redirecting...',
                        icon: 'info',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#57a94f'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Redirect to logout script
                            window.location.href = 'login.php';
                        }
                    }) 
                    setTimeout(function() {
                        window.location.href = 'login.php';
                    }, 5000);
                });
            </script>";
      exit;
    }

    $token = $_COOKIE['auth_token'];
    $ip = $_SERVER['REMOTE_ADDR'];

    $stmt = $db->prepare(" SELECT u.id, s.token, s.expires_at  FROM user_sessions s
                      JOIN users u ON s.user_id = u.id 
                      WHERE s.token =:token
                      AND s.expires_at > NOW();");
    $stmt->execute([':token' => $token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    

    if (!$user) {
        // Token invalid or expired
       // Set 30-minute cookie
      setcookie('auth_token', $token, [
        'expires' => time() + 1800, // 30 minutes
        'path' => '/',
        'httponly' => true,
        'secure' => false // Set to true if using HTTPS
      ]);
        echo "<script> alert('Session Expired!Login Again); window.location.href='login.php';</script>";
    }

    // Optionally verify IP address
    // if ($ip !== $session['ip_address']) { ... }

    return $user['id']; // You can return user info if needed
}

$user_id = check_login($db);

if($user_id ){
    // After successful login, set a cookie for the user_id

    if(!isset($_COOKIE['jen_idd'])){
setcookie('jen_idd', $user_id, time() + 3600, "/");
    header("Location: " . $_SERVER['PHP_SELF']);
   
     } // Cookie expires in 1 hour
}
?>