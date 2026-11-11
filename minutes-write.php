
<?php 
include('includes/checklogin.php');

$title = "Editor| Article Writer";
include("includes/get_user.php");


?>

<!doctype html>

<html
  lang="en"
  class="layout-navbar-fixed layout-menu-fixed layout-compact "
  data-assets-path="../assets/"
  data-template="vertical-menu-template-free">
    <?php @include('includes/header.php');?>
    <link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/45.0.0/ckeditor5.css" />

  <body>
   <!-- Layout wrapper -->
   <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <!-- Menu -->
         <?php
          @include('includes/sidebar.php');
          ?>
        <!-- / Menu -->

        <!-- Layout container -->
        <div class="layout-page">
          <!-- Navbar -->
          <?php
          @include('includes/nav.php');
         
          ?>

          <!-- / Navbar -->
        <?php if(isset($_GET['Mid'])){?>
          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
              <div class="card mb-3">
                <div class="card-body">
                  <div class="card-title d-flex align-items-start justify-content-between">
                    <h5>Write your minutes or edit them here...</h5>
                  </div>
                </div>

              </div>

                          <!-- Load CKEditor 5 from CDN -->
              <script src="https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/ckeditor.js"></script>

              <div class="card">
                <div class="container-fluid">
                <?php $meeting_id = $_GET['Mid'];?>
              <form action="manage/save_minutes.php" class="mt-4" method="POST">
                <label class="form-label h3 text-uppercase"> Meeting Name </label>
                <input type="hidden" class="form-control mb-3" name="meeting_id" value= "<?= $meeting_id;?>"> 
                
                <input type="hidden" name="personnel" value="<?= $user_id;?>">
                <textarea name="minutes" id="minutes" class="form-control mb-2"></textarea>
                <button type="submit" class="btn btn-outline-primary mt-3">Save</button>
              </form>
                
              </div>
            </div>

              

            </div>
            <!-- / Content -->

           <?php 
           @include("includes/footer.php");?>
          

            <div class="content-backdrop fade"></div>
          </div>
          <!-- Content wrapper -->
           <?php } ?>
        </div>
        <!-- / Layout page -->
      </div>

      <!-- Overlay -->
      <div class="layout-overlay layout-menu-toggle"></div>
    </div>
    <!-- / Layout wrapper -->

 
    <script>
                  ClassicEditor
                      .create(document.querySelector('#minutes'))
                      .catch(error => {
                          console.error(error);
                      });
              </script>
    <!-- Script JS -->
     <?php include('includes/scripts.html');?>
    <!-- Page js here -->
   
    
    <!-- Page JS -->

    <!-- Place this tag before closing body tag for github widget button. -->
    <script async defer src="https://buttons.github.io/buttons.js"></script>
  </body>
</html>
