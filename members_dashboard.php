<?php
date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');

$title = "Members Dashboard | Church Growth & Analytics";
include("includes/get_user.php");

// ── Fetch Baseline PHP Metrics ────────────────────────────────────────────────
try {
    // Total members
    $total_stmt = $db->query("SELECT COUNT(*) as total FROM member");
    $total_members = intval($total_stmt->fetch(PDO::FETCH_ASSOC)['total']);

    // Joined in last 30 days
    $recent_joined_stmt = $db->query("SELECT COUNT(*) as total FROM member WHERE joined_on >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $recent_joined = intval($recent_joined_stmt->fetch(PDO::FETCH_ASSOC)['total']);

    // Unassigned Cell count
    $unassigned_cell_stmt = $db->query("SELECT COUNT(*) as total FROM member WHERE cell_id IS NULL OR cell_id = 0");
    $unassigned_cell = intval($unassigned_cell_stmt->fetch(PDO::FETCH_ASSOC)['total']);
    
    // Cell coverage
    $cell_coverage_pct = $total_members > 0 ? round((($total_members - $unassigned_cell) / $total_members) * 100, 1) : 0;

    // Average monthly registrations
    $avg_monthly_stmt = $db->query("
        SELECT COUNT(*) / COUNT(DISTINCT DATE_FORMAT(joined_on, '%Y-%m')) as avg_val 
        FROM member 
        WHERE joined_on IS NOT NULL AND joined_on != '0000-00-00 00:00:00'
    ");
    $avg_monthly = round(floatval($avg_monthly_stmt->fetch(PDO::FETCH_ASSOC)['avg_val']), 1);

    // Latest 5 members
    $latest_members_stmt = $db->query("
        SELECT m.*, COALESCE(c.name, 'Unassigned') as cell_name 
        FROM member m 
        LEFT JOIN cells c ON m.cell_id = c.id 
        ORDER BY m.id DESC LIMIT 5
    ");
    $latest_members = $latest_members_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Growth analytics insights
    $peak_month_stmt = $db->query("
        SELECT DATE_FORMAT(joined_on, '%M %Y') as month_name, COUNT(*) as count 
        FROM member 
        WHERE joined_on IS NOT NULL AND joined_on != '0000-00-00 00:00:00'
        GROUP BY month_name 
        ORDER BY count DESC LIMIT 1
    ");
    $peak_month_row = $peak_month_stmt->fetch(PDO::FETCH_ASSOC);
    $peak_month_name = $peak_month_row ? $peak_month_row['month_name'] : 'N/A';
    $peak_month_count = $peak_month_row ? $peak_month_row['count'] : 0;

    // Department representation rate
    $unassigned_dept_stmt = $db->query("SELECT COUNT(*) as total FROM member WHERE department_id IS NULL OR department_id = 0");
    $unassigned_dept = intval($unassigned_dept_stmt->fetch(PDO::FETCH_ASSOC)['total']);
    $dept_coverage_pct = $total_members > 0 ? round((($total_members - $unassigned_dept) / $total_members) * 100, 1) : 0;

} catch (PDOException $e) {
    die("Database error loading dashboard stats: " . $e->getMessage());
}
?>
<!doctype html>
<html
  lang="en"
  class="layout-navbar-fixed layout-menu-fixed layout-compact"
  dir="ltr"
  data-skin="default"
  data-assets-path="assets/"
  data-template="vertical-menu-template"
  data-bs-theme="light">
<?php @include('includes/header.php');?>

<head>
  <style>
    :root {
      --c-primary : #1a0533;
      --c-accent  : #6f42c1;
      --c-accent-light : rgba(111, 66, 193, 0.08);
      --c-cyan    : #0ec2e6;
      --c-cyan-light : rgba(14, 194, 230, 0.08);
      --c-success : #28a745;
      --c-success-light : rgba(40, 167, 69, 0.08);
      --c-warning : #ffc107;
      --c-warning-light : rgba(255, 193, 7, 0.08);
      --c-danger  : #dc3545;
      --c-danger-light : rgba(220, 53, 69, 0.08);
      --primary-gradient: linear-gradient(135deg, #1a0533 0%, #2d0a5e 55%, #6f42c1 100%);
    }

    /* ── Hero Banner ───────────────── */
    .page-hero {
      background: var(--primary-gradient);
      padding: 28px 32px;
      border-radius: 16px;
      color: #fff;
      margin-bottom: 28px;
      box-shadow: 0 8px 32px rgba(26,5,51,.3);
      position: relative; overflow: hidden;
    }
    .page-hero::before {
      content:''; position:absolute; top:-50px; right:-50px;
      width:220px; height:220px; border-radius:50%;
      background:rgba(255,255,255,.05);
    }
    .page-hero h4 { font-weight:700; font-size:1.5rem; margin-bottom: 4px; }
    .page-hero p  { opacity:.8; font-size:.9rem; margin:0; }

    /* ── Stats Cards ───────────────── */
    .stat-card {
      border-radius: 14px; padding: 22px 24px;
      border: none; box-shadow: 0 4px 20px rgba(0,0,0,.06);
      background: #fff;
      display: flex; align-items: center; justify-content: space-between;
      transition: transform .22s, box-shadow .22s;
    }
    .stat-card:hover { 
      transform: translateY(-3px); 
      box-shadow: 0 8px 24px rgba(26,5,51,.1);
    }
    .stat-num { font-size: 1.8rem; font-weight: 800; color: var(--c-primary); line-height: 1.1; }
    .stat-lbl { font-size: .8rem; color: #8a7baa; text-transform: uppercase; letter-spacing: .05em; font-weight: 600; }
    .stat-badge { font-size: .72rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-top: 4px; display: inline-block; }
    .stat-avatar {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; flex-shrink: 0;
    }

    /* ── Chart Cards ───────────────── */
    .chart-card {
      border-radius: 16px; border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.06);
      background: #fff; margin-bottom: 24px;
      transition: box-shadow 0.3s;
    }
    .chart-card:hover {
      box-shadow: 0 8px 30px rgba(26,5,51,.08);
    }
    .chart-card .card-header {
      background: transparent; border-bottom: 1px solid #f0eaf8;
      padding: 18px 24px; display: flex; align-items: center; justify-content: space-between;
    }
    .chart-card .card-title {
      font-size: 1rem; font-weight: 700; color: var(--c-primary); margin: 0;
    }
    .chart-card .card-body {
      padding: 24px;
    }

    /* ── Avatar Fallbacks ──────────── */
    .m-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: .88rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    /* ── Shimmer Loading ───────────── */
    .loading-placeholder {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 250px;
    }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(12px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .fade-up { animation: fadeUp .45s ease both; }
  </style>
</head>

<body>
<div class="layout-wrapper layout-content-navbar">
  <div class="layout-container">

    <?php @include('includes/sidebar.php');?>

    <div class="menu-mobile-toggler d-xl-none rounded-1">
      <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large text-bg-secondary p-2 rounded-1">
        <i class="bx bx-menu icon-base"></i>
        <i class="bx bx-chevron-right icon-base"></i>
      </a>
    </div>

    <div class="layout-page">
      <?php @include('includes/nav.php');?>

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">

          <!-- ── Page Hero ── -->
          <div class="page-hero fade-up">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h4><i class="bx bx-chart me-2"></i>Members Dashboard</h4>
                <p>Track membership growth trajectories, department distribution, and cell assimilation rates.</p>
              </div>
              <div>
                <a href="view-members.php" class="btn btn-white text-primary border-0" style="font-weight:600; border-radius:8px;">
                  <i class="bx bx-list-ul me-1"></i> Directory View
                </a>
              </div>
            </div>
          </div>

          <!-- ── Stats Row ── -->
          <div class="row g-3 mb-4 fade-up">
            <!-- Stat 1: Total Members -->
            <div class="col-sm-6 col-xl-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Total Members</div>
                  <div class="stat-num mt-1"><?= $total_members ?></div>
                  <span class="stat-badge" style="background:var(--c-accent-light); color:var(--c-accent);">Cumulative</span>
                </div>
                <div class="stat-avatar" style="background:var(--c-accent-light); color:var(--c-accent);">
                  <i class="bx bx-group"></i>
                </div>
              </div>
            </div>
            <!-- Stat 2: New in 30 Days -->
            <div class="col-sm-6 col-xl-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">New registrations</div>
                  <div class="stat-num mt-1"><?= $recent_joined ?></div>
                  <span class="stat-badge" style="background:var(--c-success-light); color:var(--c-success);">Last 30 Days</span>
                </div>
                <div class="stat-avatar" style="background:var(--c-success-light); color:var(--c-success);">
                  <i class="bx bx-user-plus"></i>
                </div>
              </div>
            </div>
            <!-- Stat 3: Cell Coverage -->
            <div class="col-sm-6 col-xl-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Cell assimilation</div>
                  <div class="stat-num mt-1"><?= $cell_coverage_pct ?>%</div>
                  <span class="stat-badge" style="background:var(--c-cyan-light); color:var(--c-cyan);"><?= ($total_members - $unassigned_cell) ?> assigned</span>
                </div>
                <div class="stat-avatar" style="background:var(--c-cyan-light); color:var(--c-cyan);">
                  <i class="bx bx-git-branch"></i>
                </div>
              </div>
            </div>
            <!-- Stat 4: Avg Monthly Growth -->
            <div class="col-sm-6 col-xl-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Average Growth</div>
                  <div class="stat-num mt-1"><?= $avg_monthly ?></div>
                  <span class="stat-badge" style="background:var(--c-warning-light); color:var(--c-warning);">Sign-ups / Month</span>
                </div>
                <div class="stat-avatar" style="background:var(--c-warning-light); color:var(--c-warning);">
                  <i class="bx bx-trending-up"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Row 1: Interactive Growth Timeline Chart ── -->
          <div class="row fade-up">
            <div class="col-12">
              <div class="card chart-card">
                <div class="card-header">
                  <div>
                    <h5 class="card-title mb-0">Monthly Member growth Timeline</h5>
                    <small class="text-muted">Interactive chart mapping new registrations by month. Click points to list members.</small>
                  </div>
                  <span class="badge bg-label-primary p-2 rounded"><i class="bx bx-info-circle me-1"></i>Click chart points for drilldown</span>
                </div>
                <div class="card-body">
                  <div id="growthChartContainer">
                    <div id="monthlyGrowthChart"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Row 2: Secondary Distributions ── -->
          <div class="row g-4 mb-4 fade-up">
            <!-- Col 1: Departments -->
            <div class="col-lg-6">
              <div class="card chart-card h-100">
                <div class="card-header">
                  <h5 class="card-title">Departmental Representation</h5>
                </div>
                <div class="card-body">
                  <div id="deptChart"></div>
                </div>
              </div>
            </div>
            <!-- Col 2: Cell Groups -->
            <div class="col-lg-6">
              <div class="card chart-card h-100">
                <div class="card-header">
                  <h5 class="card-title">Cell Group representation</h5>
                </div>
                <div class="card-body">
                  <div id="cellChart"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Row 3: Demographics & Insights ── -->
          <div class="row g-4 mb-4 fade-up">
            <!-- Col 1: Gender & Marital -->
            <div class="col-lg-4">
              <div class="card chart-card h-100">
                <div class="card-header">
                  <h5 class="card-title">Gender profile</h5>
                </div>
                <div class="card-body">
                  <div id="genderChart"></div>
                </div>
              </div>
            </div>
            <!-- Col 2: Employment Profile -->
            <div class="col-lg-4">
              <div class="card chart-card h-100">
                <div class="card-header">
                  <h5 class="card-title">Employment status</h5>
                </div>
                <div class="card-body">
                  <div id="empChart"></div>
                </div>
              </div>
            </div>
            <!-- Col 3: AI Growth Insights -->
            <div class="col-lg-4">
              <div class="card chart-card h-100">
                <div class="card-header">
                  <h5 class="card-title"><i class="bx bx-analyse me-1 text-primary"></i>Growth Analysis Insights</h5>
                </div>
                <div class="card-body">
                  <div class="d-flex flex-column gap-3">
                    <div class="p-3 bg-label-primary rounded border-start border-primary border-3">
                      <h6 class="fw-bold mb-1 text-primary">Peak Registration Month</h6>
                      <p class="mb-0 small text-muted"><strong><?= htmlspecialchars($peak_month_name) ?></strong> recorded the highest single-month registration volume with <strong><?= $peak_month_count ?></strong> members joining the church.</p>
                    </div>
                    <div class="p-3 bg-label-success rounded border-start border-success border-3">
                      <h6 class="fw-bold mb-1 text-success">Cell Group Integration</h6>
                      <p class="mb-0 small text-muted">Currently, <strong><?= $cell_coverage_pct ?>%</strong> of members are assigned to cell groups. Integrating the remaining <strong><?= $unassigned_cell ?></strong> members is recommended to foster fellowship.</p>
                    </div>
                    <div class="p-3 bg-label-info rounded border-start border-info border-3">
                      <h6 class="fw-bold mb-1 text-info">Departmental Engagement</h6>
                      <p class="mb-0 small text-muted"><strong><?= $dept_coverage_pct ?>%</strong> of the membership is active in various church departments. Broadening departments helps build core commitment.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Row 4: Recent Registrations Table ── -->
          <div class="row fade-up">
            <div class="col-12">
              <div class="card table-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0"><i class="bx bx-user me-2 text-primary"></i>Recently Joined Members</h5>
                  <a href="view-members.php" class="btn btn-outline-secondary btn-sm" style="border-radius: 8px;">View Directory</a>
                </div>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead style="background:#faf7ff;">
                      <tr>
                        <th style="padding:12px 18px;">Member</th>
                        <th>Cell Group</th>
                        <th>Email Address</th>
                        <th>Phone Number</th>
                        <th>Joined Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <?php if (!empty($latest_members)): 
                        foreach ($latest_members as $index => $row):
                          $name = $row['first_name']." ".$row['last_name'];
                          $initial = strtoupper(substr($row['first_name'], 0, 1));
                          $acolor = '#' . substr(md5($row['id']), 0, 6);
                      ?>
                      <tr>
                        <td style="padding:12px 18px;">
                          <div class="d-flex align-items-center gap-2">
                            <div class="m-avatar" style="background:<?= $acolor ?>;"><?= $initial ?></div>
                            <div>
                              <div class="fw-semibold text-primary" style="font-size:.9rem;">
                                <?= htmlspecialchars($name); ?>
                              </div>
                              <small class="text-muted">ID: <?= $row['id'] ?></small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge bg-label-info" style="font-size:0.75rem;">
                            <?= htmlspecialchars($row['cell_name']); ?>
                          </span>
                        </td>
                        <td class="small text-muted"><?= htmlspecialchars($row['email']); ?></td>
                        <td class="small text-muted">
                          <?php if ($row['phone_no']): ?>
                            <i class="bx bx-phone me-1"></i><?= htmlspecialchars($row['phone_no']); ?>
                          <?php else: ?>—<?php endif; ?>
                        </td>
                        <td class="small text-muted"><?= date('M d, Y', strtotime($row['joined_on'])) ?></td>
                      </tr>
                      <?php endforeach; else: ?>
                      <tr>
                        <td colspan="5" class="text-center py-4 text-muted">No recently joined members found.</td>
                      </tr>
                      <?php endif; ?>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div><!-- /container -->

        <?php @include('includes/footer.php'); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
</div>

<!-- ── Joined Members Drilldown Modal ── -->
<div class="modal fade" id="joinedMembersModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content border-0" style="border-radius:14px; box-shadow:0 8px 30px rgba(0,0,0,0.15);">
      <div class="modal-header border-bottom-0 pb-0">
        <h5 class="modal-title fw-bold" id="modalTitle">Joined Members Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body py-4">
        <!-- Live Filter Search -->
        <div class="mb-3">
          <div class="input-group">
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <input type="text" id="modalSearch" class="form-control" placeholder="Type to search table...">
          </div>
        </div>
        
        <!-- Loading State -->
        <div id="modal-loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted mt-2 small">Fetching registered members for selected month...</p>
        </div>

        <!-- Table State -->
        <div id="modal-table-container" style="display: none;">
          <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="table table-hover align-middle mb-0" id="modalTable">
              <thead style="background:#faf7ff; position: sticky; top: 0; z-index: 10;">
                <tr>
                  <th>#</th>
                  <th>Member Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Cell Group</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody id="modalTableBody">
                <!-- Dynamically Populated -->
              </tbody>
            </table>
          </div>
          <div class="text-end mt-3">
            <span class="badge bg-label-secondary" id="modalTotalLabel">Total: 0 members</span>
          </div>
        </div>
      </div>
      <div class="modal-footer border-top-0 pt-0">
        <button type="button" class="btn btn-label-secondary w-100" data-bs-dismiss="modal" style="border-radius:8px;">Close</button>
      </div>
    </div>
  </div>
</div>

<?php include('includes/scripts.html');?>
<script>
  $(document).ready(function() {
    // ── Fetch Analytics Data ──
    $.ajax({
      url: 'manage/get-growth-chart-data.php',
      type: 'GET',
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          initializeCharts(response.data);
        } else {
          showToast('Error loading charts: ' + response.message, 'error');
        }
      },
      error: function() {
        showToast('Connection error loading charts data.', 'error');
      }
    });

    // Modal Table Search Filter
    $('#modalSearch').on('keyup', function() {
      const value = $(this).val().toLowerCase();
      $('#modalTableBody tr').filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
      });
    });
  });

  // Toast helper fallback if not active
  function showToast(message, type = 'info') {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      alert(message);
    }
  }

  // Format YYYY-MM into readable month names (e.g. June 2026)
  function formatMonthName(monthStr) {
    if (!monthStr) return '';
    const parts = monthStr.split('-');
    if (parts.length !== 2) return monthStr;
    const year = parts[0];
    const month = parseInt(parts[1], 10) - 1;
    const date = new Date(year, month, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // ── Drilldown AJAX: Fetch members who joined in a specific month ──
  function openJoinedMembersModal(monthKey) {
    $('#modalTitle').text('Registered Members - ' + formatMonthName(monthKey));
    $('#modalSearch').val('');
    
    // Switch to loading
    $('#modal-loading').show();
    $('#modal-table-container').hide();
    $('#joinedMembersModal').modal('show');

    $.ajax({
      url: 'manage/get-members-joined.php',
      type: 'GET',
      data: { month: monthKey },
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          let rowsHtml = '';
          response.data.forEach((member, index) => {
            const initial = member.first_name ? member.first_name.charAt(0).toUpperCase() : '?';
            const colors = ['#6f42c1', '#0ec2e6', '#28a745', '#ffc107', '#dc3545', '#1a0533'];
            const colorIdx = member.id % colors.length;
            const acolor = colors[colorIdx];

            rowsHtml += `
              <tr>
                <td>${index + 1}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="m-avatar" style="width:30px; height:30px; font-size:0.75rem; background:${acolor};">${initial}</div>
                    <div>
                      <div class="fw-semibold text-primary" style="font-size:0.85rem;">${member.full_name}</div>
                      <small class="text-muted">ID: ${member.id}</small>
                    </div>
                  </div>
                </td>
                <td class="small text-muted">${member.email || 'N/A'}</td>
                <td class="small text-muted">${member.phone_no || 'N/A'}</td>
                <td><span class="badge bg-label-info" style="font-size:0.7rem;">${member.cell_name}</span></td>
                <td class="small text-muted">${member.joined_on_formatted}</td>
              </tr>
            `;
          });

          if (response.data.length === 0) {
            rowsHtml = '<tr><td colspan="6" class="text-center text-muted py-4">No members registered in this month.</td></tr>';
          }

          $('#modalTableBody').html(rowsHtml);
          $('#modalTotalLabel').text('Total: ' + response.count + ' members');
          
          $('#modal-loading').hide();
          $('#modal-table-container').show();
        } else {
          showToast(response.message, 'error');
          $('#joinedMembersModal').modal('hide');
        }
      },
      error: function() {
        showToast('Error retrieving member details.', 'error');
        $('#joinedMembersModal').modal('hide');
      }
    });
  }

  // ── Initialize ApexCharts ──
  function initializeCharts(data) {
    const primaryColor = '#1a0533';
    const accentColor = '#6f42c1';
    const accentColorLight = '#8e56ec';

    // 1. Monthly growth Area Chart
    const growthCategories = data.growth.map(row => row.month);
    const growthCounts = data.growth.map(row => parseInt(row.count, 10));

    const growthOptions = {
      series: [{
        name: 'New Registrations',
        data: growthCounts
      }],
      chart: {
        height: 320,
        type: 'area',
        toolbar: { show: false },
        events: {
          dataPointSelection: function(event, chartContext, config) {
            const dataPointIdx = config.dataPointIndex;
            const monthKey = growthCategories[dataPointIdx];
            if (monthKey) {
              openJoinedMembersModal(monthKey);
            }
          }
        }
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3, colors: [accentColor] },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 95]
        }
      },
      xaxis: {
        categories: growthCategories.map(m => formatMonthName(m)),
        labels: {
          style: { colors: '#8a7baa', fontSize: '11px', fontFamily: 'Public Sans' }
        }
      },
      yaxis: {
        labels: {
          style: { colors: '#8a7baa', fontSize: '11px', fontFamily: 'Public Sans' }
        }
      },
      colors: [accentColor],
      grid: {
        borderColor: '#ede5fc',
        strokeDashArray: 4,
        padding: { right: 20, left: 10 }
      },
      tooltip: {
        y: {
          formatter: function(val) { return val + " registered" }
        }
      }
    };
    const growthChart = new ApexCharts(document.querySelector("#monthlyGrowthChart"), growthOptions);
    growthChart.render();

    // 2. Department Horizontal Bar Chart
    const deptNames = data.departments.map(row => row.dept_name);
    const deptCounts = data.departments.map(row => parseInt(row.count, 10));

    const deptOptions = {
      series: [{
        name: 'Members',
        data: deptCounts
      }],
      chart: {
        type: 'bar',
        height: 280,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '60%',
          borderRadius: 4
        }
      },
      colors: ['#0ec2e6'],
      dataLabels: { enabled: true, style: { fontSize: '10px' } },
      xaxis: {
        categories: deptNames,
        labels: { style: { colors: '#8a7baa' } }
      },
      yaxis: {
        labels: { style: { colors: '#8a7baa' } }
      },
      grid: { borderColor: '#ede5fc' }
    };
    const deptChart = new ApexCharts(document.querySelector("#deptChart"), deptOptions);
    deptChart.render();

    // 3. Cell Group Distribution Donut Chart
    const cellNames = data.cells.map(row => row.cell_name);
    const cellCounts = data.cells.map(row => parseInt(row.count, 10));

    const cellOptions = {
      series: cellCounts,
      chart: {
        type: 'donut',
        height: 280
      },
      labels: cellNames,
      colors: ['#6f42c1', '#0ec2e6', '#28a745', '#ffc107', '#dc3545', '#1a0533', '#8e56ec'],
      legend: {
        position: 'bottom',
        fontFamily: 'Public Sans',
        labels: { colors: '#8a7baa' }
      },
      dataLabels: { enabled: true },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: { position: 'bottom' }
        }
      }]
    };
    const cellChart = new ApexCharts(document.querySelector("#cellChart"), cellOptions);
    cellChart.render();

    // 4. Gender Profile Pie Chart
    const genderLabels = data.gender.map(row => row.gender);
    const genderCounts = data.gender.map(row => parseInt(row.count, 10));

    const genderOptions = {
      series: genderCounts,
      chart: {
        type: 'pie',
        height: 250
      },
      labels: genderLabels,
      colors: ['#6f42c1', '#0ec2e6', '#e0cffc'],
      legend: {
        position: 'bottom',
        labels: { colors: '#8a7baa' }
      }
    };
    const genderChart = new ApexCharts(document.querySelector("#genderChart"), genderOptions);
    genderChart.render();

    // 5. Employment Status Bar Chart
    const empLabels = data.emp_status.map(row => row.emp_status);
    const empCounts = data.emp_status.map(row => parseInt(row.count, 10));

    const empOptions = {
      series: [{
        name: 'Members',
        data: empCounts
      }],
      chart: {
        type: 'bar',
        height: 250,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
          borderRadius: 4
        }
      },
      colors: ['#28a745'],
      xaxis: {
        categories: empLabels,
        labels: { style: { colors: '#8a7baa', fontSize: '10px' } }
      },
      yaxis: {
        labels: { style: { colors: '#8a7baa' } }
      },
      grid: { borderColor: '#ede5fc' }
    };
    const empChart = new ApexCharts(document.querySelector("#empChart"), empOptions);
    empChart.render();
  }
</script>
</body>
</html>
