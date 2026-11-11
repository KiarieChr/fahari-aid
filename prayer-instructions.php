
<?php 
include('includes/checklogin.php');

$title = "Prayer Management | Instructions";
include("includes/get_user.php");


?>

<!doctype html>

<html
  lang="en"
  class="layout-navbar-fixed layout-menu-fixed layout-compact "
  data-assets-path="../assets/"
  data-template="vertical-menu-template-free">
    <?php @include('includes/header.php');?>
    <link rel="stylesheet" href="../assets/vendor/libs/jstree/jstree.css" />

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
          @include('modals/roles-forms.php');
          ?>

          <!-- / Navbar -->

          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
                <h4 class="mb-1">Roles List</h4>

                <p class="mb-6">Access Roles</p>
                <!-- Role cards -->
                <div class="row g-6">
                    

                <?php
                    try {
                        $stmt = $db->query("SELECT *FROM prayer_schedule ORDER BY id DESC");
                        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    } catch (PDOException $e) {
                        die("Database error: " . $e->getMessage());
                    }
                    
                    if (!empty($roles)): ?>
                <?php foreach ($roles as $index => $row):
                      $id = $row['id'];
                      $name = $row['title'];
                      
                    ?>
                <div class="col-xl-4 col-lg-6 col-md-6">
                    <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                        <h6 class="fw-normal mb-0 text-body">Total 7 users</h6>
                        <!-- <ul class="list-unstyled d-flex align-items-center avatar-group mb-0">
                            <li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top" title="Jimmy Ressula" class="avatar pull-up">
                            <img class="rounded-circle" src="../../assets/img/avatars/4.png" alt="Avatar" />
                            </li>
                            <li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top" title="John Doe" class="avatar pull-up">
                            <img class="rounded-circle" src="../../assets/img/avatars/1.png" alt="Avatar" />
                            </li>
                            <li data-bs-toggle="tooltip" data-popup="tooltip-custom" data-bs-placement="top" title="Kristi Lawker" class="avatar pull-up">
                            <img class="rounded-circle" src="../../assets/img/avatars/2.png" alt="Avatar" />
                            </li>
                            <li class="avatar">
                            <span class="avatar-initial rounded-circle pull-up" data-bs-toggle="tooltip" data-bs-placement="bottom" title="4 more">+4</span>
                            </li>
                        </ul> -->
                        </div>
                        <div class="d-flex justify-content-between align-items-end">
                        <div class="role-heading">
                            <h5 class="mb-1"><?php echo htmlspecialchars($name);?></h5>
                            <a href="javascript:void(0);" data-bs-target="#editRole-<?php echo $id;?>" data-bs-toggle="modal" class="btn btn-sm btn-outline-primary mb-4 edit-role">Edit Role</a>
                            <a href="assign_permissions.php?role_id=<?php echo $id; ?>" class="btn btn-sm btn-outline-primary mb-4">Assign Permissions</a>
                            
                            <a href="javascript:void(0);" data-bs-target="#editRole-<?php echo $id;?>" data-bs-toggle="modal" class="btn btn-sm btn-outline-primary  ml-2 mb-4 edit-role"><span> <i class="icon-base bx bx-cog"></i></a>
                        </div>
                       
                        </div>
                    </div>
                    </div>

                    
                    <!-- Modal for editiing -->
                     
                </div>
                <?php @include("modals/edit-role.php");?>
                <?php endforeach; endif;?>
                    <div class="col-xl-4 col-lg-6 col-md-6">
                        <div class="card h-100">
                            <div class="row h-100">
                                <div class="col-sm-5">
                                    <div class="d-flex align-items-end h-100 justify-content-center mt-sm-0 mt-4 ps-6">
                                        <img src="../../assets/img/illustrations/lady-with-laptop-light.png" class="img-fluid" alt="Image" width="120" data-app-light-img="illustrations/lady-with-laptop-light.png" data-app-dark-img="illustrations/lady-with-laptop-dark.png" />
                                    </div>
                                </div>
                                <div class="col-sm-7">
                                    <div class="card-body text-sm-end text-center ps-sm-0">
                                        <button data-bs-target="#addRole" data-bs-toggle="modal" class="btn btn-sm btn-primary mb-4 text-nowrap add-new-role">Add New Role</button>
                                        <p class="mb-0">
                                        Add new role, <br />
                                        if it doesn't exist.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
    <script src="../assets/vendor/libs/jstree/jstree.js"></script>
   
<script>
$(document).ready(function () {
    // When a modal is opened
    $('.modal').on('shown.bs.modal', function () {
        var treeDiv = $(this).find('.permissionsTree');
        var roleId = treeDiv.data('role-id');
        var treeId = treeDiv.attr('id');

        // Only initialize the jsTree once
        if (!$('#' + treeId).hasClass('jstree')) {
            $('#' + treeId).jstree({
                core: {
                    data: function (node, callback) {
                        $.getJSON("manage/fetch_permissions.php", function (allPermissions) {
                            $.getJSON("manage/get_assigned_permissions.php", { role_id: roleId }, function (assignedPermissions) {
                                callback.call(this, allPermissions);
                                setTimeout(() => {
                                    $('#' + treeId).jstree(true).select_node(assignedPermissions);
                                }, 300);
                            });
                        });
                    }
                },
                plugins: ["checkbox"],
                checkbox: {
                    three_state: false,
                    cascade: "undetermined"
                }
            }).on("select_node.jstree deselect_node.jstree", function (e, data) {
                var tree = $('#' + treeId).jstree(true);

                if (data.node.parent !== "#") {
                    var parent = data.node.parent;
                    var siblings = tree.get_children_dom(parent);
                    var allChecked = siblings.find('.jstree-clicked').length === siblings.length;

                    if (allChecked) {
                        tree.select_node(parent);
                    } else {
                        tree.deselect_node(parent);
                    }
                } else {
                    if (data.node.state.selected) {
                        tree.select_node(data.node.children_d);
                    } else {
                        tree.deselect_node(data.node.children_d);
                    }
                }
            });
        }
    });

    // Save button click handler
    $(document).on("click", ".savePermissionsBtn", function () {
        var roleId = $(this).data('role-id');
        var treeId = $(this).data('tree-id');
        var selectedPermissions = $('#' + treeId).jstree("get_selected");

        $.ajax({
            url: "manage/save_permissions.php",
            method: "POST",
            data: {
                role_id: roleId,
                permissions: selectedPermissions
            },
            success: function (response) {
                alert("Permissions saved successfully!");
                $('#assignPermissions-' + roleId).modal('hide');
            },
            error: function (xhr) {
                alert("Error: " + xhr.responseText);
            }
        });
    });
});
</script>




    </body>
</html>

