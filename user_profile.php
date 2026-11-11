<!doctype html>

<?php 
include('includes/checklogin.php');

$title = "User Profile | My profile";
include("includes/get_user.php");


?>
<html
  lang="en"
  class=" layout-navbar-fixed layout-menu-fixed layout-compact "
  dir="ltr"
  data-skin="default"
  data-assets-path="assets/"
  data-template="vertical-menu-template"
  data-bs-theme="light">
  <?php @include('includes/header.php');?>
  <style>
/* Modern Profile Styling */
.profile-header-wrapper {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    background: #fff;
}
.profile-banner {
    width: 100%;
    height: 250px;
    object-fit: cover;
}
.profile-glass-card {
    position: relative;
    margin-top: -80px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(15px);
    border-top: 1px solid rgba(255, 255, 255, 0.8);
    padding: 24px;
    display: flex;
    align-items: flex-end;
    gap: 24px;
    border-radius: 0 0 20px 20px;
}
.profile-avatar-container {
    position: relative;
    margin-top: -60px;
}
.profile-avatar {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    border: 4px solid #fff;
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
    object-fit: cover;
    background: #fff;
}
.edit-avatar-btn {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background: #6f42c1;
    color: white;
    border-radius: 50%;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #fff;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(111, 66, 193, 0.3);
    transition: transform 0.2s;
}
.edit-avatar-btn:hover { transform: scale(1.1); color: #fff; }
.edit-banner-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0,0,0,0.5);
    color: white;
    backdrop-filter: blur(5px);
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s;
}
.edit-banner-btn:hover { background: rgba(0,0,0,0.7); color: white; }

/* Modern Tabs */
.modern-nav-pills .nav-link {
    border-radius: 50rem;
    padding: 10px 24px;
    color: #6c757d;
    font-weight: 600;
    transition: all 0.3s;
    border: 1px solid transparent;
}
.modern-nav-pills .nav-link.active {
    background: linear-gradient(135deg, #1a0533, #6f42c1);
    box-shadow: 0 4px 15px rgba(111, 66, 193, 0.3);
    color: white;
}
.modern-nav-pills .nav-link:hover:not(.active) {
    background: rgba(111, 66, 193, 0.08);
    color: #6f42c1;
}

/* Info Cards */
.info-card {
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    background: #fff;
    transition: transform 0.2s;
}
.info-card:hover { transform: translateY(-3px); }
.info-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

@media (max-width: 768px) {
    .profile-glass-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-top: -60px;
    }
    .profile-avatar-container { margin-top: -80px; }
}
</style>


  <body>
    
    
    <!-- Layout wrapper -->
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
      
      <?php @include("includes/nav.php");
        ?>
<!-- / Navbar -->
      

      <!-- Content wrapper -->
      <div class="content-wrapper">
        <!-- Content -->
        <div class="container-xxl flex-grow-1 container-p-y">
          <?php 
          // Get some of the details of the users ...

            $qr = "SELECT * FROM users JOIN member ON users.member_id = member.id   WHERE users.id =:user_id";
            $prep = $db->prepare($qr);
            $prep->bindParam(':user_id',$user_id, PDO::PARAM_INT);
            $prep->execute();
            $res = $prep->fetch(PDO::FETCH_OBJ);
            if($res){
                $defaultBanner = "assets/img/elements/15.png";
                $defaultProfile = "assets/img/avatars/default-a.jpg";
                $bannerImage = !empty($res->photo1) ? "assets/user_img/" . $res->photo1 : $defaultBanner;
                $profileImage = !empty($res->photo) ? "assets/user_img/" . $res->photo : $defaultProfile;

                @include("modals/userUpdate.php");
               
            ?>

            <!-- Modern Header -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="profile-header-wrapper">
                        <img src="<?= $bannerImage;?>" alt="Banner image" class="profile-banner" />
                        <button class="edit-banner-btn" data-bs-toggle="modal" data-bs-target="#editBannerImg">
                            <i class="bx bx-camera me-2"></i> Edit Cover
                        </button>
                        
                        <div class="profile-glass-card">
                            <div class="profile-avatar-container">
                                <img src="<?= $profileImage;?>" alt="user image" class="profile-avatar"/>
                                <a href="javascript:void(0);" class="edit-avatar-btn" data-bs-toggle="modal" data-bs-target="#editProfilePic" title="Edit Profile Picture">
                                    <i class="bx bx-pencil"></i>
                                </a>
                            </div>
                            
                            <div class="flex-grow-1 w-100">
                                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end gap-3">
                                    <div>
                                        <h3 class="mb-1 fw-bold text-dark"><?= htmlspecialchars($res->first_name." ".$res->last_name);?></h3>
                                        <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3 flex-wrap text-muted small fw-medium mt-2">
                                            <span class="d-flex align-items-center"><i class="bx bx-map me-1 text-primary"></i> <?= htmlspecialchars($res->location ?: 'Location not set'); ?></span>
                                            <span class="d-flex align-items-center"><i class="bx bx-calendar me-1 text-info"></i> Joined <?= date('M Y', strtotime($res->date));?></span>
                                            <span class="d-flex align-items-center"><i class="bx bx-crown me-1 text-warning"></i> 
                                            <?php 
                                                $ss = "SELECT r.name from roles r join user_roles u on u.role_id = r.id where u.user_id=:user_id";
                                                $des = $db->prepare($ss);
                                                $des->execute([':user_id' => $user_id]);
                                                $rec = $des->fetchAll(PDO::FETCH_COLUMN);
                                                echo !empty($rec) ? htmlspecialchars(implode(', ', $rec)) : 'Member';
                                            ?>
                                            </span>
                                        </div>
                                    </div>
                                    <a href="javascript:void(0)" class="btn btn-outline-danger rounded-pill shadow-sm px-4" onclick="confirmInActivate(<?=$user_id;?>)">
                                        <i class="bx bx-power-off me-2"></i> Deactivate
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!--/ Header -->

            <!-- Navbar pills -->
            <div class="row mb-4">
                <div class="col-md-12">
                    <ul class="nav nav-pills modern-nav-pills flex-column flex-sm-row gap-2 justify-content-center justify-content-md-start">
                        <li class="nav-item">
                            <a class="nav-link active" data-bs-toggle="tab" href="#my-profile"><i class="bx bx-user me-2"></i> My Profile</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#my-cell"><i class="bx bx-group me-2"></i> My Cell</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#my-attendance"><i class="bx bx-grid-alt me-2"></i> Attendance</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#new-members"><i class="bx bx-link me-2"></i> Members I Invited</a>
                        </li>
                    </ul>
                </div>
            </div>
            <!--/ Navbar pills -->

            <!-- User Profile Content -->
            <div class="tab-content mt-1">
                
                <div class="tab-pane fade show active" id="my-profile">
                    <div class="row">
                        <div class="col-xl-4 col-lg-5 col-md-5">
                            <!-- Bio Card -->
                            <div class="card info-card mb-4">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h6 class="mb-0 fw-bold text-uppercase text-muted" style="letter-spacing:1px;"><i class="bx bx-detail me-2"></i>About Me</h6>
                                        <button class="btn btn-icon btn-sm btn-text-primary" data-bs-toggle="modal" data-bs-target="#editBio" title="Edit Bio"><i class="bx bx-edit"></i></button>
                                    </div>
                                    <p class="mb-0 text-muted" style="font-size:0.95rem; line-height:1.6;">
                                        <?= !empty($res->bio) ? htmlspecialchars($res->bio) : '<em>No bio added yet. Write something about yourself!</em>';?>
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Contact Card -->
                            <div class="card info-card mb-4">
                                <div class="card-body">
                                    <h6 class="mb-4 fw-bold text-uppercase text-muted" style="letter-spacing:1px;"><i class="bx bx-phone me-2"></i>Contact Details</h6>
                                    
                                    <div class="d-flex align-items-center mb-4">
                                        <div class="info-icon bg-label-primary text-primary me-3"><i class="bx bx-phone-call"></i></div>
                                        <div>
                                            <p class="mb-0 small text-muted text-uppercase">Phone Number</p>
                                            <h6 class="mb-0 fw-semibold text-dark"><?= htmlspecialchars($res->phone_no ?: 'N/A');?></h6>
                                        </div>
                                    </div>
                                    
                                    <div class="d-flex align-items-center mb-4">
                                        <div class="info-icon bg-label-success text-success me-3"><i class="bx bx-envelope"></i></div>
                                        <div>
                                            <p class="mb-0 small text-muted text-uppercase">Email Address</p>
                                            <h6 class="mb-0 fw-semibold text-dark"><?= htmlspecialchars($res->email ?: 'N/A');?></h6>
                                        </div>
                                    </div>
                                    
                                    <div class="d-flex align-items-center">
                                        <div class="info-icon bg-label-warning text-warning me-3"><i class="bx bx-cake"></i></div>
                                        <div>
                                            <p class="mb-0 small text-muted text-uppercase">Date of Birth</p>
                                            <div class="d-flex align-items-center">
                                                <h6 class="mb-0 fw-semibold text-dark me-2">
                                                    <?= !empty($res->bod) && $res->bod != '0000-00-00' ? date('F jS, Y', strtotime($res->bod)) : 'Not Set';?>
                                                </h6>
                                                <a href="javascript:void(0)" data-bs-toggle="modal" data-bs-target="#editBirthday" class="text-primary" title="Edit Birthday"><i class="bx bx-edit-alt"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Ministry Overview Card -->
                            <div class="card info-card mb-4">
                                <div class="card-body">
                                    <h6 class="mb-4 fw-bold text-uppercase text-muted" style="letter-spacing:1px;"><i class="bx bx-star me-2"></i>Engagement</h6>
                                    <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                                        <span class="d-flex align-items-center text-muted"><i class="bx bx-user-plus me-2 text-primary"></i>Members Invited</span>
                                        <span class="badge bg-label-primary rounded-pill fw-bold" style="font-size:0.9rem;">5</span>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                                        <span class="d-flex align-items-center text-muted"><i class="bx bx-group me-2 text-success"></i>Souls Won</span>
                                        <span class="badge bg-label-success rounded-pill fw-bold" style="font-size:0.9rem;">897</span>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="d-flex align-items-center text-muted"><i class="bx bx-check-shield me-2 text-info"></i>Meetings Attended</span>
                                        <span class="badge bg-label-info rounded-pill fw-bold" style="font-size:0.9rem;">3 / 40</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-8 col-lg-7 col-md-7">
                            <!-- Modern Activity Timeline -->
                            <div class="card info-card mb-4">
                                <div class="card-header border-bottom d-flex align-items-center py-3">
                                    <h5 class="card-title mb-0 fw-bold"><i class="bx bx-pulse text-primary me-2"></i>Recent Activity</h5>
                                </div>
                                <div class="card-body pt-4">
                                    <?php 
                                    $stmt = $db->prepare("SELECT id,title, detail, created_at FROM user_timeline WHERE user_id = :uid ORDER BY created_at DESC LIMIT 10");
                                    $stmt->bindParam(':uid', $user_id, PDO::PARAM_INT);
                                    $stmt->execute();
                                    $timeline = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                    ?>
                                    
                                    <ul class="timeline timeline-dashed mt-3 mb-0">
                                        <?php if(!empty($timeline)):
                                            foreach($timeline as $index => $row):
                                                $created_at = $row['created_at'];
                                                $timeAgo = "<script> document.write(timeAgo('$created_at')); </script>";
                                        ?>
                                        <li class="timeline-item timeline-item-transparent">
                                            <span class="timeline-point timeline-point-primary">
                                                <i class="bx bx-record-circle"></i>
                                            </span>
                                            <div class="timeline-event">
                                                <div class="timeline-header mb-1">
                                                    <h6 class="mb-0 fw-bold text-dark"><?= htmlspecialchars($row['title']);?></h6>
                                                    <small class="text-muted"><?= $timeAgo;?></small>
                                                </div>
                                                <p class="mb-0 text-muted" style="font-size:0.9rem;"><?= htmlspecialchars($row['detail'] ?? 'Action performed on profile.');?></p>
                                            </div>
                                        </li>
                                        <?php endforeach; else: ?>
                                        <li class="timeline-item timeline-item-transparent">
                                            <span class="timeline-point timeline-point-success">
                                                <i class="bx bx-check-circle"></i>
                                            </span>
                                            <div class="timeline-event">
                                                <div class="timeline-header mb-1">
                                                    <h6 class="mb-0 fw-bold text-dark">Welcome to your profile</h6>
                                                    <small class="text-muted">Just now</small>
                                                </div>
                                                <p class="mb-0 text-muted" style="font-size:0.9rem;">Your activity timeline is currently empty. Actions you take will appear here!</p>
                                            </div>
                                        </li>
                                        <?php endif;?>
                                    </ul>
                                </div>
                            </div>
                            <!--/ Activity Timeline -->
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="my-cell">
                    <?php
                        $get_cell = "SELECT m.cell_id, m.id as my_member_id FROM member m join users u on m.id = u.member_id WHERE u.id =:user_id";
                        $stmtt = $db->prepare($get_cell);
                        $stmtt->bindParam(':user_id', $user_id,PDO::PARAM_INT);
                        $stmtt->execute();
                        $cellRes = $stmtt->fetch(PDO::FETCH_OBJ);
                        
                        if(!$cellRes || empty($cellRes->cell_id))
                        {
                            echo "
                            <script>
                                Swal.fire({
                                    title: 'Seems you are not Assigned Yet! Give us a Moment',
                                    icon: 'warning',
                                    confirmButtonText: 'Ok',
                                    confirmButtonColor: '#d33',       
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        console.log('Unassigned');
                                    }
                                });
                            </script>
                            <div class='alert alert-warning text-center p-4 mt-4' style='border-radius:15px;'>
                                <i class='bx bx-error-circle bx-lg mb-3'></i>
                                <h4>You haven't been assigned to a Cell yet.</h4>
                                <p>Please reach out to your administrator to get assigned to a cell.</p>
                            </div>
                            ";
                        }
                        else
                        {
                            $cell_id = $cellRes->cell_id;
                            $my_member_id = $cellRes->my_member_id;

                            // get cell details and members
                            $cell_det = "SELECT c.id, c.cell_leader, c.code, m.first_name, m.last_name, m.phone_no FROM cells c left join member m on c.cell_leader = m.id where c.id = :cell_id";
                            $details = $db->prepare($cell_det);
                            $details->bindParam(':cell_id',$cell_id, PDO::PARAM_INT);
                            $details->execute();
                            $CELL = $details->fetch(PDO::FETCH_OBJ);

                            $get_cell_members = "SELECT * FROM member WHERE cell_id =:cell_id";
                            $mGet = $db->prepare($get_cell_members);
                            $mGet->bindParam(':cell_id',$cell_id, PDO::PARAM_INT);
                            $mGet->execute();
                            $members = $mGet->fetchaLL(PDO::FETCH_ASSOC);
                            
                            $is_leader = ($CELL && $CELL->cell_leader == $my_member_id);
                    ?>
                    
                    <?php if($is_leader): ?>
                        <!-- Cell Leader Dashboard -->
                        <div class="row mb-4">
                            <div class="col-12">
                                <div class="card bg-label-primary shadow-none border-0" style="border-radius:15px;">
                                    <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
                                        <div class="d-flex align-items-center gap-3">
                                            <div class="avatar avatar-lg">
                                                <span class="avatar-initial rounded-circle bg-primary text-white"><i class="bx bx-crown bx-sm"></i></span>
                                            </div>
                                            <div>
                                                <h4 class="mb-0 text-primary fw-bold">Cell Leader Dashboard</h4>
                                                <p class="mb-0 text-muted">You are the leader of cell <strong class="text-dark"><?= htmlspecialchars($CELL->code ?? ''); ?></strong></p>
                                            </div>
                                        </div>
                                        <div class="d-flex gap-2">
                                            <button class="btn btn-primary rounded-pill"><i class="bx bx-plus me-1"></i> Add Member</button>
                                            <button class="btn btn-outline-primary rounded-pill"><i class="bx bx-calendar-check me-1"></i> Log Attendance</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mb-4">
                            <div class="col-md-4">
                                <div class="card shadow-sm border-0 info-card h-100">
                                    <div class="card-body text-center">
                                        <div class="avatar avatar-md mx-auto mb-3">
                                            <span class="avatar-initial rounded-circle bg-label-info"><i class="bx bx-group bx-sm"></i></span>
                                        </div>
                                        <h3 class="mb-1 fw-bold"><?= count($members); ?></h3>
                                        <span class="text-muted text-uppercase small fw-semibold" style="letter-spacing:1px;">Total Members</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card shadow-sm border-0 info-card h-100">
                                    <div class="card-body text-center">
                                        <div class="avatar avatar-md mx-auto mb-3">
                                            <span class="avatar-initial rounded-circle bg-label-success"><i class="bx bx-line-chart bx-sm"></i></span>
                                        </div>
                                        <h3 class="mb-1 fw-bold">+2</h3>
                                        <span class="text-muted text-uppercase small fw-semibold" style="letter-spacing:1px;">New This Month</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card shadow-sm border-0 info-card h-100">
                                    <div class="card-body text-center">
                                        <div class="avatar avatar-md mx-auto mb-3">
                                            <span class="avatar-initial rounded-circle bg-label-warning"><i class="bx bx-check-shield bx-sm"></i></span>
                                        </div>
                                        <h3 class="mb-1 fw-bold">85%</h3>
                                        <span class="text-muted text-uppercase small fw-semibold" style="letter-spacing:1px;">Avg Attendance</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php else: ?>
                        <!-- Regular Member Cell Banner -->
                        <div class="card shadow-sm border-0 mb-4" style="border-radius:15px; background: linear-gradient(135deg, rgba(111,66,193,0.05), rgba(111,66,193,0.1));">
                            <div class="card-body d-flex align-items-center gap-4">
                                <div class="avatar avatar-xl">
                                    <span class="avatar-initial rounded-circle bg-primary text-white"><i class="bx bx-group bx-md"></i></span>
                                </div>
                                <div>
                                    <h4 class="mb-1 fw-bold text-dark">Cell <?= htmlspecialchars($CELL->code ?? 'Unknown'); ?></h4>
                                    <p class="mb-0 text-muted">
                                        <span class="fw-semibold text-primary"><i class="bx bx-crown me-1"></i> Leader:</span> 
                                        <?php if(!empty($CELL->first_name)): ?>
                                            <?= htmlspecialchars($CELL->first_name.' '.$CELL->last_name); ?>
                                            <span class="ms-3"><i class="bx bx-phone me-1"></i> <?= htmlspecialchars($CELL->phone_no); ?></span>
                                        <?php else: ?>
                                            Not Yet Assigned
                                        <?php endif; ?>
                                    </p>
                                </div>
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <!-- Users List Table -->
                    <div class="card shadow-sm border-0" style="border-radius:20px;">
                        <div class="card-header border-bottom d-flex justify-content-between align-items-center py-3">
                            <h5 class="card-title mb-0 fw-bold"><i class="bx bx-list-ul me-2"></i>Cell Roster</h5>
                        </div>
                        <div class="card-body mt-3">
                            <div class="row mb-4">
                                <div class="col-md-4 user_role"></div>
                                <div class="col-md-4 user_plan"></div>
                                <div class="col-md-4 user_status"></div>
                            </div>
                        <div class="table-responsive">
                            <table class="datatables-users table table-hover border-top" id="cellTable">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Contact</th>
                                        <th>Email</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php
                                        if (!empty($members)): 
                                        foreach ($members as $index => $row):
                                            $id = $row['id'];
                                            $name = $row['first_name']."  ".$row['last_name'];
                                            $username = $row['phone_no'];
                                            $email = $row['email'];
                                            // $last_login = $row['last_login'];
                                            //$status = $row['status'];date("M d, Y h:i a",strtotime($date));
                                    ?>
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div class="avatar avatar-sm me-3">
                                                    <span class="avatar-initial rounded-circle bg-label-info"><?php echo strtoupper(substr($name, 0, 2)); ?></span>
                                                </div>
                                                <div>
                                                    <h6 class="mb-0 fw-semibold text-body"><?php echo htmlspecialchars($name);?></h6>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span class="text-muted"><i class="bx bx-phone me-1 text-primary"></i><?php echo htmlspecialchars($username);?></span></td>
                                        <td><?php echo htmlspecialchars($email);?></td>
                                        <!-- <td><?php // echo htmlspecialchars(date("M d, Y h:i a",strtotime($last_login)));?></td>
                                        -->
                                        <td>
                                            <div class="dropdown">
                                                <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="icon-base bx bx-cog me-1"></i>
                                                <i class="icon-base bx bx-dots-vertical-rounded"></i>
                                                </button>
                                                <div class="dropdown-menu dropdown-menu-end shadow-sm border-0" style="border-radius:12px;">
                                                    <?php if (userHasPermission($db,$user_id,'edit_member')){?>
                                                    <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#editMember-<?=$id;?>">
                                                        <i class="bx bx-edit-alt me-2 text-primary"></i> Edit
                                                    </a>
                                                    <?php 
                                                
                                                    }?>
                                                    <a class="dropdown-item" href="javascript:void(0);"
                                                        ><i class="bx bx-transfer me-2 text-info"></i> View Details</a
                                                    >
                                                </div>
                                            </div>
                                         </td>
                                        <?php 
                                            @include('modals/edit-user.php');
                                        ?>
                                    </tr>
                                    <?php endforeach; endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <?php } ?>
                </div>
                <div class="tab-pane fade" id="my-attendance">
                    <?php
                        // Fetch attendance records
                        $att_query = "SELECT m.name, m.start_time, m.meeting_type, a.login_time 
                                      FROM attendance a 
                                      JOIN meeting m ON a.meeting_id = m.id 
                                      WHERE a.member_id = (SELECT member_id FROM users WHERE id = :uid) 
                                      ORDER BY m.start_time DESC";
                        $att_stmt = $db->prepare($att_query);
                        $att_stmt->execute([':uid' => $user_id]);
                        $attendance_records = $att_stmt->fetchAll(PDO::FETCH_ASSOC);
                    ?>
                    <div class="card shadow-sm border-0" style="border-radius:20px;">
                        <div class="card-header border-bottom d-flex justify-content-between align-items-center py-3">
                            <h5 class="card-title mb-0 fw-bold"><i class="bx bx-calendar-check text-primary me-2"></i>My Attendance Record</h5>
                            <span class="badge bg-label-primary rounded-pill"><?= count($attendance_records); ?> Total Meetings</span>
                        </div>
                        <div class="card-body mt-3">
                            <div class="table-responsive">
                                <table class="datatables-users table table-hover border-top" id="attendanceTable">
                                    <thead>
                                        <tr>
                                            <th>Meeting Name</th>
                                            <th>Date</th>
                                            <th>Check-in Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (!empty($attendance_records)): ?>
                                            <?php foreach ($attendance_records as $row): ?>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex align-items-center">
                                                            <div class="avatar avatar-sm me-3">
                                                                <span class="avatar-initial rounded-circle bg-label-primary"><i class="bx bx-calendar-event"></i></span>
                                                            </div>
                                                            <div>
                                                                <h6 class="mb-0 fw-semibold text-body"><?= htmlspecialchars($row['name']); ?></h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span class="fw-medium text-dark"><?= date("M d, Y", strtotime($row['start_time'])); ?></span></td>
                                                    <td><span class="text-muted"><i class="bx bx-time-five me-1"></i><?= date("h:i A", strtotime($row['login_time'])); ?></span></td>
                                                    <td><span class="badge bg-label-success rounded-pill px-3"><i class="bx bx-check me-1"></i> Attended</span></td>
                                                </tr>
                                            <?php endforeach; ?>
                                        <?php else: ?>
                                            <tr>
                                                <td colspan="4" class="text-center text-muted py-5">
                                                    <i class="bx bx-calendar-x bx-lg mb-3 opacity-50"></i>
                                                    <h5>No Attendance Records Found</h5>
                                                    <p>You haven't checked into any meetings yet.</p>
                                                </td>
                                            </tr>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="new-members">
                    <?php
                        $qr = "SELECT member_id, first_name, last_name FROM users JOIN member ON users.member_id = member.id WHERE users.id = :user_id";
                        $prep = $db->prepare($qr);
                        $prep->execute([':user_id' => $user_id]);
                        $res1 = $prep->fetch(PDO::FETCH_OBJ);
                        $my_member_id = $res1->member_id ?? 0;
                        
                        $get_inv = "SELECT * FROM member WHERE department = :member_id ORDER BY id DESC";
                        $stmtt = $db->prepare($get_inv);
                        $stmtt->execute([':member_id' => $my_member_id]);
                        $invited_members = $stmtt->fetchAll(PDO::FETCH_ASSOC);
                    ?>
                    
                    <div class="card shadow-sm border-0" style="border-radius:20px;">
                        <div class="card-header border-bottom d-flex justify-content-between align-items-center py-3">
                            <h5 class="card-title mb-0 fw-bold"><i class="bx bx-user-plus text-primary me-2"></i>Members I Invited</h5>
                            <span class="badge bg-label-primary rounded-pill"><?= count($invited_members); ?> People</span>
                        </div>
                        <div class="card-body mt-3">
                            <div class="table-responsive">
                                <table class="datatables-users table table-hover border-top" id="invitedTable">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Contact</th>
                                            <th>Email</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (!empty($invited_members)): ?>
                                            <?php foreach ($invited_members as $index => $row): 
                                                $id = $row['id'];
                                                $name = $row['first_name'] . " " . $row['last_name'];
                                                $phone = $row['phone_no'];
                                                $email = $row['email'];
                                            ?>
                                            <tr>
                                                <td>
                                                    <div class="d-flex align-items-center">
                                                        <div class="avatar avatar-sm me-3">
                                                            <span class="avatar-initial rounded-circle bg-label-success"><?= strtoupper(substr($name, 0, 2)); ?></span>
                                                        </div>
                                                        <div>
                                                            <h6 class="mb-0 fw-semibold text-body"><?= htmlspecialchars($name); ?></h6>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span class="text-muted"><i class="bx bx-phone me-1 text-primary"></i><?= htmlspecialchars($phone); ?></span></td>
                                                <td><?= htmlspecialchars($email ?: 'N/A'); ?></td>
                                                <td>
                                                    <div class="dropdown">
                                                        <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="bx bx-cog me-1 icon-base"></i><i class="icon-base bx bx-dots-vertical-rounded"></i></button>
                                                        <div class="dropdown-menu dropdown-menu-end shadow-sm border-0" style="border-radius:12px;">
                                                            <?php if (userHasPermission($db,$user_id,'edit_member')){?>
                                                                <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#editMember-<?=$id;?>">
                                                                    <i class="bx bx-edit-alt me-2 text-primary"></i> Edit
                                                                </a>
                                                            <?php }?>
                                                            <a class="dropdown-item" href="javascript:void(0);"><i class="bx bx-transfer me-2 text-info"></i> View Details</a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <?php @include('modals/edit-user.php'); ?>
                                            </tr>
                                            <?php endforeach; ?>
                                        <?php else: ?>
                                            <tr>
                                                <td colspan="4" class="text-center text-muted py-5">
                                                    <i class="bx bx-user-x bx-lg mb-3 opacity-50"></i>
                                                    <h5>No Invites Yet</h5>
                                                    <p>You haven't invited anyone to join yet. Start sharing!</p>
                                                </td>
                                            </tr>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                    
            </div>
            
        </div>
            <!--/ User Profile Content -->

<?php }?>
        </div>
        <!-- / Content -->

        
        

<!-- Footer -->
<?php @include("includes/footer.php");?>
<!-- / Footer -->

        
        <div class="content-backdrop fade"></div>
      </div>
      <!-- Content wrapper -->
    </div>
    <!-- / Layout page -->
  </div>

  
  
  <!-- Overlay -->
  <div class="layout-overlay layout-menu-toggle"></div>
  
  
  <!-- Drag Target Area To SlideIn Menu On Small Screens -->
  <div class="drag-target"></div>
  
</div>
<!-- / Layout wrapper -->

    
      <div class="buy-now">
        <a href="javascript:(void);" data-bs-toggle="modal" data-bs-target="#makePayment" class="btn btn-success btn-buy-now">Giving</a>
      </div>
    
<script>
    
  const citySelect = new TomSelect("#locationSelect", {
    plugins: ['remove_button'],
    maxItems: 1,
    placeholder: 'Type your location...'
  });

  const country = new TomSelect("#countrySelect", {
    plugin : ['remove_button'],
    maxItems: 1,
    placeholder : "Type your Country.."
  });
  function confirmInActivate(userId) {
    Swal.fire({
        title: 'Are you sure you want to deactivate Account?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Deactivate',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.isConfirmed) {
            // Redirect to logout script
            window.location.href = 'manage/deactivate.php?user-id='+userId;
        }
    });
}

   // AJAX calls
   document.getElementById('countrySelect').addEventListener('change', function(){
    const countryId = this.value;
    if(!countryId) return;

    fetch('manage/get_cities.php?country_id='+countryId).then(
        res=>res.json()).then(
            data=>{
                citySelect.clearOptions();
                citySelect.clear(true);
                data.forEach(city=>{
                    citySelect.addOption({
                        value:city.name, text:city.name
                    });
                    
                });
                citySelect.refreshOptions();
            }).catch(err=>console.error(err));
    
   });
  

      function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return date.toLocaleDateString(); // fallback
}
</script>
<script>
       document.getElementById('dob').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
  let errorMessage = document.getElementById('dob-error');
  let isValidDate = false;

  // Format input as MM/DD/YYYY
  if (value.length > 2 && value.length <= 4)
    value = value.slice(0, 2) + '/' + value.slice(2);
  else if (value.length > 4 && value.length <= 8)
    value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
  else if (value.length > 8)
    value = value.slice(0, 10); // Limit to MM/DD/YYYY

  // Validate the date using a regular expression
  if (value.length === 10) {
    const dateParts = value.split('/');
    const month = parseInt(dateParts[0], 10);
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    
    // Check if the date is valid (MM between 1-12, DD valid for the month)
    const date = new Date(year, month - 1, day);  // month is 0-indexed in JavaScript
    isValidDate = date.getMonth() + 1 === month && date.getDate() === day && date.getFullYear() === year;
    }

      // Show or hide error message based on validation
      if (isValidDate) {
        errorMessage.style.display = 'none';
      } else {
        errorMessage.style.display = 'block';
      }

      // Update input value with the formatted date
      e.target.value = value;
    });
</script>


    <!-- Core JS -->
    <!-- build:js assets/vendor/js/theme.js  -->
    <?php @include("includes/scripts.html");?>
   
    
  </body>
</html>

  <!-- beautify ignore:end -->

