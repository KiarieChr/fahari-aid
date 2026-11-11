<?php 
// Dynamic Avatar Generation
$f_initial = !empty($fname) ? strtoupper(substr($fname, 0, 1)) : 'U';
$l_initial = !empty($lname) ? strtoupper(substr($lname, 0, 1)) : '';
$initials = $f_initial . $l_initial;

// Generate a deterministic pastel-ish color based on the name
$hash = md5($fname . $lname);
$r = hexdec(substr($hash, 0, 2)) % 100 + 100; // 100-199
$g = hexdec(substr($hash, 2, 2)) % 100 + 100;
$b = hexdec(substr($hash, 4, 2)) % 150 + 100;
$avatar_color = "rgb($r, $g, $b)";
?>
<style>
@keyframes pulse-badge {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 62, 29, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 62, 29, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 62, 29, 0); }
}
.pulsing-badge {
    animation: pulse-badge 2s infinite;
}
.nav-icon-animated i {
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.nav-icon-animated:hover i {
    transform: scale(1.2);
    color: #696cff;
}
.search-pill {
    border-radius: 50px !important;
    background-color: rgba(67, 89, 113, 0.05);
    transition: all 0.3s ease;
    padding-left: 15px;
}
.search-pill:focus {
    background-color: white;
    box-shadow: 0 0 0 3px rgba(105, 108, 255, 0.2) !important;
}
.dynamic-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    letter-spacing: 1px;
}
.glass-nav {
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    background-color: rgba(255, 255, 255, 0.85) !important;
    box-shadow: 0 4px 24px 0 rgba(34, 41, 47, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.4);
}
.dark-style .glass-nav {
    background-color: rgba(43, 44, 64, 0.85) !important;
    border: 1px solid rgba(255, 255, 255, 0.05);
}
</style>

<nav class="layout-navbar container-xxl navbar-detached navbar navbar-expand-xl align-items-center bg-navbar-theme glass-nav" id="layout-navbar">
<div class="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
  <a class="nav-item nav-link px-0 me-xl-6 nav-icon-animated" href="javascript:void(0)">
    <i class="icon-base bx bx-menu icon-md"></i>
  </a>
</div>

<div class="navbar-nav-right d-flex align-items-center justify-content-end" id="navbar-collapse">
  <!-- Search -->
  <div class="navbar-nav align-items-center me-auto">
    <div class="nav-item d-flex align-items-center" style="position:relative;">
      <span class="w-px-22 h-px-22" style="position:absolute; left:12px; z-index:2; color:#a1acb8;"><i class="icon-base bx bx-search icon-md"></i></span>
      <input
        type="text"
        class="form-control border-0 shadow-none d-md-block d-none search-pill"
        style="padding-left: 40px; width: 250px;"
        placeholder="Search (Ctrl+K)..."
        aria-label="Search..." />
    </div>
  </div>
  <!-- /Search -->

  <ul class="navbar-nav flex-row align-items-center ms-md-auto">
    
      <!-- Style Switcher -->
      <li class="nav-item dropdown me-2 me-xl-0">
        <a class="nav-link dropdown-toggle hide-arrow nav-icon-animated" id="nav-theme" href="javascript:void(0);" data-bs-toggle="dropdown">
          <i class="icon-base bx bx-sun icon-md theme-icon-active"></i>
          <span class="d-none ms-2" id="nav-theme-text">Toggle theme</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="nav-theme-text">
          <li>
            <button type="button" class="dropdown-item align-items-center active" data-bs-theme-value="light" aria-pressed="false">
              <span><i class="icon-base bx bx-sun icon-md me-3" data-icon="sun"></i>Light</span>
            </button>
          </li>
          <li>
            <button type="button" class="dropdown-item align-items-center" data-bs-theme-value="dark" aria-pressed="true">
              <span><i class="icon-base bx bx-moon icon-md me-3" data-icon="moon"></i>Dark</span>
            </button>
          </li>
          <li>
            <button type="button" class="dropdown-item align-items-center" data-bs-theme-value="system" aria-pressed="false">
              <span><i class="icon-base bx bx-desktop icon-md me-3" data-icon="desktop"></i>System</span>
            </button>
          </li>
        </ul>
      </li>
      <!-- / Style Switcher-->
    
    <!-- Quick links  -->
    <li class="nav-item dropdown-shortcuts navbar-dropdown dropdown me-2 me-xl-0">
      <a class="nav-link dropdown-toggle hide-arrow nav-icon-animated" href="javascript:void(0);" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
        <i class="icon-base bx bx-grid-alt icon-md"></i>
      </a>
      <div class="dropdown-menu dropdown-menu-end p-0">
        <div class="dropdown-menu-header border-bottom">
          <div class="dropdown-header d-flex align-items-center py-3">
            <h6 class="mb-0 me-auto">Shortcuts</h6>
            <a href="javascript:void(0)" class="dropdown-shortcuts-add py-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Add shortcuts"><i class="icon-base bx bx-plus-circle text-heading"></i></a>
          </div>
        </div>
        <div class="dropdown-shortcuts-list scrollable-container">
          <div class="row row-bordered overflow-visible g-0">
            <div class="dropdown-shortcuts-item col">
              <span class="dropdown-shortcuts-icon rounded-circle mb-3 bg-label-primary">
                <i class="icon-base bx bx-calendar-star icon-26px text-heading"></i>
              </span>
              <a href="events.php" class="stretched-link">Events</a>
              <small>Programs</small>
            </div>
            <div class="dropdown-shortcuts-item col">
              <span class="dropdown-shortcuts-icon rounded-circle mb-3 bg-label-success">
                <i class="icon-base bx bx-group icon-26px text-heading"></i>
              </span>
              <a href="cells.php" class="stretched-link">My Cell</a>
              <small>Small Group</small>
            </div>
          </div>
          <div class="row row-bordered overflow-visible g-0">
            <div class="dropdown-shortcuts-item col">
              <span class="dropdown-shortcuts-icon rounded-circle mb-3 bg-label-info">
                <i class="icon-base bx bx-book-reader icon-26px text-heading"></i>
              </span>
              <a href="training_dashboard.php" class="stretched-link">Training</a>
              <small>LMS</small>
            </div>
            <div class="dropdown-shortcuts-item col">
              <span class="dropdown-shortcuts-icon rounded-circle mb-3 bg-label-warning">
                <i class="icon-base bx bx-user icon-26px text-heading"></i>
              </span>
              <a href="user_profile.php" class="stretched-link">Profile</a>
              <small>My Account</small>
            </div>
          </div>
        </div>
      </div>
    </li>
    <!-- Quick links -->

    <!-- Notification -->
    <li class="nav-item dropdown-notifications navbar-dropdown dropdown me-3 me-xl-2">
      <a class="nav-link dropdown-toggle hide-arrow nav-icon-animated" href="javascript:void(0);" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
        <span class="position-relative">
          <i class="icon-base bx bx-bell icon-md"></i>
          <span class="badge rounded-pill bg-danger badge-dot badge-notifications border pulsing-badge"></span>
        </span>
      </a>
      <ul class="dropdown-menu dropdown-menu-end p-0">
        <li class="dropdown-menu-header border-bottom notification-header">
          <div class="dropdown-header d-flex align-items-center py-3">
            <h6 class="mb-0 me-auto text-white"> <i class="icon-base bx bx-bell px-1"></i>Notifications</h6>
            <div class="d-flex align-items-center h6 mb-0">
              <span class="badge bg-label-primary me-2">1 New</span>
              <a href="javascript:void(0)" class="dropdown-notifications-all p-2 text-white" data-bs-toggle="tooltip" data-bs-placement="top" title="Mark all as read"><i class="icon-base bx bx-envelope-open text-white"></i></a>
            </div>
          </div>
        </li>
        <li class="dropdown-notifications-list scrollable-container">
          <ul class="list-group list-group-flush">
            <li class="list-group-item list-group-item-action dropdown-notifications-item">
              <div class="d-flex">
                <div class="flex-shrink-0 me-3">
                  <div class="avatar">
                    <span class="avatar-initial rounded-circle bg-label-danger">SYS</span>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <h6 class="small mb-0">Welcome to the new UI!</h6>
                  <small class="mb-1 d-block text-body">The top bar has been modernized.</small>
                  <small class="text-body-secondary">Just now</small>
                </div>
                <div class="flex-shrink-0 dropdown-notifications-actions">
                  <a href="javascript:void(0)" class="dropdown-notifications-read"><span class="badge badge-dot"></span></a>
                  <a href="javascript:void(0)" class="dropdown-notifications-archive"><span class="icon-base bx bx-x"></span></a>
                </div>
              </div>
            </li>
          </ul>
        </li>
        <li class="border-top">
          <div class="d-grid p-4">
            <a class="btn btn-primary btn-sm d-flex" href="javascript:void(0);">
              <small class="align-middle">View all notifications</small>
            </a>
          </div>
        </li>
      </ul>
    </li>
    <!--/ Notification -->
    
    <!-- Messages / Noticeboard -->
    <li class="nav-item dropdown-notifications navbar-dropdown dropdown me-3 me-xl-2">
      <a class="nav-link dropdown-toggle hide-arrow nav-icon-animated" href="javascript:void(0);" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
        <span class="position-relative">
          <i class="icon-base bx bx-message-square-detail icon-md"></i>
          <span class="badge rounded-pill bg-warning badge-dot badge-notifications border"></span>
        </span>
      </a>
      <ul class="dropdown-menu dropdown-menu-end p-0">
        <li class="dropdown-menu-header border-bottom">
          <div class="dropdown-header d-flex align-items-center py-3">
            <h6 class="mb-0 me-auto">Messages</h6>
            <div class="d-flex align-items-center h6 mb-0">
              <span class="badge bg-label-warning me-2">1 New</span>
              <a href="javascript:void(0)" class="dropdown-notifications-all p-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Mark all as read"><i class="icon-base bx bx-envelope-open text-heading"></i></a>
            </div>
          </div>
        </li>
        <li class="dropdown-notifications-list scrollable-container">
          <ul class="list-group list-group-flush">
            <li class="list-group-item list-group-item-action dropdown-notifications-item">
              <div class="d-flex">
                <div class="flex-shrink-0 me-3">
                  <div class="avatar">
                    <img src="assets/img/avatars/1.png" alt class="rounded-circle" />
                  </div>
                </div>
                <div class="flex-grow-1">
                  <h6 class="small mb-0">Pastor Meeting</h6>
                  <small class="mb-1 d-block text-body">Meeting Scheduled for Tuesday, from 08:30 pm to 10:00pm</small>
                  <small class="text-body-secondary">1h ago</small>
                </div>
                <div class="flex-shrink-0 dropdown-notifications-actions">
                  <a href="javascript:void(0)" class="dropdown-notifications-read"><span class="badge badge-dot"></span></a>
                  <a href="javascript:void(0)" class="dropdown-notifications-archive"><span class="icon-base bx bx-x"></span></a>
                </div>
              </div>
            </li>
          </ul>
        </li>
        <li class="border-top">
          <div class="d-grid p-4">
            <a class="btn btn-warning btn-sm d-flex" href="javascript:void(0);">
              <small class="align-middle text-white">View All Messages</small>
            </a>
          </div>
        </li>
      </ul>
    </li>

    <!-- User -->
    <li class="nav-item navbar-dropdown dropdown-user dropdown">
      <a class="nav-link dropdown-toggle hide-arrow p-0" href="javascript:void(0);" data-bs-toggle="dropdown" style="margin-left: 8px;">
        <div class="avatar avatar-online">
          <!-- Dynamic Avatar -->
          <div class="dynamic-avatar" style="background-color: <?php echo $avatar_color; ?>;">
             <?php echo $initials; ?>
          </div>
        </div>
      </a>
      <ul class="dropdown-menu dropdown-menu-end">
        <li>
          <a class="dropdown-item" href="user_profile.php">
            <div class="d-flex">
              <div class="flex-shrink-0 me-3">
                <div class="avatar avatar-online">
                  <div class="dynamic-avatar" style="background-color: <?php echo $avatar_color; ?>;">
                     <?php echo $initials; ?>
                  </div>
                </div>
              </div>
              <div class="flex-grow-1">
                <h6 class="mb-0 text-bold"><?php echo htmlspecialchars($fname." ".$lname);?></h6>
                <small class="text-body-secondary">Admin</small>
              </div>
            </div>
          </a>
        </li>
        <li>
          <div class="dropdown-divider my-1"></div>
        </li>
        <li>
          <a class="dropdown-item" href="user_profile.php"> <i class="icon-base bx bx-user icon-md me-3 text-primary"></i><span>My Profile</span> </a>
        </li>
        <li>
          <a class="dropdown-item" href="#settings"> <i class="icon-base bx bx-cog icon-md me-3 text-secondary"></i><span>Settings</span> </a>
        </li>
        <li>
          <a class="dropdown-item" href="#partnership">
            <span class="d-flex align-items-center align-middle">
              <i class="flex-shrink-0 icon-base bx bx-credit-card icon-md me-3 text-success"></i><span class="flex-grow-1 align-middle">Partnership</span>
              <span class="flex-shrink-0 badge rounded-pill bg-danger">4</span>
            </span>
          </a>
        </li>
        <li>
          <div class="dropdown-divider my-1"></div>
        </li>
        <li>
          <a class="dropdown-item" href="#give"> <i class="icon-base bx bx-heart icon-md me-3 text-danger"></i><span>Giving</span> </a>
        </li>
        <li>
          <a class="dropdown-item" href="#manual"> <i class="icon-base bx bx-book-open icon-md me-3 text-info"></i><span>System Manual</span> </a>
        </li>
        <li>
          <div class="dropdown-divider my-1"></div>
        </li>
        <li>
          <a class="dropdown-item" href="javascript::void(0)" onclick="confirmLogout()"> <i class="icon-base bx bx-power-off icon-md me-3 text-danger"></i><span class="text-danger fw-medium">Log Out</span> </a>
        </li>
      </ul>
    </li>
    <!--/ User -->
  
</ul>
</div>
</nav>

<!-- Include SweetAlert2 CDN if not already included -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
function confirmLogout() {
    Swal.fire({
        title: 'Are you sure you want to logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Logout',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        backdrop: `rgba(0,0,0,0.4)`
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'manage/signout.php';
        }
    });
}
</script>
<div class="toast-container" id="toastContainer" style="z-index:1800;">
   <div class="bs-toast toast" id="toastElement" aria-live="assertive" aria-atomic="true" role="alert" style="z-index:1800;"></div>
</div>