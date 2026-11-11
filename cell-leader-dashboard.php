<?php
/**
 * cell-leader-dashboard.php
 * Cell leader personal dashboard and workspace.
 */
include('includes/checklogin.php');

$title = "Cell Management | Leader Workspace";
include("includes/get_user.php");
require_once 'manage/functions.php';

// 1. Fetch cell led by the current user
$cell = null;
$cell_id = 0;
$members_count = 0;
$drafts = [];
$reports = [];
$pending_tasks = [];
$completed_tasks = [];

// Get cell_id where user is cell leader
$cell_stmt = $db->prepare("
    SELECT c.*, CONCAT(m.first_name,' ',m.last_name) AS leader_name 
    FROM cells c
    LEFT JOIN member m ON c.cell_leader = m.id
    WHERE c.cell_leader = :lid AND c.status = 1
    LIMIT 1
");
$cell_stmt->execute([':lid' => $member_id]);
$cell = $cell_stmt->fetch(PDO::FETCH_ASSOC);

// If user is not cell leader, check if they are Administrator/General Admin to view a default cell
if (!$cell && (userHasPermission($db, $user_id, 'edit_cell') || userHasPermission($db, $user_id, 'create_cell'))) {
    // Admin user: default to first active cell
    $admin_cell_stmt = $db->query("
        SELECT c.*, CONCAT(m.first_name,' ',m.last_name) AS leader_name 
        FROM cells c
        LEFT JOIN member m ON c.cell_leader = m.id
        WHERE c.status = 1
        LIMIT 1
    ");
    $cell = $admin_cell_stmt->fetch(PDO::FETCH_ASSOC);
}

if ($cell) {
    $cell_id = intval($cell['id']);

    // Total cell members
    $m_stmt = $db->prepare("SELECT COUNT(*) FROM member WHERE cell_id = :cid AND (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')");
    $m_stmt->execute([':cid' => $cell_id]);
    $members_count = intval($m_stmt->fetchColumn());

    // Fetch reports
    // Drafts
    $dr_stmt = $db->prepare("SELECT * FROM cell_reports WHERE cell_id = :cid AND status = 'draft' ORDER BY meeting_date DESC");
    $dr_stmt->execute([':cid' => $cell_id]);
    $drafts = $dr_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Published
    $pub_stmt = $db->prepare("SELECT * FROM cell_reports WHERE cell_id = :cid AND status = 'published' ORDER BY meeting_date DESC");
    $pub_stmt->execute([':cid' => $cell_id]);
    $reports = $pub_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch tasks assigned to current user
    $t_stmt = $db->prepare("
        SELECT t.*, m.first_name, m.last_name, m.phone_no 
        FROM cell_followup_tasks t
        JOIN member m ON t.member_id = m.id
        WHERE t.assigned_to = :uid AND t.status = 'pending'
        ORDER BY t.due_date ASC
    ");
    $t_stmt->execute([':uid' => $user_id]);
    $pending_tasks = $t_stmt->fetchAll(PDO::FETCH_ASSOC);

    $ct_stmt = $db->prepare("
        SELECT t.*, m.first_name, m.last_name, m.phone_no 
        FROM cell_followup_tasks t
        JOIN member m ON t.member_id = m.id
        WHERE t.assigned_to = :uid AND t.status = 'completed'
        ORDER BY t.completed_at DESC
        LIMIT 10
    ");
    $ct_stmt->execute([':uid' => $user_id]);
    $completed_tasks = $ct_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch stats
    // Souls won (sum of salvations from published reports)
    $souls_stmt = $db->prepare("SELECT SUM(salvations) as total FROM cell_reports WHERE cell_id = :cid AND status = 'published'");
    $souls_stmt->execute([':cid' => $cell_id]);
    $total_souls = intval($souls_stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

    // First timers (count of first timers from published reports)
    $ft_count_stmt = $db->prepare("
        SELECT COUNT(ft.id) as total 
        FROM cell_report_first_timers ft
        JOIN cell_reports r ON ft.report_id = r.id
        WHERE r.cell_id = :cid AND r.status = 'published'
    ");
    $ft_count_stmt->execute([':cid' => $cell_id]);
    $total_first_timers = intval($ft_count_stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

    // Average attendance rate
    $avg_stmt = $db->prepare("SELECT AVG(total_attendance) as avg_att FROM cell_reports WHERE cell_id = :cid AND status = 'published'");
    $avg_stmt->execute([':cid' => $cell_id]);
    $avg_att = round(floatval($avg_stmt->fetch(PDO::FETCH_ASSOC)['avg_att'] ?? 0), 1);
}
?>
<!doctype html>
<html lang="en" class="layout-navbar-fixed layout-menu-fixed layout-compact" data-assets-path="assets/" data-template="vertical-menu-template" data-bs-theme="light">
<?php @include('includes/header.php'); ?>
<head>
  <style>
    :root {
      --jen-primary: #1a0533;
      --jen-accent:  #6f42c1;
      --jen-cyan:    #0ec2e6;
      --jen-success: #28a745;
      --jen-warning: #ffc107;
      --jen-danger:  #dc3545;
      --gradient: linear-gradient(135deg, var(--jen-primary) 0%, #2d0a5e 60%, var(--jen-accent) 100%);
    }

    .page-hero {
      background: var(--gradient);
      padding: 30px 32px;
      border-radius: 16px;
      color: #fff;
      margin-bottom: 28px;
      box-shadow: 0 8px 30px rgba(26,5,51,0.3);
      position: relative;
      overflow: hidden;
    }
    .page-hero h4 { font-weight: 700; font-size: 1.5rem; margin-bottom: 4px; }
    .page-hero p  { opacity: 0.8; font-size: 0.9rem; margin: 0; }

    .stat-card {
      border-radius: 14px;
      padding: 20px;
      background: #fff;
      box-shadow: 0 4px 18px rgba(0,0,0,0.05);
      border: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: transform 0.2s;
    }
    .stat-card:hover { transform: translateY(-3px); }
    .stat-card .stat-num { font-size: 1.8rem; font-weight: 800; color: var(--jen-primary); }
    .stat-card .stat-lbl { font-size: 0.8rem; color: #8a7baa; text-transform: uppercase; font-weight: 600; }
    .stat-card .stat-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
    }

    .card-custom {
      border: none;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      margin-bottom: 24px;
      background: #fff;
    }
    .card-custom .card-header {
      background: transparent;
      border-bottom: 1px solid #f0eaf8;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-custom .card-header h5 {
      font-weight: 700;
      color: var(--jen-primary);
      margin: 0;
    }

    .task-item {
      border-left: 4px solid var(--jen-accent);
      background: #faf8ff;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 12px;
      transition: background 0.2s;
    }
    .task-item:hover { background: #f4eefd; }
    .task-item.first_timer { border-left-color: var(--jen-cyan); background: #f5fcfe; }
    .task-item.absentee { border-left-color: var(--jen-danger); background: #fdf5f6; }
    .task-item.pastoral_care { border-left-color: var(--jen-warning); background: #fefcf3; }

    .nav-tabs-custom .nav-link {
      border-radius: 8px;
      color: var(--jen-primary);
      font-weight: 600;
      padding: 10px 20px;
    }
    .nav-tabs-custom .nav-link.active {
      background: var(--jen-accent);
      color: #fff;
    }
  </style>
</head>

<body>
<div class="layout-wrapper layout-content-navbar">
  <div class="layout-container">
    <?php @include('includes/sidebar.php'); ?>
    <div class="layout-page">
      <?php @include('includes/nav.php'); ?>

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">

          <?php if (!$cell): ?>
          <!-- Unassigned Cell state -->
          <div class="page-hero">
            <h4>Welcome to Cell Leader Workspace</h4>
            <p>Here you can manage report drafts, view past submissions, and track follow-up compliance.</p>
          </div>
          <div class="card card-custom p-5 text-center">
            <i class="bx bx-home-alt fs-1 text-muted mb-3"></i>
            <h5>No Cell Group Assigned</h5>
            <p class="text-muted">You are not designated as a leader for any active cell group. Contact your Discipleship Director to get assigned.</p>
          </div>
          <?php else: ?>

          <!-- Page Hero -->
          <div class="page-hero">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h4><i class="bx bx-home-heart me-2"></i>My Cell Leader Workspace &mdash; <?= htmlspecialchars($cell['code'] . ' - ' . $cell['name']) ?></h4>
                <p>Track your cell's growth, complete generated follow-up workflows, and file reports.</p>
              </div>
              <div>
                <a href="cell-report-form.php?cell_id=<?= $cell_id ?>" class="btn btn-white text-primary border-0" style="font-weight:600; border-radius:8px;">
                  <i class="bx bx-plus-circle me-1"></i> New Report
                </a>
              </div>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="row g-3 mb-4">
            <div class="col-sm-6 col-lg-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Cell Members</div>
                  <div class="stat-num mt-1"><?= $members_count ?></div>
                </div>
                <div class="stat-icon" style="background:#f0e8ff; color:var(--jen-accent);">
                  <i class="bx bx-group"></i>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-lg-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Avg Attendance</div>
                  <div class="stat-num mt-1"><?= $avg_att ?></div>
                </div>
                <div class="stat-icon" style="background:#e0f8fc; color:var(--jen-cyan);">
                  <i class="bx bx-line-chart"></i>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-lg-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">First Timers</div>
                  <div class="stat-num mt-1"><?= $total_first_timers ?></div>
                </div>
                <div class="stat-icon" style="background:#e8fff0; color:var(--jen-success);">
                  <i class="bx bx-user-plus"></i>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-lg-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Souls Won</div>
                  <div class="stat-num mt-1"><?= $total_souls ?></div>
                </div>
                <div class="stat-icon" style="background:#fef5e7; color:var(--jen-warning);">
                  <i class="bx bx-star"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Left Side: Cell Reports Log -->
            <div class="col-lg-7">
              <div class="card card-custom">
                <div class="card-header border-bottom-0 pb-1">
                  <h5><i class="bx bx-history me-2 text-primary"></i>Cell Report Logs</h5>
                  <ul class="nav nav-tabs nav-tabs-custom border-0" id="reportTabs" role="tablist">
                    <li class="nav-item">
                      <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#publishedTab" type="button">Published (<?= count($reports) ?>)</button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#draftsTab" type="button">Drafts (<?= count($drafts) ?>)</button>
                    </li>
                  </ul>
                </div>
                <div class="card-body">
                  <div class="tab-content pt-3">
                    
                    <!-- Published reports -->
                    <div class="tab-pane fade show active" id="publishedTab">
                      <?php if (empty($reports)): ?>
                      <div class="text-center py-5 text-muted">
                        <i class="bx bx-cabinet fs-1 d-block mb-2"></i>
                        No published reports found. Click "New Report" to file one.
                      </div>
                      <?php else: ?>
                      <div class="table-responsive">
                        <table class="table table-hover align-middle">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Type</th>
                              <th>Topic</th>
                              <th>Att.</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            <?php foreach ($reports as $r): ?>
                            <tr>
                              <td class="fw-semibold"><?= date('M d, Y', strtotime($r['meeting_date'])) ?></td>
                              <td><span class="badge bg-label-info"><?= htmlspecialchars($r['meeting_type']) ?></span></td>
                              <td><div class="text-truncate" style="max-width: 140px;"><?= htmlspecialchars($r['topic'] ?: 'No Topic') ?></div></td>
                              <td><span class="badge bg-success"><?= $r['total_attendance'] ?></span></td>
                              <td>
                                <a href="cell-report-form.php?cell_id=<?= $cell_id ?>&date=<?= $r['meeting_date'] ?>&meeting_type=<?= urlencode($r['meeting_type']) ?>" class="btn btn-sm btn-outline-primary">Edit</a>
                              </td>
                            </tr>
                            <?php endforeach; ?>
                          </tbody>
                        </table>
                      </div>
                      <?php endif; ?>
                    </div>

                    <!-- Draft reports -->
                    <div class="tab-pane fade" id="draftsTab">
                      <?php if (empty($drafts)): ?>
                      <div class="text-center py-5 text-muted">
                        <i class="bx bx-edit fs-1 d-block mb-2"></i>
                        No active drafts found. Any report you start is saved as a draft automatically.
                      </div>
                      <?php else: ?>
                      <div class="table-responsive">
                        <table class="table table-hover align-middle">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Type</th>
                              <th>Topic</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            <?php foreach ($drafts as $d): ?>
                            <tr>
                              <td class="fw-semibold"><?= date('M d, Y', strtotime($d['meeting_date'])) ?></td>
                              <td><span class="badge bg-label-warning"><?= htmlspecialchars($d['meeting_type']) ?></span></td>
                              <td><div class="text-truncate" style="max-width: 140px;"><?= htmlspecialchars($d['topic'] ?: 'Unnamed Draft') ?></div></td>
                              <td>
                                <a href="cell-report-form.php?cell_id=<?= $cell_id ?>&date=<?= $d['meeting_date'] ?>&meeting_type=<?= urlencode($d['meeting_type']) ?>" class="btn btn-sm btn-primary">Resume</a>
                              </td>
                            </tr>
                            <?php endforeach; ?>
                          </tbody>
                        </table>
                      </div>
                      <?php endif; ?>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side: Follow-up Tasks Workflow -->
            <div class="col-lg-5">
              <div class="card card-custom">
                <div class="card-header border-bottom-0 pb-1">
                  <h5><i class="bx bx-bell me-2 text-primary"></i>Assimilation Tasks</h5>
                  <ul class="nav nav-tabs nav-tabs-custom border-0" id="taskTabs" role="tablist">
                    <li class="nav-item">
                      <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#pendingTasksTab" type="button">Pending (<?= count($pending_tasks) ?>)</button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#completedTasksTab" type="button">History</button>
                    </li>
                  </ul>
                </div>
                <div class="card-body">
                  <div class="tab-content pt-3">
                    
                    <!-- Pending Tasks -->
                    <div class="tab-pane fade show active" id="pendingTasksTab">
                      <?php if (empty($pending_tasks)): ?>
                      <div class="text-center py-5 text-muted">
                        <i class="bx bx-check-double text-success fs-1 d-block mb-2"></i>
                        All follow-up tasks completed! Excellent assimilation work.
                      </div>
                      <?php else: ?>
                      <div style="max-height: 420px; overflow-y: auto; padding-right: 4px;">
                        <?php foreach ($pending_tasks as $t): 
                          $days_left = round((strtotime($t['due_date']) - time()) / 86400);
                          $due_class = $days_left < 0 ? 'text-danger fw-bold' : ($days_left <= 1 ? 'text-warning fw-bold' : 'text-muted');
                        ?>
                        <div class="task-item <?= $t['task_type'] ?>">
                          <div class="d-flex justify-content-between align-items-start">
                            <div>
                              <span class="badge bg-label-secondary mb-1" style="font-size:0.7rem;"><?= str_replace('_', ' ', strtoupper($t['task_type'])) ?></span>
                              <h6 class="fw-bold mb-1 text-primary"><?= htmlspecialchars($t['first_name'] . ' ' . $t['last_name']) ?></h6>
                              <p class="small mb-2 text-secondary"><?= htmlspecialchars($t['description']) ?></p>
                              <div class="d-flex gap-3 text-xs">
                                <span class="<?= $due_class ?>"><i class="bx bx-calendar me-1"></i>Due: <?= date('M d, Y', strtotime($t['due_date'])) ?></span>
                                <?php if ($t['phone_no']): ?>
                                <span class="text-muted"><i class="bx bx-phone me-1"></i><?= htmlspecialchars($t['phone_no']) ?></span>
                                <?php endif; ?>
                              </div>
                            </div>
                            <button type="button" class="btn btn-sm btn-success btn-icon rounded-circle" onclick="resolveTask(<?= $t['id'] ?>)" title="Complete Task">
                              <i class="bx bx-check"></i>
                            </button>
                          </div>
                        </div>
                        <?php endforeach; ?>
                      </div>
                      <?php endif; ?>
                    </div>

                    <!-- Completed Tasks -->
                    <div class="tab-pane fade" id="completedTasksTab">
                      <?php if (empty($completed_tasks)): ?>
                      <div class="text-center py-5 text-muted">
                        <i class="bx bx-task-x fs-1 d-block mb-2"></i>
                        No recently resolved tasks found.
                      </div>
                      <?php else: ?>
                      <div style="max-height: 420px; overflow-y: auto;">
                        <?php foreach ($completed_tasks as $t): ?>
                        <div class="task-item bg-white border-start-0 p-3 mb-2 shadow-xs" style="border:1px solid #eef0f2; border-radius:8px;">
                          <div class="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 class="fw-bold mb-1 text-muted text-decoration-line-through"><?= htmlspecialchars($t['first_name'] . ' ' . $t['last_name']) ?></h6>
                              <p class="small mb-1 text-secondary"><?= htmlspecialchars($t['description']) ?></p>
                              <div class="small bg-light p-2 rounded text-muted mt-1" style="font-size:0.75rem;">
                                <strong>Log Notes:</strong> <?= htmlspecialchars($t['notes'] ?: 'No completion notes recorded.') ?>
                              </div>
                              <small class="text-muted mt-1 d-block"><i class="bx bx-check-circle text-success me-1"></i>Completed: <?= date('M d, Y h:i A', strtotime($t['completed_at'])) ?></small>
                            </div>
                          </div>
                        </div>
                        <?php endforeach; ?>
                      </div>
                      <?php endif; ?>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>

          <?php endif; ?>

        </div>
        <?php include("includes/footer.php"); ?>
      </div>

    </div>
  </div>
</div>

<?php include('includes/scripts.html'); ?>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
  // Complete a follow-up task
  function resolveTask(taskId) {
    Swal.fire({
      title: 'Complete Follow-up Task',
      input: 'textarea',
      inputPlaceholder: 'Enter call notes or followup details (e.g. He is doing well, will attend next Sunday)...',
      inputAttributes: {
        'aria-label': 'Enter call notes'
      },
      showCancelButton: true,
      confirmButtonText: 'Submit & Complete',
      confirmButtonColor: '#28a745',
      preConfirm: (notes) => {
        if (!notes) {
          Swal.showValidationMessage('Please write down some notes before submitting.');
        }
        return notes;
      }
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Updating task status...',
          didOpen: () => { Swal.showLoading(); }
        });

        fetch('manage/complete_followup_task.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `task_id=${taskId}&notes=${encodeURIComponent(result.value)}`
        })
        .then(r => r.json())
        .then(res => {
          Swal.close();
          if (res.success) {
            Swal.fire({
              icon: 'success',
              title: 'Task Resolved!',
              text: res.message,
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire('Error', res.message, 'error');
          }
        })
        .catch(() => {
          Swal.close();
          Swal.fire('Error', 'Connection error occurred.', 'error');
        });
      }
    });
  }
</script>
</body>
</html>
