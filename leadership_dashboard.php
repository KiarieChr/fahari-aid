<?php 
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');

$title = "Senior Leadership Command Center";
include("includes/get_user.php");

// Restrict to senior leadership only
require_once 'manage/functions.php';
if(!userHasPermission($db, $user_id, 'senior_leadership')) {
    setcookie('error', "Access Denied: You do not have Senior Leadership privileges.", time() + 5, "/");
    header("Location: dashboard.php");
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
      .kpi-card {
        border-radius: 15px;
        border: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
      }
      .kpi-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.08);
      }
      .kpi-title {
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6c757d;
        font-weight: 600;
      }
      .kpi-value {
        font-size: 2rem;
        font-weight: 800;
        color: #384551;
      }
      .trend-up { color: #28c76f; }
      .trend-down { color: #ea5455; }
      
      .dashboard-section {
        margin-bottom: 2rem;
      }
      .section-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #4338ca;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
      }
      .section-title i {
        margin-right: 0.5rem;
      }

      /* Search Modal Profile Styles */
      .profile-timeline {
        border-left: 2px solid #e7e7ff;
        padding-left: 1.5rem;
        position: relative;
        margin-top: 1rem;
      }
      .timeline-node {
        position: absolute;
        left: -11px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #696cff;
        border: 4px solid #fff;
      }
      .profile-glass {
        background: rgba(255,255,255,0.95);
        border: 1px solid rgba(105, 108, 255, 0.1);
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.05);
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
              
              <!-- Top Search Bar for 360 Profile -->
              <div class="card mb-4 border-0 shadow-sm" style="border-radius: 20px;">
                <div class="card-body p-3">
                  <div class="input-group input-group-merge">
                    <span class="input-group-text border-0 bg-transparent"><i class="bx bx-search fs-4 text-primary"></i></span>
                    <input type="text" id="memberSearch" class="form-control border-0 fs-5" placeholder="Search a member for a 360-degree profile view..." aria-label="Search...">
                    <button class="btn btn-primary rounded-pill px-4" onclick="searchMember()">Search</button>
                  </div>
                </div>
              </div>

              <!-- 360-Degree Profile View (Hidden by default) -->
              <div id="profileView" class="mb-5 d-none">
                <!-- Injected via JS -->
              </div>

              <!-- Section 1: Top-Level KPI Cards -->
              <div class="dashboard-section">
                <div class="row g-4" id="kpiContainer">
                  <!-- Skeletons -->
                  <div class="col-12 text-center py-4"><div class="spinner-border text-primary" role="status"></div></div>
                </div>
              </div>

              <!-- Section 2 & 3 Row -->
              <div class="row g-4 dashboard-section">
                
                <!-- Section 2: Discipleship Pipeline Funnel -->
                <div class="col-xl-7">
                  <div class="card h-100 border-0 shadow-sm" style="border-radius: 15px;">
                    <div class="card-header bg-transparent border-bottom">
                      <h5 class="card-title mb-0 fw-bold text-primary"><i class="bx bx-filter-alt me-2"></i> End-to-End Discipleship Pipeline</h5>
                      <small class="text-muted">Tracking the member journey over the last 12 months</small>
                    </div>
                    <div class="card-body pt-4">
                      <div id="funnelChart" style="min-height: 400px;"></div>
                    </div>
                  </div>
                </div>

                <!-- Section 3: Priority Actions / Alerts -->
                <div class="col-xl-5">
                  <div class="card h-100 border-0 shadow-sm" style="border-radius: 15px;">
                    <div class="card-header bg-transparent border-bottom d-flex justify-content-between align-items-center">
                      <h5 class="card-title mb-0 fw-bold text-danger"><i class="bx bx-error me-2"></i> Priority Actions</h5>
                      <span class="badge bg-label-danger rounded-pill" id="alertsCount">0 Alerts</span>
                    </div>
                    <div class="card-body p-0">
                      <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                        <table class="table table-hover table-borderless">
                          <tbody id="alertsTableBody">
                            <!-- Injected via JS -->
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
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
    
    <!-- Load ApexCharts if not already in scripts.html -->
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
          fetchDashboardData();

          // Listen for Enter key on search
          document.getElementById('memberSearch').addEventListener('keypress', function (e) {
              if (e.key === 'Enter') {
                  searchMember();
              }
          });
      });

      function fetchDashboardData() {
          fetch('api/mock_leadership_data.php?action=dashboard')
          .then(r => r.json())
          .then(data => {
              renderKPIs(data.kpis);
              renderFunnel(data.funnel);
              renderAlerts(data.alerts);
          })
          .catch(err => console.error('Error fetching dashboard data:', err));
      }

      function renderKPIs(kpis) {
          const container = document.getElementById('kpiContainer');
          
          const trendHtml = (trend, type) => {
              if(!trend) return '';
              const icon = type === 'up' ? 'bx-trending-up trend-up' : 'bx-trending-down trend-down';
              const textClass = type === 'up' ? 'text-success' : 'text-danger';
              return `<small class="${textClass} fw-semibold"><i class="bx ${icon}"></i> ${trend}%</small>`;
          };

          container.innerHTML = `
            <div class="col-lg-2 col-md-4 col-sm-6">
              <div class="card kpi-card h-100 p-3">
                <div class="kpi-title">Total New Members</div>
                <div class="mt-2 d-flex justify-content-between align-items-end">
                  <div class="kpi-value">${kpis.total_new_members.value}</div>
                  <div>${trendHtml(kpis.total_new_members.trend, kpis.total_new_members.trend_type)}</div>
                </div>
              </div>
            </div>
            
            <div class="col-lg-2 col-md-4 col-sm-6">
              <div class="card kpi-card h-100 p-3">
                <div class="kpi-title">Follow-Up Completion</div>
                <div class="mt-2 d-flex justify-content-between align-items-end">
                  <div class="kpi-value text-primary">${kpis.followup_rate.value}%</div>
                  <div><i class="bx bx-check-circle text-primary fs-3"></i></div>
                </div>
              </div>
            </div>

            <div class="col-lg-2 col-md-4 col-sm-6">
              <div class="card kpi-card h-100 p-3">
                <div class="kpi-title">Active Cell Attend.</div>
                <div class="mt-2 d-flex justify-content-between align-items-end">
                  <div class="kpi-value">${kpis.active_cell_attendance.value}</div>
                  <div>${trendHtml(kpis.active_cell_attendance.trend, kpis.active_cell_attendance.trend_type)}</div>
                </div>
              </div>
            </div>

            <div class="col-lg-2 col-md-4 col-sm-6">
              <div class="card kpi-card h-100 p-3">
                <div class="kpi-title">Disciple Saturation</div>
                <div class="mt-2 d-flex justify-content-between align-items-end">
                  <div class="kpi-value text-info">${kpis.discipleship_saturation.value}%</div>
                  <div><i class="bx bxs-user-detail text-info fs-3"></i></div>
                </div>
              </div>
            </div>

            <div class="col-lg-2 col-md-4 col-sm-6">
              <div class="card kpi-card h-100 p-3">
                <div class="kpi-title">Leaders in Training</div>
                <div class="mt-2 d-flex justify-content-between align-items-end">
                  <div class="kpi-value">${kpis.leaders_in_training.value}</div>
                  <div>${trendHtml(kpis.leaders_in_training.trend, kpis.leaders_in_training.trend_type)}</div>
                </div>
              </div>
            </div>

            <div class="col-lg-2 col-md-4 col-sm-6">
              <div class="card kpi-card h-100 p-3">
                <div class="kpi-title">Multiplied Cells</div>
                <div class="mt-2 d-flex justify-content-between align-items-end">
                  <div class="kpi-value text-success">${kpis.multiplied_cells.value}</div>
                  <div>${trendHtml(kpis.multiplied_cells.trend, kpis.multiplied_cells.trend_type)}</div>
                </div>
              </div>
            </div>
          `;
      }

      function renderFunnel(funnelData) {
          const stages = funnelData.map(f => f.stage);
          const counts = funnelData.map(f => f.count);

          // Find largest drop off index
          let maxDropIdx = 0;
          let maxDropPct = 0;
          for(let i=0; i<counts.length-1; i++) {
              let drop = (counts[i] - counts[i+1]) / counts[i];
              if(drop > maxDropPct) {
                  maxDropPct = drop;
                  maxDropIdx = i+1;
              }
          }

          const colors = counts.map((c, i) => i === maxDropIdx ? '#ea5455' : '#696cff');

          var options = {
              series: [{
                  name: "Members",
                  data: counts
              }],
              chart: {
                  type: 'bar',
                  height: 400,
                  toolbar: { show: false }
              },
              plotOptions: {
                  bar: {
                      borderRadius: 4,
                      horizontal: true,
                      barHeight: '60%',
                      distributed: true,
                      dataLabels: {
                          position: 'bottom'
                      }
                  }
              },
              colors: colors,
              dataLabels: {
                  enabled: true,
                  textAnchor: 'start',
                  style: {
                      colors: ['#fff']
                  },
                  formatter: function (val, opt) {
                      return val + " Members"
                  },
                  offsetX: 0
              },
              xaxis: {
                  categories: stages,
              },
              yaxis: {
                  labels: {
                      style: {
                          fontSize: '13px',
                          fontWeight: 600
                      }
                  }
              },
              tooltip: {
                  theme: 'light',
                  y: {
                      title: { formatter: function() { return '' } }
                  }
              }
          };

          var chart = new ApexCharts(document.querySelector("#funnelChart"), options);
          chart.render();
      }

      function renderAlerts(alerts) {
          document.getElementById('alertsCount').innerText = alerts.length + " Alerts";
          const tbody = document.getElementById('alertsTableBody');
          tbody.innerHTML = '';

          alerts.forEach(alert => {
              const bgClass = alert.priority === 'Red' ? 'bg-label-danger' : 'bg-label-warning';
              const borderClass = alert.priority === 'Red' ? 'border-danger' : 'border-warning';
              
              tbody.innerHTML += `
                <tr class="border-bottom border-1">
                  <td class="pe-0">
                    <div class="badge ${bgClass} p-2 rounded"><i class="bx bx-bell"></i></div>
                  </td>
                  <td>
                    <h6 class="mb-0 fw-bold">${alert.name}</h6>
                    <small class="text-muted">${alert.module}</small>
                  </td>
                  <td>
                    <span class="text-dark fw-semibold">${alert.type}</span><br>
                    <small class="text-muted"><i class="bx bx-time-five"></i> ${alert.date}</small>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary rounded-pill">${alert.action_label}</button>
                  </td>
                </tr>
              `;
          });
      }

      function searchMember() {
          const query = document.getElementById('memberSearch').value;
          if(query.length < 3) {
              Swal.fire('Search', 'Please enter at least 3 characters', 'warning');
              return;
          }

          Swal.showLoading();
          
          fetch('api/mock_leadership_data.php?action=search&q=' + encodeURIComponent(query))
          .then(r => r.json())
          .then(data => {
              Swal.close();
              if(!data.success) {
                  Swal.fire('Not Found', 'No members matched your search.', 'info');
                  return;
              }
              renderProfileView(data.member);
          })
          .catch(err => {
              Swal.close();
              console.error(err);
          });
      }

      function renderProfileView(m) {
          const view = document.getElementById('profileView');
          view.classList.remove('d-none');

          view.innerHTML = `
            <div class="card profile-glass mb-4">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <div class="d-flex align-items-center">
                    <img src="${m.photo}" alt="${m.name}" class="rounded-circle me-4" width="80" height="80" onerror="this.src='assets/img/avatars/1.png'">
                    <div>
                      <h3 class="fw-bold mb-1 text-primary">${m.name}</h3>
                      <span class="text-muted me-3"><i class="bx bx-phone me-1"></i> ${m.phone}</span>
                      <span class="text-muted"><i class="bx bx-calendar me-1"></i> Joined: ${m.joined}</span>
                    </div>
                  </div>
                  <button class="btn btn-icon btn-outline-secondary rounded-circle" onclick="document.getElementById('profileView').classList.add('d-none')"><i class="bx bx-x"></i></button>
                </div>

                <div class="row g-4">
                  <!-- Assimilation -->
                  <div class="col-md-3">
                    <div class="p-3 bg-light rounded h-100">
                      <h6 class="text-uppercase fw-bold text-muted mb-3"><i class="bx bx-user-plus text-primary me-2"></i>Assimilation</h6>
                      <span class="badge bg-label-success mb-2">${m.new_members.status}</span>
                      <p class="small text-muted mb-0">${m.new_members.logs}</p>
                    </div>
                  </div>
                  
                  <!-- Cell Life -->
                  <div class="col-md-3">
                    <div class="p-3 bg-light rounded h-100">
                      <h6 class="text-uppercase fw-bold text-muted mb-3"><i class="bx bx-home-heart text-info me-2"></i>Cell Life</h6>
                      <h5 class="fw-bold mb-1">${m.cell_life.cell_name}</h5>
                      <p class="small text-muted mb-2">Since ${m.cell_life.join_date}</p>
                      <div class="d-flex justify-content-between small fw-semibold mb-1">
                        <span>Attendance</span><span>${m.cell_life.attendance_rate}</span>
                      </div>
                      <small class="text-muted d-block">Last seen: ${m.cell_life.last_attendance}</small>
                    </div>
                  </div>

                  <!-- Discipleship -->
                  <div class="col-md-3">
                    <div class="p-3 bg-light rounded h-100">
                      <h6 class="text-uppercase fw-bold text-muted mb-3"><i class="bx bx-walk text-warning me-2"></i>Discipleship</h6>
                      <span class="badge bg-label-warning mb-2">${m.discipleship.stage} Stage</span>
                      <p class="small text-muted mb-2">Discipler: <strong>${m.discipleship.discipler}</strong></p>
                      <small class="text-muted d-block mb-2">Last Session: ${m.discipleship.last_session}</small>
                      <div id="sparklineChart" style="min-height: 40px;"></div>
                    </div>
                  </div>

                  <!-- LMS Training -->
                  <div class="col-md-3">
                    <div class="p-3 bg-light rounded h-100">
                      <h6 class="text-uppercase fw-bold text-muted mb-3"><i class="bx bx-book-reader text-danger me-2"></i>LMS Training</h6>
                      <p class="fw-bold mb-1 small">${m.lms.enrolled_course}</p>
                      <div class="d-flex justify-content-between small text-muted mb-1">
                        <span>Progress</span><span>${m.lms.progress}%</span>
                      </div>
                      <div class="progress mb-2" style="height: 6px;">
                        <div class="progress-bar bg-danger" role="progressbar" style="width: ${m.lms.progress}%"></div>
                      </div>
                      <small class="text-muted d-block">Coach: ${m.lms.coach}</small>
                      ${m.lms.pending_evals > 0 ? `<span class="badge bg-label-danger mt-2">${m.lms.pending_evals} Pending Evaluation</span>` : ''}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          `;

          // Render Sparkline for Discipleship
          var sparkOptions = {
            series: [{ data: m.discipleship.sparkline_data }],
            chart: { type: 'area', height: 50, sparkline: { enabled: true } },
            stroke: { curve: 'smooth', width: 2 },
            fill: { opacity: 0.3 },
            colors: ['#ffab00'],
            tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: function (seriesName) { return 'Score' } } }, marker: { show: false } }
          };
          var spark = new ApexCharts(document.querySelector("#sparklineChart"), sparkOptions);
          spark.render();
      }
    </script>
  </body>
</html>
