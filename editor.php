<?php 
include('includes/checklogin.php');

$title = "Editor| Article Writer";
include("includes/get_user.php");

// Fetch existing material if editing
$editing_material = null;
$material_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($material_id > 0) {
    $mat_stmt = $db->prepare("SELECT * FROM materials WHERE id = :id");
    $mat_stmt->execute([':id' => $material_id]);
    $editing_material = $mat_stmt->fetch(PDO::FETCH_ASSOC);
}
?>

<!doctype html>

<html
  lang="en"
  class="layout-navbar-fixed layout-menu-fixed layout-compact "
  data-assets-path="assets/"
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

          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
              <div class="card mb-3">
                <div class="card-body">
                  <div class="card-title d-flex align-items-start justify-content-between">
                    <h5>Write you content here ...</h5>
                  </div>
                </div>

              </div>

                          <!-- Load CKEditor 5 from CDN -->
              <script src="https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/ckeditor.js"></script>

              <div class="card">
                <div class="container-fluid">
                
              <form action="manage/save_content.php" class="mt-4" method="POST">
                <?php if ($editing_material): ?>
                  <input type="hidden" name="material_id" value="<?php echo $editing_material['id']; ?>">
                <?php endif; ?>
                <label class="form-label h3 text-uppercase"> Material Title </label>
                <input type="text" class="form-control mb-3" name="material_title" placeholder="FRUITFULL WASTELAND" value="<?php echo $editing_material ? htmlspecialchars($editing_material['title']) : ''; ?>" required> 
                <label for="material_type" class="form-label">Type</label>
                <select name="material_type" id="material_type" class="form-select mb-3" required>
                  <option value="">Select Material Type</option>
                    <?php 
                    $mtypesq = $db->query("SELECT * FROM material_type ORDER BY id ASC");
                    $mtypes = $mtypesq->fetchAll(PDO::FETCH_ASSOC);
                    
                    if(!empty($mtypes)){
                      foreach($mtypes as $index=>$row){
                        $selected = ($editing_material && $editing_material['type'] == $row['id']) ? 'selected' : '';
                        echo "<option value='{$row['id']}' {$selected}>{$row['name']}</option>";
                      }
                    }
                    ?>
                </select>

                <textarea name="content" id="editor" class="form-control mb-2"><?php echo $editing_material ? htmlspecialchars($editing_material['content']) : ''; ?></textarea>
                <button type="submit" class="btn btn-outline-primary mt-3">Save</button>
              </form>
                
              </div>
            </div>

              

            </div>
            <!-- / Content -->

           <?php 
           @include("includes/footer.php");?>
          <script>
                  ClassicEditor
                      .create(document.querySelector('#editor'))
                      .catch(error => {
                          console.error(error);
                      });
              </script>

            <div class="content-backdrop fade"></div>
          </div>
          <!-- Content wrapper -->
        </div>
        <!-- / Layout page -->
      </div>

      <!-- Overlay -->
      <div class="layout-overlay layout-menu-toggle"></div>
    </div>
    <!-- / Layout wrapper -->

 

    <!-- Script JS -->
     <?php include('includes/scripts.html');?>
    <!-- Page js here -->
   
    
    <!-- Page JS -->

    <!-- Place this tag before closing body tag for github widget button. -->
    <script async defer src="https://buttons.github.io/buttons.js"></script>
  </body>
</html>
