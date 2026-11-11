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

    <title>Reset Password | Jesus Enthroned Network</title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="assets/img/favicon/favicon.ico" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
      rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <link rel="stylesheet" href="assets/vendor/fonts/iconify-icons.css" />

    <!-- Core CSS -->
    <link rel="stylesheet" href="assets/css/core-2.css" />
    <link rel="stylesheet" href="assets/css/demo.css" />

    <!-- Vendors CSS -->
    <link rel="stylesheet" href="assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />

    <!-- Page CSS -->
    <link rel="stylesheet" href="assets/vendor/css/auth2.css" />

    <!-- Helpers -->
    <script src="assets/vendor/js/helpers.js"></script>

    <script src="assets/js/config.js"></script>
    
    <style>
      /* Ensure the alert messages look modern within the new dark/glassmorphic form */
      .alert { border: none; backdrop-filter: blur(5px); }
      .alert-danger { background-color: rgba(220, 53, 69, 0.15); color: #ea868f; border: 1px solid rgba(220, 53, 69, 0.3); }
      .alert-success { background-color: rgba(25, 135, 84, 0.15); color: #75b798; border: 1px solid rgba(25, 135, 84, 0.3); }
    </style>
  </head>

  <body>
    <!-- Content -->
    <?php if(isset($_GET['token'])){ ?>
    <div class="__container">
      <div class="header">
        <h1 class="text-white">Jesus Enthroned Network</h1>
        <p>Password Reset? 🔒<br>Enter new password and confirm</p>
      </div>
      <div class="form-container">
        <?php if(isset($_COOKIE['error'])):?>
             <div class="alert alert-danger p-3 mb-4" style="border-radius:12px; font-size: 14px;"><i class="bx bx-error-circle me-1"></i><?= $_COOKIE['error']; ?></div>
        <?php endif; ?>
        <?php if(isset($_COOKIE['sent'])):?>
             <div class="alert alert-success p-3 mb-4" style="border-radius:12px; font-size: 14px;"><i class="bx bx-check-circle me-1"></i><?= $_COOKIE['sent'];?></div>
        <?php endif;?>
        <?php $token = htmlspecialchars($_GET['token']); ?>
        <form id="form" method="post" action="manage/update-password.php">
          <input type="hidden" name="token" value="<?=$token;?>">
          
          <div class="input--group" id="passwordGroup">
            <label for="password">
              <i class="bx bx-bxs-lock"></i> New Password
            </label>
            <div class="input-group input-group-merge">
              <input type="password" id="password" class="form-control form-contol-append" name="password" placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;">
              <i class="icon-base bx bx-hide position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer" style="padding:15px!important; z-index: 10;" id="togglePassword1" onclick="toggleVis('password', 'togglePassword1')"></i>
            </div>
          </div>
          
          <div class="input--group" id="cpasswordGroup">
            <label for="cpassword">
              <i class="bx bx-check-shield"></i> Confirm Password
            </label>
            <div class="input-group input-group-merge">
              <input type="password" id="cpassword" class="form-control form-contol-append" name="cpassword" placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;" onkeyup="checkPassword()">
              <i class="icon-base bx bx-hide position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer" style="padding:15px!important; z-index: 10;" id="togglePassword2" onclick="toggleVis('cpassword', 'togglePassword2')"></i>
            </div>
            <div id="msgPassword" class="mt-2 small px-1"></div>
          </div>
          
          <div class="mb-4 mt-5">
            <button type="submit" class="btn btn-primary d-grid w-100 py-3" style="border-radius: 12px; font-weight: 600;">Reset Password</button>
          </div>
        </form>
        <p class="text-center mt-4">
          <a href="login.php" class="text-decoration-none text-primary d-inline-flex align-items-center">
            <i class="icon-base bx bx-chevron-left me-1"></i> Back to login
          </a>
        </p>
      </div>
    </div>
<?php } else { ?>
    <div class="__container">
      <div class="header">
        <h1 class="text-white">Jesus Enthroned Network</h1>
        <p>Forgot Password? 🔒<br>Enter your email and we'll send you instructions.</p>
      </div>
      <div class="form-container">
        <?php if(isset($_COOKIE['error'])):?>
             <div class="alert alert-danger p-3 mb-4" style="border-radius:12px; font-size: 14px;"><i class="bx bx-error-circle me-1"></i><?= $_COOKIE['error']; ?></div>
        <?php endif; ?>
        <?php if(isset($_COOKIE['sent'])):?>
             <div class="alert alert-success p-3 mb-4" style="border-radius:12px; font-size: 14px;"><i class="bx bx-check-circle me-1"></i><?= $_COOKIE['sent'];?></div>
        <?php endif;?>
        <form id="form" method="post" action="manage/reset.php">
          <div class="input--group" id="emailGroup">
            <label for="email">
              <i class="bx bx-envelope"></i> Email Address
            </label>
            <input type="email" name="email" id="email" placeholder="Enter your registered email" class="form-control" required autofocus>
          </div>
          
          <div class="mb-4 mt-5">
            <button type="submit" class="btn btn-primary d-grid w-100 py-3" style="border-radius: 12px; font-weight: 600;">Send Reset Instructions</button>
          </div>
        </form>
        <p class="text-center mt-4">
          <a href="login.php" class="text-decoration-none text-primary d-inline-flex align-items-center">
            <i class="icon-base bx bx-chevron-left me-1"></i> Back to login
          </a>
        </p>
      </div>
    </div>
<?php } ?>

    <!-- / Content -->

    <!-- Core JS -->
    <script src="assets/vendor/libs/jquery/jquery.js"></script>
    <script src="assets/vendor/libs/popper/popper.js"></script>
    <script src="assets/vendor/js/bootstrap.js"></script>
    <script src="assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>
    <script src="assets/vendor/js/menu.js"></script>

    <!-- Main JS -->
    <script>
      function checkPassword() {
        let passworddiv = document.getElementById('msgPassword');
        let password = document.getElementById('password').value;
        let cpassword = document.getElementById('cpassword').value;

        if(!password || !cpassword) {
            passworddiv.innerHTML = "";
            return;
        }

        if(password !== cpassword) {
          passworddiv.innerHTML = "<span class='text-danger fw-semibold d-flex align-items-center'><i class='bx bx-error-circle me-1'></i> Passwords do not match!</span>";
        } else {
          passworddiv.innerHTML = "<span class='text-success fw-semibold d-flex align-items-center'><i class='bx bx-check-circle me-1'></i> Passwords match.</span>";
        }
      }

      function toggleVis(inputId, iconId) {
        let input = document.getElementById(inputId);
        let icon = document.getElementById(iconId);
        if (input.type === "password") {
          input.type = "text";
          icon.classList.remove("bx-hide");
          icon.classList.add("bx-show");
          icon.classList.add("text-primary");
        } else {
          input.type = "password";
          icon.classList.remove("bx-show");
          icon.classList.remove("text-primary");
          icon.classList.add("bx-hide");
        }
      }
    </script>
    <script src="assets/js/main.js"></script>
  </body>
</html>
