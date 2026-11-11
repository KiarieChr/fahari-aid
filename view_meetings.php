
<?php 
include('includes/checklogin.php');
$title = "Meeting Managment | View Meetings ";
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
          @include('modals/meeting-m.php');
          //@include('modals/academic-years.html');
          ?>

          <!-- / Navbar -->

          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
             
              
                <div class="card mb-3">
                    <div class="card-body">
                    <div class="demo-inline-spacing">
                                <button
                                  type="button"
                                  class="btn btn-outline-primary"
                                  data-bs-toggle="modal"
                                  data-bs-target="#newMeeting">
                                  New Meeting
                                </button>

                                <button
                                  type="button"
                                  class="btn btn-outline-primary"
                                  data-bs-toggle="modal"
                                  data-bs-target="#newSubMinisterial">
                                  Instant Meeting
                                </button>

                                <a
                                href=""
                                  class="btn btn-outline-primary"
                                  >
                                  New Cell Group
                                </a>
                              </div>
                    </div>
                </div>

                <!-- Users List Table -->
                <div class="card">
                    <div class="card-header border-bottom">
                    <h5 class="card-title mb-0">Search Filters</h5>
                    <div class="d-flex justify-content-between align-items-center row pt-4 gap-md-0 g-6">
                        <div class="col-md-4 user_role"></div>
                        <div class="col-md-4 user_plan"></div>
                        <div class="col-md-4 user_status"></div>
                    </div>
                    </div>
                    <div class="card-datatable table-responsive">
                    <table class="datatables-users table table-stripped border-top" id="usersTable">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Facilitator</th>
                            <th>Action</th>
                            <th>Meeting Start</th>
                            <th>Meeting End</th>
                        </tr>
                        </thead>
                        <tbody>
                        <?php
                        try {
                            $stmt = $db->query("SELECT m.first_name, m.last_name , u.id, mt.start_time,mt.id as meeting, mt.end_time, mt.name FROM meeting mt join users u on u.id = mt.facilitator join member m on u.member_id = m.id  ORDER BY mt.id DESC");
                            $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        } catch (PDOException $e) {
                            die("Database error: " . $e->getMessage());
                        }
                        $cnt = 1;
                        if (!empty($members)): ?>
                    <?php foreach ($members as $index => $row):
                          $name = $row['name'];
                          $faclitator = $row['first_name']." ".$row['last_name'];
                          $meeting_id = $row['meeting'];
                          $stime = $row['start_time'];
                          $etime = $row['end_time'];
                          //$status = $row['status'];date("M d, Y h:i a",strtotime($date));
                        ?>
                        <tr><td><?php echo $cnt;?></td>
                            <td><?php echo htmlspecialchars($name);?></td>
                            <td><?php echo htmlspecialchars($faclitator)?></td>
                            <td>
                                <div class="dropdown">
                                    <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="icon-base bx bx-cog me-1"></i>
                                      <i class="icon-base bx bx-dots-vertical-rounded"></i>
                                    </button>
                                    <div class="dropdown-menu">
                                      <?php if (userHasPermission($db,$user_id,'view_meeting')){?>
                                        <a href="attendance.php?id=<?php echo $meeting_id;?>" class="dropdown-item btn btn-outline-primary">View Attendance</a>
                                      <?php } 
                                        if(userHasPermission($db,$user_id,'view_meeting')){
                                      ?>

                                      <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#editMeeting-<?=$meeting_id;?>"
                                        ><i class="icon-base bx bx-edit me-1"></i> Edit</a>
                                      <?php 
                              
                                      }?>
                                      <?php if(userHasPermission($db,$user_id,'edit_meeting')){
                                        ?>
                                      <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#copyLink-<?=$meeting_id;?>"
                                        ><i class="icon-base bx bx-copy me-1"></i>Copy Meeting Link</a>
                                      <?php 
                              
                                      }?>

                                  <a class="dropdown-item" href="javascript:void(0);"
                                    ><i class="icon-base bx bx-transfer me-1"></i>My Attendance</a
                                  >
                                </div>
                              </div>
                             
                            </td>
                            <td><?php echo htmlspecialchars(date("M d, Y h:i a",strtotime($stime)));?></td>
                            <td><?php echo htmlspecialchars(date("M d, Y h:i a",strtotime($etime)));
                            //echo htmlspecialchars(date("M d, Y h:i a",strtotime($last_login)));?></td>
                            <?php $cnt+=1; 
                          @include('modals/meetings.php');
                          endforeach; endif;?>
                        </tr>
                        </tbody>
                    </table>
                    </div>
                    
                </div>

             
                <div class="toast-container position-fixed bottom-0 end-0 p-3">
                    <div class="bs-toast toast fade " id="liveToast" role="alert" aria-live="assertive" aria-atomic="true">
                      <div class="toast-header">
                        <i class="icon-base bx bx-bell me-2"></i>
                      <div class="me-auto fw-medium">Notification</div>
                        <small>Just Now</small>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                      </div>
                        <div class="toast-body" id="toastMessage">
                          
                        </div>
                    </div>
                </div>
            </div>
            <!-- / Content -->

            <!-- Footer -->
            <?php @include('includes/footer.php');?>
            <!-- / Footer -->
            <script src="https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/ckeditor.js"></script>

           
          </div>
          <!-- Content wrapper -->
        </div>
        <!-- / Layout page -->
      </div>

      <!-- Overlay -->
      <div class="layout-overlay layout-menu-toggle"></div>
    </div>
    <!-- / Layout wrapper -->

    

   <!-- Core JS -->
   <?php include("includes/scripts.html");?>
    
    <!-- Page JS -->

  </body>
</html>
