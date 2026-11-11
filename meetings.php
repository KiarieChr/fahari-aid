
<?php 
include('includes/checklogin.php');

$title = "Meeting Management| Meeting Lists ";
include("includes/get_user.php");


?>
<!doctype html>

<html
  lang="en"
  class=" layout-navbar-fixed layout-menu-fixed layout-compact "
  dir="ltr"
  data-skin="default"
  data-assets-path="assets/"
  data-template="vertical-menu-template"
  data-bs-theme="light">
  <?php @include('includes/header.php');?>


  <body>
    
      <!-- ?PROD Only: Google Tag Manager (noscript) (Default ThemeSelection: GTM-5DDHKGP, PixInvent: GTM-5J3LMKC) -->
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5DDHKGi" height="0" width="0" style="display: none; visibility: hidden"></iframe></noscript>
      <!-- End Google Tag Manager (noscript) -->
    
    <!-- Layout wrapper -->
<div class="layout-wrapper layout-content-navbar  ">
  <div class="layout-container">
    
    


    <!-- Menu -->
    <?php
          @include('includes/sidebar.php');
          ?>
        <!-- / Menu -->



    <div class="menu-mobile-toggler d-xl-none rounded-1">
      <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large text-bg-secondary p-2 rounded-1">
        <i class="bx bx-menu icon-base"></i>
        <i class="bx bx-chevron-right icon-base"></i>
      </a>
    </div>
    <!-- / Menu -->

    

    <!-- Layout container -->
    <div class="layout-page">
        <?php
          @include('includes/nav.php');
          @include('modals/meeting-m.php');
          ?>

      

      <!-- Content wrapper -->
      <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
            
            <!-- Page Header -->
            <div class="card glass-card mb-4 border-0 p-4" style="background:rgba(255,255,255,.45);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.6)!important;border-radius:16px;">
              <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div class="d-flex align-items-center gap-3">
                  <div style="width:48px;height:48px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem;">
                    <i class="bx bx-calendar-event"></i>
                  </div>
                  <div>
                    <h4 class="mb-0 fw-bold" style="color:#1e1b4b;">Meetings Hub</h4>
                    <p class="text-muted mb-0 small">Manage all your cell groups, sub-ministerial, and general meetings here.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="card shadow-sm border-0 mb-4" style="border-radius:20px;">
                <div class="card-body">
                <div class="d-flex flex-wrap gap-3">
                            <button
                              type="button"
                              class="btn btn-primary rounded-pill px-4"
                              data-bs-toggle="modal"
                              data-bs-target="#newMeeting">
                              <i class="bx bx-plus me-1"></i> New Meeting
                            </button>

                            <button
                              type="button"
                              class="btn btn-outline-primary rounded-pill px-4"
                              data-bs-toggle="modal"
                              data-bs-target="#newMt">
                              <i class="bx bx-layer-plus me-1"></i> New Meeting Type
                            </button>

                            <a
                             href=""
                              class="btn btn-outline-primary rounded-pill px-4"
                              >
                              <i class="bx bx-group me-1"></i> New Cell Group
                            </a>
                          </div>
                </div>
            </div>
              <!-- Categories Cards -->
              <h6 class="text-muted fw-bold mb-3"><i class="bx bx-category me-2"></i>MEETING CATEGORIES</h6>
              <div class="row g-4 mb-4">
                  <?php
                  try {
                      $cat = $db->query("SELECT * FROM meeting_types ORDER BY id");
                      $categories = $cat->fetchAll(PDO::FETCH_ASSOC);
                      
                      $catColors = [
                          'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))',
                          'linear-gradient(135deg, rgba(240,147,251,0.1), rgba(245,87,108,0.1))',
                          'linear-gradient(135deg, rgba(67,233,123,0.1), rgba(56,249,215,0.1))',
                          'linear-gradient(135deg, rgba(79,172,254,0.1), rgba(0,242,254,0.1))'
                      ];
                      $iconColors = ['text-primary', 'text-danger', 'text-success', 'text-info'];
                      
                      if(!empty($categories)):
                          foreach($categories as $index => $rw):
                              $bg = $catColors[$index % count($catColors)];
                              $iconColor = $iconColors[$index % count($iconColors)];
                  ?>
                  <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                      <div class="card glass-card h-100 border-0" style="background: <?=$bg?>; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.6) !important; border-radius: 16px; transition: transform 0.3s ease;">
                          <div class="card-body d-flex align-items-center">
                              <div class="avatar avatar-md me-3">
                                  <span class="avatar-initial rounded-circle bg-white shadow-sm <?=$iconColor?>"><i class="bx bx-layer"></i></span>
                              </div>
                              <div>
                                  <h6 class="mb-0 fw-bold" style="color: #1e1b4b;"><?= htmlspecialchars($rw['name']);?></h6>
                              </div>
                          </div>
                      </div>
                  </div>
                  <?php 
                          endforeach;
                      endif;
                  } catch (PDOException $e) {
                      // Silently fallback if table issue
                  }
                  ?>
              </div>

              <!-- Users List Table -->
              <div class="row">
                 <div class="col-12">
                   <div class="card shadow-sm border-0" style="border-radius:20px;">
                       <div class="card-header border-bottom d-flex justify-content-between align-items-center py-3">
                           <h5 class="card-title mb-0 fw-bold"><i class="bx bx-list-ul me-2"></i>All Meetings</h5>
                       </div>
                       <div class="card-body mt-3">
                           <div class="row mb-4">
                               <div class="col-md-4 user_role"></div>
                               <div class="col-md-4 user_plan"></div>
                               <div class="col-md-4 user_status"></div>
                           </div>
                           <div class="card-datatable table-responsive">
                               <table class="datatables-users table table-hover border-top" id="usersTable">
                                   <thead>
                                   <tr>
                                   
                                   <th>Name</th>
                                   <th>Facilitator</th>
                                   <th>Meeting Schedule</th>
                                   <th>Action</th>
                               </tr>
                               </thead>
                               <tbody>
                               <?php
                               try {
                                   $stmt = $db->query("SELECT m.first_name, m.last_name , u.id, mt.start_time, mt.end_time, mt.name FROM meeting mt join users u on u.id = mt.facilitator join member m on u.member_id = m.id  ORDER BY mt.start_time DESC");
                                   $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
                               } catch (PDOException $e) {
                                   echo "Database error: " . $e->getMessage();
                                   $members = [];
                               }
                               
                               if (!empty($members)): ?>
                           <?php foreach ($members as $index => $row):
                                 $name = $row['name'];
                                 $meeting_id = $row['id'];
                                 $faclitator = $row['first_name']." ".$row['last_name'];
                                 $stime = $row['start_time'];
                                 $etime = $row['end_time'];
                                 //$status = $row['status'];date("M d, Y h:i a",strtotime($date));
                               ?>
                               <tr>
                                   <td><?php echo htmlspecialchars($name);?></td>
                                   <td><?php echo htmlspecialchars($faclitator)?></td>
                                   <td>
                                    <div class="d-flex flex-column">
                                        <span class="fw-medium text-primary"><i class="bx bx-calendar-event me-1"></i><?php echo htmlspecialchars(date("M d, Y", strtotime($stime))); ?></span>
                                        <span class="text-muted small"><i class="bx bx-time-five me-1"></i><?php echo htmlspecialchars(date("h:i a", strtotime($stime))) . " - " . htmlspecialchars(date("h:i a", strtotime($etime))); ?></span>
                                    </div>
                                   </td>
                                   <td>
                                     <div class="dropdown">
                                       <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="icon-base bx bx-cog me-1"></i>
                                       <i class="icon-base bx bx-dots-vertical-rounded"></i>
                                       </button>
                                       <div class="dropdown-menu dropdown-menu-end shadow-sm border-0" style="border-radius:12px;">
                                           <?php if (userHasPermission($db,$user_id,'view_meeting')){?>
                                           <a href="attendance.php?id=<?php echo $meeting_id;?>" class="dropdown-item"><i class="bx bx-user-check me-2"></i> View Attendance</a>
                                           <?php } 
                                            if(userHasPermission($db,$user_id,'view_meeting')){
                                           ?>
 
                                           <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#editMeeting-<?=$meeting_id;?>"
                                             ><i class="bx bx-edit me-2"></i> Edit Meeting</a>
                                           <?php 
                                   
                                           }?>
                                           <?php if(userHasPermission($db,$user_id,'edit_meeting')){
                                             ?>
                                           <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#copyLink-<?=$meeting_id;?>"
                                             ><i class="bx bx-link me-2"></i> Copy Meeting Link</a>
                                           <?php 
                               
                                            }?>
 
                                           <a class="dropdown-item" href="minutes.php?meet_id=<?php echo $meeting_id; ?>"
                                             ><i class="bx bx-book-open me-2"></i> Meeting Minutes</a
                                           >
                                       </div>
                                     </div>
                                 </td>
                                  
                               </tr>
                               <?php endforeach; endif;?>
                               </tbody>
                           </table>
                       </div>
                   </div>
                 </div>
               </div>


        </div>
        <!-- / Content -->

        
        

                    <!-- Footer -->
                      <?php include 'includes/footer.php';?>
                    <!-- / Footer -->

        
        <div class="content-backdrop fade"></div>
      </div>
      <!-- Content wrapper -->
    </div>
    <!-- / Layout page -->
  </div>

  
  

  
  
  <!-- Drag Target Area To SlideIn Menu On Small Screens -->
  <div class="drag-target"></div>
  
</div>
<!-- / Layout wrapper -->

    

    

    <!-- Script JS -->
    <?php include('includes/scripts.html');?>
    <!-- Page js here -->
    
    
    
    <!-- Page JS -->
    <script src="assets/js/app-user-list.js"></script>
    <script>
  $(document).ready(function() {
    $('#usersTable').DataTable({
      "paging": true,  // Enables pagination
      "searching": true,  // Enables search bar
      "ordering": true,  // Enables sorting
      "info": true,  // Shows info text
      "lengthChange": true // Enables page length change
    });
    $('#catTable').DataTable({
      "paging": true,  // Enables pagination
      "searching": true,  // Enables search bar
      "ordering": true,  // Enables sorting
      "info": true,  // Shows info text
      "lengthChange": true // Enables page length change
    });
  });
</script>
  </body>
</html>

  <!-- beautify ignore:end -->

