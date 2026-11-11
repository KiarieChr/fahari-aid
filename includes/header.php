<?php if(!isset($title)){

    $title = "Royal Point MIS | Edu-Nation Systems";
}
?>



<head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />

    <title><?php echo htmlspecialchars($title); ?></title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/jpeg" href="assets/img/logo/logo-dark.jpeg" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
      rel="stylesheet" />

    <link rel="stylesheet" href="assets/vendor/fonts/iconify-icons.css" />
    <!-- Bootstrap Icons CDN -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
   
    <!-- Core CSS -->
    <!-- build:css assets/vendor/css/theme.css  -->
    <link rel="stylesheet" href="assets/vendor/libs/pickr/pickr-themes.css" />

    <link rel="stylesheet" href="assets/vendor/css/core-2.css" />
    <link rel="stylesheet" href="assets/css/demo.css" />

    <!-- Vendors CSS -->

    <link rel="stylesheet" href="assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />

    <!-- endbuild -->

    <link rel="stylesheet" href="assets/vendor/libs/apex-charts/apex-charts.css" />

    <!-- Sweet- Alert -->
     <link rel="stylesheet" href="assets/vendor/libs/sweet-alert/sweetalert.css">
  
  <link rel="stylesheet" href="assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css" />
  <link rel="stylesheet" href="assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css" />
  <link rel="stylesheet" href="assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css" />
  <link rel="stylesheet" href="assets/vendor/libs/selectt2/select2.css" />
  <link rel="stylesheet" href="assets/vendor/libs/@form-validation/form-validation.css" />
    <!-- Page CSS -->
<!-- Tom Select CSS -->
<link href="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.css" rel="stylesheet">

<!-- Tom Select JS -->
<script src="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js"></script>


    <!-- Helpers -->
    <script src="assets/vendor/js/helpers.js"></script>
    <!--! Template customizer & Theme config files MUST be included after core stylesheets and helpers.js in the <head> section -->
    <script src="assets/vendor/js/template-customizer.js"></script>
    <!--? Config:  Mandatory theme config file contain global vars & default theme options, Set your preferred theme option in this file.  -->

    <script src="assets/js/config.js"></script>
    <style>
      .scrollable-container {
          max-height: 400px; 
          overflow-y: auto; 
          overflow-x: auto;  
          border: 1px solid #ddd;  
          padding: 10px;      
        }
      .notification-header{
        background:linear-gradient(to right, rgba(33, 5, 85, 0.94) 0%, rgba(12, 4, 117, 0.83)100%)
      }
      .avatar-initial{
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #00aeffc0;
        color: var(--bs-white);
        font-size: 20px;
        font-weight: 500;
        inset: 0;
        text-transform: uppercase;

      }
       .toast-container {
            position: fixed;
            z-index: 1800;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
      .toast {
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            display: flex;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease-out;
            max-width: 350px;
        }
         .toast i {
            margin-right: 12px;
            font-size: 20px;
        }
        
        .toast .toast-content {
            flex: 1;
        }
        
        .toast .toast-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
            margin-left: 12px;
        }
         @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }


    </style>
  </head>
  <?php include_once("manage/functions.php");
  @include('modals/give-m.php');
  ?>