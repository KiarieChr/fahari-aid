<?php 
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');

$title = "Dashboard|Jesus Enthroned Network";
include("includes/get_user.php");
?>


<!doctype html>
<html lang="en"
  class="layout-navbar-fixed layout-menu-fixed layout-compact"
  dir="ltr"
  data-skin="default"
  data-assets-path="assets/"
  data-template="vertical-menu-template"
  data-bs-theme="light">
    <?php @include('includes/header.php');?>
  <head>
    <link rel="stylesheet" href="assets/vendor/css/pages/app-calendar.css" />
    <link rel="stylesheet" href="assets/vendor/libs/fullcalendar/fullcalendar.css" />
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --success-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            --info-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }

        /* Improved Card Design */
        .dashboard-card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            overflow: hidden;
        }

        .dashboard-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .card-gradient {
            position: relative;
            background: var(--primary-gradient);
            color: white;
        }

        .card-gradient::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: rgba(255,255,255,0.3);
        }

        /* Statistics Cards */
        .stat-card {
            border-radius: 12px;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }

        .stat-card .icon-wrapper {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            color: white;
        }

        .stat-card .stat-number {
            font-size: 2rem;
            font-weight: 700;
            margin: 10px 0;
        }

        .stat-card .stat-title {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-bottom: 5px;
        }

        .stat-card .stat-change {
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        /* Welcome Card */
        .welcome-card {
            background: white;
            color: #2b2c40;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
        }

        .welcome-card::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }

        .welcome-card .greeting {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .welcome-card .message {
            opacity: 0.9;
            line-height: 1.6;
        }

        /* Progress Bar */
        .progress-container {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
        }

        .progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }

        .progress-bar-custom {
            height: 8px;
            border-radius: 4px;
            background: rgba(255,255,255,0.2);
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: white;
            border-radius: 4px;
            transition: width 1s ease;
        }

        /* Tab Navigation */
        .nav-tabs-custom {
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 0;
        }

        .nav-tabs-custom .nav-link {
            border: none;
            border-bottom: 3px solid transparent;
            padding: 12px 20px;
            color: #6c757d;
            font-weight: 500;
            transition: all 0.3s;
            border-radius: 8px 8px 0 0;
            margin-right: 5px;
        }

        .nav-tabs-custom .nav-link:hover {
            color: #667eea;
            background: rgba(102, 126, 234, 0.05);
        }

        .nav-tabs-custom .nav-link.active {
            color: #667eea;
            border-bottom: 3px solid #667eea;
            background: rgba(102, 126, 234, 0.05);
        }

        /* Table Improvements */
        .table-striped-custom tbody tr:nth-of-type(odd) {
            background-color: rgba(102, 126, 234, 0.02);
        }

        .table-hover-custom tbody tr:hover {
            background-color: rgba(102, 126, 234, 0.05);
        }

        /* Avatar Styles */
        .avatar-online::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: 0;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #43e97b;
            border: 2px solid white;
        }

        /* Button Improvements */
        .btn-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .btn-gradient:hover {
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        /* Dashboard Grid */
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        /* Quick Actions */
        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .action-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: white;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            transition: all 0.3s ease;
            text-decoration: none;
            color: #495057;
        }

        .action-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-color: #667eea;
            color: #667eea;
        }

        .action-btn i {
            font-size: 1.5rem;
            margin-bottom: 10px;
        }

        /* Loading Animation */
        .loading-shimmer {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
            .welcome-card .greeting {
                font-size: 1.5rem;
            }
            
            .stat-card .stat-number {
                font-size: 1.5rem;
            }
            
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Notification Badge */
        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #f5576c;
            color: white;
            font-size: 0.7rem;
            padding: 2px 6px;
            border-radius: 10px;
            min-width: 20px;
            text-align: center;
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }

        /* Chart Container */
        .chart-container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        /* Birthdays Section */
        .birthday-card {
            background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
            border-radius: 15px;
            padding: 20px;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .birthday-card::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }

        /* Glassmorphism overrides */
        .glass-card {
            background: rgba(255, 255, 255, 0.45) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 16px !important;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.08) !important;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            overflow: hidden;
            color: #1e293b !important;
        }

        .glass-card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.15) !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
        }

        .glass-welcome {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.25) !important;
            border-radius: 20px !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
            color: #1e293b !important;
        }

        .glass-stat {
            background: rgba(255, 255, 255, 0.5) !important;
            backdrop-filter: blur(15px) !important;
            -webkit-backdrop-filter: blur(15px) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 16px !important;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04) !important;
            transition: all 0.25s ease !important;
            color: #1e293b !important;
        }

        .glass-stat:hover {
            transform: translateY(-4px) !important;
            border-color: rgba(99, 102, 241, 0.4) !important;
        }

        .suggestion-box {
            background: rgba(99, 102, 241, 0.08) !important;
            border-left: 4px solid #6366f1 !important;
            border-radius: 8px !important;
            padding: 12px 16px !important;
            margin-top: 15px !important;
            font-size: 0.88rem !important;
            color: #475569 !important;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }

        .suggestion-box.warning {
            background: rgba(245, 158, 11, 0.08) !important;
            border-left-color: #f59e0b !important;
            color: #475569 !important;
        }

        .suggestion-box.success {
            background: rgba(16, 185, 129, 0.08) !important;
            border-left-color: #10b981 !important;
            color: #475569 !important;
        }

        .suggestion-icon {
            font-size: 1.1rem;
            margin-top: 2px;
        }

        .people-know-card {
            border-radius: 12px !important;
            padding: 10px !important;
            transition: background 0.2s !important;
        }

        .people-know-card:hover {
            background: rgba(255, 255, 255, 0.8) !important;
        }

        /* Make tab content transparent and full width to match cells.php layout style */
        .tab-content {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            border: none !important;
        }

   
        .birthday-card-container {
            perspective: 1000px;
        }

        .birthday-card {
            width: 100%;
            max-width: 400px;
            height: 300px;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.8s;
        }

        .birthday-card:hover {
            transform: rotateY(10deg);
        }

        .card-front {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            padding: 20px;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .birthday-balloons {
            position: absolute;
            top: 20px;
            width: 100%;
            display: flex;
            justify-content: space-around;
        }

        .balloon {
            width: 30px;
            height: 40px;
            border-radius: 50%;
            position: relative;
        }

        .balloon:after {
            content: "";
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 2px;
            height: 15px;
            background: rgba(0, 0, 0, 0.2);
        }

        .balloon1 { background: #ff6b6b; }
        .balloon2 { background: #4ecdc4; }
        .balloon3 { background: #ffd166; }
        .balloon4 { background: #6a0572; }

        .birthday-cake {
            position: relative;
            margin: 20px 0;
        }

        .cake-base {
            width: 80px;
            height: 30px;
            background: #f8c5c5;
            border-radius: 5px;
        }

        .cake-top {
            width: 90px;
            height: 25px;
            background: #f19090;
            border-radius: 50% 50% 0 0;
            position: relative;
            top: -5px;
            left: -5px;
        }

        .candle {
            width: 8px;
            height: 25px;
            background: #fdfd96;
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 5px;
        }

        .flame {
            width: 15px;
            height: 15px;
            background: #ff9d00;
            border-radius: 50% 50% 20% 20%;
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            animation: flicker 1.5s infinite alternate;
        }

        @keyframes flicker {
            0% { opacity: 0.8; transform: translateX(-50%) scale(1); }
            100% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }

        .birthday-greeting {
            color: #6a0572;
            font-weight: bold;
            margin-bottom: 5px;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.7);
        }

        .birthday-name {
            color: #333;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .birthday-date {
            color: #6a0572;
            font-weight: 500;
        }

        .birthday-info-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        .info-item {
            padding-bottom: 10px;
            border-bottom: 1px dashed #eee;
        }

        .info-item:last-child {
            border-bottom: none;
        }
        </style>
  </head>
  <body>
    <!-- Layout wrapper -->
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <!-- Menu -->
         <?php
          @include('includes/sidebar.php');
          ?>
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
          <?php
          @include('includes/nav.php');
          @include('modals/dashboard.php');
          ?>

          <!-- / Navbar -->

          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
              <div class="nav-align-top px-1">
                <ul class="nav nav-tabs flex-column flex-sm-row mb-4 gap-2 nav-tabs-custom" role="tablist">
                      <li class="nav-item" role="presentation">
                        <a class="nav-link active" data-bs-toggle="tab" href="#dashboard" role="tab">
                          <i class="bx bx-home me-2"></i>My Dashboard
                        </a>
                      </li>
                      <li class="nav-item" role="presentation">
                        <a class="nav-link" data-bs-toggle="tab" href="#my-cell" role="tab">
                          <i class="bx bx-group me-2"></i>My Cell
                        </a>
                      </li>
                      <?php if (userHasPermission($db, $user_id, 'view_meeting')): ?>
                      <li class="nav-item" role="presentation">
                        <a class="nav-link" data-bs-toggle="tab" href="#attendance" role="tab">
                          <i class="bx bx-check-circle me-2"></i>Attendance
                        </a>
                      </li>
                      <?php endif; ?>
                      <li class="nav-item" role="presentation">
                        <a class="nav-link" data-bs-toggle="tab" href="#my-pledge" role="tab">
                          <i class="bx bx-dollar-circle me-2"></i>My Pledges
                        </a>
                      </li>
                      <li class="nav-item" role="presentation">
                        <a class="nav-link" data-bs-toggle="tab" href="#my-birthday" role="tab">
                          <i class="bx bx-cake me-2"></i>My Birthday
                        </a>
                      </li>
                      <?php if (userHasPermission($db, $user_id, 'view_meeting')): ?>
                      <li class="nav-item" role="presentation">
                        <a class="nav-link" data-bs-toggle="tab" href="#upcoming-birthdays" role="tab">
                          <i class="bx bx-gift me-2"></i>Upcoming Birthdays
                        </a>
                      </li>
                      <?php endif; ?>
                </ul>
              </div>

              <div class="tab-content bg-transparent shadow-none border-0 p-0 mt-1">

                <div class="tab-pane fade show active" id="dashboard" role='tabpanel'>
                   <?php
                      // 1. Calculate Pledges and Redemptions for the current user
                      $user_fullname = $fname . ' ' . $lname;
                      $user_email = $_SESSION['user_email'] ?? '';

                      $pledges_query = $db->prepare("SELECT COALESCE(SUM(pledges_amount), 0) as total_pledges FROM pledges WHERE TRIM(full_name) = :fullname OR email = :email");
                      $pledges_query->execute([':fullname' => $user_fullname, ':email' => $user_email]);
                      $user_total_pledges = (float)$pledges_query->fetchColumn();

                      $redeem_query = $db->prepare("
                          SELECT COALESCE(SUM(pr.redeemed_amount), 0) as total_redeemed 
                          FROM pledges_redeem pr
                          JOIN pledges p ON pr.pledge_id = p.id
                          WHERE TRIM(p.full_name) = :fullname OR pr.email = :email
                      ");
                      $redeem_query->execute([':fullname' => $user_fullname, ':email' => $user_email]);
                      $user_total_redeemed = (float)$redeem_query->fetchColumn();

                      $user_remaining_pledges = max(0, $user_total_pledges - $user_total_redeemed);
                      $pledge_percentage = ($user_total_pledges > 0) ? ($user_total_redeemed / $user_total_pledges) * 100 : 0;

                      // 2. Calculate Contributions using the collections + non-duplicated pledges_redeem
                      $collections_query = $db->prepare("SELECT COALESCE(SUM(amount), 0) FROM collections WHERE TRIM(payee) = :payee AND (cancelled = 0 OR cancelled IS NULL)");
                      $collections_query->execute([':payee' => $user_fullname]);
                      $user_total_collections = (float)$collections_query->fetchColumn();

                      $non_dup_redeem_query = $db->prepare("
                          SELECT COALESCE(SUM(pr.redeemed_amount), 0) 
                          FROM pledges_redeem pr
                          JOIN pledges p ON pr.pledge_id = p.id
                          LEFT JOIN collections c ON c.collection_type = 'pledges' AND c.doc_reference = pr.id
                          WHERE c.id IS NULL AND (TRIM(p.full_name) = :fullname OR pr.email = :email)
                      ");
                      $non_dup_redeem_query->execute([':fullname' => $user_fullname, ':email' => $user_email]);
                      $user_total_non_dup_redeem = (float)$non_dup_redeem_query->fetchColumn();

                      $user_total_contributions = $user_total_collections + $user_total_non_dup_redeem;

                        // 3. Query Cell Details
                    $get_cell_info = "
                        SELECT c.name as cell_name, c.code, m.first_name as leader_fname, m.last_name as leader_lname, m.phone_no as leader_phone
                        FROM member u_mem
                        JOIN cells c ON u_mem.cell_id = c.id
                        LEFT JOIN member m ON c.cell_leader = m.id
                        WHERE u_mem.id = :member_id
                    ";
                      $cell_stmt = $db->prepare($get_cell_info);
                      $cell_stmt->execute([':member_id' => $member_id]);
                      $user_cell = $cell_stmt->fetch(PDO::FETCH_ASSOC);

                      // 4. Query "People You May Know" from the same area/location
                      $people_you_may_know = [];
                      $is_location_match = false;
                      if (!empty($location)) {
                          $people_query = $db->prepare("
                              SELECT id, first_name, last_name, photo, location, phone_no 
                              FROM member 
                              WHERE TRIM(LOWER(location)) = TRIM(LOWER(:location)) 
                                AND id != :member_id 
                                AND (delete_status = 0 OR delete_status IS NULL) 
                              LIMIT 4
                          ");
                          $people_query->execute([':location' => $location, ':member_id' => $member_id]);
                          $people_you_may_know = $people_query->fetchAll(PDO::FETCH_ASSOC);
                          if (!empty($people_you_may_know)) {
                              $is_location_match = true;
                          }
                      }
                      
                      // Fallback if no matching location members
                      if (empty($people_you_may_know)) {
                          $people_query = $db->prepare("
                              SELECT id, first_name, last_name, photo, location, phone_no 
                              FROM member 
                              WHERE id != :member_id 
                                AND (delete_status = 0 OR delete_status IS NULL) 
                              ORDER BY joined_on DESC 
                              LIMIT 4
                          ");
                          $people_query->execute([':member_id' => $member_id]);
                          $people_you_may_know = $people_query->fetchAll(PDO::FETCH_ASSOC);
                      }

                      // 5. User Avatar Path Resolution
                      $avatarPath = '';
                      if (!empty($photo)) {
                          $testPath = 'assets/user_img/' . $photo;
                          if (file_exists(__DIR__ . '/' . $testPath)) {
                              $avatarPath = $testPath;
                          }
                      }

                      // 6. Upcoming Events & Meetings (Next 5)
                      $upcoming_events_stmt = $db->query("
                          SELECT id, ename as title, start_date as event_date, 'event' as type 
                          FROM event 
                          WHERE start_date >= CURDATE() AND (delete_status = 0 OR delete_status IS NULL)
                          ORDER BY start_date ASC 
                          LIMIT 5
                      ");
                      $upcoming_events = $upcoming_events_stmt->fetchAll(PDO::FETCH_ASSOC);

                      $upcoming_meetings_stmt = $db->query("
                          SELECT id, name as title, start_time as event_date, 'meeting' as type 
                          FROM meeting 
                          WHERE start_time >= CURDATE() 
                          ORDER BY start_time ASC 
                          LIMIT 5
                      ");
                      $upcoming_meetings = $upcoming_meetings_stmt->fetchAll(PDO::FETCH_ASSOC);
                      
                      $upcoming_all = array_merge($upcoming_events, $upcoming_meetings);
                      usort($upcoming_all, function($a, $b) {
                          return strtotime($a['event_date']) - strtotime($b['event_date']);
                      });
                      $upcoming_all = array_slice($upcoming_all, 0, 5);
                   ?>

                    <!-- Page Header -->
                    <div class="card glass-card mb-4 border-0 shadow-xs p-4" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                        <div class="d-flex align-items-center gap-3">
                          <div class="avatar avatar-md bg-gradient-primary rounded text-white d-flex align-items-center justify-content-center shadow-xs" style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <i class="bx bx-home-alt fs-3"></i>
                          </div>
                          <div>
                            <h4 class="mb-1 fw-bold text-heading" style="color: #1e1b4b; font-size: 1.5rem;">My Spiritual Dashboard</h4>
                            <p class="text-muted mb-0 small" style="font-size: 0.88rem;">Real-time fellowship growth, cell connections, schedules, and active ministries.</p>
                          </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                          <span class="badge bg-label-primary px-3 py-2 rounded-pill fw-semibold" style="font-size: 0.85rem; background-color: rgba(102, 126, 234, 0.15); color: #667eea;">
                            <i class="bx bx-calendar-event me-1"></i> <?= date('F j, Y'); ?>
                          </span>
                          <span class="badge bg-label-info px-3 py-2 rounded-pill fw-semibold" style="font-size: 0.85rem; background-color: rgba(0, 242, 254, 0.1); color: #00b4d8;">
                            <i class="bx bx-time-five me-1"></i> Africa/Nairobi
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Welcome section -->
                    <div class="row mb-4">
                      <div class="col-12">
                        <div class="welcome-card glass-welcome p-4 d-flex flex-column justify-content-between">
                          <div class="row align-items-center">
                            <div class="col-lg-9">
                              <?php
                              $h = date('G');
                              if($h >= 5 && $h <= 11) {
                                  $msg = "Good Morning";
                              } else if($h >= 12 && $h <= 15) {
                                  $msg = "Good Afternoon";
                              } else {
                                  $msg = "Good Evening";
                              }
                              ?>
                              <h1 class="greeting mb-3" style="font-size: 2.2rem; font-weight: 700; color: #1e1b4b;"><?= htmlspecialchars($msg); ?>, <?= htmlspecialchars($fname); ?>! 👋</h1>
                              <p class="message mb-4" style="color: #475569; font-size: 1.05rem; line-height: 1.6;">
                                You are blessed, highly favored, and have a godly heritage. The desire of nations is fulfilled in you. Have a blessed day!
                              </p>
                              
                              <!-- Quick Actions -->
                              <div class="quick-actions">
                                <a href="#" class="action-btn glass-card">
                                  <i class="bx bx-calendar-check text-primary"></i>
                                  <span class="fw-semibold">Today's Meetings</span>
                                </a>
                                
                                <?php
                                $get_leader = "SELECT * FROM cells WHERE cell_leader = :member_id";
                                $get = $db->prepare($get_leader);
                                $get->bindParam(":member_id", $member_id, PDO::PARAM_INT);
                                $get->execute();
                                $leader = $get->fetch(PDO::FETCH_ASSOC);
                                
                                if($leader):
                                ?>
                                <a href="javascript:void(0)" class="action-btn glass-card" data-bs-toggle="modal" data-bs-target="#showAttendance">
                                  <i class="bx bx-list-check text-success"></i>
                                  <span class="fw-semibold">Check Attendance</span>
                                </a>
                                <?php @include('modals/attendance-s.php'); ?>
                                <?php endif; ?>
                                
                                <a href="#" class="action-btn glass-card">
                                  <i class="bx bx-church text-info"></i>
                                  <span class="fw-semibold">My Cell</span>
                                </a>
                                
                                <a href="#" class="action-btn glass-card">
                                  <i class="bx bx-bar-chart text-warning"></i>
                                  <span class="fw-semibold">Reports</span>
                                </a>
                              </div>
                            </div>
                            <div class="col-lg-3 text-center mt-4 mt-lg-0">
                              <div class="position-relative d-inline-block">
                                <div class="avatar avatar-xxl" style="width: 130px; height: 130px;">
                                  <?php if (!empty($avatarPath)): ?>
                                    <img src="<?= $avatarPath; ?>" alt="User Profile" class="rounded-circle shadow-lg" style="width: 130px; height: 130px; object-fit: cover; border: 4px solid rgba(255,255,255,0.75);">
                                  <?php else: ?>
                                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-gradient-primary text-white shadow-lg mx-auto" style="width: 130px; height: 130px; border: 4px solid rgba(255,255,255,0.75); font-size: 2.5rem; font-weight: 700;">
                                      <?= strtoupper(substr($fname, 0, 1) . substr($lname, 0, 1)); ?>
                                    </div>
                                  <?php endif; ?>
                                  <span class="avatar-online" style="bottom: 8px; right: 8px; width: 14px; height: 14px; border: 3px solid #fff;"></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Upcoming Events & Meetings -->
                    <div class="row mb-4">
                      <div class="col-12">
                        <div class="card glass-card p-4">
                          <h5 class="fw-bold mb-4" style="color: #1e1b4b;"><i class="bx bx-calendar-star text-primary me-2"></i>Upcoming Events & Meetings</h5>
                          <?php if (empty($upcoming_all)): ?>
                              <div class="text-muted"><i class="bx bx-info-circle me-1"></i>No upcoming events or meetings scheduled at the moment.</div>
                          <?php else: ?>
                              <div class="list-group list-group-flush border-0">
                                <?php foreach ($upcoming_all as $item): 
                                    $is_event = $item['type'] === 'event';
                                    $icon = $is_event ? 'bx-calendar-event text-primary' : 'bx-group text-success';
                                    $link = $is_event ? "event_checkin.php?event_id={$item['id']}" : "attendance.php?id={$item['id']}";
                                    $date_str = date('D, M j, Y g:i A', strtotime($item['event_date']));
                                ?>
                                  <div class="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0 border-bottom py-3">
                                    <div class="d-flex align-items-center">
                                      <div class="avatar avatar-sm me-3 rounded d-flex align-items-center justify-content-center" style="background-color: rgba(102, 126, 234, 0.1);">
                                          <i class="bx <?= $icon ?> fs-4"></i>
                                      </div>
                                      <div>
                                        <h6 class="mb-0 fw-bold" style="color: #1e1b4b;"><?= htmlspecialchars($item['title']) ?> <span class="badge bg-label-secondary ms-2" style="font-size:0.7rem;"><?= ucfirst($item['type']) ?></span></h6>
                                        <small class="text-muted"><i class="bx bx-time me-1"></i><?= $date_str ?></small>
                                      </div>
                                    </div>
                                    <a href="<?= $link ?>" class="btn btn-sm btn-outline-primary rounded-pill fw-semibold">
                                        <i class="bx bx-check-circle me-1"></i>Mark Attendance
                                    </a>
                                  </div>
                                <?php endforeach; ?>
                              </div>
                          <?php endif; ?>
                        </div>
                      </div>
                    </div>

                    <!-- Improved Dynamic Stats & Suggestions Grid -->
                    <div class="row mb-4">
                      <!-- Monthly Attendance Stats Card -->
                      <div class="col-lg-3 col-md-6 mb-3">
                        <div class="card glass-card p-4 h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div class="d-flex align-items-center mb-3">
                              <div class="icon-wrapper bg-primary shadow-sm" style="border-radius: 12px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; color: white;">
                                <i class="bx bx-check-circle fs-4"></i>
                              </div>
                              <div class="ms-3">
                                <h6 class="stat-title mb-0 fw-bold" style="color: #475569;">Monthly Attendance</h6>
                                <?php
                                $mid = $db->prepare("SELECT * FROM users WHERE id = :id");
                                $mid->execute([':id' => $user_id]);
                                $member = $mid->fetch(PDO::FETCH_ASSOC);
                                $member_id = $member['member_id'];
                                
                                $attd = "SELECT COUNT(*) as attendance FROM attendance WHERE member_id = :member_id 
                                         AND MONTH(login_time) = MONTH(CURRENT_DATE())
                                         AND YEAR(login_time) = YEAR(CURRENT_DATE())";
                                $attended = $db->prepare($attd);
                                $attended->bindParam(':member_id', $member_id, PDO::PARAM_INT);
                                $attended->execute();
                                $res = $attended->fetch(PDO::FETCH_ASSOC);
                                $mattend = $res['attendance'];
                                
                                $meet = $db->query("SELECT COUNT(*) as meetings FROM meeting 
                                                   WHERE MONTH(start_time) = MONTH(CURRENT_DATE()) 
                                                   AND YEAR(start_time) = YEAR(CURRENT_DATE())");
                                $meeting = $meet->fetch(PDO::FETCH_OBJ);
                                $meetings = $meeting->meetings ?? 0;
                                
                                $percentage = ($meetings > 0) ? ($mattend / $meetings) * 100 : 0;
                                ?>
                                <div class="stat-number fw-bold" style="font-size: 1.8rem; color: #1e1b4b;"><?= $mattend; ?>/<?= $meetings; ?></div>
                              </div>
                            </div>
                            
                            <!-- Progress Bar -->
                            <div class="progress-container bg-opacity-10 bg-secondary" style="border-radius: 10px; padding: 12px;">
                              <div class="progress-label fw-semibold" style="color: #475569;">
                                <span>Attendance Rate</span>
                                <span><?= round($percentage, 1); ?>%</span>
                              </div>
                              <div class="progress-bar-custom bg-opacity-20 bg-secondary" style="height: 6px; border-radius: 3px; overflow: hidden; margin-top: 6px;">
                                <div class="progress-fill bg-primary" style="width: <?= $percentage; ?>%; height: 100%; border-radius: 3px;"></div>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Dynamic Attendance Suggestion -->
                          <div>
                            <?php if ($percentage >= 80): ?>
                              <div class="suggestion-box success">
                                <i class="bx bx-check-double suggestion-icon"></i>
                                <div><strong>🌟 Praise:</strong> Excellent consistency! Keep growing in grace. Invite a cell mate to the next session.</div>
                              </div>
                            <?php elseif ($percentage >= 50): ?>
                              <div class="suggestion-box warning">
                                <i class="bx bx-bulb suggestion-icon"></i>
                                <div><strong>💡 Suggestion:</strong> Try setting a calendar reminder 15 minutes before the next service to maintain standard consistency.</div>
                              </div>
                            <?php else: ?>
                              <div class="suggestion-box warning">
                                <i class="bx bx-error suggestion-icon"></i>
                                <div><strong>⚠️ Action Required:</strong> Low attendance rate. Fellowship builds spiritual strength. Reach out to your cell leader if you face connectivity issues.</div>
                              </div>
                            <?php endif; ?>
                          </div>
                        </div>
                      </div>

                      <!-- Finance (Pledges) Stats Card -->
                      <div class="col-lg-3 col-md-6 mb-3">
                        <div class="card glass-card p-4 h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div class="d-flex align-items-center mb-3">
                              <div class="icon-wrapper bg-success shadow-sm" style="border-radius: 12px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; color: white;">
                                <i class="bx bx-gift fs-4"></i>
                              </div>
                              <div class="ms-3">
                                <h6 class="stat-title mb-0 fw-bold" style="color: #475569;">Partnership Pledges</h6>
                                <div class="stat-number fw-bold" style="font-size: 1.4rem; color: #1e1b4b;">
                                  KES <?= number_format($user_total_redeemed); ?> <span style="font-size: 0.9rem; font-weight: normal; color: #64748b;">/ KES <?= number_format($user_total_pledges); ?></span>
                                </div>
                              </div>
                            </div>
                            
                            <!-- Progress Bar -->
                            <div class="progress-container bg-opacity-10 bg-secondary" style="border-radius: 10px; padding: 12px; margin-top: 10px;">
                              <div class="progress-label fw-semibold" style="color: #475569;">
                                <span>Redeemed Rate</span>
                                <span><?= round($pledge_percentage, 1); ?>%</span>
                              </div>
                              <div class="progress-bar-custom bg-opacity-20 bg-secondary" style="height: 6px; border-radius: 3px; overflow: hidden; margin-top: 6px;">
                                <div class="progress-fill bg-success" style="width: <?= $pledge_percentage; ?>%; height: 100%; border-radius: 3px;"></div>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Pledges Suggestion -->
                          <div>
                            <?php if ($user_total_pledges == 0): ?>
                              <div class="suggestion-box">
                                <i class="bx bx-coin-stack suggestion-icon text-primary"></i>
                                <div><strong>💡 Giving Tip:</strong> Sponsor upcoming outreaches and ministry expansion. Make a pledge in the **My Pledges** tab.</div>
                              </div>
                            <?php elseif ($user_remaining_pledges > 0): ?>
                              <div class="suggestion-box warning">
                                <i class="bx bx-bell suggestion-icon"></i>
                                <div><strong>📢 Reminder:</strong> You have KES <?= number_format($user_remaining_pledges); ?> remaining. Fulfill your faith commitment via M-Pesa.</div>
                              </div>
                            <?php else: ?>
                              <div class="suggestion-box success">
                                <i class="bx bx-check-circle suggestion-icon"></i>
                                <div><strong>🌟 Faithfulness:</strong> Pledges fully redeemed! Your partnership advances the Kingdom work. Thank you!</div>
                              </div>
                            <?php endif; ?>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Finance (Collections) Stats Card -->
                      <div class="col-lg-3 col-md-6 mb-3">
                        <div class="card glass-card p-4 h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div class="d-flex align-items-center mb-3">
                              <div class="icon-wrapper bg-info shadow-sm" style="border-radius: 12px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; color: white;">
                                <i class="bx bx-wallet fs-4"></i>
                              </div>
                              <div class="ms-3">
                                <h6 class="stat-title mb-0 fw-bold" style="color: #475569;">My Total Contributions</h6>
                                <div class="stat-number fw-bold" style="font-size: 1.7rem; color: #1e1b4b;">
                                  KES <?= number_format($user_total_contributions); ?>
                                </div>
                              </div>
                            </div>
                            <p style="color: #64748b; font-size: 0.85rem; margin-top: 10px;">
                              This combines tithes, offerings, seed sowing, and partnership redemptions logged in the collections ledger.
                            </p>
                          </div>
                          
                          <!-- Contributions Suggestion -->
                          <div>
                            <div class="suggestion-box success">
                              <i class="bx bx-heart-circle suggestion-icon"></i>
                              <div><strong>🌟 Stewardship:</strong> "Give, and it shall be given unto you." Thank you for supporting the ministry work!</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Cell Management Stats Card -->
                      <div class="col-lg-3 col-md-6 mb-3">
                        <div class="card glass-card p-4 h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div class="d-flex align-items-center mb-3">
                              <div class="icon-wrapper bg-warning shadow-sm" style="border-radius: 12px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; color: white;">
                                <i class="bx bx-home-heart fs-4"></i>
                              </div>
                              <div class="ms-3">
                                <h6 class="stat-title mb-0 fw-bold" style="color: #475569;">My Cell Fellowship</h6>
                                <div class="stat-number fw-bold" style="font-size: 1.2rem; color: #1e1b4b;">
                                  <?= !empty($user_cell) ? htmlspecialchars($user_cell['cell_name']) : 'Not Assigned'; ?>
                                </div>
                                <small class="text-muted"><?= !empty($user_cell) ? 'Code: ' . htmlspecialchars($user_cell['code']) : ''; ?></small>
                              </div>
                            </div>
                            
                            <?php if (!empty($user_cell)): ?>
                              <div class="mt-2" style="font-size: 0.88rem; color: #475569;">
                                <strong>Cell Leader:</strong> <?= htmlspecialchars($user_cell['leader_fname'] . ' ' . $user_cell['leader_lname']); ?><br>
                                <strong>Contact:</strong> <?= htmlspecialchars($user_cell['leader_phone']); ?>
                              </div>
                            <?php endif; ?>
                          </div>
                          
                          <!-- Cell Suggestion -->
                          <div>
                            <?php if (empty($user_cell)): ?>
                              <div class="suggestion-box warning">
                                <i class="bx bx-error-circle suggestion-icon"></i>
                                <div><strong>🏠 Alert:</strong> You are not registered in any cell group. Fellowship is key to your spiritual growth. Contact administrator.</div>
                              </div>
                            <?php else: ?>
                              <div class="suggestion-box success">
                                <i class="bx bx-chat suggestion-icon"></i>
                                <div><strong>🏠 Action:</strong> Fellowship strengthens faith. Contact your leader to verify cell schedule or share testimony.</div>
                              </div>
                            <?php endif; ?>
                          </div>
                        </div>
                      </div>
                    </div>

                   <!-- People You May Know (Location-based Social Recommendations) -->
                   <div class="card glass-card p-4 mb-4">
                     <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
                       <div>
                         <h5 class="fw-bold mb-0 text-dark">
                           <i class="bx bx-group text-primary me-2"></i>
                           <?php if ($is_location_match): ?>
                             People You May Know in <?= htmlspecialchars($location); ?>
                           <?php else: ?>
                             Discover Fellow Members
                           <?php endif; ?>
                         </h5>
                         <p class="text-muted mb-0 small">Connect with fellow church members to grow your spiritual network.</p>
                       </div>
                       <?php if ($is_location_match): ?>
                         <span class="badge bg-label-success">Location Match</span>
                       <?php else: ?>
                         <span class="badge bg-label-primary">Recent Joins</span>
                       <?php endif; ?>
                     </div>
                     
                     <div class="row">
                       <?php if (!empty($people_you_may_know)): ?>
                         <?php foreach ($people_you_may_know as $person): 
                           $person_name = htmlspecialchars($person['first_name'] . ' ' . $person['last_name']);
                           $person_loc = htmlspecialchars($person['location'] ?? 'N/A');
                           $person_avatar = '';
                           if (!empty($person['photo'])) {
                               $testP = 'assets/user_img/' . $person['photo'];
                               if (file_exists(__DIR__ . '/' . $testP)) {
                                   $person_avatar = $testP;
                               }
                           }
                         ?>
                           <div class="col-lg-3 col-sm-6 mb-3">
                             <div class="people-know-card d-flex align-items-center p-3 border rounded-3 bg-white bg-opacity-40">
                               <div class="avatar me-3">
                                 <?php if (!empty($person_avatar)): ?>
                                   <img src="<?= $person_avatar; ?>" alt="Member Profile" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">
                                 <?php else: ?>
                                   <div class="rounded-circle d-flex align-items-center justify-content-center bg-label-primary text-primary fw-bold" style="width: 40px; height: 40px; font-size: 0.95rem;">
                                     <?= strtoupper(substr($person['first_name'], 0, 1) . substr($person['last_name'], 0, 1)); ?>
                                   </div>
                                 <?php endif; ?>
                               </div>
                               <div class="flex-grow-1 overflow-hidden">
                                 <h6 class="text-truncate mb-0" style="font-size: 0.9rem; font-weight: 600; color: #1e293b;"><?= $person_name; ?></h6>
                                 <small class="text-muted text-truncate d-block" style="font-size: 0.78rem;">
                                   <i class="bx bx-map-pin me-1"></i><?= $person_loc; ?>
                                 </small>
                               </div>
                               <div class="ms-2">
                                 <a href="tel:<?= htmlspecialchars($person['phone_no']); ?>" class="btn btn-sm btn-icon btn-label-primary rounded-circle" title="Call Member" style="width: 28px; height: 28px; display: inline-flex; justify-content: center; align-items: center; background: rgba(99, 102, 241, 0.1); border: none; color: #6366f1;">
                                   <i class="bx bx-phone" style="font-size: 0.9rem;"></i>
                                 </a>
                               </div>
                             </div>
                           </div>
                         <?php endforeach; ?>
                       <?php else: ?>
                         <div class="col-12 py-3 text-center text-muted">
                           <i class="bx bx-user-x fs-2 mb-2"></i>
                           <p class="mb-0">No other fellowship members found to recommend.</p>
                         </div>
                       <?php endif; ?>
                     </div>
                   </div>

                 

                  <!--Total Attendance -->
                  <?php if(userHasPermission($db,$user_id,'meeting_analysis')){
                    $years_stmt = $db->query("SELECT MIN(YEAR(login_time)) as min_yr, MAX(YEAR(login_time)) as max_yr FROM attendance");
                    $years_row = $years_stmt->fetch(PDO::FETCH_ASSOC);
                    $min_year = isset($years_row['min_yr']) ? (int)$years_row['min_yr'] : (int)date('Y');
                    $max_year = isset($years_row['max_yr']) ? (int)$years_row['max_yr'] : (int)date('Y');
                    $attendance_years = [];
                    for ($y = $max_year; $y >= $min_year; $y--) {
                        $attendance_years[] = $y;
                    }
                    if (empty($attendance_years)) {
                        $attendance_years[] = (int)date('Y');
                    }
                  ?>
             
                  <div class="col-md-12 col-xxl-12 order-2 order-md-3 order-xxl-2 mb-6 total-revenue">
                    <div class="card">
                      <div class="row row-bordered g-0">
                        <div class="col-lg-8">
                          <div class="card-header d-flex align-items-center justify-content-between">
                            <div class="card-title mb-0">
                              <h5 class="m-0 me-2">Attendance Report</h5>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                              <label for="attendanceYearSelect" class="form-label mb-0 text-muted small fw-medium">Year:</label>
                              <select id="attendanceYearSelect" class="form-select form-select-sm border-light-subtle shadow-xs" style="width: auto;">
                                <?php foreach ($attendance_years as $year): ?>
                                  <option value="<?php echo $year; ?>"><?php echo $year; ?></option>
                                <?php endforeach; ?>
                              </select>
                            </div>
                          </div>
                          <div id="attendanceChart" class="px-3"></div>
                        </div>
                        <div class="col-lg-4">
                          <div class="card-body px-xl-9 py-12 d-flex align-items-center flex-column">
                            

                            <div id="growthChart"></div>
                            <div class="text-center fw-medium my-6">
                              <?php
                              $today = date('Y-m-d');
                              $lastWeek = date('Y-m-d', strtotime('-7 days'));
                              $prevWeek = date('Y-m-d', strtotime('-14 days'));
                          
                              // Count for last 7 days
                              $stmt = $db->prepare("SELECT COUNT(*) FROM member WHERE joined_on BETWEEN :lastWeek AND :today");
                              $stmt->execute([':lastWeek' => $lastWeek, ':today' => $today]);
                              $increaseCount = $stmt->fetchColumn();
                          
                                                      // Count for the previous 7 days
                              $stmt2 = $db->prepare("SELECT COUNT(*) FROM member WHERE joined_on < :lastWeek");
                              $stmt2->execute([':lastWeek' => $lastWeek]);
                              $previousCount = $stmt2->fetchColumn();
                              if ($previousCount == 0 && $increaseCount > 0) {
                                $growthRate = 100; // avoid division by zero
                              } elseif ($previousCount == 0 && $increaseCount == 0) {
                                  $growthRate = 0;
                              } else {
                                  $growthRate = ($increaseCount / $previousCount) * 100;
                              }
                                ?>
                              <?= $growthRate;?>% Last 7 Days Growth
                            </div>

                            <div class="d-flex gap-11 justify-content-between">
                              <div class="d-flex">
                                <div class="avatar me-2">
                                  <span class="avatar-initial rounded-2 bg-label-primary"
                                    ><i class="icon-base bx bx-wallet icon-lg text-primary"></i
                                  ></span>
                                </div>
                                <div class="d-flex flex-column">
                                  <small>
                                  Last Week 7 Days Toll
                                  </small>
                                  <h6 class="mb-0"><?=$previousCount;?></h6>
                                </div>
                              </div>
                              <div class="d-flex">
                                <div class="avatar me-2">
                                  <span class="avatar-initial rounded-2 bg-label-info"
                                    ><i class="icon-base bx bx-wallet icon-lg text-info"></i
                                  ></span>
                                </div>
                                <div class="d-flex flex-column">
                                  <small>
                                    Current Toll
                                  </small>
                                  <h6 class="mb-0"><?= $previousCount + $increaseCount;?></h6>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <?php }?>
                 
                </div>
                <div class="tab-pane fade" id="calendar-schedule">
                  <!-- Calendar Tab Header -->
                  <div class="card glass-card mb-4 border-0 shadow-xs p-4" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                      <div class="d-flex align-items-center gap-3">
                        <div class="avatar avatar-md bg-gradient-success rounded text-white d-flex align-items-center justify-content-center shadow-xs" style="width: 50px; height: 50px; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                          <i class="bx bx-calendar fs-3"></i>
                        </div>
                        <div>
                          <h4 class="mb-1 fw-bold text-heading" style="color: #1e1b4b; font-size: 1.5rem;">Fellowship Calendar & Schedules</h4>
                          <p class="text-muted mb-0 small" style="font-size: 0.88rem;">Track church services, executive planning sessions, events, outreach, and holiday schedules.</p>
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-primary btn-sm px-4" data-bs-toggle="offcanvas" data-bs-target="#addEventSidebar">
                          <i class="bx bx-plus me-1"></i> Add Event
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="row g-0">
                    <!-- Calendar Sidebar -->
                    <div class="col app-calendar-sidebar border-end" id="app-calendar-sidebar">
                      <div class="border-bottom p-6 my-sm-0 mb-4">
                        <button class="btn btn-primary btn-toggle-sidebar w-100" data-bs-toggle="offcanvas" data-bs-target="#addEventSidebar" aria-controls="addEventSidebar">
                          <i class="icon-base bx bx-plus icon-16px me-2"></i>
                          <span class="align-middle">Add Event</span>
                        </button>
                      </div>
                      <div class="px-3 pt-2">
                        <!-- inline calendar (flatpicker) -->
                        <div class="inline-calendar"></div>
                      </div>
                      <hr class="mb-6 mx-n4 mt-3" />
                      <div class="px-6 pb-2">
                        <!-- Filter -->
                        <div>
                          <h5 class="mb-4">Event Filters</h5>
                        </div>

                        <div class="form-check form-check-secondary mb-5 ms-2">
                          <input class="form-check-input select-all" type="checkbox" id="selectAll" data-value="all" checked />
                          <label class="form-check-label" for="selectAll">View All</label>
                        </div>

                        <div class="app-calendar-events-filter text-heading">
                          <div class="form-check form-check-primary mb-5 ms-2">
                            <input class="form-check-input input-filter" type="checkbox" id="select-word-session" data-value="Word Session" checked />
                            <label class="form-check-label" for="select-word-session">Word Session</label>
                          </div>
                          <div class="form-check form-check-warning mb-5 ms-2">
                            <input class="form-check-input input-filter" type="checkbox" id="select-events" data-value="Jesus Enthroned Events" checked />
                            <label class="form-check-label" for="select-events">Jesus Enthroned Events</label>
                          </div>
                          <div class="form-check form-check-success mb-5 ms-2">
                            <input class="form-check-input input-filter" type="checkbox" id="select-planning" data-value="Planning" checked />
                            <label class="form-check-label" for="select-planning">Planning</label>
                          </div>
                          <div class="form-check form-check-danger mb-5 ms-2">
                            <input class="form-check-input input-filter" type="checkbox" id="select-holiday" data-value="Holiday" checked />
                            <label class="form-check-label" for="select-holiday">Holiday Tracking</label>
                          </div>
                          <div class="form-check form-check-info ms-2">
                            <input class="form-check-input input-filter" type="checkbox" id="select-etc" data-value="ETC" checked />
                            <label class="form-check-label" for="select-etc">ETC / Personal</label>
                          </div>
                        </div>
                      </div>

                      <?php
                      // Query upcoming schedules
                      $schedules_query = $db->query("
                          SELECT title, start_date, calendar_label 
                          FROM calendar 
                          WHERE start_date >= CURRENT_DATE() 
                          ORDER BY start_date ASC 
                          LIMIT 5
                      ");
                      $upcoming_schedules = $schedules_query->fetchAll(PDO::FETCH_ASSOC);

                      // If there are no future events, fallback to the 5 closest events to today
                      if (empty($upcoming_schedules)) {
                          $schedules_query = $db->query("
                              SELECT title, start_date, calendar_label 
                              FROM calendar 
                              ORDER BY ABS(DATEDIFF(start_date, CURRENT_DATE())) ASC 
                              LIMIT 5
                          ");
                          $upcoming_schedules = $schedules_query->fetchAll(PDO::FETCH_ASSOC);
                          // Sort them chronologically
                          usort($upcoming_schedules, function($a, $b) {
                              return strtotime($a['start_date']) - strtotime($b['start_date']);
                          });
                      }

                      // Query upcoming holidays
                      $holidays_query = $db->query("
                          SELECT title, start_date 
                          FROM calendar 
                          WHERE start_date >= CURRENT_DATE() 
                            AND calendar_label = 'Holiday' 
                          ORDER BY start_date ASC 
                          LIMIT 3
                      ");
                      $upcoming_holidays = $holidays_query->fetchAll(PDO::FETCH_ASSOC);

                      // Fallback if no upcoming holidays
                      if (empty($upcoming_holidays)) {
                          $holidays_query = $db->query("
                              SELECT title, start_date 
                              FROM calendar 
                              WHERE calendar_label = 'Holiday' 
                              ORDER BY ABS(DATEDIFF(start_date, CURRENT_DATE())) ASC 
                              LIMIT 3
                          ");
                          $upcoming_holidays = $holidays_query->fetchAll(PDO::FETCH_ASSOC);
                          usort($upcoming_holidays, function($a, $b) {
                              return strtotime($a['start_date']) - strtotime($b['start_date']);
                          });
                      }
                      ?>

                      <!-- Upcoming Schedules -->
                      <hr class="mb-6 mx-n4 mt-3" />
                      <div class="px-6 pb-4">
                        <h5 class="mb-4">Upcoming Schedules</h5>
                        <?php if (empty($upcoming_schedules)): ?>
                          <p class="text-muted small">No upcoming schedules.</p>
                        <?php else: ?>
                          <div class="d-flex flex-column gap-3">
                            <?php foreach ($upcoming_schedules as $sched): 
                              $lbl_class = 'primary';
                              if ($sched['calendar_label'] === 'Jesus Enthroned Events') $lbl_class = 'warning';
                              elseif ($sched['calendar_label'] === 'Planning') $lbl_class = 'success';
                              elseif ($sched['calendar_label'] === 'Holiday') $lbl_class = 'danger';
                              elseif ($sched['calendar_label'] === 'ETC') $lbl_class = 'info';
                            ?>
                              <div class="d-flex align-items-start gap-2 pb-2 border-bottom border-light-subtle">
                                <span class="badge badge-dot bg-<?= $lbl_class; ?> mt-1.5 flex-shrink-0"></span>
                                <div class="flex-grow-1 min-w-0">
                                  <h6 class="mb-0 small fw-bold text-truncate" title="<?= htmlspecialchars($sched['title']); ?>"><?= htmlspecialchars($sched['title']); ?></h6>
                                  <small class="text-muted" style="font-size: 0.75rem;"><?= date('M j, Y g:i A', strtotime($sched['start_date'])); ?></small>
                                </div>
                              </div>
                            <?php endforeach; ?>
                          </div>
                        <?php endif; ?>
                      </div>

                      <!-- Holiday Trackings -->
                      <hr class="mb-6 mx-n4 mt-3" />
                      <div class="px-6 pb-4">
                        <h5 class="mb-4">Holiday Trackings</h5>
                        <?php if (empty($upcoming_holidays)): ?>
                          <p class="text-muted small">No upcoming holidays.</p>
                        <?php else: ?>
                          <div class="d-flex flex-column gap-3">
                            <?php foreach ($upcoming_holidays as $hol): ?>
                              <div class="d-flex align-items-center gap-2 p-2 rounded bg-label-danger" style="background-color: rgba(255, 76, 81, 0.08) !important;">
                                <i class="bx bx-gift text-danger fs-5"></i>
                                <div class="flex-grow-1 min-w-0">
                                  <h6 class="mb-0 small fw-bold text-danger text-truncate" title="<?= htmlspecialchars($hol['title']); ?>"><?= htmlspecialchars($hol['title']); ?></h6>
                                  <small class="text-muted" style="font-size: 0.75rem;"><?= date('M j, Y', strtotime($hol['start_date'])); ?></small>
                                </div>
                              </div>
                            <?php endforeach; ?>
                          </div>
                        <?php endif; ?>
                      </div>
                    </div>
                    <!-- /Calendar Sidebar -->

                    <!-- Calendar & Modal -->
                    <div class="col app-calendar-content">
                      <div class="card shadow-none border-0">
                        <div class="card-body pb-0">
                          <!-- FullCalendar -->
                          <div id="calendar"></div>
                        </div>
                      </div>
                      <div class="app-overlay"></div>
                      <!-- FullCalendar Offcanvas -->
                      <div class="offcanvas offcanvas-end event-sidebar" tabindex="-1" id="addEventSidebar" aria-labelledby="addEventSidebarLabel">
                        <div class="offcanvas-header border-bottom">
                          <h5 class="offcanvas-title" id="addEventSidebarLabel">Add Event</h5>
                          <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div class="offcanvas-body">
                          <form class="event-form pt-0" id="eventForm" onsubmit="return false">
                            <div class="mb-6 form-control-validation">
                              <label class="form-label" for="eventTitle">Title</label>
                              <input type="text" class="form-control" id="eventTitle" name="eventTitle" placeholder="Event Title" />
                            </div>
                            <div class="mb-6">
                              <label class="form-label" for="eventLabel">Label</label>
                              <select class="select2 select-event-label form-select" id="eventLabel" name="eventLabel">
                                <option data-label="primary" value="Word Session" selected>Word Session</option>
                                <option data-label="warning" value="Jesus Enthroned Events">Jesus Enthroned Events</option>
                                <option data-label="success" value="Planning">Planning</option>
                                <option data-label="danger" value="Holiday">Holiday</option>
                                <option data-label="info" value="ETC">ETC</option>
                              </select>
                            </div>
                            <div class="mb-6 form-control-validation">
                              <label class="form-label" for="eventStartDate">Start Date</label>
                              <input type="text" class="form-control" id="eventStartDate" name="eventStartDate" placeholder="Start Date" />
                            </div>
                            <div class="mb-6 form-control-validation">
                              <label class="form-label" for="eventEndDate">End Date</label>
                              <input type="text" class="form-control" id="eventEndDate" name="eventEndDate" placeholder="End Date" />
                            </div>
                            <div class="mb-6">
                              <div class="form-check form-switch">
                                <input type="checkbox" class="form-check-input allDay-switch" id="allDaySwitch" />
                                <label class="form-check-label" for="allDaySwitch">All Day</label>
                              </div>
                            </div>
                            <div class="mb-6">
                              <label class="form-label" for="eventURL">Event URL</label>
                              <input type="url" class="form-control" id="eventURL" name="eventURL" placeholder="https://www.google.com" />
                            </div>
                            <div class="mb-4 select2-primary">
                              <label class="form-label" for="eventGuests">Add Guests</label>
                              <select class="select2 select-event-guests form-select" id="eventGuests" name="eventGuests" multiple>
                                <option data-avatar="1.png" value="Jane Foster">Jane Foster</option>
                                <option data-avatar="3.png" value="Donna Frank">Donna Frank</option>
                                <option data-avatar="5.png" value="Gabrielle Robertson">Gabrielle Robertson</option>
                                <option data-avatar="7.png" value="Lori Spears">Lori Spears</option>
                                <option data-avatar="9.png" value="Sandy Vega">Sandy Vega</option>
                                <option data-avatar="11.png" value="Cheryl May">Cheryl May</option>
                              </select>
                            </div>
                            <div class="mb-6">
                              <label class="form-label" for="eventLocation">Location</label>
                              <input type="text" class="form-control" id="eventLocation" name="eventLocation" placeholder="Enter Location" />
                            </div>
                            <div class="mb-6">
                              <label class="form-label" for="eventDescription">Description</label>
                              <textarea class="form-control" name="eventDescription" id="eventDescription"></textarea>
                            </div>
                            <div class="d-flex justify-content-sm-between justify-content-start mt-6 gap-2">
                              <div class="d-flex">
                                <button type="submit" id="addEventBtn" class="btn btn-primary btn-add-event me-4">Add</button>
                                <button type="reset" class="btn btn-label-secondary btn-cancel me-sm-0 me-1" data-bs-dismiss="offcanvas">Cancel</button>
                              </div>
                              <button class="btn btn-label-danger btn-delete-event d-none">Delete</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                    <!-- /Calendar & Modal -->
                  </div>
                </div>
                <!-- My Cell Tab -->
                <div class="tab-pane fade" id="my-cell" role="tabpanel">
                  <?php
                  $get_cell = "SELECT m.cell_id FROM member m JOIN users u ON m.id = u.member_id WHERE u.id = :user_id";
                  $stmtt = $db->prepare($get_cell);
                  $stmtt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                  $stmtt->execute();
                  $res = $stmtt->fetch(PDO::FETCH_OBJ);
                  
                  $cell_assigned = false;
                  $members = [];
                  $total_souls = 0;
                  $total_first_timers = 0;
                  $avg_att = 0;
                  $next_meeting_date = 'Not Scheduled';
                  
                  if ($res && !empty($res->cell_id)) {
                      $cell_id = $res->cell_id;
                      $cell_det = "SELECT c.id, c.code, c.name, c.meeting_day, c.meeting_time, c.location,
                                          m.id AS leader_member_id, m.first_name, m.last_name, m.phone_no, m.email 
                                   FROM cells c 
                                   LEFT JOIN member m ON c.cell_leader = m.id 
                                   WHERE c.id = :cell_id";
                      $details = $db->prepare($cell_det);
                      $details->bindParam(':cell_id', $cell_id, PDO::PARAM_INT);
                      $details->execute();
                      $CELL = $details->fetch(PDO::FETCH_OBJ);
                      
                      if ($CELL) {
                          $cell_assigned = true;
                          $get_cell_members = "SELECT * FROM member WHERE cell_id = :cell_id AND (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0') ORDER BY first_name ASC";
                          $mGet = $db->prepare($get_cell_members);
                          $mGet->bindParam(':cell_id', $cell_id, PDO::PARAM_INT);
                          $mGet->execute();
                          $members = $mGet->fetchAll(PDO::FETCH_ASSOC);
                          
                          // Souls won (sum of salvations from published reports)
                          $souls_stmt = $db->prepare("SELECT SUM(salvations) as total FROM cell_reports WHERE cell_id = :cid AND status = 'published'");
                          $souls_stmt->execute([':cid' => $cell_id]);
                          $total_souls = intval($souls_stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

                          // First timers
                          $ft_count_stmt = $db->prepare("
                              SELECT COUNT(ft.id) as total 
                              FROM cell_report_first_timers ft
                              JOIN cell_reports r ON ft.report_id = r.id
                              WHERE r.cell_id = :cid AND r.status = 'published'
                          ");
                          $ft_count_stmt->execute([':cid' => $cell_id]);
                          $total_first_timers = intval($ft_count_stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

                          // Average attendance
                          $avg_stmt = $db->prepare("SELECT AVG(total_attendance) as avg_att FROM cell_reports WHERE cell_id = :cid AND status = 'published'");
                          $avg_stmt->execute([':cid' => $cell_id]);
                          $avg_att = round(floatval($avg_stmt->fetch(PDO::FETCH_ASSOC)['avg_att'] ?? 0), 1);
                          
                          // Calculate next fellowship date
                          if (!empty($CELL->meeting_day)) {
                              $meeting_day = trim($CELL->meeting_day);
                              $next_ts = strtotime("next " . $meeting_day);
                              if (date('l') === $meeting_day) {
                                  $meeting_time = $CELL->meeting_time ?? '00:00:00';
                                  if (time() < strtotime(date('Y-m-d') . ' ' . $meeting_time)) {
                                      $next_ts = strtotime('today');
                                  }
                              }
                              $next_meeting_date = date('l, F j, Y', $next_ts);
                          }
                      }
                  }
                  ?>

                  <!-- My Cell Tab Header -->
                  <div class="card glass-card mb-4 border-0 shadow-xs p-4" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                      <div class="d-flex align-items-center gap-3">
                        <div class="avatar avatar-md bg-gradient-warning rounded text-white d-flex align-items-center justify-content-center shadow-xs" style="width: 50px; height: 50px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                          <i class="bx bx-home-heart fs-3"></i>
                        </div>
                        <div>
                          <h4 class="mb-1 fw-bold text-heading" style="color: #1e1b4b; font-size: 1.5rem;">My Cell Fellowship Group</h4>
                          <p class="text-muted mb-0 small" style="font-size: 0.88rem;">Fellowship strengthens faith. Connect with your local cell members and cell leaders.</p>
                        </div>
                      </div>
                      <?php if($cell_assigned): ?>
                      <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-label-warning px-3 py-2 rounded-pill fw-semibold" style="font-size: 0.85rem; background-color: rgba(254, 225, 64, 0.15); color: #c48c02;">
                          <i class="bx bx-hash me-1"></i> Code: <?= htmlspecialchars($CELL->code); ?>
                        </span>
                      </div>
                      <?php endif; ?>
                    </div>
                  </div>

                  <?php if(!$cell_assigned): ?>
                  <div class="alert alert-warning border-0 shadow-xs p-4" style="border-radius: 12px;">
                    <h5 class="fw-bold text-warning mb-2"><i class="bx bx-info-circle me-2 fs-4"></i>Not Yet Assigned</h5>
                    <p class="mb-0">You haven't been assigned to a cell group yet. Please contact your cell leader or administrator to register you in a local fellowship cell.</p>
                  </div>
                  <?php else: ?>

                  <!-- Mini Stats Row -->
                  <div class="row g-3 mb-4">
                    <div class="col-6 col-md-3">
                      <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                        <div>
                          <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">Cell Members</small>
                          <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;"><?= count($members) ?></h4>
                        </div>
                        <div class="avatar avatar-sm rounded text-primary d-flex align-items-center justify-content-center" style="background: rgba(111, 66, 193, 0.12); width: 38px; height: 38px;">
                          <i class="bx bx-group fs-5"></i>
                        </div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                        <div>
                          <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">Avg Attendance</small>
                          <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;"><?= $avg_att ?></h4>
                        </div>
                        <div class="avatar avatar-sm rounded text-info d-flex align-items-center justify-content-center" style="background: rgba(3, 195, 236, 0.12); width: 38px; height: 38px;">
                          <i class="bx bx-line-chart fs-5"></i>
                        </div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                        <div>
                          <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">First Timers</small>
                          <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;"><?= $total_first_timers ?></h4>
                        </div>
                        <div class="avatar avatar-sm rounded text-success d-flex align-items-center justify-content-center" style="background: rgba(40, 167, 69, 0.12); width: 38px; height: 38px;">
                          <i class="bx bx-user-plus fs-5"></i>
                        </div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                        <div>
                          <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">Souls Won</small>
                          <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;"><?= $total_souls ?></h4>
                        </div>
                        <div class="avatar avatar-sm rounded text-warning d-flex align-items-center justify-content-center" style="background: rgba(255, 193, 7, 0.15); width: 38px; height: 38px;">
                          <i class="bx bx-star fs-5"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Two Column Content Grid -->
                  <div class="row g-4">
                    <!-- Left Side Column -->
                    <div class="col-lg-4">
                      <!-- Cell Details Card -->
                      <div class="card glass-card mb-4 border-0 shadow-xs" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                        <div class="card-header border-bottom border-light-subtle p-4">
                          <h5 class="card-title mb-0 fw-bold text-heading" style="color: #1e1b4b;"><i class="bx bx-purchase-tag me-2 text-primary"></i>Cell Details</h5>
                        </div>
                        <div class="card-body p-4">
                          <div class="detail-item mb-3 d-flex align-items-start gap-2">
                            <i class="bx bx-home text-accent fs-4 mt-1"></i>
                            <div>
                              <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Cell Name</small>
                              <span class="fw-semibold" style="color: #1e1b4b;"><?= htmlspecialchars($CELL->name ?: 'Unnamed Cell'); ?></span>
                            </div>
                          </div>
                          <div class="detail-item mb-3 d-flex align-items-start gap-2">
                            <i class="bx bx-map text-accent fs-4 mt-1"></i>
                            <div>
                              <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Meeting Center</small>
                              <span class="fw-semibold" style="color: #1e1b4b;"><?= htmlspecialchars($CELL->location ?: 'Not Provided'); ?></span>
                            </div>
                          </div>
                          <div class="detail-item mb-3 d-flex align-items-start gap-2">
                            <i class="bx bx-calendar-event text-accent fs-4 mt-1"></i>
                            <div>
                              <small class="text-muted d-block text-uppercase fw-semibold" style="font-size: 0.7rem;">Meeting Schedule</small>
                              <span class="fw-semibold" style="color: #1e1b4b;">
                                <?= $CELL->meeting_day ? htmlspecialchars($CELL->meeting_day) : 'Not Set' ?> at 
                                <?= $CELL->meeting_time ? date('h:i A', strtotime($CELL->meeting_time)) : 'Not Set' ?>
                              </span>
                            </div>
                          </div>
                          
                          <!-- Dynamic Next Fellowship Meeting Widget -->
                          <div class="p-3 mt-4 rounded-3 border border-dashed border-primary" style="background: rgba(111, 66, 193, 0.04);">
                            <div class="d-flex align-items-center gap-2 mb-2">
                              <i class="bx bx-timer text-primary fs-4"></i>
                              <span class="fw-bold small text-primary text-uppercase" style="letter-spacing: 0.05em;">Next Fellowship Meeting</span>
                            </div>
                            <div class="fw-semibold text-heading mb-1" style="color: #1e1b4b; font-size: 0.95rem;">
                              <?= $next_meeting_date; ?>
                            </div>
                            <small class="text-muted">Join your cell group members at the designated meeting center.</small>
                          </div>
                        </div>
                      </div>

                      <!-- Cell Leader Profile Card -->
                      <?php if ($CELL->first_name): 
                          $lcolor = '#' . substr(md5($CELL->leader_member_id), 0, 6);
                          $linitial = strtoupper(substr($CELL->first_name, 0, 1));
                      ?>
                      <div class="card glass-card border-0 shadow-xs" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                        <div class="card-header border-bottom border-light-subtle p-4">
                          <h5 class="card-title mb-0 fw-bold text-heading" style="color: #1e1b4b;"><i class="bx bx-user me-2 text-primary"></i>Cell Leader</h5>
                        </div>
                        <div class="card-body p-4 text-center">
                          <div class="d-flex flex-column align-items-center mb-3">
                            <div class="leader-avatar-lg mb-2 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style="width: 70px; height: 70px; border-radius: 50%; font-size: 1.8rem; background: <?= $lcolor ?>;">
                              <?= $linitial ?>
                            </div>
                            <h6 class="fw-bold mb-1" style="color: #1e1b4b; font-size: 1.05rem;"><?= htmlspecialchars($CELL->first_name . ' ' . $CELL->last_name) ?></h6>
                            <span class="badge bg-label-success px-3 py-1 rounded-pill fw-semibold" style="font-size: 0.75rem; background-color: rgba(40, 167, 69, 0.12); color: #28a745;">
                              <i class="bx bx-crown me-1"></i>Cell Leader
                            </span>
                          </div>
                          
                          <div class="text-start mt-4 pt-2 border-top border-light-subtle">
                            <?php if ($CELL->phone_no): ?>
                            <div class="d-flex align-items-center gap-2 mb-2">
                              <i class="bx bx-phone text-muted fs-5"></i>
                              <span class="small text-muted"><?= htmlspecialchars($CELL->phone_no) ?></span>
                              <a href="tel:<?= htmlspecialchars($CELL->phone_no) ?>" class="btn btn-xs btn-outline-primary ms-auto py-1 px-2 rounded-2">Call</a>
                            </div>
                            <?php endif; ?>
                            <?php if ($CELL->email): ?>
                            <div class="d-flex align-items-center gap-2">
                              <i class="bx bx-envelope text-muted fs-5"></i>
                              <span class="small text-muted text-truncate" style="max-width: 160px;"><?= htmlspecialchars($CELL->email) ?></span>
                              <a href="mailto:<?= htmlspecialchars($CELL->email) ?>" class="btn btn-xs btn-outline-primary ms-auto py-1 px-2 rounded-2">Email</a>
                            </div>
                            <?php endif; ?>
                          </div>
                        </div>
                      </div>
                      <?php endif; ?>
                    </div>

                    <!-- Right Side Column: Members List Table -->
                    <div class="col-lg-8">
                      <div class="card glass-card border-0 shadow-xs" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                        <div class="card-header border-bottom border-light-subtle d-flex justify-content-between align-items-center p-4">
                          <h5 class="card-title mb-0 fw-bold text-heading" style="color: #1e1b4b;">Cell Members List</h5>
                          <span class="badge bg-label-primary px-3 py-2 rounded-pill fw-semibold" style="background-color: rgba(102, 126, 234, 0.15); color: #667eea;"><?= count($members); ?> Members</span>
                        </div>
                        <div class="card-body p-4">
                          <div class="table-responsive custom-scrollbar" style="border-radius: 8px;">
                            <table class="table table-hover align-middle w-100" id="dashboardMyCellTable">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Member</th>
                                  <th>Contact</th>
                                  <th>Email</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <?php if (!empty($members)): ?>
                                <?php foreach ($members as $index => $row): 
                                  $mid = $row['id'];
                                  $name = $row['first_name'] . " " . $row['last_name'];
                                  $phone = $row['phone_no'];
                                  $email = $row['email'];
                                  $acolor = '#' . substr(md5($mid), 0, 6);
                                  $initial = strtoupper(substr($row['first_name'], 0, 1));
                                ?>
                                <tr>
                                  <td><?= $index + 1; ?></td>
                                  <td>
                                    <div class="d-flex align-items-center">
                                      <div class="avatar avatar-sm me-3" style="width: 32px; height: 32px;">
                                        <span class="avatar-initial rounded-circle text-white d-flex align-items-center justify-content-center fw-semibold" style="font-size: 0.85rem; background-color: <?= $acolor ?>;">
                                          <?= $initial; ?>
                                        </span>
                                      </div>
                                      <div>
                                        <h6 class="mb-0 fw-semibold text-heading" style="font-size: 0.92rem; color: #1e1b4b;"><?= htmlspecialchars($name); ?></h6>
                                      </div>
                                    </div>
                                  </td>
                                  <td><span class="text-muted small"><?= $phone ? htmlspecialchars($phone) : '—'; ?></span></td>
                                  <td><span class="text-muted small"><?= $email ? htmlspecialchars($email) : '—'; ?></span></td>
                                  <td>
                                    <span class="badge bg-label-success px-2 py-1 rounded-pill fw-semibold" style="font-size: 0.75rem; background-color: rgba(40, 167, 69, 0.12) !important; color: #28a745 !important;">Active</span>
                                  </td>
                                  <td>
                                    <div class="dropdown">
                                      <button type="button" class="btn btn-sm btn-outline-secondary btn-icon-only border-0" data-bs-toggle="dropdown" style="width: 28px; height: 28px; padding: 0;">
                                        <i class="bx bx-dots-vertical-rounded"></i>
                                      </button>
                                      <div class="dropdown-menu dropdown-menu-end">
                                        <?php if (userHasPermission($db, $user_id, 'edit_member')): ?>
                                        <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#editMember-<?= $mid; ?>">
                                          <i class="bx bx-edit me-2"></i>Edit Member Info
                                        </a>
                                        <?php endif; ?>
                                        <a class="dropdown-item" href="assign_cell.php?cid=<?= $cell_id ?>">
                                          <i class="bx bx-transfer-alt me-2"></i>Reassign / Remove
                                        </a>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                                <?php 
                                  @include('modals/edit-user.php'); 
                                endforeach; ?>
                                <?php endif; ?>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <?php endif; ?>
                </div>
                 <!-- Attendance Tab -->
                <?php if (userHasPermission($db, $user_id, 'view_meeting')): ?>
                <div class="tab-pane fade" id="attendance" role="tabpanel">
                  <?php 
                  $qMeeting = $db->query("SELECT *
                    FROM meeting
                    WHERE WEEK(start_time, 1) = WEEK(CURDATE(), 1)
                      AND YEAR(start_time) = YEAR(CURDATE())
                    ORDER BY start_time DESC
                    LIMIT 1");
                  $qMeeting->execute();
                  $meetingR = $qMeeting->fetch(PDO::FETCH_ASSOC);
                  $meeting_id = $meetingR['id'] ?? null;
                  $name = $meetingR['name'] ?? 'No meetings this week';
                  ?>
                  
                  <div class="card">
                    <div class="card-header">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 class="card-title mb-0">Latest Meeting Attendance</h5>
                          <p class="text-muted mb-0"><?= $name; ?></p>
                        </div>
                        <span class="badge bg-primary"><?= date('F j, Y', strtotime($meetingR['start_time'] ?? 'now')); ?></span>
                      </div>
                    </div>
                    <div class="card-body">
                      <div class="table-responsive">
                        <table class="table table-striped table-hover-custom" id="attendanceTable">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Member</th>
                              <th>Joined At</th>
                              <th>Contact</th>
                              <th>Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            <?php if($meeting_id): 
                            try {
                                $stmt = $db->prepare("SELECT m.first_name, m.last_name, m.phone_no, a.login_time
                                                      FROM attendance a 
                                                      JOIN meeting mt ON a.meeting_id = mt.id 
                                                      JOIN member m ON a.member_id = m.id 
                                                      WHERE a.meeting_id = :meeting_id 
                                                      ORDER BY a.login_time DESC");
                                $stmt->bindParam(":meeting_id", $meeting_id, PDO::PARAM_INT);
                                $stmt->execute();
                                $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
                            } catch (PDOException $e) {
                                $attendance = [];
                            }
                            $cnt = 1;
                            if (!empty($attendance)): 
                            foreach ($attendance as $row):
                                $login = $row['login_time'];
                                $name = $row['first_name'] . " " . $row['last_name'];
                                $contact = $row['phone_no'];
                                $logout = $row['login_time'];
                                $duration = $logout ? round((strtotime($logout) - strtotime($login)) / 60, 0) . ' min' : 'N/A';
                            ?>
                            <tr>
                              <td><?= $cnt; ?></td>
                              <td>
                                <div class="d-flex align-items-center">
                                  <div class="avatar avatar-sm me-3">
                                    <span class="avatar-initial rounded-circle bg-label-info">
                                      <?= strtoupper(substr($row['first_name'], 0, 1)); ?>
                                    </span>
                                  </div>
                                  <div>
                                    <h6 class="mb-0"><?= htmlspecialchars($name); ?></h6>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span class="badge bg-label-secondary">
                                  <?= date("h:i A", strtotime($login)); ?>
                                </span>
                              </td>
                              <td><?= htmlspecialchars($contact); ?></td>
                              <td>
                                <span class="badge bg-label-primary"><?= $duration; ?></span>
                              </td>
                            </tr>
                            <?php $cnt++; endforeach; ?>
                            <?php else: ?>
                            <tr>
                              <td colspan="5" class="text-center py-4">
                                <div class="text-muted">
                                  <i class="bx bx-user-check fs-1 mb-2"></i>
                                  <p class="mb-0">No attendance records found</p>
                                </div>
                              </td>
                            </tr>
                            <?php endif; ?>
                            <?php else: ?>
                            <tr>
                              <td colspan="5" class="text-center py-4">
                                <div class="text-muted">
                                  <i class="bx bx-calendar-x fs-1 mb-2"></i>
                                  <p class="mb-0">No meetings scheduled for this week</p>
                                </div>
                              </td>
                            </tr>
                            <?php endif; ?>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <?php endif; ?>

                <!-- My Pledges Tab -->
                <!-- My Pledges Tab -->
                <div class="tab-pane fade" id="my-pledge" role="tabpanel">
                  <?php
                  $user_fullname = $fname . ' ' . $lname;
                  $user_email = $_SESSION['user_email'] ?? '';
                  
                  // Query Pledges List
                  $pledges_list_query = $db->prepare("
                      SELECT id, purpose, pledges_amount, date, recurring, notes, phone_no, status, pledge_type, attendees_sponsored 
                      FROM pledges 
                      WHERE member_id = :member_id OR TRIM(full_name) = :fullname OR email = :email
                      ORDER BY date DESC
                  ");
                  $pledges_list_query->execute([
                      ':member_id' => $member_id,
                      ':fullname' => $user_fullname,
                      ':email' => $user_email
                  ]);
                  $user_pledges = $pledges_list_query->fetchAll(PDO::FETCH_ASSOC);

                  // Query Redemptions List
                  $redeem_list_query = $db->prepare("
                      SELECT pr.id, pr.mpesa_code, pr.redeemed_amount, pr.recorded_on, p.purpose, p.full_name
                      FROM pledges_redeem pr
                      JOIN pledges p ON pr.pledge_id = p.id
                      WHERE p.member_id = :member_id OR TRIM(p.full_name) = :fullname OR pr.email = :email
                      ORDER BY pr.recorded_on DESC
                  ");
                  $redeem_list_query->execute([
                      ':member_id' => $member_id,
                      ':fullname' => $user_fullname,
                      ':email' => $user_email
                  ]);
                  $user_redemptions = $redeem_list_query->fetchAll(PDO::FETCH_ASSOC);
                  ?>

                  <!-- Page Header -->
                  <div class="card glass-card mb-4 border-0 shadow-xs p-4" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                      <div class="d-flex align-items-center gap-3">
                        <div class="avatar avatar-md bg-gradient-primary rounded text-white d-flex align-items-center justify-content-center shadow-xs" style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                          <i class="bx bx-dollar fs-3"></i>
                        </div>
                        <div>
                          <h4 class="mb-1 fw-bold text-heading" style="color: #1e1b4b; font-size: 1.5rem;">My Pledges & Redemptions</h4>
                          <p class="text-muted mb-0 small" style="font-size: 0.88rem;">Track your sponsorship statements, M-Pesa redemptions, and remaining balance.</p>
                        </div>
                      </div>
                      <div class="d-flex align-items-center gap-2">
                        <a href="make-pledge.php" class="btn btn-primary btn-sm px-4 rounded-pill fw-semibold">
                          <i class="bx bx-plus-circle me-1"></i> Make Pledge
                        </a>
                      </div>
                    </div>
                  </div>

                  <!-- Mini Stats Row -->
                  <div class="row g-3 mb-4">
                    <div class="col-6 col-md-3">
                      <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                        <div>
                          <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">Total Pledged</small>
                          <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;">KES <?= number_format($user_total_pledges, 0) ?></h4>
                        </div>
                        <div class="avatar avatar-sm rounded text-primary d-flex align-items-center justify-content-center" style="background: rgba(111, 66, 193, 0.12); width: 38px; height: 38px;">
                          <i class="bx bx-dollar fs-5"></i>
                        </div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                        <div>
                          <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">Total Redeemed</small>
                          <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;">KES <?= number_format($user_total_redeemed, 0) ?></h4>
                        </div>
                        <div class="avatar avatar-sm rounded text-success d-flex align-items-center justify-content-center" style="background: rgba(40, 167, 69, 0.12); width: 38px; height: 38px;">
                          <i class="bx bx-check-circle fs-5"></i>
                        </div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                        <div>
                          <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">Remaining Balance</small>
                          <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;">KES <?= number_format($user_remaining_pledges, 0) ?></h4>
                        </div>
                        <div class="avatar avatar-sm rounded text-danger d-flex align-items-center justify-content-center" style="background: rgba(220, 53, 69, 0.12); width: 38px; height: 38px;">
                          <i class="bx bx-info-circle fs-5"></i>
                        </div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="card glass-card border-0 shadow-xs p-3 d-flex flex-row align-items-center justify-content-between" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 12px; transition: transform 0.2s;">
                        <div>
                          <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">Progress</small>
                          <h4 class="mb-0 fw-bold mt-1" style="color: #1e1b4b; font-size: 1.4rem;"><?= number_format($pledge_percentage, 0) ?>%</h4>
                        </div>
                        <div class="avatar avatar-sm rounded text-warning d-flex align-items-center justify-content-center" style="background: rgba(255, 193, 7, 0.15); width: 38px; height: 38px;">
                          <i class="bx bx-pie-chart-alt fs-5"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Two Column Grid -->
                  <div class="row g-4">
                    <!-- Left Side Column -->
                    <div class="col-lg-4">
                      <!-- Progress Card -->
                      <div class="card glass-card mb-4 border-0 shadow-xs" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                        <div class="card-header border-bottom border-light-subtle p-4">
                          <h5 class="card-title mb-0 fw-bold text-heading" style="color: #1e1b4b;"><i class="bx bx-pie-chart-alt-2 me-2 text-primary"></i>Fulfillment Progress</h5>
                        </div>
                        <div class="card-body p-4">
                          <div class="d-flex align-items-center justify-content-between mb-2">
                            <span class="fw-semibold text-muted">Overall Completion</span>
                            <span class="fw-bold text-primary"><?= number_format($pledge_percentage, 1) ?>%</span>
                          </div>
                          <div class="progress-bar-custom" style="height: 10px; border-radius: 5px; background: rgba(102, 126, 234, 0.1); overflow: hidden; width: 100%;">
                            <div class="progress-fill" style="height: 100%; border-radius: 5px; background: linear-gradient(90deg, #667eea, #764ba2); width: <?= min(100, $pledge_percentage) ?>%; transition: width 1s ease;"></div>
                          </div>
                          <p class="text-muted small mt-3 mb-0">Every contribution helps support our Dec Conference, High School Reachout, and general ministry partnerships.</p>
                        </div>
                      </div>

                      <!-- Quick Link Card -->
                      <div class="card glass-card border-0 shadow-xs" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                        <div class="card-body p-4 text-center">
                          <div class="avatar avatar-md bg-gradient-primary rounded text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow-xs" style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <i class="bx bx-heart fs-3"></i>
                          </div>
                          <h6 class="fw-bold text-heading" style="color: #1e1b4b;">Support the Ministry</h6>
                          <p class="text-muted small mb-4">Feel led to make another sponsorship or general partnership commitment?</p>
                          <a href="make-pledge.php" class="btn btn-primary w-100 rounded-pill fw-semibold">
                            <i class="bx bx-plus-circle me-1"></i> Make a New Pledge
                          </a>
                        </div>
                      </div>
                    </div>

                    <!-- Right Side Column: Tables (Pledges & Redemptions) -->
                    <div class="col-lg-8">
                      <!-- Pledges Card -->
                      <div class="card glass-card border-0 shadow-xs mb-4" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                        <div class="card-header border-bottom border-light-subtle d-flex justify-content-between align-items-center p-4">
                          <h5 class="card-title mb-0 fw-bold text-heading" style="color: #1e1b4b;"><i class="bx bx-list-ul me-2 text-primary"></i>My Commitments</h5>
                          <span class="badge bg-label-primary px-3 py-2 rounded-pill fw-semibold" style="background-color: rgba(102, 126, 234, 0.15); color: #667eea;"><?= count($user_pledges); ?> Pledges</span>
                        </div>
                        <div class="card-body p-4">
                          <div class="table-responsive custom-scrollbar" style="border-radius: 8px;">
                            <table class="table table-hover align-middle w-100" id="userPledgesTable">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Purpose</th>
                                  <th>Type</th>
                                  <th>Amount</th>
                                  <th>Date</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <?php if (!empty($user_pledges)): ?>
                                <?php foreach ($user_pledges as $index => $row): 
                                  $p_purpose = $row['purpose'];
                                  $p_amount = $row['pledges_amount'];
                                  $p_date = $row['date'];
                                  $p_type = $row['pledge_type'] ?: 'Cash';
                                  $p_status = $row['status'];
                                ?>
                                <tr>
                                  <td><?= $index + 1; ?></td>
                                  <td><span class="fw-semibold text-heading" style="color: #1e1b4b;"><?= htmlspecialchars(ucfirst(str_replace('_', ' ', $p_purpose))); ?></span></td>
                                  <td><span class="badge bg-label-secondary"><?= htmlspecialchars(ucfirst($p_type)); ?></span></td>
                                  <td class="fw-semibold text-primary">KES <?= number_format($p_amount, 0); ?></td>
                                  <td><span class="text-muted small"><?= date('M d, Y', strtotime($p_date)); ?></span></td>
                                  <td>
                                    <?php if ($p_status == 1): ?>
                                      <span class="badge bg-label-success px-2 py-1 rounded-pill fw-semibold" style="font-size: 0.75rem; background-color: rgba(40, 167, 69, 0.12) !important; color: #28a745 !important;">Active</span>
                                    <?php else: ?>
                                      <span class="badge bg-label-secondary px-2 py-1 rounded-pill fw-semibold" style="font-size: 0.75rem;">Fulfilled</span>
                                    <?php endif; ?>
                                  </td>
                                </tr>
                                <?php endforeach; ?>
                                <?php endif; ?>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      <!-- Redemptions Card -->
                      <div class="card glass-card border-0 shadow-xs" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                        <div class="card-header border-bottom border-light-subtle d-flex justify-content-between align-items-center p-4">
                          <h5 class="card-title mb-0 fw-bold text-heading" style="color: #1e1b4b;"><i class="bx bx-check-shield me-2 text-success"></i>My Redemptions</h5>
                          <span class="badge bg-label-success px-3 py-2 rounded-pill fw-semibold" style="background-color: rgba(40, 167, 69, 0.12); color: #28a745;"><?= count($user_redemptions); ?> Payments</span>
                        </div>
                        <div class="card-body p-4">
                          <div class="table-responsive custom-scrollbar" style="border-radius: 8px;">
                            <table class="table table-hover align-middle w-100" id="userRedemptionsTable">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Purpose</th>
                                  <th>M-Pesa Code</th>
                                  <th>Amount</th>
                                  <th>Redeemed On</th>
                                </tr>
                              </thead>
                              <tbody>
                                <?php if (!empty($user_redemptions)): ?>
                                <?php foreach ($user_redemptions as $index => $row): 
                                  $r_purpose = $row['purpose'];
                                  $r_code = $row['mpesa_code'];
                                  $r_amount = $row['redeemed_amount'];
                                  $r_date = $row['recorded_on'];
                                ?>
                                <tr>
                                  <td><?= $index + 1; ?></td>
                                  <td><span class="fw-semibold text-heading" style="color: #1e1b4b;"><?= htmlspecialchars(ucfirst(str_replace('_', ' ', $r_purpose))); ?></span></td>
                                  <td><span class="badge bg-label-info fw-bold"><?= htmlspecialchars($r_code); ?></span></td>
                                  <td class="fw-semibold text-success">KES <?= number_format($r_amount, 0); ?></td>
                                  <td><span class="text-muted small"><?= date('M d, Y h:i A', strtotime($r_date)); ?></span></td>
                                </tr>
                                <?php endforeach; ?>
                                <?php endif; ?>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  <!-- Upcoming Birthdays Tab -->
                  <div class="tab-pane fade" id="upcoming-birthdays" role="tabpanel">
                    <?php if (userHasPermission($db, $user_id, 'view_meeting')): ?>
                    <!-- Page Header for Upcoming Birthdays -->
                    <div class="card glass-card mb-4 border-0 shadow-xs p-4" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                        <div class="d-flex align-items-center gap-3">
                          <div class="avatar avatar-md rounded text-white d-flex align-items-center justify-content-center shadow-xs" style="width: 50px; height: 50px; background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);">
                            <i class="bx bx-party fs-3"></i>
                          </div>
                          <div>
                            <h4 class="mb-1 fw-bold text-heading" style="color: #1e1b4b; font-size: 1.5rem;">Upcoming Birthdays</h4>
                            <p class="text-muted mb-0 small" style="font-size: 0.88rem;">Celebrate with members having their birthdays in the next two weeks.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <?php
                      $qBirthday = $db->query("SELECT * FROM member 
                          WHERE DATE(CONCAT(YEAR(CURDATE()), '-', MONTH(bod), '-', DAY(bod))) 
                                BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
                          ORDER BY DATE(CONCAT(YEAR(CURDATE()), '-', MONTH(bod), '-', DAY(bod))) ASC");
                      $qBirthday->execute();
                      $birthdays = $qBirthday->fetchAll(PDO::FETCH_ASSOC);
                      
                      if (!empty($birthdays)):
                      foreach ($birthdays as $row):
                          $name = $row['first_name'] . " " . $row['last_name'];
                          $birthday = $row['bod'];
                          $contact = $row['phone_no'];
                          
                          $currentYear = date('Y');
                          $nextBirthday = date('Y-m-d', strtotime($currentYear . '-' . date('m-d', strtotime($birthday))));
                          
                          if (strtotime($nextBirthday) < strtotime(date('Y-m-d'))) {
                              $nextBirthday = date('Y-m-d', strtotime('+1 year', strtotime($nextBirthday)));
                          }
                          
                          $daysUntil = floor((strtotime($nextBirthday) - strtotime(date('Y-m-d'))) / (60 * 60 * 24));
                      ?>
                      <div class="col-md-4 col-sm-6 mb-4">
                        <div class="card h-100 glass-card border-0 shadow-sm" style="background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.8) !important; border-radius: 16px; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                          <div class="card-body text-center p-4">
                            <div class="avatar avatar-xl mb-3 mx-auto d-flex justify-content-center">
                              <span class="avatar-initial rounded-circle text-white shadow-sm d-flex align-items-center justify-content-center" style="width: 70px; height: 70px; font-size: 1.8rem; background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);">
                                <?= strtoupper(substr($row['first_name'], 0, 1)); ?>
                              </span>
                            </div>
                            <h5 class="mb-1 fw-bold" style="color: #1e1b4b;"><?= htmlspecialchars($name); ?></h5>
                            <p class="text-muted mb-3 fw-semibold small">
                              <i class="bx bx-cake me-1 text-primary"></i>
                              <?= date("F j", strtotime($birthday)); ?>
                            </p>
                            <?php if ($daysUntil == 0): ?>
                            <span class="badge px-3 py-2 rounded-pill fw-bold shadow-xs" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545; border: 1px solid rgba(220, 53, 69, 0.2);">Today! 🎉</span>
                            <?php elseif ($daysUntil == 1): ?>
                            <span class="badge px-3 py-2 rounded-pill fw-bold shadow-xs" style="background-color: rgba(255, 193, 7, 0.15); color: #e0a800; border: 1px solid rgba(255, 193, 7, 0.3);">Tomorrow 🎈</span>
                            <?php else: ?>
                            <span class="badge bg-label-info px-3 py-2 rounded-pill fw-bold shadow-xs">In <?= $daysUntil; ?> days</span>
                            <?php endif; ?>
                            
                            <hr class="my-3 border-secondary" style="opacity: 0.15;">
                            
                            <div class="mt-2">
                              <a href="tel:<?= htmlspecialchars($contact); ?>" class="btn btn-sm btn-outline-primary rounded-pill px-4 shadow-xs" style="font-weight: 600;">
                                <i class="bx bx-phone me-1"></i> Call
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <?php endforeach; ?>
                      <?php else: ?>
                      <div class="col-12">
                        <div class="text-center py-5 glass-card" style="background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(5px); border-radius: 16px; border: 1px dashed rgba(0,0,0,0.1);">
                          <div class="avatar avatar-lg mx-auto mb-3 bg-label-secondary rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                            <i class="bx bx-party fs-2 text-muted"></i>
                          </div>
                          <h5 class="fw-bold" style="color: #1e1b4b;">No Upcoming Birthdays</h5>
                          <p class="text-muted mb-0">There are no birthdays in the next two weeks.</p>
                        </div>
                      </div>
                      <?php endif; ?>
                    </div>
                    <?php endif; ?>
                  </div>
                  <style>
                                  /* Birthday Tab CSS */
                    .birthday-card-container { perspective: 1000px; width: 100%; max-width: 380px; height: 420px; margin: 0 auto; }
                    .birthday-card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-style: preserve-3d; cursor: pointer; }
                    .birthday-card-container:hover .birthday-card-inner, .birthday-card-inner.flipped { transform: rotateY(180deg); }
                    .card-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
                    .card-face-front { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: 1px solid rgba(255,255,255,0.2); }
                    .card-face-back { background: rgba(255, 255, 255, 0.95); transform: rotateY(180deg); border: 1px solid rgba(0,0,0,0.05); }
                    .gift-box { font-size: 5rem; color: #fff; margin-bottom: 1.5rem; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); transition: transform 0.3s ease; }
                    .birthday-card-container:hover .gift-box { transform: scale(1.1) rotate(5deg); }
                        .flip-prompt { position: absolute; bottom: 20px; font-size: 0.85rem; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; animation: pulse 2s infinite; }
                        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
                        .sparkle { position: absolute; background: #fff; border-radius: 50%; top: -10px; opacity: 0; animation: floatSparkle 3s ease-in infinite; }
                        @keyframes floatSparkle { 0% { transform: translateY(0) scale(1); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-100px) scale(0); opacity: 0; } }
                        
                        /* Cake CSS */
                        .birthday-cake { position: relative; width: 120px; height: 120px; margin-bottom: 1.5rem; }
                        .cake-base { position: absolute; bottom: 0; left: 10%; width: 80%; height: 50px; background: #fca5a5; border-radius: 10px 10px 5px 5px; box-shadow: inset 0 -10px rgba(0,0,0,0.1); }
                        .cake-base::before { content:''; position: absolute; top: -10px; left: 0; width: 100%; height: 20px; background: #fff; border-radius: 50%; }
                        .cake-top { position: absolute; bottom: 50px; left: 20%; width: 60%; height: 40px; background: #f87171; border-radius: 10px 10px 0 0; }
                        .candle { position: absolute; bottom: 90px; left: 45%; width: 10%; height: 25px; background: #fef08a; border-radius: 5px; }
                        .flame { position: absolute; bottom: 115px; left: 45%; width: 10%; height: 15px; background: #fbbf24; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; animation: flicker 0.5s infinite alternate; }
                        @keyframes flicker { 0% { transform: scale(1) rotate(-2deg); opacity: 0.9; } 100% { transform: scale(1.1) rotate(2deg); opacity: 1; box-shadow: 0 0 10px #fbbf24; } }
                        
                        .birthday-greeting { color: #6b7280; text-transform: uppercase; letter-spacing: 2px; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; }
                        .birthday-name { color: #1e1b4b; font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; }
                        .birthday-date { color: #8b5cf6; font-weight: 600; font-size: 1.1rem; margin-top: 0.5rem; }
                        
                        /* Info Card */
                        .birthday-info-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border-radius: 20px; padding: 2rem; border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 10px 30px rgba(0,0,0,0.05); height: 100%; }
                        .info-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
                        .info-item:last-child { border-bottom: none; }
                  </style>
                  <div class="tab-pane fade" id="my-birthday" role="tabpanel">
                      <?php
                      // Zodiac Sign & Prophetic Blessings Helper
                      if (!function_exists('getSpiritualZodiac')) {
                          function getSpiritualZodiac($dateString) {
                              if (empty($dateString)) {
                                  return [
                                      'name' => 'Unknown',
                                      'verse' => 'Philippians 4:13',
                                      'blessing' => 'May the Lord establish your steps and guide you in all wisdom and truth.'
                                  ];
                              }
                              $timestamp = strtotime($dateString);
                              $month = intval(date('m', $timestamp));
                              $day = intval(date('d', $timestamp));
                              
                              $zodiacs = [
                                  ['name' => 'Capricorn', 'start' => '12-22', 'end' => '01-19', 'verse' => 'Isaiah 40:31', 'blessing' => 'May the Lord renew your strength, that you may mount up on wings like eagles, run and not grow weary.'],
                                  ['name' => 'Aquarius', 'start' => '01-20', 'end' => '02-18', 'verse' => 'John 7:38', 'blessing' => 'May rivers of living water flow from your heart, refreshing and bringing life to many souls.'],
                                  ['name' => 'Pisces', 'start' => '02-19', 'end' => '03-20', 'verse' => 'Matthew 4:19', 'blessing' => 'May the Lord make you a fisher of men, walking in deep spiritual insight and fellowship.'],
                                  ['name' => 'Aries', 'start' => '03-21', 'end' => '04-19', 'verse' => 'Joshua 1:9', 'blessing' => 'Be strong and courageous; walk boldly into the assignments of the Lord, knowing He is with you.'],
                                  ['name' => 'Taurus', 'start' => '04-20', 'end' => '05-20', 'verse' => 'Psalm 1:3', 'blessing' => 'You shall be like a tree planted by the rivers of water, yielding fruit in season and never custom-failing.'],
                                  ['name' => 'Gemini', 'start' => '05-21', 'end' => '06-20', 'verse' => 'Proverbs 18:24', 'blessing' => 'May your life be filled with divine relationships, friendship, and the communication of grace.'],
                                  ['name' => 'Cancer', 'start' => '06-21', 'end' => '07-22', 'verse' => 'Psalm 91:1', 'blessing' => 'Dwell securely in the secret place of the Most High, abiding under the shadow of the Almighty.'],
                                  ['name' => 'Leo', 'start' => '07-23', 'end' => '08-22', 'verse' => 'Proverbs 28:1', 'blessing' => 'May you be as bold as a lion in righteousness, leading with divine authority and courage.'],
                                  ['name' => 'Virgo', 'start' => '08-23', 'end' => '09-22', 'verse' => 'Philippians 4:8', 'blessing' => 'May your mind dwell on things that are pure, lovely, honorable, and of good report.'],
                                  ['name' => 'Libra', 'start' => '09-23', 'end' => '10-22', 'verse' => 'Proverbs 11:1', 'blessing' => 'May the Lord guide you with balance, wisdom, justice, and a spirit of peacemaking.'],
                                  ['name' => 'Scorpio', 'start' => '10-23', 'end' => '11-21', 'verse' => 'Luke 10:19', 'blessing' => 'Walk in the authority to tread upon all obstacles, victorious over the enemy in every season.'],
                                  ['name' => 'Sagittarius', 'start' => '11-22', 'end' => '12-21', 'verse' => 'Psalm 127:4', 'blessing' => 'Like arrows in the hand of a warrior, may you be launched forth with accuracy, speed, and impact.']
                              ];

                              foreach ($zodiacs as $z) {
                                  $start = explode('-', $z['start']);
                                  $end = explode('-', $z['end']);
                                  $start_m = intval($start[0]);
                                  $start_d = intval($start[1]);
                                  $end_m = intval($end[0]);
                                  $end_d = intval($end[1]);
                                  
                                  if (($month === $start_m && $day >= $start_d) || ($month === $end_m && $day <= $end_d)) {
                                      return $z;
                                  }
                              }
                              return $zodiacs[0];
                          }
                      }

                      // Get the member id
                      $qMember = $db->prepare('SELECT member_id FROM users WHERE id=:user_id');
                      $qMember->execute([':user_id'=>$user_id]);
                      $row = $qMember->fetch(PDO::FETCH_ASSOC);
                      $member_id = $row['member_id'];
                      
                      $stmt = $db->prepare("SELECT first_name, last_name, bod, phone_no FROM member WHERE id = :user_id");
                      $stmt->bindParam(":user_id", $member_id);
                      $stmt->execute();
                      $user = $stmt->fetch(PDO::FETCH_ASSOC);
                      
                      // Calculate next birthday
                      $currentYear = date('Y');
                      $user_birthday = $user['bod'];
                      $user_name = $user['first_name'] . " " . $user['last_name'];
                      
                      if (!empty($user_birthday) && $user_birthday != '0000-00-00') {
                          $birthdayThisYear = date('Y-m-d', strtotime($currentYear . '-' . date('m-d', strtotime($user_birthday))));
                      
                      $isPassed = false;
                      if (strtotime($birthdayThisYear) < strtotime(date('Y-m-d'))) {
                          $isPassed = true;
                          $nextBirthday = date('Y-m-d', strtotime('+1 year', strtotime($birthdayThisYear)));
                      } else {
                          $nextBirthday = $birthdayThisYear;
                      }
                      
                      $daysUntil = floor((strtotime($nextBirthday) - strtotime(date('Y-m-d'))) / (60 * 60 * 24));
                      $age = date('Y') - date('Y', strtotime($user_birthday)) + ($isPassed ? 1 : 0);
                      $spiritual = getSpiritualZodiac($user_birthday);
                      ?>

                      <!-- Page Header -->
                      <div class="card glass-card mb-4 border-0 shadow-xs p-4" style="background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.6) !important; border-radius: 16px;">
                        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                          <div class="d-flex align-items-center gap-3">
                            <div class="avatar avatar-md bg-gradient-danger rounded text-white d-flex align-items-center justify-content-center shadow-xs" style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);">
                              <i class="bx bx-cake fs-3"></i>
                            </div>
                            <div>
                              <h4 class="mb-1 fw-bold text-heading" style="color: #1e1b4b; font-size: 1.5rem;">My Birthday Celebration</h4>
                              <p class="text-muted mb-0 small" style="font-size: 0.88rem;">Celebrating the gift of life. View your birthdate statement, spiritual blessings, and prophetic scripture.</p>
                            </div>
                          </div>
                          <?php if($daysUntil === 0): ?>
                          <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-label-danger px-3 py-2 rounded-pill fw-semibold" style="font-size: 0.85rem; background-color: rgba(255, 154, 158, 0.2); color: #dc3545; animation: pulse-gift 1.5s infinite alternate;">
                              <i class="bx bx-gift me-1"></i> Today is your Birthday!
                            </span>
                          </div>
                          <?php endif; ?>
                        </div>
                      </div>

                      <div class="row g-4">
                        <!-- Left Column: 3D Flip Card -->
                        <div class="col-lg-5 col-md-6 d-flex justify-content-center">
                          <div class="birthday-card-container">
                            <div class="birthday-card-inner" id="bdayCardInner">
                              <!-- Front Face: The Gift -->
                              <div class="card-face card-face-front">
                                <i class="bx bxs-gift gift-box"></i>
                                <h4 class="fw-bold text-white mb-1">A Gift For You</h4>
                                <p class="text-white-50 small mb-0">Hover or tap to reveal</p>
                                <div class="flip-prompt text-white-50"><i class="bx bx-rotate-right me-1"></i>Open Card</div>
                                
                                <!-- Floating sparkles -->
                                <div class="sparkle" style="left:10%; width:8px; height:8px; animation-delay:0.2s;"></div>
                                <div class="sparkle" style="left:30%; width:10px; height:10px; animation-delay:1.5s;"></div>
                                <div class="sparkle" style="left:70%; width:6px; height:6px; animation-delay:0.7s;"></div>
                                <div class="sparkle" style="left:85%; width:12px; height:12px; animation-delay:2.1s;"></div>
                              </div>
                              
                              <!-- Back Face: The Blessing -->
                              <div class="card-face card-face-back">
                                <div class="birthday-cake">
                                  <div class="cake-base"></div>
                                  <div class="cake-top"></div>
                                  <div class="candle"></div>
                                  <div class="flame"></div>
                                </div>
                                <h5 class="birthday-greeting mt-3">
                                  <?php if($daysUntil === 0){ ?>Happy Birthday!<?php }elseif($isPassed){ ?>Happy Belated Birthday!<?php }else{ ?>Upcoming Birthday!<?php } ?>
                                </h5>
                                <h4 class="birthday-name"><?= htmlspecialchars($user_name); ?></h4>
                                <span class="badge bg-label-primary px-3 py-1 rounded-pill fw-semibold mb-2" style="font-size: 0.8rem; background-color: rgba(102, 126, 234, 0.12); color: #667eea;">
                                  Turning <?= $age ?>
                                </span>
                                <p class="birthday-date"><?= date('F j', strtotime($user_birthday)); ?></p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Right Column: Birthday & Prophetic Info -->
                        <div class="col-lg-7 col-md-6">
                          <div class="birthday-info-card">
                            <h5 class="fw-bold mb-4 text-heading" style="color: #1e1b4b;"><i class="bx bx-bookmark-heart me-2 text-primary"></i>Your Birthday Profile</h5>
                            
                            <div class="info-item">
                              <span class="text-muted small fw-semibold text-uppercase">Birth Date</span>
                              <span class="fw-bold" style="color: #1e1b4b;"><?= date('F j, Y', strtotime($user_birthday)); ?></span>
                            </div>
                            
                            <div class="info-item">
                              <span class="text-muted small fw-semibold text-uppercase">Next Birthday</span>
                              <span class="fw-bold text-primary"><?= date('F j, Y', strtotime($nextBirthday)); ?></span>
                            </div>
                            
                            <div class="info-item">
                              <span class="text-muted small fw-semibold text-uppercase">Days Until Birthday</span>
                              <?php if ($daysUntil === 0): ?>
                                <span class="badge bg-label-danger px-3 py-2 rounded-pill fw-bold">Today! 🎉</span>
                              <?php else: ?>
                                <span class="fw-bold <?= $daysUntil <= 30 ? 'text-warning' : 'text-heading' ?>"><?= $daysUntil ?> days</span>
                              <?php endif; ?>
                            </div>
                            
                            <div class="info-item">
                              <span class="text-muted small fw-semibold text-uppercase">Spiritual Zodiac</span>
                              <span class="badge bg-label-info px-3 py-2 rounded-pill fw-bold" style="background-color: rgba(3, 195, 236, 0.12); color: #03c3ec;"><?= htmlspecialchars($spiritual['name']) ?></span>
                            </div>

                            <!-- Prophetic Blessing Block -->
                            <div class="p-3 mt-4 rounded-3 border border-dashed border-primary" style="background: rgba(111, 66, 193, 0.04);">
                              <div class="d-flex align-items-center gap-2 mb-2">
                                <i class="bx bx-shield-quarter text-primary fs-4"></i>
                                <span class="fw-bold small text-primary text-uppercase" style="letter-spacing: 0.05em;">Prophetic Blessing & Scripture</span>
                              </div>
                              <blockquote class="blockquote fs-6 mb-2 fw-semibold" style="color: #1e1b4b; border: none; padding: 0;">
                                "<?= htmlspecialchars($spiritual['blessing']) ?>"
                              </blockquote>
                              <cite class="d-block text-accent fw-bold small">— <?= htmlspecialchars($spiritual['verse']) ?></cite>
                            </div>
                          </div>

                          <?php if ($daysUntil <= 30 && $daysUntil > 0): ?>
                          <div class="alert alert-info border-0 shadow-xs p-3 mt-4 d-flex align-items-center gap-2" style="border-radius: 12px;">
                            <i class="bx bx-bell fs-4 text-info"></i>
                            <div class="mb-0 small">
                              <strong>Celebration Coming Soon!</strong> Your birthday is just <strong><?= $daysUntil; ?></strong> days away!
                            </div>
                          </div>
                          <?php endif; ?>
                        </div>
                      </div>
                      
                      <?php if($daysUntil === 0): ?>
                      <!-- Confetti trigger for birthday -->
                      <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
                      <script>
                        document.addEventListener('DOMContentLoaded', function() {
                          var duration = 5 * 1000;
                          var animationEnd = Date.now() + duration;
                          var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

                          function randomInRange(min, max) {
                            return Math.random() * (max - min) + min;
                          }

                          var interval = setInterval(function() {
                            var timeLeft = animationEnd - Date.now();

                            if (timeLeft <= 0) {
                              return clearInterval(interval);
                            }

                            var particleCount = 50 * (timeLeft / duration);
                            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
                          }, 250);
                        });
                      </script>
                      <?php endif; ?>
                      
                      <!-- JavaScript to toggle flip on mobile devices -->
                      <script>
                        document.addEventListener('DOMContentLoaded', function() {
                          const card = document.getElementById('bdayCardInner');
                          if (card) {
                            card.addEventListener('click', function() {
                              this.classList.toggle('flipped');
                            });
                          }
                        });
                      </script>
                      <?php } else { ?>
                      <div class="alert alert-warning border-0 shadow-xs p-4" style="border-radius: 12px;">
                        <h5 class="fw-bold text-warning mb-2"><i class="bx bx-exclamation-triangle me-2 fs-4"></i>Birthday Not Set</h5>
                        <p class="mb-0">We couldn't find your birthday information in your account details. Please update your profile in settings.</p>
                      </div>
                      <?php } ?>
                </div>
                </div>

                

                <?php
                // Helper function to get zodiac sign based on date
                
                ?>
              </div>

              <!-- End of the Tab content -->
              <!-- / Content -->
            </div>
            <!--  end of the content -->

          
            <!-- Footer -->
            <?php @include('includes/footer.php');?>
            <!-- / Footer -->
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
   <!-- <script src="assets/js/dashboards-analytics.js"></script>-->
     <!-- Page JS -->
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
     <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
     <link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css" rel="stylesheet">
     <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
     <!-- <script src="assets/js/app-calendar-events.js"></script> -->
    
    <script src="assets/js/app-calendar.js"></script>
  
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>


    <script>
      document.querySelectorAll('.nav-tabs-custom .nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    // Add loading states
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 1000);
        });
    });

    let cardColor, headingColor, legendColor, labelColor, shadeColor, borderColor, fontFamily;
      cardColor = config.colors.cardColor;
      headingColor = config.colors.headingColor;
      legendColor = config.colors.bodyColor;
      labelColor = config.colors.textMuted;
      borderColor = config.colors.borderColor;
      fontFamily = config.fontFamily;
    
        const orderAreaChartEl = document.querySelector('#orderChart');
      $('#attendanceTable').DataTable({
      "paging": true,  // Enables pagination
      "searching": true,  // Enables search bar
      "ordering": true,  // Enables sorting
      "info": true,
      "responsive":true,  // Shows info text
      "lengthChange": true, // Enables page length change
      dom: 'Bfrtip',  // This specifies the position of the buttons
    buttons: [
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
      },{
          extend: 'pdf',
          title: 'Meeting Attendance Report',
          messageTop: 'This is a system generated report.',
          className: 'btn btn-danger me-2 mb-2',
          customize: function (doc) {
            doc.styles.title = {
          color: '#4CAF50',
          fontSize: '16',
          alignment: 'center'
            };
            doc.content.splice(0, 0, {
              text: 'Report - JEN/25/ATT',
              fontSize: 10,
              alignment: 'right',
              margin: [0, 0, 0, 10]
            });
        }
        },
      {
        extend: 'print',
        className: 'btn btn-info me-2 mb-2',
        text: '<i class="bx bx-printer me-1"></i> Print'
      }
    ]
    });

    if ($('#dashboardMyCellTable').length) {
      $('#dashboardMyCellTable').DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        lengthChange: true,
        pageLength: 10,
        columnDefs: [{ orderable: false, targets: [5] }],
        language: { searchPlaceholder: 'Search members…', search: '' }
      });
    }

    if ($('#userPledgesTable').length) {
      $('#userPledgesTable').DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        lengthChange: true,
        pageLength: 5,
        language: { searchPlaceholder: 'Search pledges…', search: '' }
      });
    }

    if ($('#userRedemptionsTable').length) {
      $('#userRedemptionsTable').DataTable({
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        lengthChange: true,
        pageLength: 5,
        language: { searchPlaceholder: 'Search payments…', search: '' }
      });
    }

    fetch('analysis/get-member-attendance.php?member_id=<?=$member_id?>') // ðŸ‘ˆ change to desired member_id
      .then(res => res.json())
      .then(attendanceData => {
        const orderAreaChartConfig = {
          chart: {
            height: 80,
            type: 'area',
            toolbar: { show: false },
            sparkline: { enabled: true }
          },
          markers: {
            size: 6,
            colors: 'transparent',
            strokeColors: 'transparent',
            strokeWidth: 4,
            discrete: [
              {
                fillColor: cardColor,
                seriesIndex: 0,
                dataPointIndex: 6,
                strokeColor: config.colors.success,
                strokeWidth: 2,
                size: 6,
                radius: 8
              }
            ],
            offsetX: -1,
            hover: { size: 7 }
          },
          grid: {
            show: false,
            padding: { top: 15, right: 7, left: 0 }
          },
          colors: [config.colors.success],
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.4,
              gradientToColors: [config.colors.cardColor],
              opacityTo: 0.4,
              stops: [0, 100]
            }
          },
          dataLabels: { enabled: false },
          stroke: {
            width: 2,
            curve: 'smooth'
          },
          series: [
            {
              name: 'Monthly Attendance',
              data: attendanceData
            }
          ],
          xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                labels: {
                  show: true,
                  style: {
                    fontSize: '10px',
                    colors: '#999'
                  }
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
              },
          yaxis: { show: false }
        };
    
        if (typeof orderAreaChartEl !== 'undefined' && orderAreaChartEl !== null) {
          const orderAreaChart = new ApexCharts(orderAreaChartEl, orderAreaChartConfig);
          orderAreaChart.render();
        }
      })
      .catch(error => console.error('Failed to load member attendance:', error));
      const totalRevenueChartEl = document.querySelector('#attendanceChart');
      if (totalRevenueChartEl) {
        let totalRevenueChart;
        const yearSelect = document.getElementById('attendanceYearSelect');

        function fetchAttendanceData(year) {
          fetch('analysis/attendance_stats.php?year=' + year)
          .then(response => response.json())
          .then(monthlyData => {
            if (totalRevenueChart) {
              totalRevenueChart.updateSeries([
                {
                  name: 'Attendance',
                  data: monthlyData
                }
              ]);
            } else {
              const totalRevenueChartOptions = {
                series: [
                  {
                    name: 'Attendance',
                    data: monthlyData
                  }
                ],
                chart: {
                  height: 300,
                  stacked: true,
                  type: 'bar',
                  toolbar: { show: false }
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '30%',
                    borderRadius: 8,
                    startingShape: 'rounded',
                    endingShape: 'rounded',
                    borderRadiusApplication: 'around'
                  }
                },
                colors: [config.colors.primary],
                dataLabels: { enabled: false },
                stroke: {
                  curve: 'smooth',
                  width: 6,
                  lineCap: 'round',
                  colors: [cardColor]
                },
                legend: {
                  show: true,
                  horizontalAlign: 'left',
                  position: 'top',
                  markers: {
                    size: 4,
                    radius: 12,
                    shape: 'circle',
                    strokeWidth: 0
                  },
                  fontSize: '13px',
                  fontFamily: fontFamily,
                  fontWeight: 400,
                  labels: {
                    colors: legendColor,
                    useSeriesColors: false
                  },
                  itemMargin: {
                    horizontal: 10
                  }
                },
                grid: {
                  strokeDashArray: 7,
                  borderColor: borderColor,
                  padding: {
                    top: 0,
                    bottom: -8,
                    left: 20,
                    right: 20
                  }
                },
                fill: { opacity: 1 },
                xaxis: {
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  labels: {
                    style: {
                      fontSize: '13px',
                      fontFamily: fontFamily,
                      colors: labelColor
                    }
                  },
                  axisTicks: { show: false },
                  axisBorder: { show: false }
                },
                yaxis: {
                  labels: {
                    style: {
                      fontSize: '13px',
                      fontFamily: fontFamily,
                      colors: labelColor
                    }
                  }
                },
                responsive: [/* keep your breakpoints here unchanged */],
                states: {
                  hover: { filter: { type: 'none' } },
                  active: { filter: { type: 'none' } }
                }
              };

              totalRevenueChart = new ApexCharts(totalRevenueChartEl, totalRevenueChartOptions);
              totalRevenueChart.render();
            }
          })
          .catch(error => {
            console.error('Failed to fetch monthly attendance:', error);
          });
        }

        if (yearSelect) {
          fetchAttendanceData(yearSelect.value);
          yearSelect.addEventListener('change', function() {
            fetchAttendanceData(this.value);
          });
        } else {
          fetchAttendanceData(new Date().getFullYear());
        }
      }

  // Growth Chart - Radial Bar Chart
  // --------------------------------------------------------------------
  const growthChartEl = document.querySelector('#growthChart'),
    growthChartOptions = {
      
      labels: ['Growth'],
      chart: {
        height: 200,
        type: 'radialBar'
      },
      plotOptions: {
        radialBar: {
          size: 150,
          offsetY: 10,
          startAngle: -150,
          endAngle: 150,
          hollow: {
            size: '55%'
          },
          track: {
            background: cardColor,
            strokeWidth: '100%'
          },
          dataLabels: {
            name: {
              offsetY: 15,
              color: legendColor,
              fontSize: '15px',
              fontWeight: '500',
              fontFamily: fontFamily
            },
            value: {
              offsetY: -25,
              color: headingColor,
              fontSize: '22px',
              fontWeight: '500',
              fontFamily: fontFamily
            }
          }
        }
      },
      colors: [config.colors.primary],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          shadeIntensity: 0.5,
          gradientToColors: [config.colors.primary],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 0.6,
          stops: [30, 70, 100]
        }
      },
      stroke: {
        dashArray: 5
      },
      grid: {
        padding: {
          top: -35,
          bottom: -10
        }
      },
      states: {
        hover: {
          filter: {
            type: 'none'
          }
        },
        active: {
          filter: {
            type: 'none'
          }
        }
      }
    };

    if (growthChartEl !== undefined && growthChartEl !== null) {
      fetch('analysis/get-growth-rate.php')
        .then(res => res.json())
        .then(data => {
          const growthRate = data.growth;
    
          const growthChart = new ApexCharts(growthChartEl, {
            ...growthChartOptions,
            series: [growthRate]
          });
    
          growthChart.render();
        })
        .catch(err => {
          console.error("Failed to fetch growth rate", err);
        });
    }
    

    </script>

    <!-- Place this tag before closing body tag for github widget button. -->
    </body>
</html>
