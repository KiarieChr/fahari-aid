<?php 

include('includes/checklogin.php');

$title = "Prayers | Declarations and Instructions";
include("includes/get_user.php");?>

<!doctype html>

<html
  lang="en"
  class=" layout-navbar-fixed layout-menu-fixed layout-compact "
  dir="ltr"
  data-skin="default"
  data-assets-path="../assets/"
  data-template="vertical-menu-template"
  data-bs-theme="light">

    <?php @include('includes/header.php');?>
           <!-- Load CKEditor 5 from CDN -->
           <script src="https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/ckeditor.js"></script>

  <body>
    <div class="layout-wrapper layout-content-navbar  ">
        <div class="layout-container">
    
            <?php @include('includes/sidebar.php');?>

            <div class="menu-mobile-toggler d-xl-none rounded-1">
              <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large text-bg-secondary p-2 rounded-1">
                  <i class="bx bx-menu icon-base"></i>
                  <i class="bx bx-chevron-right icon-base"></i>
              </a>
            </div>
            <!-- / Menu -->

            <!-- Layout container -->
            <div class="layout-page">
    
                <!-- Navbar -->
                <?php @include('includes/nav.php');
                    @include('modals/dashboard.php')
                ?>

                <!-- Content wrapper -->
                <div class="content-wrapper">
                    <!-- Content -->
                    <div class="container-xxl flex-grow-1 container-p-y">
                    
                        <!-- Hour chart  -->
                        <div class="card bg-transparent shadow-none my-6 border-0">
                            <div class="card-body row p-0 pb-6 g-6">
                                <div class="col-12 col-lg-8 card-separator">
                                    <h5 class="mb-2">
                                        Hello there! Welcome Back,   
                                        <span class="h4"> <?php echo $fname;?> 👋🏻</span>
                                    </h5>
                                    <div class="col-sm-12 col-md-12 col-lg-12">
                                        <p>The word .!</p>
                                    </div>
                                </div>
                          
                                <div class="col-12 col-lg-4 ps-md-4 ps-lg-6">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div>
                                                <h5 class="mb-1">Fulfilled Prophecies</h5>
                                                <p class="mb-9">Check your name</p>
                                            </div>
                                            <div class="time-spending-chart">
                                                <h4 class="mb-2">Total 3<span class="text-body">h</span> 30<span class="text-body">m</span></h4>
                                                <span class="badge bg-label-success">2% of total materials</span>
                                            </div>
                                        </div>
                                        <div id="leadsReportChart"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Hour chart End  -->
                        <div class="card bg-transparent shadow-none mb-2">
                            <div class="card-body row">
                                <div class="col-md-6">
                                    <button
                                        type="button"
                                        class="btn btn-outline-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#newPType">
                                        New Prophecy Type
                                    </button>
                                <a
                                    href="js"
                                    class="btn btn-outline-primary" data-bs-toggle="modal"
                                    data-bs-target="#newProphecy"
                                     >
                                        New Prophecy/Instruction
                                </a>
                                 <a
                                    href="generate_communications.php"
                                    class="btn btn-primary" target="_blank"                                   
                                     >
                                        Download All Communications
                                </a>
                            </div>
                            <div class="col-md-6">
                                <a
                                    href="editor.php"
                                    class="btn btn-outline-success"
                                    >
                                    Add  A Prayer Schedule                             
                                </a>
                                <a
                                    href="editor.php"
                                    class="btn btn-outline-success"
                                    >
                                    View Prayer Schedules
                                </a>
                            </div>
                        </div>
                    
                      
                      <!-- prophecy datatable -->
                       <?php
                        $prophecies_get = $db->query("SELECT *FROM prophecies order by dates desc");
                        $prophecies_get->execute();
                        $prophecies = $prophecies_get->fetchAll(PDO::FETCH_ASSOC);
                       ?>
                      <div class="card mb-6">
                        <div class="mb-4 table-responsive">
                            <table class="table table-hover table-sm datatables-academy-prophecy" id="prophecyTable">
                                <thead>
                                <tr>
                                    <th>Action</th>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Purpose</th>
                                    <th class="">Date</th>
                                    <th class="">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                    <?php 
                                    if(!empty($prophecies)):
                                        foreach($prophecies as $index=>$row):
                                        $id = $row['id'];
                                        ?>
                                        
                                    <tr>
                                        <td>
                                            <div class="dropdown">
                                                <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="icon-base bx bx-cog me-1"></i>
                                                    <i class="icon-base bx bx-dots-vertical-rounded"></i>
                                                </button>
                                                <div class="dropdown-menu">
                                                    
                                                    <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#viewInstruction<?=$id;?>"
                                                    ><i class="icon-base bx bx-transfer me-1" ></i> View Instruction</a>
                                                    
                                                    <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#markFulfilled<?=$id;?>
                                                        ><i class="icon-base bx bx-check me-1"></i> Mark As Complete</a
                                                            >
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td><?= $index +1;?></td>
                                        <td><?= $row['title'];?></td>
                                        <td><?= $row['purpose'];?></td>
                                        <td><?= $row['dates'];?></td>
                                        <td><?= $row['status'];?></td>
                                    </tr>
                                    <?php
                                    @include('modals/edit-user.php'); 
                                    endforeach; 
                                    endif;?>

                                </tbody>
                            </table>
                        </div>
                      </div>
                      <!-- prophecy datatable End -->

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
        </div>
    </div>
    <!-- / Layout wrapper -->

    <div class="buy-now">
      <a href="" target="" class="btn btn-success btn-buy-now">Giving</a>
    </div>
    <!-- Core JS -->
    <!-- build:js assets/vendor/js/theme.js  -->
    <?php include('includes/scripts.html');?>
    <!-- Page JS -->
    <script src="../../assets/js/app-academy-dashboard.js"></script>
    <script>
        new TomSelect("#purposeSelect", {
            plugins: ['remove_button'],
            maxItems: 1,
            placeholder: 'Choose the Cell...'
        });
        ClassicEditor.create(document.querySelector("#editor"));
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

