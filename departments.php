<?php 
include('includes/checklogin.php');

$title = "Management | Ministries & Departments";
include("includes/get_user.php");

// ── Aggregate Stats ──────────────────────────────────────────────────────────
$total_depts = $db->query("SELECT COUNT(*) FROM departments WHERE delete_status = 0 OR delete_status IS NULL")->fetchColumn();
$total_sub_depts = $db->query("SELECT COUNT(*) FROM sub_departments")->fetchColumn();
$assigned_mems = $db->query("
    SELECT COUNT(*) 
    FROM member 
    WHERE department_id IS NOT NULL AND department_id > 0 
      AND (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')
")->fetchColumn();
$total_mems = $db->query("
    SELECT COUNT(*) 
    FROM member 
    WHERE (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')
")->fetchColumn();
$unassigned_mems = max(0, $total_mems - $assigned_mems);

// ── Selected Filter Parameters ───────────────────────────────────────────────
$selected_dept_id = isset($_GET['dept_id']) ? intval($_GET['dept_id']) : 0;
$selected_sub_id = isset($_GET['sub_id']) ? intval($_GET['sub_id']) : 0;
$view_mode = isset($_GET['view']) ? $_GET['view'] : ''; // 'unassigned' or 'all'

// ── Get Filtered List of Members ─────────────────────────────────────────────
$members = [];
$list_title = "All Registered Members";
$list_subtitle = "Viewing all members in the church directory.";

if ($selected_sub_id > 0) {
    // Get sub-dept and dept info
    $sub_stmt = $db->prepare("
        SELECT sd.name as sub_name, d.name as dept_name, sd.department as dept_id 
        FROM sub_departments sd 
        JOIN departments d ON sd.department = d.id 
        WHERE sd.id = ?
    ");
    $sub_stmt->execute([$selected_sub_id]);
    $sub_info = $sub_stmt->fetch(PDO::FETCH_ASSOC);
    if ($sub_info) {
        $list_title = htmlspecialchars($sub_info['dept_name']) . " &mdash; " . htmlspecialchars($sub_info['sub_name']);
        $list_subtitle = "Viewing members assigned to this sub-ministry.";
        $selected_dept_id = intval($sub_info['dept_id']);
    }
    
    $stmt = $db->prepare("
        SELECT m.id, m.first_name, m.last_name, m.phone_no, m.email, m.location, 
               m.department_id, m.sub_ministerial, d.name as dept_name, sd.name as sub_name
        FROM member m
        LEFT JOIN departments d ON m.department_id = d.id
        LEFT JOIN sub_departments sd ON m.sub_ministerial = sd.id
        WHERE m.sub_ministerial = ?
          AND (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0')
        ORDER BY m.first_name ASC
    ");
    $stmt->execute([$selected_sub_id]);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
} elseif ($selected_dept_id > 0) {
    // Get department info
    $dept_name = $db->query("SELECT name FROM departments WHERE id = $selected_dept_id")->fetchColumn();
    $list_title = htmlspecialchars($dept_name) . " Ministry";
    $list_subtitle = "Viewing all members assigned to this department.";
    
    $stmt = $db->prepare("
        SELECT m.id, m.first_name, m.last_name, m.phone_no, m.email, m.location, 
               m.department_id, m.sub_ministerial, d.name as dept_name, sd.name as sub_name
        FROM member m
        LEFT JOIN departments d ON m.department_id = d.id
        LEFT JOIN sub_departments sd ON m.sub_ministerial = sd.id
        WHERE m.department_id = ?
          AND (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0')
        ORDER BY m.first_name ASC
    ");
    $stmt->execute([$selected_dept_id]);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
} elseif ($view_mode === 'unassigned') {
    $list_title = "Unassigned Members";
    $list_subtitle = "Viewing members not assigned to any ministry or department.";
    
    $stmt = $db->query("
        SELECT m.id, m.first_name, m.last_name, m.phone_no, m.email, m.location, 
               m.department_id, m.sub_ministerial, NULL as dept_name, NULL as sub_name
        FROM member m
        WHERE (m.department_id IS NULL OR m.department_id = 0)
          AND (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0')
        ORDER BY m.first_name ASC
    ");
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
} else {
    // Default: View all members
    $stmt = $db->query("
        SELECT m.id, m.first_name, m.last_name, m.phone_no, m.email, m.location, 
               m.department_id, m.sub_ministerial, d.name as dept_name, sd.name as sub_name
        FROM member m
        LEFT JOIN departments d ON m.department_id = d.id
        LEFT JOIN sub_departments sd ON m.sub_ministerial = sd.id
        WHERE (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0')
        ORDER BY m.first_name ASC
    ");
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// ── Directories Lists (Left Tree) ────────────────────────────────────────────
// Fetch active departments with member counts
$departments_list = $db->query("
    SELECT d.id, d.name, d.description, d.delete_status,
           (SELECT COUNT(*) FROM member m WHERE m.department_id = d.id AND (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0')) as member_count
    FROM departments d
    WHERE d.delete_status = 0 OR d.delete_status IS NULL
    ORDER BY d.name ASC
")->fetchAll(PDO::FETCH_ASSOC);

// Fetch all sub-departments with member counts
$sub_departments_list = $db->query("
    SELECT sd.id, sd.name, sd.department as dept_id,
           (SELECT COUNT(*) FROM member m WHERE m.sub_ministerial = sd.id AND (m.delete_status IS NULL OR m.delete_status = 'Active' OR m.delete_status = '0')) as member_count
    FROM sub_departments sd
    ORDER BY sd.name ASC
")->fetchAll(PDO::FETCH_ASSOC);

// Group sub-departments by parent department
$sub_depts_by_dept = [];
foreach ($sub_departments_list as $sd) {
    $sub_depts_by_dept[$sd['dept_id']][] = $sd;
}

// Fetch unassigned members for assignment selection (max limit or complete list)
$unassigned_members = $db->query("
    SELECT id, first_name, last_name, phone_no 
    FROM member 
    WHERE (department_id IS NULL OR department_id = 0)
      AND (delete_status IS NULL OR delete_status = 'Active' OR delete_status = '0')
    ORDER BY first_name ASC
")->fetchAll(PDO::FETCH_ASSOC);

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
    /* ── Design tokens ─────────────────────────────────────── */
    :root {
      --c-primary : #1a0533;
      --c-accent  : #6f42c1;
      --c-cyan    : #0ec2e6;
      --c-success : #28a745;
      --c-warning : #ffc107;
      --c-danger  : #dc3545;
      --c-info    : #17a2b8;
    }

    /* ── Page hero ─────────────────────────────────────────── */
    .page-hero {
      background: linear-gradient(135deg, var(--c-primary) 0%, #2d0a5e 55%, var(--c-accent) 100%);
      padding: 26px 32px;
      border-radius: 16px;
      color: #fff;
      margin-bottom: 28px;
      box-shadow: 0 8px 32px rgba(26,5,51,.32);
      position: relative;
      overflow: hidden;
    }
    .page-hero::before {
      content:'';
      position:absolute; top:-50px; right:-50px;
      width:220px; height:220px; border-radius:50%;
      background:rgba(255,255,255,.05);
    }
    .page-hero::after {
      content:'';
      position:absolute; bottom:-60px; left:40%;
      width:160px; height:160px; border-radius:50%;
      background:rgba(255,255,255,.04);
    }
    .page-hero h4 { font-weight:700; font-size:1.45rem; margin:0 0 4px; }
    .page-hero p  { opacity:.8; font-size:.9rem; margin:0; }

    /* ── Stat cards ────────────────────────────────────────── */
    .stat-card {
      border-radius: 16px;
      padding: 22px 20px;
      color: #fff;
      border: none;
      box-shadow: 0 6px 22px rgba(0,0,0,.13);
      transition: transform .25s, box-shadow .25s;
      position: relative;
      overflow: hidden;
    }
    .stat-card:hover { transform:translateY(-5px); box-shadow:0 12px 32px rgba(0,0,0,.18); }
    .stat-card .s-icon {
      position:absolute; right:16px; top:16px;
      font-size:2.8rem; opacity:.18;
    }
    .stat-card .s-num {
      font-size:2.4rem; font-weight:800; line-height:1; display:block;
    }
    .stat-card .s-lbl {
      font-size:.78rem; text-transform:uppercase; letter-spacing:.06em;
      opacity:.85; margin-top:6px; display:block;
    }
    .stat-card .s-sub {
      font-size:.75rem; opacity:.7; margin-top:2px;
    }
    .sc-purple { background:linear-gradient(135deg,#6f42c1,#a06efc); }
    .sc-green  { background:linear-gradient(135deg,#28a745,#55de7a); }
    .sc-blue   { background:linear-gradient(135deg,#0ec2e6,#43d9f5); }
    .sc-orange { background:linear-gradient(135deg,#fd7e14,#ffc36b); }

    /* ── Table & Tree Cards ────────────────────────────────── */
    .table-card {
      border-radius:16px; border:none;
      box-shadow:0 4px 20px rgba(0,0,0,.07);
      overflow:hidden;
    }
    .table-card .card-header {
      background:#fff; border-bottom:1px solid #f0eaf8;
      padding:18px 24px;
      display:flex; align-items:center; justify-content:space-between;
      flex-wrap:wrap; gap:12px;
    }
    .table-card .card-header h5 {
      font-weight:700; color:var(--c-primary); margin:0; font-size:1.05rem;
    }

    /* ── Directory Left Panel ──────────────────────────────── */
    .dir-tree-title {
      font-size: .8rem;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: #8a7baa;
      padding: 10px 15px;
      font-weight: 700;
    }
    .dir-item-link {
      transition: all .2s ease;
      font-size: .88rem;
    }
    .dir-item-link:hover {
      background: #f8f6fc;
      color: var(--c-accent);
    }
    .dir-item-link.active {
      background: #f0e8ff !important;
      color: var(--c-accent) !important;
      font-weight: 600;
      border-left: 3px solid var(--c-accent);
    }
    .sub-dir-container {
      background: #fbfbfe;
      border-left: 1px dashed #d0c4f0;
      margin-left: 20px;
      padding-left: 5px;
    }
    .sub-dir-link {
      font-size: .82rem;
      padding: 6px 12px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all .15s;
      color: #6c757d;
    }
    .sub-dir-link:hover {
      background: #f5f0ff;
      color: var(--c-accent);
    }
    .sub-dir-link.active {
      background: var(--c-accent);
      color: #fff !important;
      font-weight: 600;
    }
    .hover-bg-light:hover {
      background: #f5f0ff;
    }

    /* ── Member Avatar & Badges ────────────────────────────── */
    .m-avatar {
      width:36px; height:36px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:.88rem; font-weight:700; color:#fff; flex-shrink:0;
    }
    .member-badge {
      display:inline-flex; align-items:center; gap:5px;
      background:#f0e8ff; color:var(--c-accent);
      border-radius:20px; padding:4px 12px; font-size:.8rem; font-weight:600;
    }

    /* ── Action Inline Buttons ─────────────────────────────── */
    .btn-inline {
      border-radius: 8px; font-size: .78rem; font-weight: 600;
      padding: 5px 12px; border: none; transition: all .2s;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .btn-reassign { background: #e8f4ff; color: #0d6efd; }
    .btn-reassign:hover { background: #0d6efd; color: #fff; }
    .btn-remove   { background: #fff0f0; color: var(--c-danger); }
    .btn-remove:hover   { background: var(--c-danger); color: #fff; }

    /* ── Fade animation ────────────────────────────────────── */
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .fade-up { animation:fadeUp .45s ease both; }
    .fade-up:nth-child(2) { animation-delay:.06s; }
    .fade-up:nth-child(3) { animation-delay:.12s; }
    .fade-up:nth-child(4) { animation-delay:.18s; }

    /* ── TomSelect override ────────────────────────────────── */
    .ts-wrapper .ts-control { border-radius: 8px !important; min-height: 40px; }
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
      <?php 
      @include('includes/nav.php');
      @include('modals/dpt-form.php'); 
      ?>

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">

          <!-- ── Page Hero ── -->
          <div class="page-hero fade-up">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h4><i class="bx bx-category-alt me-2"></i>Ministries & Departments Directory</h4>
                <p>Manage church departments, set up sub-ministries, and filter members by their service areas.</p>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#newClass" style="border-radius:10px; font-weight:600; padding:8px 16px;">
                  <i class="bx bx-plus me-1"></i> New Department
                </button>
                <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#newSubMinisterial" style="border-radius:10px; font-weight:600; padding:8px 16px;">
                  <i class="bx bx-plus me-1"></i> New Sub-Ministry
                </button>
                <button type="button" class="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#assignMinistryModal" style="border-radius:10px; font-weight:600; padding:8px 16px; background:rgba(255,255,255,.15); color:#fff; border:none;">
                  <i class="bx bx-user-plus me-1"></i> Assign Member
                </button>
              </div>
            </div>
          </div>

          <!-- ── Stats Row ── -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-purple h-100">
                <i class="bx bx-git-branch s-icon"></i>
                <span class="s-num"><?= $total_depts ?></span>
                <span class="s-lbl">Total Departments</span>
                <div class="s-sub">Core ministries setup</div>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-blue h-100">
                <i class="bx bx-subdirectory-right s-icon"></i>
                <span class="s-num"><?= $total_sub_depts ?></span>
                <span class="s-lbl">Sub-Ministries</span>
                <div class="s-sub">Service areas & specialties</div>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-green h-100">
                <i class="bx bx-user-check s-icon"></i>
                <span class="s-num"><?= $assigned_mems ?></span>
                <span class="s-lbl">Assigned Members</span>
                <div class="s-sub">Serving in ministries</div>
              </div>
            </div>
            <div class="col-6 col-md-3 fade-up">
              <div class="stat-card sc-orange h-100">
                <i class="bx bx-user-voice s-icon"></i>
                <span class="s-num"><?= $unassigned_mems ?></span>
                <span class="s-lbl">Unassigned Members</span>
                <div class="s-sub">Available to assign</div>
              </div>
            </div>
          </div>

          <!-- ── Main Grid Directory ── -->
          <div class="row g-4 fade-up">
            
            <!-- Left Column: Accordion Tree -->
            <div class="col-lg-4">
              <div class="card table-card h-100">
                <div class="card-header py-3">
                  <h5 class="mb-0"><i class="bx bx-folder-open me-2 text-primary"></i>Directory Categories</h5>
                </div>
                
                <div class="list-group list-group-flush py-2">
                  <!-- View All Links -->
                  <a href="departments.php" class="list-group-item list-group-item-action border-0 py-2 px-4 dir-item-link d-flex justify-content-between align-items-center <?= ($selected_dept_id == 0 && $selected_sub_id == 0 && $view_mode !== 'unassigned') ? 'active' : '' ?>">
                    <span><i class="bx bx-globe me-2"></i>All Members</span>
                    <span class="badge bg-secondary rounded-pill"><?= $total_mems ?></span>
                  </a>
                  
                  <a href="departments.php?view=unassigned" class="list-group-item list-group-item-action border-0 py-2 px-4 dir-item-link d-flex justify-content-between align-items-center <?= ($view_mode === 'unassigned') ? 'active' : '' ?>">
                    <span><i class="bx bx-user-x me-2 text-warning"></i>Unassigned Pool</span>
                    <span class="badge bg-warning text-dark rounded-pill"><?= $unassigned_mems ?></span>
                  </a>
                  
                  <div class="menu-divider my-2"></div>
                  <div class="dir-tree-title">Ministries & Sub-Ministries</div>
                  
                  <!-- Departments list -->
                  <?php if (!empty($departments_list)): ?>
                    <?php foreach ($departments_list as $dept): 
                      $dept_id = $dept['id'];
                      $has_subs = !empty($sub_depts_by_dept[$dept_id]);
                      $is_dept_active = ($selected_dept_id == $dept_id && $selected_sub_id == 0);
                      $is_parent_active = ($selected_dept_id == $dept_id);
                    ?>
                      <div class="border-0 mb-1">
                        <div class="d-flex align-items-center justify-content-between py-2 px-4 dir-item-link <?= $is_dept_active ? 'active' : '' ?>">
                          <a href="departments.php?dept_id=<?= $dept_id ?>" class="flex-grow-1 text-body d-flex align-items-center gap-2" style="text-decoration: none;">
                            <i class="bx bx-chevron-right text-muted" style="transition: transform .2s; <?= $is_parent_active ? 'transform: rotate(90deg);' : '' ?>"></i>
                            <span class="fw-bold" style="font-size: .88rem;"><?= htmlspecialchars($dept['name']) ?></span>
                          </a>
                          <div class="d-flex align-items-center gap-2">
                            <span class="badge rounded-pill" style="background:rgba(111,66,193,.1); color:var(--c-accent); font-size: .75rem;"><?= $dept['member_count'] ?></span>
                            
                            <!-- Quick add/edit sub-dept action -->
                            <div class="dropdown">
                              <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                <i class="bx bx-dots-vertical-rounded text-muted" style="font-size: .95rem;"></i>
                              </button>
                              <div class="dropdown-menu dropdown-menu-end">
                                <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#newSubMinisterial" onclick="$('#department').val(<?= $dept_id ?>)">
                                  <i class="bx bx-plus me-1"></i> Add Sub-Ministry
                                </a>
                                <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#editDeptModal-<?= $dept_id ?>">
                                  <i class="bx bx-edit-alt me-1"></i> Edit Ministry
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>



                        <!-- Sub-departments nested -->
                        <?php if ($has_subs): ?>
                          <div class="sub-dir-container py-1 pe-3" style="display: <?= $is_parent_active ? 'block' : 'none' ?>;">
                            <?php foreach ($sub_depts_by_dept[$dept_id] as $sub_dept): 
                              $sub_dept_id = $sub_dept['id'];
                              $is_sub_active = ($selected_sub_id == $sub_dept_id);
                            ?>
                              <div class="d-flex align-items-center justify-content-between mb-1 rounded <?= $is_sub_active ? 'bg-primary text-white' : 'hover-bg-light' ?>" style="margin-left: 10px;">
                                <a href="departments.php?sub_id=<?= $sub_dept_id ?>" class="sub-dir-link flex-grow-1 text-decoration-none py-2 px-3 <?= $is_sub_active ? 'text-white font-bold' : '' ?>" style="display: flex; justify-content: space-between; align-items: center; width: calc(100% - 30px); text-decoration: none;">
                                  <span class="d-flex align-items-center gap-1 text-truncate">
                                    <i class="bx bx-subdirectory-right <?= $is_sub_active ? 'text-white' : 'text-muted' ?> me-1"></i>
                                    <span class="text-truncate"><?= htmlspecialchars($sub_dept['name']) ?></span>
                                  </span>
                                  <span class="badge rounded-pill <?= $is_sub_active ? 'bg-white text-primary' : 'bg-label-secondary' ?>" style="font-size: .7rem;"><?= $sub_dept['member_count'] ?></span>
                                </a>
                                
                                <div class="dropdown me-2">
                                  <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                    <i class="bx bx-dots-vertical-rounded <?= $is_sub_active ? 'text-white' : 'text-muted' ?>" style="font-size: .9rem;"></i>
                                  </button>
                                  <div class="dropdown-menu dropdown-menu-end">
                                    <a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#editSubDeptModal-<?= $sub_dept_id ?>">
                                      <i class="bx bx-edit-alt me-1"></i> Edit Sub-Ministry
                                    </a>
                                  </div>
                                </div>
                              </div>


                            <?php endforeach; ?>
                          </div>
                        <?php endif; ?>
                      </div>
                    <?php endforeach; ?>
                  <?php else: ?>
                    <div class="text-center py-4 text-muted small">No departments configured yet.</div>
                  <?php endif; ?>
                </div>
              </div>
            </div>

            <!-- Right Column: Interactive Member Table -->
            <div class="col-lg-8">
              <div class="card table-card h-100">
                <div class="card-header d-flex justify-content-between align-items-center py-3">
                  <div>
                    <h5 class="mb-1"><i class="bx bx-list-ul me-2 text-primary"></i><?= $list_title ?></h5>
                    <small class="text-muted"><?= $list_subtitle ?></small>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge" style="background:#f0e8ff; color:var(--c-accent); font-size:.8rem; padding:6px 12px;">
                      <?= count($members) ?> member<?= count($members) !== 1 ? 's' : '' ?>
                    </span>
                    <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#assignMinistryModal" style="border-radius:8px; font-size:.82rem;">
                      <i class="bx bx-user-plus me-1"></i>Assign Members
                    </button>
                  </div>
                </div>

                <?php if (empty($members)): ?>
                  <div class="text-center py-5">
                    <i class="bx bx-user-x" style="font-size:3.5rem; color:#d0c4f0; display:block; margin-bottom:12px;"></i>
                    <h6 class="text-muted mb-1">No members found in this category</h6>
                    <p class="text-muted small mb-0">Use the Assign Member button above to link members here.</p>
                  </div>
                <?php else: ?>
                  <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0" id="membersDirectoryTable">
                      <thead style="background:#faf7ff;">
                        <tr>
                          <th style="padding:12px 18px;">#</th>
                          <th>Member</th>
                          <th>Contact Info</th>
                          <th>Location</th>
                          <th>Ministry & Sub-Ministry</th>
                          <th style="padding:12px 18px;">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <?php foreach ($members as $index => $row): 
                          $mid = $row['id'];
                          $name = $row['first_name'] . ' ' . $row['last_name'];
                          $initial = strtoupper(substr($row['first_name'], 0, 1));
                          $acolor = '#' . substr(md5($mid), 0, 6);
                          
                          $disp_dept = $row['dept_name'] ? htmlspecialchars($row['dept_name']) : '<span class="text-muted small">None</span>';
                          $disp_sub = $row['sub_name'] ? ' &bull; ' . htmlspecialchars($row['sub_name']) : '';
                        ?>
                          <tr>
                            <td style="padding:12px 18px; color:#8a7baa; font-weight:600;"><?= $index + 1 ?></td>
                            <td>
                              <div class="d-flex align-items-center gap-2">
                                <div class="m-avatar" style="background:<?= $acolor ?>;"><?= $initial ?></div>
                                <div>
                                  <div class="fw-semibold" style="font-size:.9rem; color:var(--c-primary);"><?= htmlspecialchars($name) ?></div>
                                  <small class="text-muted">ID: <?= $mid ?></small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div class="small text-muted">
                                <?php if ($row['email']): ?>
                                  <div><i class="bx bx-envelope me-1"></i><?= htmlspecialchars($row['email']) ?></div>
                                <?php endif; ?>
                                <?php if ($row['phone_no']): ?>
                                  <div><i class="bx bx-phone me-1"></i><?= htmlspecialchars($row['phone_no']) ?></div>
                                <?php endif; ?>
                              </div>
                            </td>
                            <td class="small text-muted">
                              <?php if ($row['location']): ?>
                                <i class="bx bx-map-pin me-1"></i><?= htmlspecialchars($row['location']) ?>
                              <?php else: ?>—<?php endif; ?>
                            </td>
                            <td>
                              <span class="member-badge" style="font-size: .75rem;">
                                <i class="bx bx-briefcase-alt-2" style="font-size:.85rem;"></i>
                                <span><?= $disp_dept ?><?= $disp_sub ?></span>
                              </span>
                            </td>
                            <td style="padding:12px 18px;">
                              <div class="d-flex gap-2">
                                <button class="btn-inline btn-reassign" data-bs-toggle="modal" data-bs-target="#reassignModal-<?= $mid ?>">
                                  <i class="bx bx-transfer-alt"></i> Reassign
                                </button>
                                <button class="btn-inline btn-remove" data-bs-toggle="modal" data-bs-target="#removeModal-<?= $mid ?>">
                                  <i class="bx bx-user-minus"></i> Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        <?php endforeach; ?>
                      </tbody>
                    </table>
                  </div>
                <?php endif; ?>
              </div>
            </div>

          </div><!-- /row -->

        </div><!-- /container -->

        <?php @include("includes/footer.php"); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
  <div class="layout-overlay layout-menu-toggle"></div>
</div>

<!-- ── Modals ── -->

<!-- Assign Member Modal -->
<div class="modal fade" id="assignMinistryModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-md" role="document">
    <div class="modal-content border-0" style="border-radius:14px; box-shadow:0 8px 30px rgba(0,0,0,0.15);">
      <div class="modal-header border-bottom-0 pb-0">
        <h5 class="modal-title fw-bold">Assign Members to Ministry</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form action="manage/assign_member_ministry.php" method="post" id="assignMinistryForm">
        <input type="hidden" name="action" value="assign">
        <div class="modal-body py-4">
          <div class="mb-4">
            <label class="form-label fw-semibold small">Choose Members to Assign</label>
            <?php if (empty($unassigned_members)): ?>
              <div class="alert alert-info py-2 mb-0" style="font-size: .85rem;">All members are currently assigned to departments.</div>
            <?php else: ?>
              <select id="memberSelect" name="members[]" class="form-select" multiple required placeholder="Search and select members…">
                <?php foreach ($unassigned_members as $um): ?>
                  <option value="<?= $um['id'] ?>">
                    <?= htmlspecialchars($um['first_name'] . ' ' . $um['last_name']) ?>
                    <?php if ($um['phone_no']): ?> — <?= htmlspecialchars($um['phone_no']) ?><?php endif; ?>
                  </option>
                <?php endforeach; ?>
              </select>
            <?php endif; ?>
          </div>
          
          <div class="mb-3">
            <label class="form-label fw-semibold small">Select Department/Ministry</label>
            <select name="department_id" id="assign_dept_select" class="form-select" required>
              <option value="">Select Department...</option>
              <?php foreach ($departments_list as $d): ?>
                <option value="<?= $d['id'] ?>" <?= $selected_dept_id == $d['id'] ? 'selected' : '' ?>><?= htmlspecialchars($d['name']) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          
          <div class="mb-3" id="assign_sub_dept_wrapper">
            <label class="form-label fw-semibold small">Select Sub-Ministry (Optional)</label>
            <select name="sub_ministerial" id="assign_sub_select" class="form-select">
              <option value="">No Sub-Ministry</option>
              <!-- Populated dynamically via JS/AJAX -->
            </select>
          </div>
        </div>
        <div class="modal-footer border-top-0 pt-0">
          <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal" style="border-radius:8px;">Close</button>
          <button type="submit" class="btn btn-primary" id="saveAssignmentBtn" style="border-radius:8px; background:var(--c-accent); border:none;" <?= empty($unassigned_members) ? 'disabled' : '' ?>>Assign Members</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Inline Re-Assign and Remove Modals for List -->
<?php if (!empty($members)): ?>
  <?php foreach ($members as $m): 
    $mid = $m['id'];
    $mname = htmlspecialchars($m['first_name'] . ' ' . $m['last_name']);
  ?>
    <!-- Re-Assign Modal -->
    <div class="modal fade" id="reassignModal-<?= $mid ?>" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content border-0" style="border-radius:12px;">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold" style="font-size: 1.05rem;">Re-Assign Ministry</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form action="manage/assign_member_ministry.php" method="post" class="reassign-form">
            <input type="hidden" name="action" value="reassign">
            <input type="hidden" name="member_id" value="<?= $mid ?>">
            <div class="modal-body py-3">
              <div class="mb-3">
                <label class="form-label fw-semibold small">Member</label>
                <input type="text" class="form-control" value="<?= $mname ?>" readonly style="background:#faf7ff;">
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold small">Department/Ministry</label>
                <select name="department_id" class="form-select reassign-dept-select" required data-member-id="<?= $mid ?>" data-current-sub-id="<?= $m['sub_ministerial'] ?: '' ?>">
                  <option value="">Select Department...</option>
                  <?php foreach ($departments_list as $d): ?>
                    <option value="<?= $d['id'] ?>" <?= $m['department_id'] == $d['id'] ? 'selected' : '' ?>><?= htmlspecialchars($d['name']) ?></option>
                  <?php endforeach; ?>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold small">Sub-Ministry (Optional)</label>
                <select name="sub_ministerial" class="form-select reassign-sub-select">
                  <option value="">No Sub-Ministry</option>
                  <!-- Populated dynamically via JS/AJAX -->
                </select>
              </div>
            </div>
            <div class="modal-footer border-top-0 pt-0">
              <button type="button" class="btn btn-label-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary btn-sm btn-save-reassign" style="background:var(--c-accent); border:none;">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Remove Modal -->
    <div class="modal fade" id="removeModal-<?= $mid ?>" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content border-0" style="border-radius:12px;">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold text-danger" style="font-size: 1.05rem;">Remove From Ministry</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form action="manage/assign_member_ministry.php" method="post" class="remove-form">
            <input type="hidden" name="action" value="remove">
            <input type="hidden" name="member_id" value="<?= $mid ?>">
            <div class="modal-body py-3">
              <p style="font-size: .88rem; margin-bottom: 0;">Are you sure you want to remove <strong><?= $mname ?></strong> from all ministries?</p>
            </div>
            <div class="modal-footer border-top-0 pt-0">
              <button type="button" class="btn btn-label-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-danger btn-sm btn-confirm-remove">Yes, Remove</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
<?php endif; ?>

<!-- Edit Department Modals (Root Level) -->
<?php foreach ($departments_list as $dept): 
  $dept_id = $dept['id'];
?>
  <div class="modal fade" id="editDeptModal-<?= $dept_id ?>" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content border-0" style="border-radius:12px;">
        <div class="modal-header border-bottom-0 pb-0">
          <h5 class="modal-title fw-bold" style="font-size: 1.05rem;">Edit Ministry</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form action="manage/update_department.php" method="post" class="edit-dept-form">
          <input type="hidden" name="id" value="<?= $dept_id ?>">
          <div class="modal-body py-3">
            <div class="mb-3">
              <label class="form-label fw-semibold small">Ministry Name</label>
              <input type="text" name="name" class="form-control" value="<?= htmlspecialchars($dept['name']) ?>" required>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold small">Description</label>
              <textarea name="description" class="form-control" rows="3"><?= htmlspecialchars($dept['description'] ?? '') ?></textarea>
            </div>
          </div>
          <div class="modal-footer border-top-0 pt-0">
            <button type="button" class="btn btn-label-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm btn-save-dept" style="background:var(--c-accent); border:none;">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
<?php endforeach; ?>

<!-- Edit Sub-Department Modals (Root Level) -->
<?php foreach ($sub_departments_list as $sub_dept): 
  $sub_dept_id = $sub_dept['id'];
  $parent_dept_id = $sub_dept['dept_id'];
?>
  <div class="modal fade" id="editSubDeptModal-<?= $sub_dept_id ?>" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content border-0" style="border-radius:12px;">
        <div class="modal-header border-bottom-0 pb-0">
          <h5 class="modal-title fw-bold" style="font-size: 1.05rem;">Edit Sub-Ministry</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form action="manage/update_sub_department.php" method="post" class="edit-sub-dept-form">
          <input type="hidden" name="id" value="<?= $sub_dept_id ?>">
          <div class="modal-body py-3">
            <div class="mb-3">
              <label class="form-label fw-semibold small">Sub-Ministry Name</label>
              <input type="text" name="name" class="form-control" value="<?= htmlspecialchars($sub_dept['name']) ?>" required>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold small">Parent Department</label>
              <select name="department" class="form-select" required>
                <?php foreach ($departments_list as $d): ?>
                  <option value="<?= $d['id'] ?>" <?= $d['id'] == $parent_dept_id ? 'selected' : '' ?>><?= htmlspecialchars($d['name']) ?></option>
                <?php endforeach; ?>
              </select>
            </div>
          </div>
          <div class="modal-footer border-top-0 pt-0">
            <button type="button" class="btn btn-label-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm btn-save-sub-dept" style="background:var(--c-accent); border:none;">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
<?php endforeach; ?>

<?php include('includes/scripts.html'); ?>

<script>
  // Helper Toast notification function using Bootstrap Toast
  function showToast(message, type = 'info') {
    const icon = type === 'success' ? 'bx-check-circle' : 
                 type === 'error' ? 'bx-error-circle' : 
                 type === 'warning' ? 'bx-error-alt' : 'bx-info-circle';
    const bgClass = type === 'success' ? 'bg-success text-white' : 
                    type === 'error' ? 'bg-danger text-white' : 
                    type === 'warning' ? 'bg-warning text-dark' : 'bg-info text-white';

    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }

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
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
    });
  }

  // Helper function to query sub-departments via AJAX and populate select element
  function populateSubDepartments(deptId, targetSelect, selectedSubId = null) {
    targetSelect.html('<option value="">Loading sub-ministries...</option>');
    if (!deptId) {
      targetSelect.html('<option value="">No Sub-Ministry</option>');
      return;
    }
    
    $.getJSON('manage/get_sub_departments.php', { department_id: deptId }, function(data) {
      let options = '<option value="">No Sub-Ministry</option>';
      $.each(data, function(i, item) {
        const isSelected = selectedSubId && selectedSubId == item.id ? 'selected' : '';
        options += `<option value="${item.id}" ${isSelected}>${item.name}</option>`;
      });
      targetSelect.html(options);
    }).fail(function() {
      targetSelect.html('<option value="">Error loading sub-ministries</option>');
    });
  }

  // ── TomSelect Initialization ──────────────────────────────────────────────
  <?php if (!empty($unassigned_members)): ?>
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

  // ── DataTables Initialization ─────────────────────────────────────────────
  <?php if (!empty($members)): ?>
  $(document).ready(function() {
    $('#membersDirectoryTable').DataTable({
      paging      : true,
      searching   : true,
      ordering    : true,
      info        : true,
      lengthChange: true,
      pageLength  : 15,
      columnDefs  : [{ orderable: false, targets: [5] }],
      language    : { searchPlaceholder: 'Search members…', search: '' }
    });
  });
  <?php endif; ?>

  // ── AJAX Dropdown Population Listeners ────────────────────────────────────
  $(document).ready(function() {
    // Populate sub-departments on main assign modal open
    $('#assignMinistryModal').on('show.bs.modal', function () {
      const deptId = $('#assign_dept_select').val();
      populateSubDepartments(deptId, $('#assign_sub_select'));
    });

    // Populate sub-departments on main assign department select change
    $('#assign_dept_select').on('change', function () {
      const deptId = $(this).val();
      populateSubDepartments(deptId, $('#assign_sub_select'));
    });

    // Populate sub-departments on inline reassign modal open
    $(document).on('show.bs.modal', '[id^="reassignModal-"]', function () {
      const modal = $(this);
      const deptSelect = modal.find('.reassign-dept-select');
      const subSelect = modal.find('.reassign-sub-select');
      const deptId = deptSelect.val();
      const currentSubId = deptSelect.attr('data-current-sub-id');
      
      populateSubDepartments(deptId, subSelect, currentSubId);
    });

    // Populate sub-departments on inline reassign department select change
    $(document).on('change', '.reassign-dept-select', function() {
      const deptSelect = $(this);
      const subSelect = deptSelect.closest('form').find('.reassign-sub-select');
      const deptId = deptSelect.val();
      populateSubDepartments(deptId, subSelect);
    });
  });

  // ── AJAX Submissions ──────────────────────────────────────────────────────
  $(document).ready(function() {
    // 1. Assign Ministry Form Submission
    $('#assignMinistryForm').on('submit', function(e) {
      e.preventDefault();
      const form = $(this);
      const btn = $('#saveAssignmentBtn');
      const originalText = btn.html();
      
      btn.html('<i class="bx bx-loader-alt bx-spin me-1"></i> Saving...').prop('disabled', true);
      
      $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: form.serialize() + '&ajax=1',
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            showToast(response.message, 'success');
            setTimeout(() => { location.reload(); }, 1200);
          } else {
            showToast(response.message, 'error');
            btn.html(originalText).prop('disabled', false);
          }
        },
        error: function() {
          showToast('Failed to assign members. Please try again.', 'error');
          btn.html(originalText).prop('disabled', false);
        }
      });
    });

    // 2. Re-assign Form Submission
    $(document).on('submit', '.reassign-form', function(e) {
      e.preventDefault();
      const form = $(this);
      const btn = form.find('.btn-save-reassign');
      const originalText = btn.html();
      
      btn.html('<i class="bx bx-loader-alt bx-spin me-1"></i> Saving...').prop('disabled', true);
      
      $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: form.serialize() + '&ajax=1',
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            showToast(response.message, 'success');
            setTimeout(() => { location.reload(); }, 1200);
          } else {
            showToast(response.message, 'error');
            btn.html(originalText).prop('disabled', false);
          }
        },
        error: function() {
          showToast('Failed to reassign member. Please try again.', 'error');
          btn.html(originalText).prop('disabled', false);
        }
      });
    });

    // 3. Remove Form Submission
    $(document).on('submit', '.remove-form', function(e) {
      e.preventDefault();
      const form = $(this);
      const btn = form.find('.btn-confirm-remove');
      const originalText = btn.html();
      
      btn.html('<i class="bx bx-loader-alt bx-spin me-1"></i> Removing...').prop('disabled', true);
      
      $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: form.serialize() + '&ajax=1',
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            showToast(response.message, 'success');
            setTimeout(() => { location.reload(); }, 1200);
          } else {
            showToast(response.message, 'error');
            btn.html(originalText).prop('disabled', false);
          }
        },
        error: function() {
          showToast('Failed to remove member. Please try again.', 'error');
          btn.html(originalText).prop('disabled', false);
        }
      });
    });

    // 4. Edit Department Form Submission
    $(document).on('submit', '.edit-dept-form', function(e) {
      e.preventDefault();
      const form = $(this);
      const btn = form.find('.btn-save-dept');
      const originalText = btn.html();
      
      btn.html('<i class="bx bx-loader-alt bx-spin me-1"></i> Saving...').prop('disabled', true);
      
      $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: form.serialize() + '&ajax=1',
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            showToast(response.message, 'success');
            setTimeout(() => { location.reload(); }, 1200);
          } else {
            showToast(response.message, 'error');
            btn.html(originalText).prop('disabled', false);
          }
        },
        error: function() {
          showToast('Failed to update department. Please try again.', 'error');
          btn.html(originalText).prop('disabled', false);
        }
      });
    });

    // 5. Edit Sub-department Form Submission
    $(document).on('submit', '.edit-sub-dept-form', function(e) {
      e.preventDefault();
      const form = $(this);
      const btn = form.find('.btn-save-sub-dept');
      const originalText = btn.html();
      
      btn.html('<i class="bx bx-loader-alt bx-spin me-1"></i> Saving...').prop('disabled', true);
      
      $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: form.serialize() + '&ajax=1',
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            showToast(response.message, 'success');
            setTimeout(() => { location.reload(); }, 1200);
          } else {
            showToast(response.message, 'error');
            btn.html(originalText).prop('disabled', false);
          }
        },
        error: function() {
          showToast('Failed to update sub-ministry. Please try again.', 'error');
          btn.html(originalText).prop('disabled', false);
        }
      });
    });
  });
</script>
</body>
</html>
