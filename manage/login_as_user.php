<?php
require '../includes/connection.php';

if (isset($_POST['user_id'])) {
    $user_id = $_POST['user_id'];

    try {
        // Fetch the user details from the database
        $sql = "SELECT * FROM users WHERE id = :user_id LIMIT 1";
        $query = $db->prepare($sql);
        $query->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $query->execute();
        $user = $query->fetch(PDO::FETCH_OBJ);

        if ($user) {
            // Generate a new token for the user (same process as regular login)
            $token = bin2hex(random_bytes(32)); // Create a random token
            $ip = $_SERVER['REMOTE_ADDR'];
            $ua = $_SERVER['HTTP_USER_AGENT'];
           // date_default_timezone_set('Africa/Nairobi');
            $expires = date('Y-m-d H:i:s', strtotime('+30 minutes'));

            // Insert the token into the user_sessions table
            $stmt = $db->prepare("INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at) 
                                  VALUES (:user_id, :token, :ip, :ua, :expires)");
            $stmt->execute([
                ':user_id' => $user->id,
                ':token' => $token,
                ':ip' => $ip,
                ':ua' => $ua,
                ':expires' => $expires
            ]);

            // Set the cookie for the user
            setcookie('auth_token', $token, [
                'expires' => time() + 1800, // 30 minutes
                'path' => '/',
                'httponly' => true,
                'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'
            ]);

            // Optionally store the user info in a session or cookie for admin to know which user they're logged in as
            setcookie('logged_in_as_user', $user->id, time() + 1800, '/');

            // Redirect to the user's dashboard (or wherever you want)
            header("Location: ../dashboard.php");
            exit();
        } else {
            // User not found
            echo "<script>alert('User not found!'); window.location.href = '../dashboard.php';</script>";
        }
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
} else {
    echo "<script>alert('No user ID provided!'); window.location.href = '../dashboard.php';</script>";
}
?>
