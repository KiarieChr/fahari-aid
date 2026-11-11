<?php
include('includes/checklogin.php');

$title = "Cell Management | Cell Members";
include("includes/get_user.php");

// ── Require a cell ID ─────────────────────────────────────────────────────────
$cell_id = isset($_GET['cid']) ? intval($_GET['cid']) : 0;

// ── Cell info + leader ────────────────────────────────────────────────────────
$cell_info = null;
if ($cell_id) {
    $ci = $db->prepare("
        SELECT c.id, c.code, c.name, c.status,
               m.id AS leader_id, m.first_name, m.last_name,
               m.phone_no, m.email, m.location
        FROM cells c
        JOIN member m ON m.id = c.cell_leader
        WHERE c.id = :cid
    ");
    $ci->execute([':cid' => $cell_id]);
    $cell_info = $ci->fetch(PDO::FETCH_ASSOC);
}

// ── Current cell members ──────────────────────────────────────────────────────
$cell_members = [];
if ($cell_id) {
    $mems = $db->prepare("
        SELECT m.id, m.first_name, m.last_name, m.phone_no,
               m.email, m.location, m.delete_status
        FROM member m
        WHERE m.cell_id = :cid
          AND (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0')
        ORDER BY m.first_name ASC
    ");
    $mems->execute([':cid' => $cell_id]);
    $cell_members = $mems->fetchAll(PDO::FETCH_ASSOC);
}

// ── Unassigned members (for the Add Members select) ───────────────────────────
$unassigned_stmt = $db->query("
    SELECT id, first_name, last_name, phone_no
    FROM member
    WHERE cell_id IS NULL
      AND (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')
    ORDER BY first_name ASC
");
$unassigned = $unassigned_stmt->fetchAll(PDO::FETCH_ASSOC);

// ── All other cells (for reassign dropdown) ───────────────────────────────────
$other_cells = [];
if ($cell_id) {
    $oc = $db->prepare("
        SELECT c.id, c.code,
               CONCAT(m.first_name,' ',m.last_name) AS leader
        FROM cells c
        LEFT JOIN member m ON m.id = c.cell_leader
        WHERE c.id != :cid AND c.status = 1
        ORDER BY c.code ASC
    ");
    $oc->execute([':cid' => $cell_id]);
    $other_cells = $oc->fetchAll(PDO::FETCH_ASSOC);
}

$member_count = count($cell_members);
?>
<!doctype html>
<html lang="en"
  class="layout-navbar-fixed layout-menu-fixed layout-compact"
  dir="ltr"
  data-skin="default"
  data-assets-path="assets/"
  data-template="vertical-menu-template"
  data-bs-theme="light">
<?php @include('includes/header.php'); ?>

<head>
  <style>
    :root {
      --c-primary : #1a0533;
      --c-accent  : #6f42c1;
      --c-cyan    : #0ec2e6;
      --c-success : #28a745;
      --c-warning : #ffc107;
      --c-danger  : #dc3545;
    }

    /* ── Page hero ─────────────────── */
    .page-hero {
      background: linear-gradient(135deg, var(--c-primary) 0%, #2d0a5e 55%, var(--c-accent) 100%);
      padding: 26px 32px;
      border-radius: 16px;
      color: #fff;
      margin-bottom: 28px;
      box-shadow: 0 8px 32px rgba(26,5,51,.32);
      position: relative; overflow: hidden;
    }
    .page-hero::before {
      content:''; position:absolute; top:-50px; right:-50px;
      width:200px; height:200px; border-radius:50%;
      background:rgba(255,255,255,.05);
    }
    .page-hero h4 { font-weight:700; font-size:1.4rem; margin:0 0 4px; }
    .page-hero p  { opacity:.8; font-size:.88rem; margin:0; }

    /* ── Stat mini cards ───────────── */
    .mini-stat {
      border-radius: 14px; padding: 18px 20px;
      border: none; box-shadow: 0 4px 18px rgba(0,0,0,.08);
      display: flex; align-items: center; gap: 14px;
      transition: transform .22s;
    }
    .mini-stat:hover { transform: translateY(-3px); }
    .mini-stat .ms-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; flex-shrink: 0;
    }
    .mini-stat .ms-num  { font-size: 1.7rem; font-weight: 800; line-height: 1; color: var(--c-primary); }
    .mini-stat .ms-lbl  { font-size: .75rem; text-transform: uppercase;
                          letter-spacing:.05em; color: #8a7baa; margin-top:2px; }

    /* ── Leader card ───────────────── */
    .leader-card {
      border-radius: 16px; border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.07);
      overflow: hidden;
    }
    .leader-card .lc-header {
      background: linear-gradient(135deg, #f4f0ff, #eaf6ff);
      padding: 20px; border-bottom: 1px solid #ede0ff;
    }
    .leader-avatar-lg {
      width: 60px; height: 60px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 800; color: #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,.2);
    }

    /* ── Add members card ──────────── */
    .add-card {
      border-radius: 16px; border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.07);
    }
    .add-card .card-header {
      background: #fff; border-bottom: 1px solid #f0eaf8;
      padding: 16px 20px; border-radius: 16px 16px 0 0;
    }

    /* ── Members table card ────────── */
    .table-card {
      border-radius: 16px; border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.07);
      overflow: hidden;
    }
    .table-card .card-header {
      background: #fff; border-bottom: 1px solid #f0eaf8;
      padding: 16px 22px;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
    }
    .table-card .card-header h6 { font-weight: 700; color: var(--c-primary); margin: 0; }

    /* ── Member avatar ─────────────── */
    .m-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: .9rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    /* ── Action inline buttons ─────── */
    .btn-inline {
      border-radius: 8px; font-size: .78rem; font-weight: 600;
      padding: 5px 12px; border: none; transition: all .2s;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .btn-reassign { background: #e8f4ff; color: #0d6efd; }
    .btn-reassign:hover { background: #0d6efd; color: #fff; }
    .btn-remove   { background: #fff0f0; color: var(--c-danger); }
    .btn-remove:hover   { background: var(--c-danger); color: #fff; }

    /* ── Assign button ─────────────── */
    .btn-assign {
      background: linear-gradient(135deg, var(--c-accent), #a06efc);
      color: #fff; border: none; border-radius: 10px;
      padding: 10px 22px; font-weight: 600; font-size: .9rem;
      transition: all .2s; display: inline-flex; align-items: center; gap: 6px;
    }
    .btn-assign:hover { opacity: .9; color: #fff; transform: translateY(-1px); }

    /* ── Empty state ───────────────── */
    .empty-state { text-align: center; padding: 48px 24px; }
    .empty-state i { font-size: 3rem; color: #d0c4f0; display: block; margin-bottom: 10px; }
    .empty-state h6 { color: #6c757d; margin: 0; }

    /* ── No cell selected ──────────── */
    .select-prompt {
      background: linear-gradient(135deg,#f9f5ff,#f0f8ff);
      border-radius: 16px; padding: 60px 32px;
      text-align: center; border: 2px dashed #d0c4f0;
    }
    .select-prompt i { font-size: 3.5rem; color: #c4b0ee; display: block; margin-bottom: 14px; }
    .select-prompt h5 { color: var(--c-primary); }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .fade-up { animation: fadeUp .4s ease both; }

    /* ── TomSelect override ────────── */
    .ts-wrapper .ts-control { border-radius: 10px !important; min-height: 42px; }
  </style>
</head>

<body>
<div class="layout-wrapper layout-content-navbar">
  <div class="layout-container">

    <?php @include('includes/sidebar.php'); ?>

    <div class="menu-mobile-toggler d-xl-none rounded-1">
      <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large text-bg-secondary p-2 rounded-1">
        <i class="bx bx-menu icon-base"></i>
        <i class="bx bx-chevron-right icon-base"></i>
      </a>
    </div>

    <div class="layout-page">
      <?php @include('includes/nav.php'); ?>
      <?php @include('modals/cells.php'); ?>

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">

          <!-- ── Page Hero ──────────────────────────────────────── -->
          <div class="page-hero fade-up">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <?php if ($cell_info): ?>
                <h4><i class="bx bx-group me-2"></i>
                  <?= htmlspecialchars($cell_info['code']) ?>
                  <?php if ($cell_info['name']): ?> &mdash; <?= htmlspecialchars($cell_info['name']) ?><?php endif; ?>
                </h4>
                <p>View, add and manage members of this cell group.</p>
                <?php else: ?>
                <h4><i class="bx bx-group me-2"></i>Cell Members</h4>
                <p>Select a cell from the directory to manage its members.</p>
                <?php endif; ?>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <a href="cells.php" class="btn btn-sm" style="background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 16px;font-weight:600;">
                  <i class="bx bx-arrow-back me-1"></i> Cell Directory
                </a>
                <?php if ($cell_id): ?>
                <a href="cell_attendance.php?cell_id=<?= $cell_id ?>"
                   class="btn btn-sm" style="background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 16px;font-weight:600;">
                  <i class="bx bx-user-check me-1"></i> Attendance
                </a>
                <?php endif; ?>
                <button type="button" class="btn btn-sm btn-light" data-bs-toggle="modal" data-bs-target="#newCell"
                        style="border-radius:10px;font-weight:600;padding:8px 16px;">
                  <i class="bx bx-plus me-1"></i> New Cell
                </button>
              </div>
            </div>
          </div>

          <?php if (!$cell_id): ?>
          <!-- ── No cell selected ───────────────────────────────── -->
          <div class="select-prompt fade-up">
            <i class="bx bx-select-multiple"></i>
            <h5>No Cell Selected</h5>
            <p class="text-muted mb-4">Go to the Cell Directory and click <strong>Edit / Members</strong> on any cell to manage it here.</p>
            <a href="cells.php" class="btn-assign" style="text-decoration:none; display:inline-flex;">
              <i class="bx bx-layout"></i> Go to Cell Directory
            </a>
          </div>

          <?php else: ?>

          <!-- ── Stats + Leader Row ─────────────────────────────── -->
          <div class="row g-3 mb-4 fade-up">

            <!-- Stat: Members -->
            <div class="col-6 col-md-3">
              <div class="mini-stat h-100">
                <div class="ms-icon" style="background:#f0e8ff;">
                  <i class="bx bx-group" style="color:var(--c-accent);"></i>
                </div>
                <div>
                  <div class="ms-num"><?= $member_count ?></div>
                  <div class="ms-lbl">Cell Members</div>
                </div>
              </div>
            </div>

            <!-- Stat: Unassigned pool -->
            <div class="col-6 col-md-3">
              <div class="mini-stat h-100">
                <div class="ms-icon" style="background:#e8f5ff;">
                  <i class="bx bx-user-plus" style="color:#0d6efd;"></i>
                </div>
                <div>
                  <div class="ms-num"><?= count($unassigned) ?></div>
                  <div class="ms-lbl">Available to Add</div>
                </div>
              </div>
            </div>

            <!-- Stat: Status -->
            <div class="col-6 col-md-3">
              <div class="mini-stat h-100">
                <div class="ms-icon" style="background:<?= $cell_info['status']==1 ? '#e8fff0' : '#fff8e0' ?>;">
                  <i class="bx <?= $cell_info['status']==1 ? 'bx-check-circle' : 'bx-pause-circle' ?>"
                     style="color:<?= $cell_info['status']==1 ? '#28a745' : '#b38600' ?>;"></i>
                </div>
                <div>
                  <div class="ms-num" style="font-size:1.1rem; margin-top:4px;">
                    <?= $cell_info['status']==1 ? 'Active' : 'Closed' ?>
                  </div>
                  <div class="ms-lbl">Cell Status</div>
                </div>
              </div>
            </div>

            <!-- Stat: Cell code -->
            <div class="col-6 col-md-3">
              <div class="mini-stat h-100">
                <div class="ms-icon" style="background:#fff3e8;">
                  <i class="bx bx-id-card" style="color:#fd7e14;"></i>
                </div>
                <div>
                  <div class="ms-num" style="font-size:1.1rem; margin-top:4px;">
                    <?= htmlspecialchars($cell_info['code']) ?>
                  </div>
                  <div class="ms-lbl">Cell Code</div>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4 fade-up">

            <!-- ── Left column: Leader + Add Members ─────────── -->
            <div class="col-lg-4">

              <!-- Leader card -->
              <?php
                $lcolor   = '#' . substr(md5($cell_info['leader_id']), 0, 6);
                $linitial = strtoupper(substr($cell_info['first_name'], 0, 1));
              ?>
              <div class="card leader-card mb-4">
                <div class="lc-header">
                  <div class="d-flex align-items-center gap-3">
                    <div class="leader-avatar-lg" style="background:<?= $lcolor ?>;"><?= $linitial ?></div>
                    <div>
                      <div class="fw-bold" style="color:var(--c-primary); font-size:1rem;">
                        <?= htmlspecialchars($cell_info['first_name'] . ' ' . $cell_info['last_name']) ?>
                      </div>
                      <span class="badge" style="background:#d4f0e0;color:#1a7c3e;font-size:.75rem;">
                        <i class="bx bx-crown me-1"></i>Cell Leader
                      </span>
                    </div>
                  </div>
                </div>
                <div class="card-body p-4">
                  <?php if ($cell_info['phone_no']): ?>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="bx bx-phone text-primary"></i>
                    <span class="text-muted small"><?= htmlspecialchars($cell_info['phone_no']) ?></span>
                  </div>
                  <?php endif; ?>
                  <?php if ($cell_info['email']): ?>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="bx bx-envelope text-primary"></i>
                    <span class="text-muted small"><?= htmlspecialchars($cell_info['email']) ?></span>
                  </div>
                  <?php endif; ?>
                  <?php if ($cell_info['location']): ?>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bx bx-map-pin text-primary"></i>
                    <span class="text-muted small"><?= htmlspecialchars($cell_info['location']) ?></span>
                  </div>
                  <?php endif; ?>
                </div>
              </div>

              <!-- Add Members card -->
              <div class="card add-card">
                <div class="card-header">
                  <h6 class="fw-bold mb-0" style="color:var(--c-primary);">
                    <i class="bx bx-user-plus me-2 text-primary"></i>Add Members to Cell
                  </h6>
                  <small class="text-muted">Only unassigned members are shown</small>
                </div>
                <div class="card-body p-4">
                  <?php if (empty($unassigned)): ?>
                  <div class="text-center py-3">
                    <i class="bx bx-check-circle" style="font-size:2.2rem; color:#28a745; display:block; margin-bottom:8px;"></i>
                    <p class="text-muted small mb-0">All members are assigned to cells.</p>
                  </div>
                  <?php else: ?>
                  <form action="manage/process_members.php" method="post" id="addMembersForm">
                    <input type="hidden" name="cell_id" value="<?= $cell_id ?>">
                    <div class="mb-3">
                      <label class="form-label fw-semibold small">Choose Members</label>
                      <select id="memberSelect" multiple name="members[]" placeholder="Search members…">
                        <?php foreach ($unassigned as $u): ?>
                        <option value="<?= $u['id'] ?>">
                          <?= htmlspecialchars($u['first_name'] . ' ' . $u['last_name']) ?>
                          <?php if ($u['phone_no']): ?> — <?= htmlspecialchars($u['phone_no']) ?><?php endif; ?>
                        </option>
                        <?php endforeach; ?>
                      </select>
                    </div>
                    <button type="submit" class="btn-assign w-100" id="assignBtn">
                      <i class="bx bx-user-plus"></i>
                      Assign to <?= htmlspecialchars($cell_info['code']) ?>
                    </button>
                  </form>
                  <?php endif; ?>
                </div>
              </div>

            </div>

            <!-- ── Right column: Members table ───────────────── -->
            <div class="col-lg-8">
              <div class="card table-card h-100">
                <div class="card-header">
                  <h6>
                    <i class="bx bx-list-ul me-2 text-primary"></i>
                    Cell Members
                  </h6>
                  <span class="badge" style="background:#f0e8ff; color:var(--c-accent); font-size:.8rem; padding:6px 12px;">
                    <?= $member_count ?> member<?= $member_count !== 1 ? 's' : '' ?>
                  </span>
                </div>

                <?php if (empty($cell_members)): ?>
                <div class="empty-state">
                  <i class="bx bx-user-x"></i>
                  <h6>No members in this cell yet</h6>
                  <p class="text-muted small mt-1">Use the panel on the left to add members.</p>
                </div>
                <?php else: ?>
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0" id="membersTable">
                    <thead style="background:#faf7ff;">
                      <tr>
                        <th style="padding:12px 18px;">#</th>
                        <th>Member</th>
                        <th>Contact</th>
                        <th>Location</th>
                        <th style="padding:12px 18px;">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <?php foreach ($cell_members as $i => $row):
                        $mid     = $row['id'];
                        $name    = $row['first_name'] . ' ' . $row['last_name'];
                        $initial = strtoupper(substr($row['first_name'], 0, 1));
                        $acolor  = '#' . substr(md5($mid), 0, 6);
                      ?>
                      <tr id="mrow-<?= $mid ?>">
                        <td style="padding:12px 18px; color:#8a7baa; font-weight:600;"><?= $i + 1 ?></td>

                        <!-- Name + avatar -->
                        <td>
                          <div class="d-flex align-items-center gap-2">
                            <div class="m-avatar" style="background:<?= $acolor ?>;"><?= $initial ?></div>
                            <div>
                              <div class="fw-semibold" style="font-size:.9rem;"><?= htmlspecialchars($name) ?></div>
                              <small class="text-muted"><?= htmlspecialchars($row['email'] ?? '') ?></small>
                            </div>
                          </div>
                        </td>

                        <!-- Phone -->
                        <td>
                          <span class="text-muted small">
                            <?php if ($row['phone_no']): ?>
                            <i class="bx bx-phone me-1"></i><?= htmlspecialchars($row['phone_no']) ?>
                            <?php else: ?><span class="text-muted">—</span><?php endif; ?>
                          </span>
                        </td>

                        <!-- Location -->
                        <td>
                          <span class="text-muted small">
                            <?php if ($row['location']): ?>
                            <i class="bx bx-map-pin me-1"></i><?= htmlspecialchars($row['location']) ?>
                            <?php else: ?><span class="text-muted">—</span><?php endif; ?>
                          </span>
                        </td>

                        <!-- Actions -->
                        <td style="padding:12px 18px;">
                          <div class="d-flex gap-2">
                            <!-- Reassign: opens modal -->
                            <button class="btn-inline btn-reassign"
                                    data-bs-toggle="modal"
                                    data-bs-target="#editCell-<?= $mid ?>">
                              <i class="bx bx-transfer-alt"></i> Reassign
                            </button>
                            <!-- Remove: opens modal -->
                            <button class="btn-inline btn-remove"
                                    data-bs-toggle="modal"
                                    data-bs-target="#removeCell-<?= $mid ?>">
                              <i class="bx bx-user-minus"></i> Remove
                            </button>
                          </div>
                        </td>
                      </tr>

                      <!-- Include reassign + remove modals for this member -->
                      <?php
                        $id   = $mid;
                        $name = htmlspecialchars($row['first_name'] . ' ' . $row['last_name']);
                        include('modals/edit-cell.php');
                      ?>

                      <?php endforeach; ?>
                    </tbody>
                  </table>
                </div>
                <?php endif; ?>
              </div>
            </div>

          </div><!-- /row -->
          <?php endif; ?>

        </div><!-- /container -->

        <?php @include("includes/footer.php"); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
  <div class="layout-overlay layout-menu-toggle"></div>
</div>

<?php include('includes/scripts.html'); ?>

<script>
  // Helper toast function using Bootstrap Toast
  function showToast(message, type = 'info') {
    const icon = type === 'success' ? 'bx-check-circle' : 
                 type === 'error' ? 'bx-error-circle' : 
                 type === 'warning' ? 'bx-error-alt' : 'bx-info-circle';
    const bgClass = type === 'success' ? 'bg-success text-white' : 
                    type === 'error' ? 'bg-danger text-white' : 
                    type === 'warning' ? 'bg-warning text-dark' : 'bg-info text-white';

    // Create container if not exists
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }

    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center ${bgClass} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bx ${icon}" style="font-size:1.2rem;"></i>
          <span>${message}</span>
        </div>
        <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    container.appendChild(toastEl);

    // Initialize and show via Bootstrap API
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();

    // Remove element from DOM when hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
    });
  }

  // TomSelect for multi-select add members
  <?php if ($cell_id && !empty($unassigned)): ?>
  new TomSelect("#memberSelect", {
    plugins: ['remove_button'],
    maxItems: null,
    placeholder: 'Search and select members…',
    render: {
      option: function(data, escape) {
        return '<div class="d-flex align-items-center gap-2 py-1">' +
               '<i class="bx bx-user" style="color:#6f42c1;"></i>' +
               '<span>' + escape(data.text) + '</span></div>';
      }
    }
  });
  <?php endif; ?>

  // DataTable for members
  <?php if (!empty($cell_members)): ?>
  $(document).ready(function() {
    $('#membersTable').DataTable({
      paging      : true,
      searching   : true,
      ordering    : true,
      info        : true,
      lengthChange: true,
      pageLength  : 15,
      columnDefs  : [{ orderable: false, targets: [4] }],
      language    : { searchPlaceholder: 'Search members…', search: '' }
    });
  });
  <?php endif; ?>

  // AJAX submission for add members form
  $(document).ready(function() {
    $('#addMembersForm').on('submit', function(e) {
      e.preventDefault();
      
      const form = $(this);
      const btn = $('#assignBtn');
      const originalText = btn.html();
      
      btn.html('<i class="bx bx-loader-alt bx-spin me-1"></i> Assigning...').prop('disabled', true);
      
      const formData = form.serialize() + '&ajax=1';
      
      $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: formData,
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            showToast(response.message, 'success');
            setTimeout(() => {
              location.reload();
            }, 1200);
          } else {
            showToast(response.message, 'error');
            btn.html(originalText).prop('disabled', false);
          }
        },
        error: function(xhr, status, error) {
          showToast('Failed to assign members. Please try again.', 'error');
          btn.html(originalText).prop('disabled', false);
        }
      });
    });
  });
</script>
</body>
</html>
