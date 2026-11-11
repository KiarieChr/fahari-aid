
<?php 
include('includes/checklogin.php');

$title = "Meeting Minutes | Meeting Management";
include("includes/get_user.php");


?>

<!doctype html>

<html
  lang="en"
  class="layout-navbar-fixed layout-menu-fixed layout-compact "
  data-assets-path="assets/"
  data-template="vertical-menu-template-free">
    <?php @include('includes/header.php');?>
    
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
          @include('modals/meeting-m.php');
          ?>

          <!-- / Navbar -->

          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
                <!-- Page Header -->
                <div class="card glass-card mb-4 border-0 p-4" style="background:rgba(255,255,255,.45);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.6)!important;border-radius:16px;">
                  <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div class="d-flex align-items-center gap-3">
                      <div style="width:48px;height:48px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;">
                        <i class="bx bx-book-open"></i>
                      </div>
                      <div>
                        <h4 class="mb-0 fw-bold" style="color:#1e1b4b;">Meeting Minutes</h4>
                        <p class="text-muted mb-0 small">Manage minutes and notes for all your upcoming and past meetings.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Meeting cards -->
                <div class="row g-4">
                    <div class="col-xl-4 col-lg-6 col-md-6">
                        <div class="card h-100 shadow-sm border-0" style="border-radius:20px;">
                            <div class="row h-100">
                                <div class="col-sm-4 d-flex align-items-center justify-content-center">
                                    <div class="avatar avatar-xl mt-4 ms-4 bg-label-primary rounded-circle">
                                        <i class="bx bx-plus fs-2"></i>
                                    </div>
                                </div>
                                <div class="col-sm-8">
                                    <div class="card-body text-sm-end text-center ps-sm-0 d-flex flex-column justify-content-center h-100">
                                        <button data-bs-target="#newMeeting" data-bs-toggle="modal" class="btn btn-primary mb-3 rounded-pill">Create New Meeting</button>
                                        <p class="mb-0 text-muted" style="font-size:0.85rem;">
                                        Add a new meeting to<br />track its minutes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    

                <?php
                    try {
                        $stmt = $db->query("SELECT *FROM meeting where meeting_type !=1 ORDER BY id DESC");
                        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    } catch (PDOException $e) {
                        die("Database error: " . $e->getMessage());
                    }
                    
                    if (!empty($roles)): ?>
                
                <?php foreach ($roles as $index => $row):
                      $id = $row['id'];
                      $name = $row['name'];
                      $start_time = date("M d, Y h:i a", strtotime($row['start_time']));
                      
                      // Count minutes entries
                      $min_stmt = $db->prepare("SELECT COUNT(*) FROM meeting_minutes WHERE meeting_id = ?");
                      $min_stmt->execute([$id]);
                      $minutes_count = $min_stmt->fetchColumn();
                    ?>
                <div class="col-xl-4 col-lg-6 col-md-6">
                    <div class="card shadow-sm border-0 h-100" style="border-radius:20px;">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="fw-normal mb-0 text-muted"><i class="bx bx-time-five me-1"></i><?= htmlspecialchars($start_time) ?></h6>
                            <span class="badge bg-label-<?= $minutes_count > 0 ? 'success' : 'warning' ?> rounded-pill">
                                <?= $minutes_count ?> Document(s)
                            </span>
                        </div>
                        <div class="d-flex flex-column justify-content-between flex-grow-1">
                            <div class="role-heading mb-4">
                                <h5 class="fw-bold mb-1 text-truncate" title="<?= htmlspecialchars($name);?>"><?= htmlspecialchars($name);?></h5>
                                <p class="text-muted" style="font-size:0.85rem;">Manage documents and attendance</p>
                            </div>
                            
                            <div class="d-flex gap-2">
                                <a href="minutes.php?meet_id=<?php echo $id; ?>" class="btn btn-light rounded-pill flex-grow-1 text-primary fw-bold">
                                    View Minutes
                                </a>
                                <div class="dropdown">
                                    <button type="button" class="btn btn-icon btn-outline-light rounded-circle text-body" data-bs-toggle="dropdown"><i class="bx bx-dots-vertical-rounded"></i></button>
                                    <div class="dropdown-menu dropdown-menu-end">
                                        <a class="dropdown-item" href="minutes-write.php?Mid=<?= $id;?>"><i class="bx bx-pencil me-2"></i>Add/Edit Minutes</a>
                                        <?php if (userHasPermission($db,$user_id,'view_meeting')){?>
                                            <a class="dropdown-item" href="attendance.php?id=<?php echo $id;?>"><i class="bx bx-user-check me-2"></i>View Attendance</a>
                                            <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#editMeeting-<?=$id;?>"><i class="bx bx-edit me-2"></i>Edit Meeting Details</a>
                                        <?php } ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                <?php endforeach; endif;?>
                
            </div>
        </div> <?php 
           @include("includes/footer.php");?>
        <div class="content-backdrop fade"></div>
    </div>
          <!-- Content wrapper -->
        </div>
        <!-- / Layout page -->
      </div><!-- Script JS -->
     <?php include('includes/scripts.html');?>
    <!-- Page js here --> 
      <!-- Vendors JS -->
      <!-- End of page -->




    </body>
</html>

