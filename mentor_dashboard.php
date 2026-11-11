<?php 
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');

$title = "Mentorship & Coaching Hub";
include("includes/get_user.php");

// Restrict access if not mentor, coach, or super admin
$stmtAdmin = $db->prepare("SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = :uid AND r.name IN ('Administrator', 'General Admin') LIMIT 1");
$stmtAdmin->execute([':uid' => $user_id]);
$isSuperAdmin = $stmtAdmin->fetchColumn() ? true : false;

$stmtM = $db->prepare("SELECT id FROM trn_mentors WHERE user_id = :uid AND status = 1 LIMIT 1");
$stmtM->execute([':uid' => $user_id]);
$isMentor = $stmtM->fetch(PDO::FETCH_ASSOC) ? true : false;

$stmtC = $db->prepare("SELECT id FROM trn_coaches WHERE user_id = :uid AND status = 1 LIMIT 1");
$stmtC->execute([':uid' => $user_id]);
$isCoach = $stmtC->fetch(PDO::FETCH_ASSOC) ? true : false;

$isMentor = $isMentor || $isSuperAdmin;
$isCoach = $isCoach || $isSuperAdmin;

if (!$isMentor && !$isCoach) {
    header("Location: training_dashboard.php");
    exit;
}
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
    <style>
      .nav-tabs-custom .nav-link {
        border: none;
        border-bottom: 2px solid transparent;
        color: #6b7280;
        font-weight: 600;
        padding: 1rem 1.5rem;
        background: transparent;
        border-radius: 0;
      }
      .nav-tabs-custom .nav-link.active {
        color: #696cff;
        border-bottom: 2px solid #696cff;
        background: rgba(105, 108, 255, 0.05);
      }
      .mentor-card {
        border-radius: 15px;
        border: none;
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        transition: transform 0.2s ease;
      }
      .mentor-card:hover {
        transform: translateY(-3px);
      }
      .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
      }
      .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
      }
    </style>
  </head>
  <body>
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        
        <!-- Menu -->
        <?php @include('includes/sidebar.php');?>
        <!-- / Menu -->

        <div class="layout-page">
          <!-- Navbar -->
          <?php @include('includes/nav.php');?>
          <!-- / Navbar -->

          <div class="content-wrapper">
            <div class="container-xxl flex-grow-1 container-p-y">
              
              <!-- Hero Header -->
              <div class="card mb-4 glass-card" style="border-radius: 15px;">
                <div class="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                    <div class="d-flex align-items-center mb-3 mb-md-0">
                        <div class="avatar avatar-md me-3 bg-label-primary rounded p-2">
                            <i class="bx bx-group fs-3"></i>
                        </div>
                        <div>
                            <h4 class="fw-bold mb-1 text-primary">Trainer Command Center</h4>
                            <p class="text-muted mb-0" style="font-size: 0.9rem;">
                                <?php echo $isSuperAdmin ? 'Super Admin Mode: Viewing all data across the platform.' : 'Oversee your mentees, review reflections, and evaluate practical assignments.'; ?>
                            </p>
                        </div>
                    </div>
                </div>
              </div>

              <!-- Quick Stats & Analytics -->
              <div class="row mb-4">
                  <!-- Stats -->
                  <div class="col-md-6 mb-4 mb-md-0">
                      <div class="row">
                          <div class="col-6 mb-4">
                              <div class="card mentor-card h-100">
                                  <div class="card-body">
                                      <div class="d-flex align-items-center mb-2">
                                          <div class="stat-icon bg-label-info me-3"><i class="bx bx-user"></i></div>
                                          <h6 class="mb-0 text-muted">Total Trainees</h6>
                                      </div>
                                      <h3 class="fw-bold mb-0" id="statTrainees">0</h3>
                                  </div>
                              </div>
                          </div>
                          <div class="col-6 mb-4">
                              <div class="card mentor-card h-100">
                                  <div class="card-body">
                                      <div class="d-flex align-items-center mb-2">
                                          <div class="stat-icon bg-label-warning me-3"><i class="bx bx-message-dots"></i></div>
                                          <h6 class="mb-0 text-muted">Pending Reviews</h6>
                                      </div>
                                      <h3 class="fw-bold mb-0" id="statPending">0</h3>
                                  </div>
                              </div>
                          </div>
                          <div class="col-12">
                              <div class="card mentor-card bg-primary text-white">
                                  <div class="card-body d-flex justify-content-between align-items-center">
                                      <div>
                                          <h6 class="text-white mb-1">Your Impact</h6>
                                          <p class="mb-0 small" style="opacity: 0.8;">You are actively shaping leaders.</p>
                                      </div>
                                      <i class="bx bxs-graduation fs-1 opacity-50"></i>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <!-- Chart -->
                  <div class="col-md-6">
                      <div class="card mentor-card h-100">
                          <div class="card-body">
                              <h6 class="fw-bold mb-3">Trainee Progress Overview</h6>
                              <div id="progressChart" style="min-height: 200px;"></div>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Navigation Tabs -->
              <div class="nav-align-top mb-4">
                <ul class="nav nav-tabs nav-tabs-custom mb-3 border-bottom" role="tablist">
                  <?php if ($isMentor): ?>
                  <li class="nav-item">
                    <button type="button" class="nav-link active" role="tab" data-bs-toggle="tab" data-bs-target="#navs-mentees" aria-controls="navs-mentees" aria-selected="true">
                      <i class="bx bx-user-pin me-1"></i> Roster
                    </button>
                  </li>
                  <li class="nav-item">
                    <button type="button" class="nav-link" role="tab" data-bs-toggle="tab" data-bs-target="#navs-reflections" aria-controls="navs-reflections" aria-selected="false">
                      <i class="bx bx-message-square-detail me-1"></i> Reflections Inbox
                      <span class="badge rounded-pill badge-center h-px-20 w-px-20 bg-danger ms-1 d-none" id="refBadge">0</span>
                    </button>
                  </li>
                  <?php endif; ?>
                  
                  <?php if ($isCoach): ?>
                  <li class="nav-item">
                    <button type="button" class="nav-link <?php echo (!$isMentor) ? 'active' : ''; ?>" role="tab" data-bs-toggle="tab" data-bs-target="#navs-evaluations" aria-controls="navs-evaluations" aria-selected="<?php echo (!$isMentor) ? 'true' : 'false'; ?>">
                      <i class="bx bx-video-recording me-1"></i> Evaluation Queue
                      <span class="badge rounded-pill badge-center h-px-20 w-px-20 bg-warning ms-1 d-none" id="evalBadge">0</span>
                    </button>
                  </li>
                  <?php endif; ?>
                </ul>
                
                <div class="tab-content p-0 bg-transparent shadow-none border-0">
                  
                  <?php if ($isMentor): ?>
                  <!-- Mentees Tab -->
                  <div class="tab-pane fade show active" id="navs-mentees" role="tabpanel">
                    <div class="card mentor-card">
                      <div class="table-responsive text-nowrap">
                        <table class="table table-hover">
                          <thead>
                            <tr>
                              <th>Trainee Name</th>
                              <th>Contact</th>
                              <th>Status</th>
                              <th>Assigned On</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody class="table-border-bottom-0" id="menteesTableBody">
                            <tr><td colspan="5" class="text-center py-4">Loading roster...</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <!-- Reflections Tab -->
                  <div class="tab-pane fade" id="navs-reflections" role="tabpanel">
                     <div class="row" id="reflectionsContainer">
                         <!-- Reflections injected here -->
                     </div>
                  </div>
                  <?php endif; ?>

                  <?php if ($isCoach): ?>
                  <!-- Evaluations Tab -->
                  <div class="tab-pane fade <?php echo (!$isMentor) ? 'show active' : ''; ?>" id="navs-evaluations" role="tabpanel">
                    <div class="card mentor-card">
                      <div class="table-responsive text-nowrap">
                        <table class="table table-hover">
                          <thead>
                            <tr>
                              <th>Trainee</th>
                              <th>Module / Assignment</th>
                              <th>Submitted At</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody class="table-border-bottom-0" id="evaluationsTableBody">
                            <tr><td colspan="4" class="text-center py-4">Loading queue...</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <?php endif; ?>

                </div>
              </div>

            </div>
            
            <?php @include('includes/footer.php');?>
            <div class="content-backdrop fade"></div>
          </div>
        </div>
      </div>
      <div class="layout-overlay layout-menu-toggle"></div>
    </div>

    <?php @include('includes/scripts.html');?>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <script>
      let chart;

      document.addEventListener('DOMContentLoaded', function() {
          loadDashboardData();
      });

      function loadDashboardData() {
          fetch('api/get_mentor_data.php')
          .then(r => r.json())
          .then(data => {
              if(!data.success) return;

              // Top Stats
              let pendingCount = data.reflections.length + data.evaluations.length;
              document.getElementById('statTrainees').innerText = data.mentees.length;
              document.getElementById('statPending').innerText = pendingCount;

              // Render Chart
              renderChart(data.chart_data);

              // Populate Mentees
              if (document.getElementById('menteesTableBody')) {
                  const mBody = document.getElementById('menteesTableBody');
                  mBody.innerHTML = '';
                  if (data.mentees.length === 0) {
                      mBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No trainees assigned yet.</td></tr>';
                  } else {
                      data.mentees.forEach(m => {
                          const statusBadge = m.status === 'active' ? 'bg-label-success' : 'bg-label-secondary';
                          mBody.innerHTML += `
                              <tr>
                                <td><div class="d-flex align-items-center"><div class="avatar avatar-sm me-3"><span class="avatar-initial rounded-circle bg-label-primary">${m.first_name[0]}</span></div><strong>${m.first_name} ${m.last_name}</strong></div></td>
                                <td>${m.email || 'N/A'}<br><small class="text-muted">${m.phone_no}</small></td>
                                <td><span class="badge ${statusBadge}">${(m.status || 'Active').toUpperCase()}</span></td>
                                <td>${new Date(m.created_at).toLocaleDateString()}</td>
                                <td>
                                  <button class="btn btn-sm btn-outline-primary" onclick="alert('Feature: View Trainee Profile')"><i class="bx bx-show me-1"></i> View Profile</button>
                                </td>
                              </tr>
                          `;
                      });
                  }
              }

              // Populate Reflections
              if (document.getElementById('reflectionsContainer')) {
                  const rContainer = document.getElementById('reflectionsContainer');
                  rContainer.innerHTML = '';
                  if (data.reflections.length === 0) {
                      rContainer.innerHTML = '<div class="col-12"><div class="card mentor-card py-5 text-center text-muted"><i class="bx bx-check-circle fs-1 mb-2"></i><br>Inbox Zero! No pending reflections.</div></div>';
                      document.getElementById('refBadge').classList.add('d-none');
                  } else {
                      document.getElementById('refBadge').classList.remove('d-none');
                      document.getElementById('refBadge').innerText = data.reflections.length;
                      
                      data.reflections.forEach(r => {
                          rContainer.innerHTML += `
                              <div class="col-md-6 mb-4">
                                <div class="card mentor-card h-100">
                                  <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                      <h6 class="mb-0 fw-bold">${r.first_name} ${r.last_name}</h6>
                                      <small class="text-muted">${new Date(r.submitted_at).toLocaleDateString()}</small>
                                    </div>
                                    <p class="small text-primary mb-2 fw-semibold">${r.module_title}</p>
                                    <div class="bg-light p-3 rounded mb-3 small" style="font-style: italic;">
                                        "${r.reflection_text}"
                                    </div>
                                    <button class="btn btn-primary btn-sm w-100" onclick="respondReflection(${r.reflection_id})"><i class="bx bx-reply me-1"></i> Respond to Reflection</button>
                                  </div>
                                </div>
                              </div>
                          `;
                      });
                  }
              }

              // Populate Evaluations (Coaches)
              if (document.getElementById('evaluationsTableBody')) {
                  const eBody = document.getElementById('evaluationsTableBody');
                  eBody.innerHTML = '';
                  if (data.evaluations.length === 0) {
                      eBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No pending assignments to review.</td></tr>';
                      document.getElementById('evalBadge').classList.add('d-none');
                  } else {
                      document.getElementById('evalBadge').classList.remove('d-none');
                      document.getElementById('evalBadge').innerText = data.evaluations.length;
                      
                      data.evaluations.forEach(e => {
                          eBody.innerHTML += `
                              <tr>
                                <td><strong>${e.first_name} ${e.last_name}</strong></td>
                                <td>${e.assignment_title}<br><small class="text-primary">${e.module_title}</small></td>
                                <td>${new Date(e.submitted_at).toLocaleDateString()}</td>
                                <td>
                                  <div class="btn-group">
                                    <button class="btn btn-sm btn-success" onclick="gradeAssignment(${e.submission_id}, 'pass')"><i class="bx bx-check me-1"></i> Pass</button>
                                    <button class="btn btn-sm btn-danger" onclick="gradeAssignment(${e.submission_id}, 'fail')"><i class="bx bx-x me-1"></i> Fail</button>
                                  </div>
                                  <button class="btn btn-sm btn-outline-info ms-2" onclick="window.open('${e.media_url}', '_blank')"><i class="bx bx-link-external"></i> View Work</button>
                                </td>
                              </tr>
                          `;
                      });
                  }
              }

          }).catch(err => console.error("Error loading dashboard", err));
      }

      function renderChart(chartData) {
          const options = {
              series: [chartData.not_started, chartData.in_progress, chartData.completed],
              chart: { type: 'donut', height: 250 },
              labels: ['Not Started', 'In Progress', 'Completed'],
              colors: ['#697a8d', '#ffab00', '#71dd37'],
              dataLabels: { enabled: false },
              plotOptions: {
                  pie: {
                      donut: {
                          size: '70%',
                          labels: {
                              show: true,
                              name: { show: true },
                              value: { show: true, fontSize: '20px', fontWeight: 'bold' },
                              total: { show: true, showAlways: true, label: 'Total', fontSize: '14px' }
                          }
                      }
                  }
              },
              stroke: { width: 0 }
          };

          if (chart) {
              chart.destroy();
          }
          chart = new ApexCharts(document.querySelector("#progressChart"), options);
          chart.render();
      }

      function respondReflection(id) {
          Swal.fire({
            title: 'Reply to Reflection',
            input: 'textarea',
            inputLabel: 'Your feedback and encouragement',
            inputPlaceholder: 'Type your response...',
            showCancelButton: true,
            confirmButtonText: 'Send Reply',
            showLoaderOnConfirm: true,
            preConfirm: (text) => {
                if (!text) return false;
                // Implement your API call here
                return new Promise(resolve => setTimeout(() => resolve(true), 1000));
            }
          }).then((result) => {
              if (result.isConfirmed) {
                  Swal.fire('Sent!', 'Your feedback has been delivered.', 'success');
                  loadDashboardData();
              }
          })
      }

      function gradeAssignment(id, grade) {
          let title = grade === 'pass' ? 'Approve & Pass?' : 'Fail & Request Resubmission?';
          let icon = grade === 'pass' ? 'success' : 'warning';
          
          Swal.fire({
              title: title,
              icon: icon,
              showCancelButton: true,
              confirmButtonText: 'Yes, Confirm'
          }).then((result) => {
              if (result.isConfirmed) {
                  // Implement API call here
                  Swal.fire('Graded!', 'The assignment has been graded.', 'success');
                  loadDashboardData();
              }
          });
      }
    </script>
  </body>
</html>
