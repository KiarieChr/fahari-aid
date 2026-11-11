<?php
ob_start();
session_start();
  require_once('includes/connection.php');

 // Check for "remember me" cookie
if (isset($_COOKIE['auth_token'])) {
    $token = $_COOKIE['auth_token'];
    
    try {
        // Verify token in database
        $stmt = $db->prepare("SELECT u.* FROM users u 
                             JOIN user_sessions s ON u.id = s.user_id 
                             WHERE s.token = :token AND s.expires_at > NOW()");
        $stmt->bindParam(':token', $token, PDO::PARAM_STR);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_OBJ);
        
        if ($user && $user->status == 1) {
            // Create session and refresh token
            $_SESSION['user_id'] = $user->id;
            $_SESSION['user_email'] = $user->email;
            
            // Update last login
            $update = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
            $update->execute([':id' => $user->id]);
            echo "<script>window.location.href = 'dashboard.php';</script>";
            //header("Location: dashboard.php");
            exit();
        } else {
            // Invalid token - clear cookie
            setcookie('auth_token', '', time() - 3600, '/');
        }
    } catch (PDOException $e) {
        // Log error but continue to show login form
        error_log("Token verification error: " . $e->getMessage());
    }
}?>
<!doctype html>

<html
  lang="en"
  class="layout-wide customizer-hide"
  data-assets-path="assets/"
  data-template="vertical-menu-template-free">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />

    <title>Login | Jesus Enthroned Network</title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="assets/img/favicon/f" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
      rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <link rel="stylesheet" href="assets/vendor/fonts/iconify-icons.css" />

    <!-- Core CSS -->
    <!-- build:css assets/css/theme.css  -->

 <link rel="stylesheet" href="assets/css/core-2.css" />

    <!-- Vendors CSS -->

    <link rel="stylesheet" href="assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />

    <!-- endbuild -->

    <!-- Page CSS -->
    <!-- Page -->
    <link rel="stylesheet" href="assets/vendor/css/auth2.css" />

    <!-- Helpers -->
    <script src="assets/vendor/js/helpers.js"></script>
    <!--! Template customizer & Theme config files MUST be included after core stylesheets and helpers.js in the <head> section -->

    <!--? Config:  Mandatory theme config file contain global vars & default theme options, Set your preferred theme option in this file.  -->

    <script src="assets/js/config.js"></script>
  </head>

  <body>
    <!-- Content -->
     <!-- Toast Container -->
    <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer">
      <div id="toastElement" class="bs-toast toast fade align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">
        
        <div class="d-flex">
          <div id="toast-body" class="toast-body"></div>
          <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
    <div class="__container">
      <div class="header">
        <h1 class="text-white">Jesus Enthroned Network</h1>
        <p>Enter your Login Credentials Below.</p>
      </div>
      <div class="form-container">
        <form action="manage/signin.php" id="loginForm" method="post" class="6">
          <div class="input--group" id="emailGroup">
            <label for="email">
              <i class="bx bx-envelope"></i> Email Address
            </label>
            <input type="email" name="email-username" placeholder="Enter your Email or Username" class="form-control" id="email" required autofocus>
            <div class="error-message">Please Enter a valid email address</div>
          </div>
          <div class="input--group" id="passwordGroup">
            <label for="password">
              <i class="bx bx-bxs-lock"></i>Password
            </label>
            <div class="input-group input-group-merge ">
              <input type="password"  placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;" id="password" class="form-control form-contol-append" name="password">
              <i class="icon-base bx bx-hide position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer " style="padding:15px!important" id="togglePassword"></i>
            </div>
            
          </div>
          <div class="d-flex justify-content-between">
            <div class="form-check mb-0">
              <input class="form-check-input" type="checkbox" id="remember-me" />
              <label class="form-check-label" for="remember-me"> Remember Me </label>
            </div>
            <a href="reset-password.php">
              <span>Forgot Password?</span>
            </a>
          </div>
          <div class="mb-6">
            <button class="btn btn-primary d-grid w-100" id="loginBtn" type="submit">Login</button>
          </div>
        </form>
        <p class="text-center">
          <span>New on our platform?</span>
          <a href="user_register.php">
            <span>Create an account</span>
          </a>
        </p>
        <p class="text-center">
          <span>Attend A meeting</span>
          <a href="attend-meet.php">
            <span>Join A Session</span>
          </a>
        </p>
      </div>
    </div>


   

    <!-- / Content -->

    

    <!-- Core JS -->

    <script src="assets/vendor/libs/jquery/jquery.js"></script>

    <script src="assets/vendor/libs/popper/popper.js"></script>
    <script src="assets/vendor/js/bootstrap.js"></script>

    <script src="assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>

    <script src="assets/vendor/js/menu.js"></script>
    <script src="assets/js/main.js"></script>
    <?php
if (isset($_COOKIE['toast_message'])) {
    $msg  = $_COOKIE['toast_message'];
    $type = $_COOKIE['toast_type'] ?? 'info';

    // Clear cookies after reading
    setcookie("toast_message", "", time() - 3600, "/");
    setcookie("toast_type", "", time() - 3600, "/");

   ?>
    <script>
      // Toast notification function
      document.addEventListener('DOMContentLoaded', function () {
        const type = <?=json_encode($type);?>
        const msg = <?=json_encode($msg);?>
       

        showToast(msg,type, 10000)
        
      });
    </script>
    <?php
}
?>


    <!-- endbuild -->

    <!-- Vendors JS -->

    <!-- Main JS -->

   

    <!-- Page JS -->

    
<script>
document.addEventListener('DOMContentLoaded', function() {

  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');

  togglePassword.addEventListener('click', function(){
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

    togglePassword.classList.toggle('bx-hide', !isPassword);
    togglePassword.classList.toggle('bx-show', isPassword);
  })
    // Debug function to check responses
    window.debugResponse = function() {
        console.log('Last AJAX Response:', window.lastAjaxResponse);
        console.log('Last AJAX Error:', window.lastAjaxError);
    };
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Logging in...';
      btn.disabled =true;
      
      // Reset error states
      const inputGroups = document.querySelectorAll('.input--group');
      inputGroups.forEach(group => {
          group.classList.remove('error');
      });
      
      // Validate email/username
      let isValid = true;
      let errorMessage = '';
      const emailInput = document.getElementById('email');
      const emailValue = emailInput.value.trim();
      
      if (emailValue.includes('@')) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailValue.match(emailRegex)) {
              emailInput.parentElement.classList.add('error');
              isValid = false;
              errorMessage = 'Please enter a valid email address';
          }
      } else {
          if (emailValue.length < 3) {
              emailInput.parentElement.classList.add('error');
              isValid = false;
              errorMessage = 'Username must be at least 3 characters long';
          }
      }
      
      if (!isValid) {
          btn.disabled = false;
          btn.innerHTML = 'Login';
          const errorDiv = emailInput.parentElement.querySelector('.error-message');
          if (errorDiv) {
              errorDiv.textContent = errorMessage;
          }
          return;
      }
      
      const formData = new FormData(form);

      fetch('manage/signin.php', {
        method: "POST",
        body: formData
      })
      .then(async response => {
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid server response');
        }
        
        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}`);
        }
        return data;
      })
      .then(data => {
        if (data.success) {
          showToast(data.message || "Login Success", 'success', 2000);
          setTimeout(function() {
              window.location.href = data.redirect || 'dashboard.php';
          }, 1500);
        } else {
          showToast(data.message || 'Login failed', 'error', 2000);
          form.reset();
          btn.disabled = false;
          btn.innerHTML = 'Login';
        }
      })
      .catch(error => {
        showToast(error.message === 'Invalid server response' 
          ? 'Server connection error. Please try again later.' 
          : error.message, 'error', 3000);
        btn.disabled = false;
        btn.innerHTML = 'Login';
      });
    });
});
</script>
  </body>
</html>
<?php

ob_end_flush();
?>

