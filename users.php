
<?php 
include('includes/checklogin.php');

$title = "Users Management| Users List ";
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
          @include('modals/user-forms.php');
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
                    <i class="bx bx-group"></i>
                  </div>
                  <div>
                    <h4 class="mb-0 fw-bold" style="color:#1e1b4b;">Users Management</h4>
                    <p class="text-muted mb-0 small">Manage system users, access levels, and active accounts.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Users List Table -->
            <div class="card shadow-sm border-0" style="border-radius:20px;">
                <div class="card-header border-bottom d-flex justify-content-between align-items-center py-3">
                    <h5 class="card-title mb-0 fw-bold"><i class="bx bx-user-circle me-2"></i>All Users</h5>
                </div>
                <div class="card-body mt-3">
                    <div class="row mb-4">
                        <div class="col-md-4 user_role"></div>
                        <div class="col-md-4 user_plan"></div>
                        <div class="col-md-4 user_status"></div>
                    </div>
                    <div class="table-responsive">
                    <table class="datatables-users table table-hover border-top" id="usersTable">
                        <thead>
                    <tr>
                        <th>User</th>
                        <th>Contact</th>
                        <th>Email</th>
                        <th>Last Seen</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php
                    try {
                        $stmt = $db->query("SELECT u.id, m.first_name, m.last_name, u.last_login, m.phone_no, u.email FROM users u join member m on m.id = u.member_id ORDER BY u.id DESC");
                        $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    } catch (PDOException $e) {
                        die("Database error: " . $e->getMessage());
                    }
                    
                    if (!empty($classes)): ?>
                <?php foreach ($classes as $index => $row):
                        $id = $row['id'];
                      $name = $row['first_name']." ".$row['last_name'];
                      $username = $row['phone_no'];
                      $email = $row['email'];
                      $last_login = $row['last_login'];
                      //$status = $row['status'];date("M d, Y h:i a",strtotime($date));
                    ?>
                    <tr>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="avatar avatar-sm me-3">
                                    <span class="avatar-initial rounded-circle bg-label-primary"><?php echo strtoupper(substr($name, 0, 2)); ?></span>
                                </div>
                                <div>
                                    <h6 class="mb-0 fw-semibold text-body"><?php echo htmlspecialchars($name);?></h6>
                                </div>
                            </div>
                        </td>
                        <td><span class="text-muted"><i class="bx bx-phone me-1 text-primary"></i><?php echo htmlspecialchars($username);?></span></td>
                        <td><?php echo htmlspecialchars($email);?></td>
                        <td><span class="badge bg-label-info rounded-pill"><i class="bx bx-time-five me-1"></i><?php echo htmlspecialchars(date("M d, Y h:i a",strtotime($last_login)));?></span></td>
                        <td><div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="icon-base bx bx-cog me-1"></i>
                              <i class="icon-base bx bx-dots-vertical-rounded"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end shadow-sm border-0" style="border-radius:12px;">
                              <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target=""
                                ><i class="bx bx-edit-alt me-2 text-primary"></i> Edit User</a
                              >
                              <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#assign-role-<?php echo $id?>"
                                ><i class="bx bx-shield-quarter me-2 text-warning"></i> Assign Roles</a
                              >
                              <div class="dropdown-divider"></div>
                              <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#loginAsUserModal-<?php echo $id; ?>"
                                ><i class="bx bx-log-in-circle me-2 text-success"></i> Login As User</a
                              >
                              <a class="dropdown-item text-danger" href="javascript:void(0);"
                                ><i class="bx bx-trash me-2"></i> Delete</a
                              >
                            </div>
                          </div></td>
                        <?php 
                      @include('modals/edit-user.php');
                    endforeach; endif;?>
                    </tr>
                    </tbody>
                </table>
                </div>
                </div>
            </div>
                <!-- Offcanvas to add new user -->
                <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasAddUser" aria-labelledby="offcanvasAddUserLabel">
                <div class="offcanvas-header border-bottom">
                    <h5 id="offcanvasAddUserLabel" class="offcanvas-title">Add User</h5>
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body mx-0 flex-grow-0 p-6 h-100">
                    <form class="add-new-user pt-0" id="addNewUserForm" onsubmit="return false">
                    <div class="mb-6 form-control-validation">
                        <label class="form-label" for="add-user-fullname">Full Name</label>
                        <input type="text" class="form-control" id="add-user-fullname" placeholder="John Doe" name="userFullname" aria-label="John Doe" />
                    </div>
                    <div class="mb-6 form-control-validation">
                        <label class="form-label" for="add-user-email">Email</label>
                        <input type="text" id="add-user-email" class="form-control" placeholder="john.doe@example.com" aria-label="john.doe@example.com" name="userEmail" />
                    </div>
                    <div class="mb-6">
                        <label class="form-label" for="add-user-contact">Contact</label>
                        <input type="text" id="add-user-contact" class="form-control phone-mask" placeholder="+1 (609) 988-44-11" aria-label="john.doe@example.com" name="userContact" />
                    </div>
                    <div class="mb-6">
                        <label class="form-label" for="add-user-company">Company</label>
                        <input type="text" id="add-user-company" class="form-control" placeholder="Web Developer" aria-label="jdoe1" name="companyName" />
                    </div>
                    <div class="mb-6">
                        <label class="form-label" for="country">Country</label>
                        <select id="country" class="select2 form-select">
                        <option value="">Select</option>
                        <option value="Australia">Australia</option>
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="Belarus">Belarus</option>
                        <option value="Brazil">Brazil</option>
                        <option value="Canada">Canada</option>
                        <option value="China">China</option>
                        <option value="France">France</option>
                        <option value="Germany">Germany</option>
                        <option value="India">India</option>
                        <option value="Indonesia">Indonesia</option>
                        <option value="Israel">Israel</option>
                        <option value="Italy">Italy</option>
                        <option value="Japan">Japan</option>
                        <option value="Korea">Korea, Republic of</option>
                        <option value="Mexico">Mexico</option>
                        <option value="Philippines">Philippines</option>
                        <option value="Russia">Russian Federation</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Turkey">Turkey</option>
                        <option value="Ukraine">Ukraine</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                        </select>
                    </div>
                    <div class="mb-6">
                        <label class="form-label" for="user-role">User Role</label>
                        <select id="user-role" class="form-select">
                        <option value="subscriber">Subscriber</option>
                        <option value="editor">Editor</option>
                        <option value="maintainer">Maintainer</option>
                        <option value="author">Author</option>
                        <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="mb-6">
                        <label class="form-label" for="user-plan">Select Plan</label>
                        <select id="user-plan" class="form-select">
                        <option value="basic">Basic</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="company">Company</option>
                        <option value="team">Team</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary me-3 data-submit">Submit</button>
                    <button type="reset" class="btn btn-label-danger" data-bs-dismiss="offcanvas">Cancel</button>
                    </form>
                </div>
                </div>
            </div>

        </div>
        <!-- / Content -->

        
        

<!-- Footer -->
<?php @include('includes/footer.php');?>
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
    
    
    
   <script>
  $(document).ready(function() {
    $('#usersTable').DataTable({
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

