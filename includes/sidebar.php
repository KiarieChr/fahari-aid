<?php
$current_page = basename($_SERVER['PHP_SELF']);

$dashboard_pages = ['dashboard.php'];
$is_dashboard_active = in_array($current_page, $dashboard_pages);
$settings_pages = ['users.php','user_profile.php'];
$is_users_active = in_array($current_page,$settings_pages);
$cells_pages = ['cells.php', 'assign_cell.php','my_cell.php','cell_attendance.php', 'cell-leader-dashboard.php', 'cell-report-form.php', 'cell-oversight-dashboard.php'];
$is_cells_active = in_array($current_page,$cells_pages);
$user_pages = ['users.php','view-members.php'];
$is_userssettings_active = in_array($current_page,$user_pages);
$roles_pages = ['user_roles.php','permissions.php'];
$is_roles_active = in_array($current_page,$roles_pages);
$members_pages = ['view-members.php', 'member_portal_status.php', 'members.php', 'members_dashboard.php', 'departments.php'];
$is_members_active = in_array($current_page,$members_pages);
$followup_pages = ['attendance.php'];
$is_followup_active = in_array($current_page,$followup_pages);
$is_assimilation_active = ($current_page === 'assimilation.php');
$meeting_pages = ['meetings.php','view_meetings.php'];
$is_meetings_active= in_array($current_page,$meeting_pages);
$is_financial_mgmt_active = in_array($current_page, ['collections.php', 'accounting.php', 'audit_logs.php', 'expenditures.php']);
$is_budgeting_active = in_array($current_page, ['budgeting.php']);
$is_pledges_active = in_array($current_page, ['contributions.php', 'pledge-report.php', 'make-pledge.php', 'redeem-pledge.php']);
$event_pages = ['events.php', 'manage_events.php', 'event_registrations.php', 'event_checkin.php'];
$is_events_active = in_array($current_page, $event_pages);
?>
<style>
/* Premium Sidebar Styles */
.premium-sidebar {
    backdrop-filter: blur(14px) !important;
    -webkit-backdrop-filter: blur(14px) !important;
    background-color: rgba(255, 255, 255, 0.75) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 4px 0 24px rgba(0,0,0,0.04);
}
.dark-style .premium-sidebar {
    background-color: rgba(43, 44, 64, 0.75) !important;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
}

/* Custom Ultra-Thin Scrollbar */
.premium-sidebar .menu-inner::-webkit-scrollbar {
    width: 4px;
    background-color: transparent;
}
.premium-sidebar .menu-inner::-webkit-scrollbar-thumb {
    background-color: rgba(105, 108, 255, 0);
    border-radius: 10px;
    transition: background-color 0.3s ease;
}
.premium-sidebar:hover .menu-inner::-webkit-scrollbar-thumb {
    background-color: rgba(105, 108, 255, 0.3);
}

/* Premium Active State Gradient Pill */
.premium-sidebar .menu-item.active > .menu-link {
    background: linear-gradient(118deg, #696cff, #8592ff) !important;
    box-shadow: 0px 4px 14px rgba(105, 108, 255, 0.4) !important;
    color: #ffffff !important;
    border-radius: 8px;
    margin: 0 12px;
    position: relative;
    overflow: hidden;
}
/* Glowing Accent Line */
.premium-sidebar .menu-item.active > .menu-link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: rgba(255,255,255,0.8);
    box-shadow: 0 0 8px rgba(255,255,255,0.8);
}

.premium-sidebar .menu-item.active > .menu-link i {
    color: #ffffff !important;
}

/* Micro-Animations & Hover Effects */
.premium-sidebar .menu-item .menu-link i {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.premium-sidebar .menu-item:not(.active) .menu-link:hover i {
    transform: translateX(4px) scale(1.1);
    color: #696cff;
}
.premium-sidebar .menu-item:not(.active) .menu-link:hover {
    background-color: rgba(105, 108, 255, 0.05);
    border-radius: 8px;
    margin: 0 12px;
}

/* Typography & Branding */
.premium-sidebar .menu-header-text {
    letter-spacing: 1.5px;
    opacity: 0.6;
    font-weight: 700;
    font-size: 0.75rem;
}
.app-brand-text.premium-logo {
    background: linear-gradient(118deg, #696cff, #8592ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0px 2px 10px rgba(105, 108, 255, 0.2);
    font-size: 1.5rem;
    letter-spacing: 1px;
}
</style>
<aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme premium-sidebar">
    <div class="app-brand demo">
      <a href="index.php" class="app-brand-link">
        <span class="app-brand-logo demo">
          <span class="text-primary">
           
          </span>
        </span>
        <span class="app-brand-text demo menu-text fw-bold ms-2 premium-logo">J.E.N</span>
      </a>

      <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large ms-auto">
        <i class="icon-base bx bx-chevron-left"></i>
      </a>
    </div>

    <div class="menu-divider mt-0"></div>

    <div class="menu-inner-shadow"></div>

    <ul class="menu-inner py-1">
      <!-- Dashboards -->
      <li class="menu-item <?php echo $is_dashboard_active ? 'active open' : ''; ?>">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-home-smile"></i>
          <div class="text-truncate" data-i18n="Dashboards">Dashboard</div>
        
        </a>
        <ul class="menu-sub">
          <li class="menu-item <?php echo ($current_page == 'dashboard.php') ? 'active' : ''; ?>">
            <a href="dashboard.php" class="menu-link">
              <div class="text-truncate" data-i18n="Analytics">Analytics</div>
            </a>
          </li>
          <?php if(userHasPermission($db, $user_id, 'senior_leadership')) { ?>
          <li class="menu-item <?php echo ($current_page == 'leadership_dashboard.php') ? 'active' : ''; ?>">
            <a href="leadership_dashboard.php" class="menu-link">
              <div class="text-truncate" data-i18n="Senior Leadership">Leadership Command</div>
            </a>
          </li>
          <?php } ?>
        </ul>
      </li>

     

      <!-- Apps & Pages -->
      <li class="menu-header small text-uppercase">
        <span class="menu-header-text">Main Operations</span>
      </li>
       <!-- Management-->
       <li class="menu-item <?php echo $is_cells_active ? 'active open' : ''; ?>">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-layout"></i>
          <div class="text-truncate" data-i18n="Layouts">Cell Management</div>
        </a>

        <ul class="menu-sub">
          <li class="menu-item <?php echo ($current_page == 'cell-leader-dashboard.php' || $current_page == 'cell-report-form.php') ? 'active' : ''; ?>">
            <a href="cell-leader-dashboard.php" class="menu-link">
              <div class="text-truncate" data-i18n="CellLeaderDash">My Cell Reports</div>
            </a>
          </li>
          <?php if(userHasPermission($db,$user_id,'cell_oversight')){?>
          <li class="menu-item <?php echo ($current_page == 'cell-oversight-dashboard.php') ? 'active' : ''; ?>">
            <a href="cell-oversight-dashboard.php" class="menu-link">
              <div class="text-truncate" data-i18n="CellOversight">Cell Oversight Dashboard</div>
            </a>
          </li>
          <li class="menu-item <?php echo ($current_page == 'cells.php') ? 'active' : ''; ?> ">
            <a href="cells.php" class="menu-link ">
              <div class="text-truncate" data-i18n="Cell Directory">Cell Directory</div>
            </a>
          </li>
          <?php } if(userHasPermission($db,$user_id,'add_to_cell')){?>
          <li class="menu-item <?php echo ($current_page == 'assign_cell.php') ? 'active' : ''; ?>">
            <a href="assign_cell.php" class="menu-link">
              <div class="text-truncate" data-i18n="Departments">Assign Members</div>
            </a>
          </li>
          <?php }?>
          <li class="menu-item <?php echo ($current_page == 'my_cell.php') ? 'active' : ''; ?>">
            <a href="my_cell.php?id=<?php echo $user_id;?>" class="menu-link">
              <div class="text-truncate" data-i18n="Departments">My Cell</div>
            </a>
          </li>
          <li class="menu-item <?php echo ($current_page == 'cell_attendance.php') ? 'active' : ''; ?>">
            <a href="cell_attendance.php" class="menu-link">
              <div class="text-truncate" data-i18n="CellAttendance">Cell Attendance</div>
            </a>
          </li>
        </ul>
      </li>
      
      <!-- Equipping & Training -->
      <li class="menu-item <?php echo ($current_page == 'training_dashboard.php' || $current_page == 'mentor_dashboard.php' || $current_page == 'manage_mentors_coaches.php') ? 'active open' : ''; ?>">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-book-reader"></i>
          <div class="text-truncate" data-i18n="Training">Equipping & Training</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item <?php echo ($current_page == 'training_dashboard.php') ? 'active' : ''; ?>">
            <a href="training_dashboard.php" class="menu-link">
              <div class="text-truncate" data-i18n="My Training">My Training</div>
            </a>
          </li>
          <?php 
          // Only show mentorship hub to mentors/coaches
          $isMentorOrCoach = true;
          if(isset($user_id)) {
              $stmtMC = $db->prepare("SELECT 1 FROM trn_mentors WHERE user_id = :uid1 AND status = 1 UNION SELECT 1 FROM trn_coaches WHERE user_id = :uid2 AND status = 1");
              $stmtMC->execute([':uid1' => $user_id, ':uid2' => $user_id]);
              if($stmtMC->fetchColumn()) {
                  $isMentorOrCoach = true;
              }
          }
          if($isMentorOrCoach){ 
          ?>
          <li class="menu-item <?php echo ($current_page == 'mentor_dashboard.php') ? 'active' : ''; ?>">
            <a href="mentor_dashboard.php" class="menu-link">
              <div class="text-truncate" data-i18n="Mentorship Hub">Mentorship Hub</div>
            </a>
          </li>
          <?php } ?>
          <?php if(userHasPermission($db, $user_id, 'senior_leadership') || userHasPermission($db, $user_id, 'dc_coordinator')): ?>
          <li class="menu-item <?php echo ($current_page == 'manage_mentors_coaches.php') ? 'active' : ''; ?>">
            <a href="manage_mentors_coaches.php" class="menu-link">
              <div class="text-truncate" data-i18n="Manage Trainers">Manage Trainers</div>
            </a>
          </li>
          <?php endif; ?>
        </ul>
      </li>
      <?php if(userHasPermission($db, $user_id, 'followup_mgmt')){?>
      <li class="menu-item <?php echo $is_followup_active ? 'active open' : ''; ?>">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon icon-base bx bx-task"></i>
          <div data-i18n="Users">Follow Up</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a href="javascript:void(0);" class="menu-link menu-toggle">
              <div data-i18n="User Profile">Outreaches</div>
            </a>
            <ul class="menu-sub">
              <li class="menu-item">
                <a href="" class="menu-link">
                  <div data-i18n="Profile">High School </div>
                </a>
              </li>
              <li class="menu-item">
                <a href="" class="menu-link">
                  <div data-i18n="Teams">High School Students</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="" class="menu-link">
                  <div data-i18n="Projects">Other Outreaches</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="" class="menu-link">
                  <div data-i18n="Connections">Outreach Budgeting</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="" class="menu-link">
                  <div data-i18n="Connections">Outreach Scheduling</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="" class="menu-link">
                  <div data-i18n="Connections">Outreach Reports</div>
                </a>
              </li>
            </ul>
          </li>
          <li class="menu-item">
            <a href="javascript:void(0);" class="menu-link menu-toggle">
                <div data-i18n="Account Settings">Campus Fellowships</div>
            </a>
            <ul class="menu-sub">
              <li class="menu-item">
                <a href="" class="menu-link">
                  <div data-i18n="Account">Fellowships</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="" class="menu-link">
                  <div data-i18n="Security">Fellowship Program</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="" class="menu-link">
                  <div data-i18n="Billing & Plans">Fellowship Support</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="" class="menu-link">
                  <div data-i18n="Notifications">Campus Mentorship</div>
                </a>
              </li>
              
            </ul>
          </li>
          <?php if(userHasPermission($db,$user_id,'view_attendance')){?>
          <li class="menu-item <?php echo ($current_page == 'attendance.php') ? 'active' : ''; ?>">
            <a href="attendance.php" class="menu-link">
              <div data-i18n="Attendance">Attendance</div>
            </a>
          </li>
          <?php }?>
          </ul>
        

      </li>
      <?php }?>
      <li class="menu-item <?php echo $is_meetings_active ? 'active open' : ''; ?>">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon icon-base bx bx-calendar-event"></i>
            <div data-i18n="View">Meetings </div>
        </a>
            <ul class="menu-sub">
            <?php if(userHasPermission($db,$user_id,'view_meeting')){?>
              <li class="menu-item <?php echo ($current_page == 'view_meetings.php') ? 'active' : ''; ?>">
                <a href="view_meetings.php" class="menu-link">
                  <div data-i18n="Account">View Meetings</div>
                </a>
              </li>
              <?php }?>
              <?php if(userHasPermission($db,$user_id,'add_meeting')){?>
              <li class="menu-item <?php echo ($current_page == 'meetings.php') ? 'active': '';?>">
                <a href="meetings.php" class="menu-link ">
                  <div data-i18n="Meetings">Meetings</div>
                </a>
              </li>
              <?php }?>
              <?php if(userHasPermission($db,$user_id,'add_meeting')){?>
              <li class="menu-item <?php echo ($current_page == 'meetingMin.php') ? 'active': '';?>">
                <a href="meetingMin.php" class="menu-link ">
                  <div data-i18n="Meeting">Meeting Minutes</div>
                </a>
              </li>
              <?php }?>
              <li class="menu-item">
                <a href="" class="menu-link">
                  <div data-i18n="Connections">My Attendance</div>
                </a>
              </li>
            </ul>
      </li>

      <!-- Events & Programs -->
      <?php if(userHasPermission($db,$user_id,'view_meeting')){ // Utilizing similar permission block for now ?>
      <li class="menu-item <?php echo $is_events_active ? 'active open' : ''; ?>">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon icon-base bx bx-calendar-star"></i>
            <div data-i18n="View">Events & Programs </div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item <?php echo ($current_page == 'events.php') ? 'active' : ''; ?>">
            <a href="events.php" class="menu-link">
              <div data-i18n="Account">Events Dashboard</div>
            </a>
          </li>
          <li class="menu-item <?php echo ($current_page == 'manage_events.php') ? 'active' : ''; ?>">
            <a href="manage_events.php" class="menu-link">
              <div data-i18n="Account">Manage Events</div>
            </a>
          </li>
          <li class="menu-item <?php echo ($current_page == 'event_registrations.php') ? 'active' : ''; ?>">
            <a href="event_registrations.php" class="menu-link">
              <div data-i18n="Account">Registrations & RSVP</div>
            </a>
          </li>
          <li class="menu-item <?php echo ($current_page == 'event_checkin.php') ? 'active' : ''; ?>">
            <a href="event_checkin.php" class="menu-link">
              <div data-i18n="Account">Day-Of Check-In</div>
            </a>
          </li>
        </ul>
      </li>
      <?php }?>
      <li class="menu-item <?php echo $is_members_active ? 'active open' : ''; ?>">
           
            <a href="javascript:void(0);" class="menu-link menu-toggle">
            <i class="menu-icon tf-icons bx bx-group"></i>
              <div data-i18n="View">Members</div>
            </a>
            <ul class="menu-sub">
              <?php if(userHasPermission($db,$user_id,'view_members')){?>
              <li class="menu-item <?php echo ($current_page == 'members_dashboard.php') ? 'active' : ''; ?>">
                <a href="members_dashboard.php" class="menu-link">
                  <div data-i18n="MembersDashboard">Members Dashboard</div>
                </a>
              </li>
              <li class="menu-item <?php echo ($current_page == 'view-members.php') ? 'active' : ''; ?>">
                <a href="view-members.php" class="menu-link">
                  <div data-i18n="Security">View Members</div>
                </a>
              </li>
              <li class="menu-item <?php echo ($current_page == 'member_portal_status.php') ? 'active' : ''; ?>">
                <a href="member_portal_status.php" class="menu-link">
                  <div data-i18n="PortalStatus">Portal Access Status</div>
                </a>
              </li>
              <li class="menu-item <?php echo ($current_page == 'departments.php') ? 'active' : ''; ?>">
                <a href="departments.php" class="menu-link">
                  <div data-i18n="Departments">Ministries & Departments</div>
                </a>
              </li>
              <?php } ?>
              <!-- <li class="menu-item <?php echo ($current_page == 'members.php') ? 'active' : ''; ?>">
                <a href="members.php" class="menu-link">
                  <div data-i18n="Connections">Connections</div>
                </a>
              </li> -->
            </ul>
      </li>

      <!-- Assimilation Module -->
      <li class="menu-item <?php echo $is_assimilation_active ? 'active' : ''; ?>">
        <a href="assimilation.php" class="menu-link">
          <i class="menu-icon tf-icons bx bx-user-check"></i>
          <div class="text-truncate" data-i18n="Assimilation">Assimilation</div>
          <div class="badge rounded-pill ms-auto" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-size:.65rem;padding:3px 8px;">New</div>
        </a>
      </li>

      <?php if(userHasPermission($db,$user_id,'prayer_mgt')){?>
      <li class="menu-item">
           <a href="javascript:void(0);" class="menu-link menu-toggle">
           <i class="menu-icon tf-icons bx bx-bxs-hot"></i>
             <div data-i18n="View">Prayers</div>
           </a>
           <ul class="menu-sub">
             
             <li class="menu-item">
               <a href="instructions.php" class="menu-link">
                 <div data-i18n="Security">Prophetic Instructions</div>
               </a>
             </li>
             
             <li class="menu-item">
               <a href="communications-view.php" class="menu-link">
                 <div data-i18n="Communications">View Communications</div>
               </a>
             </li>
             <li class="menu-item <?php echo ($current_page == 'fasting_dashboard.php') ? 'active' : '';?>">
               <a href="fasting_dashboard.php" class="menu-link">
                 <div data-i18n="Connections">Fasting Schedule</div>
               </a>
             </li>
           </ul>
         </li>
         <?php }?>
       <!-- Apps & Pages -->
     
        <!-- Apps & Pages -->
      <li class="menu-header small text-uppercase">
        <span class="menu-header-text">Finance Operations</span>
      </li>
      <!-- Financial Management & Accounting -->
      <li class="menu-item <?php echo $is_financial_mgmt_active ? 'active open' : ''; ?>">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-calculator"></i>
          <div class="text-truncate" data-i18n="FinancialManagement">Financial Management & Accounting</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item <?php echo ($current_page == 'collections.php') ? 'active' : ''; ?>">
            <a href="collections.php" class="menu-link">
              <div class="text-truncate" data-i18n="Collections">Collections & Income</div>
            </a>
          </li>
          <li class="menu-item <?php echo ($current_page == 'accounting.php') ? 'active' : ''; ?>">
            <a href="accounting.php" class="menu-link">
              <div class="text-truncate" data-i18n="AccountingLedger">General Ledger & Statements</div>
            </a>
          </li>
          <li class="menu-item <?php echo ($current_page == 'expenditures.php') ? 'active' : ''; ?>">
            <a href="expenditures.php" class="menu-link">
              <div class="text-truncate" data-i18n="Expenditures">Bills & Expenditures</div>
            </a>
          </li>
          <?php if(userHasPermission($db, $user_id, 'view_audit_logs')){ ?>
          <li class="menu-item <?php echo ($current_page == 'audit_logs.php') ? 'active' : ''; ?>">
            <a href="audit_logs.php" class="menu-link">
              <div class="text-truncate" data-i18n="AuditTrail">Audit Trail</div>
            </a>
          </li>
          <?php } ?>
        </ul>
      </li>

      <!-- Budgeting Management -->
      <li class="menu-item <?php echo $is_budgeting_active ? 'active open' : ''; ?>">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-pie-chart-alt-2"></i>
          <div class="text-truncate" data-i18n="BudgetingManagement">Budgeting Management</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item <?php echo ($current_page == 'budgeting.php') ? 'active' : ''; ?>">
            <a href="budgeting.php" class="menu-link">
              <div class="text-truncate" data-i18n="BudgetsDirectory">Budgets Directory</div>
            </a>
          </li>
        </ul>
      </li>

      <!-- Pledge Management -->
      <li class="menu-item <?php echo $is_pledges_active ? 'active open' : ''; ?>">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bi bi-hearts"></i>
          <div class="text-truncate" data-i18n="PledgeManagement">Pledge Management</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item <?php echo ($current_page == 'contributions.php') ? 'active' : ''; ?>">
            <a href="contributions.php" class="menu-link">
              <div class="text-truncate" data-i18n="PledgesDirectory">Record & View Pledges</div>
            </a>
          </li>
          <li class="menu-item <?php echo ($current_page == 'pledge-report.php') ? 'active' : ''; ?>">
            <a href="pledge-report.php" class="menu-link">
              <div class="text-truncate" data-i18n="PledgeAnalytics">Partnership Analytics</div>
            </a>
          </li>
          <li class="menu-item <?php echo ($current_page == 'make-pledge.php') ? 'active' : ''; ?>">
            <a href="make-pledge.php" class="menu-link">
              <div class="text-truncate" data-i18n="MakePledge">Make Partnership Pledge</div>
            </a>
          </li>
          <li class="menu-item <?php echo ($current_page == 'redeem-pledge.php') ? 'active' : ''; ?>">
            <a href="redeem-pledge.php" class="menu-link">
              <div class="text-truncate" data-i18n="RedeemPledge">Redeem Pledge</div>
            </a>
          </li>
        </ul>
      </li>  

      <li class="menu-header small text-uppercase">
        <span class="menu-header-text">Documents</span>
      </li>

      <!-- Training & Mentorship Module -->
      <li class="menu-item <?php echo ($current_page == 'training_dashboard.php') ? 'active' : ''; ?>">
        <a href="training_dashboard.php" class="menu-link">
          <i class="menu-icon tf-icons bx bx-book-reader"></i>
          <div class="text-truncate" data-i18n="Training">Training & Mentorship</div>
          <div class="badge rounded-pill ms-auto" style="background:linear-gradient(135deg,#10b981,#047857);color:#fff;font-size:.65rem;padding:3px 8px;">New</div>
        </a>
      </li>
      <li class="menu-item">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-file"></i>
          <div class="text-truncate" data-i18n="Front Pages">Discipleship</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a
              href="discipleshipDash.php"
              class="menu-link"
              target="">
              <div class="text-truncate" data-i18n="Landing">Discipleship Dashboard</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href="periodicals.php"
              class="menu-link"
              target="">
              <div class="text-truncate" data-i18n="Pricing">Periodicals/Heralds</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="">
              <div class="text-truncate" data-i18n="Payment">Devotionals</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="">
              <div class="text-truncate" data-i18n="Checkout">Bible Plan</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="">
              <div class="text-truncate" data-i18n="Help Center">Prayer Schedule</div>
            </a>
          </li>
        </ul>
      </li> 
      <li class="menu-item">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-file"></i>
          <div class="text-truncate" data-i18n="Front Pages">Other Write Ups</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="">
              <div class="text-truncate" data-i18n="Landing">Discipleship Guides</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="">
              <div class="text-truncate" data-i18n="Pricing">Periodicals/Heralds</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="">
              <div class="text-truncate" data-i18n="Payment">Devotionals</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="">
              <div class="text-truncate" data-i18n="Checkout">Bible Plan</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="">
              <div class="text-truncate" data-i18n="Help Center">Prayer Schedule</div>
            </a>
          </li>
        </ul>
      </li>
      <?php $others = '';
      if($others === 'Active'){?>
      <!-- Front Pages -->
      <li class="menu-item">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-store"></i>
          <div class="text-truncate" data-i18n="Front Pages">Front Pages</div>
          <div class="badge rounded-pill bg-label-primary text-uppercase fs-tiny ms-auto">Pro</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="_blank">
              <div class="text-truncate" data-i18n="Landing">Landing</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="_blank">
              <div class="text-truncate" data-i18n="Pricing">Pricing</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="_blank">
              <div class="text-truncate" data-i18n="Payment">Payment</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href=""
              class="menu-link"
              target="_blank">
              <div class="text-truncate" data-i18n="Checkout">Checkout</div>
            </a>
          </li>
          <li class="menu-item">
            <a
              href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/html/front-pages/help-center-landing.html"
              class="menu-link"
              target="_blank">
              <div class="text-truncate" data-i18n="Help Center">Help Center</div>
            </a>
          </li>
        </ul>
      </li>
      <li class="menu-item">
        <a
          href=""
          target="_blank"
          class="menu-link">
          <i class="menu-icon tf-icons bx bx-envelope"></i>
          <div class="text-truncate" data-i18n="Email">Email</div>
          <div class="badge rounded-pill bg-label-primary text-uppercase fs-tiny ms-auto">Pro</div>
        </a>
      </li>
      <li class="menu-item">
        <a
          href=""
          target="_blank"
          class="menu-link">
          <i class="menu-icon tf-icons bx bx-chat"></i>
          <div class="text-truncate" data-i18n="Chat">Chat</div>
          <div class="badge rounded-pill bg-label-primary text-uppercase fs-tiny ms-auto">Pro</div>
        </a>
      </li>
      <li class="menu-item">
        <a
          href=""
          target="_blank"
          class="menu-link">
          <i class="menu-icon tf-icons bx bx-calendar"></i>
          <div class="text-truncate" data-i18n="Calendar">Calendar</div>
          <div class="badge rounded-pill bg-label-primary text-uppercase fs-tiny ms-auto">Pro</div>
        </a>
      </li>
      <li class="menu-item">
        <a
          href=""
          target="_blank"
          class="menu-link">
          <i class="menu-icon tf-icons bx bx-grid"></i>
          <div class="text-truncate" data-i18n="Kanban">Kanban</div>
          <div class="badge rounded-pill bg-label-primary text-uppercase fs-tiny ms-auto">Pro</div>
        </a>
      </li>
      <!-- Pages -->
      <li class="menu-item">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-dock-top"></i>
          <div class="text-truncate" data-i18n="Account Settings">Account Settings</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a href="pages-account-settings-account.html" class="menu-link">
              <div class="text-truncate" data-i18n="Account">Account</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="pages-account-settings-notifications.html" class="menu-link">
              <div class="text-truncate" data-i18n="Notifications">Notifications</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="pages-account-settings-connections.html" class="menu-link">
              <div class="text-truncate" data-i18n="Connections">Connections</div>
            </a>
          </li>
        </ul>
      </li>
      <li class="menu-item">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-lock-open-alt"></i>
          <div class="text-truncate" data-i18n="Authentications">Authentications</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a href="auth-login-basic.html" class="menu-link" target="_blank">
              <div class="text-truncate" data-i18n="Basic">Login</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="auth-register-basic.html" class="menu-link" target="_blank">
              <div class="text-truncate" data-i18n="Basic">Register</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="auth-forgot-password-basic.html" class="menu-link" target="_blank">
              <div class="text-truncate" data-i18n="Basic">Forgot Password</div>
            </a>
          </li>
        </ul>
      </li>
      <li class="menu-item">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-cube-alt"></i>
          <div class="text-truncate" data-i18n="Misc">Misc</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a href="pages-misc-error.html" class="menu-link">
              <div class="text-truncate" data-i18n="Error">Error</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="pages-misc-under-maintenance.html" class="menu-link">
              <div class="text-truncate" data-i18n="Under Maintenance">Under Maintenance</div>
            </a>
          </li>
        </ul>
      </li><?php }?>
      <!-- Components -->
      <li class="menu-header small text-uppercase"><span class="menu-header-text">Settings</span></li>
      <li class="menu-item <?php echo $is_users_active ? 'active open' : ''; ?>">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon icon-base bx bx-user"></i>
          <div data-i18n="Users">Users</div>
        </a>
        <ul class="menu-sub">
        <?php if(userHasPermission($db,$user_id,'view_users')){?>
          <li class="menu-item <?php echo ($current_page == 'users.php') ? 'active' : ''; ?>">
            <a href="users.php" class="menu-link">
              <div data-i18n="List">Users</div>
            </a>
          </li>
          <?php }?>
         
          <li class="menu-item <?php echo ($current_page == 'user_profile.php') ? 'active' : ''; ?>">
            <a href="user_profile.php" class="menu-link">
              <div data-i18n="Account">My Account</div>
            </a>
          </li>
            
        </ul>
      </li>
      <?php if(userHasPermission($db,$user_id,'view_roles')){?>
      <li class="menu-item <?php echo $is_roles_active ? 'active open' : ''; ?>">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon icon-base bx bx-check-shield"></i>
          <div data-i18n="Roles & Permissions">Roles & Permissions</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item <?php echo ($current_page == 'user_roles.php') ? 'active' : ''; ?>">
            <a href="user_roles.php" class="menu-link">
              <div data-i18n="Roles">Roles</div>
            </a>
          </li>
          <li class="menu-item <?php echo ($current_page == 'permissions.php') ? 'active' : ''; ?>">
            <a href="permissions.php" class="menu-link">
              <div data-i18n="Permission">Permission</div>
            </a>
          </li>
        </ul>
      <?php } ?>
      <?php if(userHasPermission($db,$user_id,'view_audit_logs')){?>
      <li class="menu-item <?php echo ($current_page == 'audit_logs.php') ? 'active' : ''; ?>">
        <a href="audit_logs.php" class="menu-link">
          <i class="menu-icon icon-base bx bx-history"></i>
          <div data-i18n="AuditTrail">Audit Trail</div>
        </a>
      </li>
      <?php } ?>
      <?php  if($others === 'Active'){?>
      <li class="menu-item">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon icon-base bx bx-dock-top"></i>
          <div data-i18n="Pages">Pages</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a href="javascript:void(0);" class="menu-link menu-toggle">
              <div data-i18n="User Profile">User Profile</div>
            </a>
            <ul class="menu-sub">
              <li class="menu-item">
                <a href="pages-profile-user.html" class="menu-link">
                  <div data-i18n="Profile">Profile</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="pages-profile-teams.html" class="menu-link">
                  <div data-i18n="Teams">Teams</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="pages-profile-projects.html" class="menu-link">
                  <div data-i18n="Projects">Projects</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="pages-profile-connections.html" class="menu-link">
                  <div data-i18n="Connections">Connections</div>
                </a>
              </li>
            </ul>
          </li>
          <li class="menu-item">
            <a href="javascript:void(0);" class="menu-link menu-toggle">
              <div data-i18n="Account Settings">Account Settings</div>
            </a>
            <ul class="menu-sub">
              <li class="menu-item">
                <a href="pages-account-settings-account.html" class="menu-link">
                  <div data-i18n="Account">Account</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="pages-account-settings-security.html" class="menu-link">
                  <div data-i18n="Security">Security</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="pages-account-settings-billing.html" class="menu-link">
                  <div data-i18n="Billing & Plans">Billing & Plans</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="pages-account-settings-notifications.html" class="menu-link">
                  <div data-i18n="Notifications">Notifications</div>
                </a>
              </li>
              <li class="menu-item">
                <a href="pages-account-settings-connections.html" class="menu-link">
                  <div data-i18n="Connections">Connections</div>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <!-- Cards -->
      <li class="menu-item">
        <a href="cards-basic.html" class="menu-link">
          <i class="menu-icon tf-icons bx bx-collection"></i>
          <div class="text-truncate" data-i18n="Basic">Cards</div>
        </a>
      </li>
      <!-- User interface -->
      <li class="menu-item">
        <a href="javascript:void(0)" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-box"></i>
          <div class="text-truncate" data-i18n="User interface">User interface</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a href="ui-accordion.html" class="menu-link">
              <div class="text-truncate" data-i18n="Accordion">Accordion</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-alerts.html" class="menu-link">
              <div class="text-truncate" data-i18n="Alerts">Alerts</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-badges.html" class="menu-link">
              <div class="text-truncate" data-i18n="Badges">Badges</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-buttons.html" class="menu-link">
              <div class="text-truncate" data-i18n="Buttons">Buttons</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-carousel.html" class="menu-link">
              <div class="text-truncate" data-i18n="Carousel">Carousel</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-collapse.html" class="menu-link">
              <div class="text-truncate" data-i18n="Collapse">Collapse</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-dropdowns.html" class="menu-link">
              <div class="text-truncate" data-i18n="Dropdowns">Dropdowns</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-footer.html" class="menu-link">
              <div class="text-truncate" data-i18n="Footer">Footer</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-list-groups.html" class="menu-link">
              <div class="text-truncate" data-i18n="List Groups">List groups</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-modals.html" class="menu-link">
              <div class="text-truncate" data-i18n="Modals">Modals</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-navbar.html" class="menu-link">
              <div class="text-truncate" data-i18n="Navbar">Navbar</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-offcanvas.html" class="menu-link">
              <div class="text-truncate" data-i18n="Offcanvas">Offcanvas</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-pagination-breadcrumbs.html" class="menu-link">
              <div class="text-truncate" data-i18n="Pagination & Breadcrumbs">Pagination &amp; Breadcrumbs</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-progress.html" class="menu-link">
              <div class="text-truncate" data-i18n="Progress">Progress</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-spinners.html" class="menu-link">
              <div class="text-truncate" data-i18n="Spinners">Spinners</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-tabs-pills.html" class="menu-link">
              <div class="text-truncate" data-i18n="Tabs & Pills">Tabs &amp; Pills</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-toasts.html" class="menu-link">
              <div class="text-truncate" data-i18n="Toasts">Toasts</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-tooltips-popovers.html" class="menu-link">
              <div class="text-truncate" data-i18n="Tooltips & Popovers">Tooltips &amp; Popovers</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="ui-typography.html" class="menu-link">
              <div class="text-truncate" data-i18n="Typography">Typography</div>
            </a>
          </li>
        </ul>
      </li>

      <!-- Extended components -->
      <li class="menu-item">
        <a href="javascript:void(0)" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-copy"></i>
          <div class="text-truncate" data-i18n="Extended UI">Extended UI</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a href="extended-ui-perfect-scrollbar.html" class="menu-link">
              <div class="text-truncate" data-i18n="Perfect Scrollbar">Perfect Scrollbar</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="extended-ui-text-divider.html" class="menu-link">
              <div class="text-truncate" data-i18n="Text Divider">Text Divider</div>
            </a>
          </li>
        </ul>
      </li>

      <li class="menu-item">
        <a href="icons-boxicons.html" class="menu-link">
          <i class="menu-icon tf-icons bx bx-crown"></i>
          <div class="text-truncate" data-i18n="Boxicons">Boxicons</div>
        </a>
      </li>

      <!-- Forms & Tables -->
      <li class="menu-header small text-uppercase"><span class="menu-header-text">Forms &amp; Tables</span></li>
      <!-- Forms -->
      <li class="menu-item">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-detail"></i>
          <div class="text-truncate" data-i18n="Form Elements">Form Elements</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a href="forms-basic-inputs.html" class="menu-link">
              <div class="text-truncate" data-i18n="Basic Inputs">Basic Inputs</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="forms-input-groups.html" class="menu-link">
              <div class="text-truncate" data-i18n="Input groups">Input groups</div>
            </a>
          </li>
        </ul>
      </li>
      <li class="menu-item">
        <a href="javascript:void(0);" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons bx bx-detail"></i>
          <div class="text-truncate" data-i18n="Form Layouts">Form Layouts</div>
        </a>
        <ul class="menu-sub">
          <li class="menu-item">
            <a href="form-layouts-vertical.html" class="menu-link">
              <div class="text-truncate" data-i18n="Vertical Form">Vertical Form</div>
            </a>
          </li>
          <li class="menu-item">
            <a href="form-layouts-horizontal.html" class="menu-link">
              <div class="text-truncate" data-i18n="Horizontal Form">Horizontal Form</div>
            </a>
          </li>
        </ul>
      </li>
      <!-- Form Validation -->
      <li class="menu-item">
        <a
          href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/html/vertical-menu-template/form-validation.html"
          target="_blank"
          class="menu-link">
          <i class="menu-icon tf-icons bx bx-list-check"></i>
          <div class="text-truncate" data-i18n="Form Validation">Form Validation</div>
          <div class="badge rounded-pill bg-label-primary text-uppercase fs-tiny ms-auto">Pro</div>
        </a>
      </li>
      <!-- Tables -->
      <li class="menu-item">
        <a href="tables-basic.html" class="menu-link">
          <i class="menu-icon tf-icons bx bx-table"></i>
          <div class="text-truncate" data-i18n="Tables">Tables</div>
        </a>
      </li>
      <!-- Data Tables -->
      <li class="menu-item">
        <a
          href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/html/vertical-menu-template/tables-datatables-basic.html"
          target="_blank"
          class="menu-link">
          <i class="menu-icon tf-icons bx bx-grid"></i>
          <div class="text-truncate" data-i18n="Datatables">Datatables</div>
          <div class="badge rounded-pill bg-label-primary text-uppercase fs-tiny ms-auto">Pro</div>
        </a>
      </li>
      <!-- Misc -->
      <li class="menu-header small text-uppercase"><span class="menu-header-text">Misc</span></li>
      <li class="menu-item">
        <a
          href="https://github.com/themeselection/sneat-bootstrap-html-admin-template-free/issues"
          target="_blank"
          class="menu-link">
          <i class="menu-icon tf-icons bx bx-support"></i>
          <div class="text-truncate" data-i18n="Support">Support</div>
        </a>
      </li>
      <li class="menu-item">
        <a
          href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/documentation/"
          target="_blank"
          class="menu-link">
          <i class="menu-icon tf-icons bx bx-file"></i>
          <div class="text-truncate" data-i18n="Documentation">Documentation</div>
        </a>
      </li>
      <?php }?>
    </ul>
  </aside>