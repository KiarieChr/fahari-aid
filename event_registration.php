<?php

    $event_id = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;
    include('includes/checklogin.php');

    $title = "Events | Event Registration";
    include("includes/get_user.php");
    
    // Fetch the event name
    $event = $db->query("SELECT *FROM event where id = $event_id")->fetch(PDO::FETCH_ASSOC);
    $event_name = $event['ename'];
    // Fetch form fields for display
    $fields = $db->query("SELECT * FROM event_registration_fields WHERE event_id = $event_id ORDER BY field_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    $field_map = [];
    foreach ($fields as $f) {
        $field_map[$f['id']] = $f['field_label'];
    }

    // Fetch registrations with their values
    $registrations_sql = "
        SELECT *
        FROM event_registration 
        WHERE event_id = $event_id
        ORDER BY id
    ";
    $result = $db->query($registrations_sql);
    $RES = $result->fetchAll(PDO::FETCH_ASSOC);


    $registrants = [];
   
?>
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


  <body>
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

                        <h4>Registrations for <?= $event_name ?></h4>

                        <?php if (empty($RES)): ?>
                            <p>No one has registered yet.</p>
                        <?php else: ?>
                            <div class="card">
                                <h5 class="card-header text-center"><?= $event_name; ?> Registrations</h5>
                                <div class="card-body table-responsive">
                                <table  class='table' id='registrationsTable' >
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Full Name</th>
                                        <th>Residence</th>
                                        <th>Contact Info</th>
                                        <th>Guardian Tel</th>
                                        <th>Sponsorship Info</th>
                                        <th>Category</th>
                                        <th>Travelling From</th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php 
                                     if(!empty($RES)){
                                        $i = 1;
                                    foreach($RES as $index =>$row){
                                        
                                        $reg_id = $row['id'];
                                        $name = $row['names'];
                                        $firstLetter = mb_substr($name, 0, 1, "UTF-8");
                                        $phone_no = $row['phone_no'];
                                        $email_address = $row['email'];
                                        $sponsorship = $row['sponsorship'];
                                        $residence = $row['residence'];
                                        $category = $row['category'];
                                        $travelling_from = $row['travelling_from'];
                                        $guardian_telno = $row['guardian_telno'];
                                            ?>
                                        <tr>
                                            <td><?= $i; ?></td>
                                            <td>
                                               
                                                <?= $name; ?></td>
                                            <td><?= $residence; ?></td>
                                            <td><?= $phone_no;  ?><br>
                                            @ <span class="text-primary">
                                                <?= $email_address; ?> 
                                            </span>    
                                            </td>
                                            <td><?= $guardian_telno;?></td>
                                            <td>
                                            <?php 
                                            if($sponsorship == 'sponsored-fully'){
                                                echo '<span class="badge badge-warning bg-warning"> To be Sponsored Fully</span>';
                                            }
                                            elseif ($sponsorship == 'half-sponsored'){
                                                echo '<span class="badge badge-warning bg-warning"> To be Sponsored Half-way</span>';
                                            }
                                            elseif($sponsorship == 'no-sponsor'){
                                                echo '<span class="badge badge-success bg-success"> No Funding Needed</span>';
                                            } 
                                            else{
                                                echo '<span class="badge badge-success bg-success"> No Funding Needed</span>';
                                            }?>  
                                            </td>
                                            <td><?=$category;?></td>
                                             <td><?= $travelling_from; ?></td>
                                        </tr>
                                    <?php  $i++; } } ?>
                                </tbody>
                            </table>
                                </div>
                            </div>
                            
                        <?php endif; ?>
                    </div>
                </div>
                  <!-- Footer -->
                  <?php include 'includes/footer.php';?>
                    <!-- / Footer -->

            </div>
        </div>
    </div>
     <!-- Script JS -->
     <?php include('includes/scripts.html');?>
    <!-- Page js here -->
    
    
    
    <!-- Page JS -->
    <script src="../assets/js/app-user-list.js"></script>
    <script>
  $(document).ready(function() {
    $('#registrationsTable').DataTable({
    "paging": true,  // Enables pagination
    "searching": true,  // Enables search bar
    "ordering": true,  // Enables sorting
    "info": true,  // Shows info text
    "lengthChange": true, // Enables page length change
    "dom": 'Bfrtip',  // This specifies the position of the buttons
    "buttons": [
        {
            extend: 'copy',
            className: 'btn btn-primary me-2 mb-2'
        },
        {
            extend: 'csv',
            className: 'btn btn-success me-2 mb-2'
        },
        {
            extend: 'excel',
            className: 'btn btn-success me-2 mb-2'
        },
        {
            extend: 'pdf',
            className: 'btn btn-danger me-2 mb-2'
        },
        {
            extend: 'print',
            className: 'btn btn-info me-2 mb-2',
            text: '<i class="bx bx-printer me-1"></i> Print'
        }
    ]
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

