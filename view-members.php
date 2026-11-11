<?php 
include('includes/checklogin.php');

$title = "Members Management | Members List";
include("includes/get_user.php");

// Get committed members count
try {
    $stmt = $db->query("SELECT COUNT(*) as total FROM committed_members");
    $committedCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
} catch (PDOException $e) {
    $committedCount = 0;
}

// Get regular members count
try {
    $stmt = $db->query("SELECT COUNT(*) as total FROM member");
    $regularCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
} catch (PDOException $e) {
    $regularCount = 0;
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
      --c-cyan    : #0ec2e6;
      --c-success : #28a745;
      --c-warning : #ffc107;
      --c-danger  : #dc3545;
    }

    /* ── Hero Banner ───────────────── */
    .page-hero {
      background: linear-gradient(135deg, var(--c-primary) 0%, #2d0a5e 55%, var(--c-accent) 100%);
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
      transition: transform .22s;
    }
    .stat-card:hover { transform: translateY(-3px); }
    .stat-num { font-size: 1.8rem; font-weight: 800; color: var(--c-primary); line-height: 1.1; }
    .stat-lbl { font-size: .8rem; color: #8a7baa; text-transform: uppercase; letter-spacing: .05em; font-weight: 600; }
    .stat-badge { font-size: .72rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-top: 4px; display: inline-block; }
    .stat-avatar {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; flex-shrink: 0;
    }

    /* ── Action Toolbar ────────────── */
    .toolbar-card {
      border-radius: 14px; border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.06);
      background: #fff; margin-bottom: 24px;
    }
    .toolbar-btn {
      font-weight: 600; font-size: .85rem; border-radius: 10px;
      padding: 10px 18px; display: inline-flex; align-items: center; gap: 6px;
      transition: all .2s;
    }

    /* ── Tab Layout ────────────────── */
    .nav-tabs-custom {
      border-bottom: 2px solid #ede5fc;
      margin-bottom: 20px; display: flex; gap: 15px;
    }
    .nav-link-custom {
      border: none; background: none; padding: 12px 20px;
      font-weight: 700; font-size: .95rem; color: #8a7baa;
      position: relative; transition: all .2s;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .nav-link-custom:hover { color: var(--c-accent); }
    .nav-link-custom.active { color: var(--c-accent); }
    .nav-link-custom.active::after {
      content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
      height: 3px; background: var(--c-accent); border-radius: 3px 3px 0 0;
    }

    /* ── Table Card ────────────────── */
    .table-card {
      border-radius: 16px; border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,.06);
      overflow: hidden; background: #fff;
    }
    .table-card .card-header {
      background: #fff; border-bottom: 1px solid #f0eaf8;
      padding: 20px 24px;
    }

    /* ── Member Avatar ─────────────── */
    .m-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: .88rem; font-weight: 700; color: #fff; flex-shrink: 0;
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
      <?php 
        @include('includes/nav.php');
        @include('modals/members-m.php');
      ?>

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">
          
          <!-- ── Page Hero ── -->
          <div class="page-hero fade-up">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h4><i class="bx bx-group me-2"></i>Members Directory</h4>
                <p>Manage church members, track committed members, and link guest registrations.</p>
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
                  <div class="stat-num mt-1"><?= $regularCount ?></div>
                  <span class="stat-badge" style="background:#e8f0fe; color:#1a73e8;">Registered</span>
                </div>
                <div class="stat-avatar" style="background:#e8f0fe; color:#1a73e8;">
                  <i class="bx bx-group"></i>
                </div>
              </div>
            </div>
            <!-- Stat 2: Committed Members -->
            <div class="col-sm-6 col-xl-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Committed</div>
                  <div class="stat-num mt-1"><?= $committedCount ?></div>
                  <span class="stat-badge" style="background:#fce8e6; color:#d93025;">Committed</span>
                </div>
                <div class="stat-avatar" style="background:#fce8e6; color:#d93025;">
                  <i class="bx bx-user-check"></i>
                </div>
              </div>
            </div>
            <!-- Stat 3: Linked Accounts -->
            <div class="col-sm-6 col-xl-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Linked Profiles</div>
                  <div class="stat-num mt-1">
                    <?php 
                    try {
                        $stmt = $db->query("SELECT COUNT(*) as linked FROM committed_members WHERE member_id IS NOT NULL");
                        echo $stmt->fetch(PDO::FETCH_ASSOC)['linked'];
                    } catch (PDOException $e) { echo "0"; }
                    ?>
                  </div>
                  <span class="stat-badge" style="background:#e6f4ea; color:#137333;">Linked Account</span>
                </div>
                <div class="stat-avatar" style="background:#e6f4ea; color:#137333;">
                  <i class="bx bx-link-alt"></i>
                </div>
              </div>
            </div>
            <!-- Stat 4: Unlinked Accounts -->
            <div class="col-sm-6 col-xl-3">
              <div class="stat-card">
                <div>
                  <div class="stat-lbl">Unlinked Profiles</div>
                  <div class="stat-num mt-1">
                    <?php 
                    try {
                        $stmt = $db->query("SELECT COUNT(*) as unlinked FROM committed_members WHERE member_id IS NULL");
                        echo $stmt->fetch(PDO::FETCH_ASSOC)['unlinked'];
                    } catch (PDOException $e) { echo "0"; }
                    ?>
                  </div>
                  <span class="stat-badge" style="background:#fef7e0; color:#b06000;">Unlinked guest</span>
                </div>
                <div class="stat-avatar" style="background:#fef7e0; color:#b06000;">
                  <i class="bx bx-user-voice"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Action Toolbar ── -->
          <div class="card toolbar-card fade-up">
            <div class="card-body p-3">
              <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-outline-primary toolbar-btn" data-bs-toggle="modal" data-bs-target="#newMember">
                  <i class="bx bx-user-plus"></i> New Member
                </button>
                <button type="button" class="btn btn-outline-success toolbar-btn" data-bs-toggle="modal" data-bs-target="#uploadMembers">
                  <i class="bx bx-spreadsheet"></i> Upload Excel
                </button>
                <button type="button" class="btn btn-outline-info toolbar-btn" data-bs-toggle="modal" data-bs-target="#newSubMinisterial">
                  <i class="bx bx-category-alt"></i> New Category
                </button>
                <a href="cells.php" class="btn btn-outline-secondary toolbar-btn">
                  <i class="bx bx-layer"></i> Cell Groups Directory
                </a>
                <a href="commited_members_form.php" class="btn btn-outline-primary toolbar-btn ms-sm-auto" target="_blank">
                  <i class="bx bx-user-pin"></i> Add Committed Guest
                </a>
              </div>
            </div>
          </div>
          
          <!-- ── Tab Navigation ── -->
          <div class="nav-tabs-custom fade-up" role="tablist">
            <button class="nav-link-custom active" id="tab-regular" data-bs-toggle="tab" data-bs-target="#navs-regular-members" role="tab">
              <i class="bx bx-group"></i> Regular Members (<?= $regularCount ?>)
            </button>
            <button class="nav-link-custom" id="tab-committed" data-bs-toggle="tab" data-bs-target="#navs-committed-members" role="tab">
              <i class="bx bx-user-check"></i> Committed Guests (<?= $committedCount ?>)
            </button>
          </div>

          <!-- ── Tab Contents ── -->
          <div class="tab-content p-0 fade-up">
            
            <!-- Tab 1: Regular Members -->
            <div class="tab-pane fade show active" id="navs-regular-members" role="tabpanel">
              <div class="card table-card">
                
                <!-- Month Filter Form -->
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Regular Members</h5>
                  <form method="GET" class="d-flex align-items-center gap-2">
                    <label for="filter_month" class="form-label mb-0 fw-semibold small text-muted text-nowrap">Filter by Month:</label>
                    <select name="filter_month" id="filter_month" class="form-select form-select-sm" onchange="this.form.submit()">
                      <option value="">All Time</option>
                      <?php
                        // Generate last 12 months for the filter dropdown
                        for ($i = 0; $i < 12; $i++) {
                            $monthVal = date('Y-m', strtotime("-$i months"));
                            $monthLabel = date('F Y', strtotime("-$i months"));
                            $selected = (isset($_GET['filter_month']) && $_GET['filter_month'] == $monthVal) ? 'selected' : '';
                            echo "<option value=\"$monthVal\" $selected>$monthLabel</option>";
                        }
                      ?>
                    </select>
                  </form>
                </div>

                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0" id="usersTable">
                    <thead style="background:#faf7ff;">
                      <tr>
                        <th style="padding:12px 18px;">#</th>
                        <th>Member</th>
                        <th>Invited By / Category</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th style="padding:12px 18px;">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <?php
                      try {
                          if (!empty($_GET['filter_month'])) {
                              $filterMonth = $_GET['filter_month'];
                              $stmt = $db->prepare("SELECT * FROM member WHERE DATE_FORMAT(joined_on, '%Y-%m') = :filter_month ORDER BY id DESC");
                              $stmt->bindParam(':filter_month', $filterMonth);
                              $stmt->execute();
                          } else {
                              $stmt = $db->query("SELECT * FROM member ORDER BY id DESC");
                          }
                          $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
                      } catch (PDOException $e) {
                          die("Database error: " . $e->getMessage());
                      }
                      $today = new DateTime();
                      
                      if (!empty($members)): 
                        foreach ($members as $index => $row):
                          $joinDate = new DateTime($row['joined_on']);
                          $interval = $today->diff($joinDate)->days;
                          $name = $row['first_name']." ".$row['last_name'];
                          $initial = strtoupper(substr($row['first_name'], 0, 1));
                          $acolor = '#' . substr(md5($row['id']), 0, 6);
                      ?>
                      <tr>
                        <td style="padding:12px 18px; color:#8a7baa; font-weight:600;"><?= $index + 1; ?></td>
                        <td>
                          <div class="d-flex align-items-center gap-2">
                            <div class="m-avatar" style="background:<?= $acolor ?>;"><?= $initial ?></div>
                            <div>
                              <div class="fw-semibold" style="font-size:.9rem; color:var(--c-primary);">
                                <?= htmlspecialchars($name); ?>
                                <?php if ($interval <= 2): ?>
                                  <span class="badge bg-warning text-dark ms-1" style="font-size:.7rem; padding:2px 6px;">New</span>
                                <?php endif; ?>
                              </div>
                              <small class="text-muted">ID: <?= $row['id'] ?></small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge bg-label-secondary" style="font-size:.75rem; padding:4px 8px;">
                            <?= htmlspecialchars($row['department'] ? $row['department'] : 'General'); ?>
                          </span>
                        </td>
                        <td class="small text-muted"><?= htmlspecialchars($row['email']); ?></td>
                        <td class="small text-muted">
                          <?php if ($row['phone_no']): ?>
                            <i class="bx bx-phone me-1"></i><?= htmlspecialchars($row['phone_no']); ?>
                          <?php else: ?>—<?php endif; ?>
                        </td>
                        <td style="padding:12px 18px;">
                          <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                              <i class="bx bx-dots-vertical-rounded" style="color:#8a7baa; font-size:1.15rem;"></i>
                            </button>
                            <div class="dropdown-menu">
                              <a class="dropdown-item" href="javascript:void(0);" onclick="viewMember(<?= $row['id'] ?>)">
                                <i class="bx bx-show me-1"></i> View Profile
                              </a>
                              <?php if (userHasPermission($db, $user_id, 'edit_member')): ?>
                                <a class="dropdown-item" href="javascript:void(0);" onclick="editMember(<?= $row['id'] ?>)">
                                  <i class="bx bx-edit-alt me-1"></i> Edit Info
                                </a>
                              <?php endif; ?>
                              <a class="dropdown-item" href="javascript:void(0);" 
                                 onclick="addCommitment(<?= $row['id'] ?>, '<?= addslashes(htmlspecialchars($name)) ?>', '<?= addslashes(htmlspecialchars($row['phone_no'])) ?>', '<?= addslashes(htmlspecialchars($row['email'])) ?>')">
                                <i class="bx bx-user-check me-1"></i> Add Commitment
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <?php endforeach; endif; ?>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <!-- Tab 2: Committed Guests -->
            <div class="tab-pane fade" id="navs-committed-members" role="tabpanel">
              <div class="card table-card">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0" id="committedTable">
                    <thead style="background:#faf7ff;">
                      <tr>
                        <th style="padding:12px 18px;">#</th>
                        <th>Guest Name</th>
                        <th>Contact info</th>
                        <th>Residence</th>
                        <th>Member Status</th>
                        <th>Committed On</th>
                        <th>Created</th>
                        <th style="padding:12px 18px;">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <?php
                      try {
                          $stmt = $db->query("
                              SELECT cm.*, m.first_name, m.last_name, m.email as member_email, m.phone_no as member_phone 
                              FROM committed_members cm 
                              LEFT JOIN member m ON cm.member_id = m.id 
                              ORDER BY cm.created_at DESC
                          ");
                          $committed = $stmt->fetchAll(PDO::FETCH_ASSOC);
                      } catch (PDOException $e) {
                          die("Database error: " . $e->getMessage());
                      }
                      
                      if (!empty($committed)): 
                        foreach ($committed as $index => $row):
                          $committed_id = $row['id'];
                          $initial = strtoupper(substr($row['full_name'], 0, 1));
                          $acolor = '#' . substr(md5($committed_id), 2, 6);
                          
                          $linked_member_name = $row['first_name'] ? $row['first_name'] . ' ' . $row['last_name'] : 'Not Linked';
                      ?>
                      <tr>
                        <td style="padding:12px 18px; color:#8a7baa; font-weight:600;"><?= $index + 1; ?></td>
                        <td>
                          <div class="d-flex align-items-center gap-2">
                            <div class="m-avatar" style="background:<?= $acolor ?>;"><?= $initial ?></div>
                            <div>
                              <div class="fw-semibold" style="font-size:.9rem; color:var(--c-primary);">
                                <?= htmlspecialchars($row['full_name']); ?>
                              </div>
                              <small class="text-muted"><?= htmlspecialchars($row['email'] ? $row['email'] : 'No Email'); ?></small>
                            </div>
                          </div>
                        </td>
                        <td class="small text-muted">
                          <?php if ($row['phone']): ?>
                            <i class="bx bx-phone me-1"></i><?= htmlspecialchars($row['phone']); ?>
                          <?php else: ?>—<?php endif; ?>
                        </td>
                        <td class="small text-muted"><?= htmlspecialchars($row['residence'] ? $row['residence'] : '—'); ?></td>
                        <td>
                          <?php if ($row['member_id']): ?>
                            <span class="badge bg-success" style="font-size:.7rem;">Linked (ID: <?= $row['member_id']; ?>)</span>
                            <br><small class="text-muted"><?= htmlspecialchars($linked_member_name); ?></small>
                          <?php else: ?>
                            <span class="badge bg-warning text-dark" style="font-size:.7rem;">Not Linked</span>
                          <?php endif; ?>
                        </td>
                        <td class="small text-muted">
                          <?= $row['committed_on'] ? date('M d, Y', strtotime($row['committed_on'])) : '—'; ?>
                        </td>
                        <td class="small text-muted"><?= date('M d, Y', strtotime($row['created_at'])); ?></td>
                        <td style="padding:12px 18px;">
                          <div class="dropdown">
                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                              <i class="bx bx-dots-vertical-rounded" style="color:#8a7baa; font-size:1.15rem;"></i>
                            </button>
                            <div class="dropdown-menu">
                              <a class="dropdown-item" href="javascript:void(0);" onclick="viewCommitted(<?= $committed_id; ?>)">
                                <i class="bx bx-show me-1"></i> View details
                              </a>
                              <a class="dropdown-item" href="javascript:void(0);" onclick="editCommitted(<?= $committed_id; ?>)">
                                <i class="bx bx-edit-alt me-1"></i> Edit details
                              </a>
                              <?php if (!$row['member_id']): ?>
                                <a class="dropdown-item" href="javascript:void(0);" onclick="linkToMember(<?= $committed_id; ?>)">
                                  <i class="bx bx-link me-1"></i> Link to Profile
                                </a>
                              <?php endif; ?>
                              <a class="dropdown-item text-danger" href="javascript:void(0);" onclick="deleteCommitted(<?= $committed_id; ?>)">
                                <i class="bx bx-trash me-1"></i> Delete Guest
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <?php endforeach; endif; ?>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div><!-- /tab-content -->

        </div><!-- /container -->

        <?php @include('includes/footer.php'); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
  <div class="drag-target"></div>
</div>

<!-- ── Modals ── -->

<!-- Add Commitment Modal -->
<div class="modal fade" id="addCommitmentModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-md">
    <div class="modal-content border-0" style="border-radius:14px; box-shadow:0 8px 30px rgba(0,0,0,0.15);">
      <div class="modal-header border-bottom-0 pb-0">
        <h5 class="modal-title fw-bold" id="addCommitmentModalTitle">Add Commitment for Member</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body py-4">
        <form id="addCommitmentForm">
          <input type="hidden" id="commitment_member_id" name="member_id">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label fw-semibold small">Member Name</label>
              <input type="text" class="form-control" id="commitment_member_name" readonly style="background:#faf7ff;">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold small">Phone Number</label>
              <input type="text" class="form-control" id="commitment_member_phone" readonly style="background:#faf7ff;">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold small">Email Address</label>
              <input type="email" class="form-control" id="commitment_member_email" readonly style="background:#faf7ff;">
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold small" for="commitment_residence">Residence</label>
              <input type="text" class="form-control" id="commitment_residence" name="residence" placeholder="Enter residence center...">
            </div>
            <div class="col-12">
              <label class="form-label fw-semibold small" for="commitment_date">Committed On Date</label>
              <input type="date" class="form-control" id="commitment_date" name="committed_on" value="<?= date('Y-m-d'); ?>">
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer border-top-0 pt-0">
        <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal" style="border-radius:8px;">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveCommitment()" style="border-radius:8px;background:var(--c-accent);border:none;">Save Commitment</button>
      </div>
    </div>
  </div>
</div>

<!-- View Committed Member Modal -->
<div class="modal fade" id="viewCommittedModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-md">
    <div class="modal-content border-0" style="border-radius:14px; box-shadow:0 8px 30px rgba(0,0,0,0.15);">
      <div class="modal-header border-bottom-0 pb-0">
        <h5 class="modal-title fw-bold" id="viewCommittedModalTitle">Committed Member Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body py-4">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label text-muted small fw-semibold text-uppercase">Full Name</label>
            <p id="view_full_name" class="fw-bold fs-5 text-primary mb-0"></p>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small fw-semibold text-uppercase">Phone Number</label>
            <p id="view_phone" class="fw-semibold mb-0"></p>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small fw-semibold text-uppercase">Email Address</label>
            <p id="view_email" class="fw-semibold mb-0"></p>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small fw-semibold text-uppercase">Residence</label>
            <p id="view_residence" class="fw-semibold mb-0"></p>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small fw-semibold text-uppercase">Committed On</label>
            <p id="view_committed_on" class="fw-semibold mb-0"></p>
          </div>
          <div class="col-12">
            <label class="form-label text-muted small fw-semibold text-uppercase">Linked Profile Status</label>
            <div id="view_member_id"></div>
          </div>
        </div>
      </div>
      <div class="modal-footer border-top-0 pt-0">
        <button type="button" class="btn btn-label-secondary w-100" data-bs-dismiss="modal" style="border-radius:8px;">Close</button>
      </div>
    </div>
  </div>
</div>

<!-- Link to Member Modal -->
<div class="modal fade" id="linkToMemberModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-md">
    <div class="modal-content border-0" style="border-radius:14px; box-shadow:0 8px 30px rgba(0,0,0,0.15);">
      <div class="modal-header border-bottom-0 pb-0">
        <h5 class="modal-title fw-bold">Link Guest to Member Profile</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body py-4">
        <input type="hidden" id="link_committed_id">
        <div class="mb-3">
          <label class="form-label fw-semibold small">Search Member Profile</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bx bx-search"></i></span>
            <input type="text" class="form-control" id="member_search" placeholder="Search by phone, email, or name...">
          </div>
          <div class="mt-3" id="search_results" style="max-height: 200px; overflow-y: auto;"></div>
        </div>
        <div class="mt-3" id="selected_member_info" style="display: none;">
          <label class="form-label fw-semibold small">Selected Target Profile</label>
          <div class="card bg-label-primary border-0 p-3">
            <p class="mb-1"><strong>Name:</strong> <span id="selected_member_name"></span></p>
            <p class="mb-1"><strong>Phone:</strong> <span id="selected_member_phone"></span></p>
            <p class="mb-0"><strong>Email:</strong> <span id="selected_member_email"></span></p>
          </div>
        </div>
      </div>
      <div class="modal-footer border-top-0 pt-0">
        <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal" style="border-radius:8px;">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="confirmLinkMember()" style="border-radius:8px;background:var(--c-accent);border:none;">Link Member Profile</button>
      </div>
    </div>
  </div>
</div>

<!-- Member Profile Offcanvas -->
<div class="offcanvas offcanvas-end border-0" tabindex="-1" id="viewMemberOffcanvas" aria-labelledby="viewMemberOffcanvasLabel" style="width: 400px; box-shadow: -8px 0 30px rgba(26,5,51,0.08);">
  <div class="offcanvas-header bg-transparent border-bottom-0 pb-0">
    <h5 id="viewMemberOffcanvasLabel" class="offcanvas-title fw-bold text-primary">Member Profile</h5>
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body pt-3">
    <div id="offcanvas-loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2 small">Loading profile details...</p>
    </div>
    
    <div id="offcanvas-content" style="display: none;">
      <!-- Profile Header -->
      <div class="text-center mb-4 pb-2 border-bottom">
        <div id="offcanvas-avatar-container" class="mb-3 d-flex justify-content-center">
          <!-- Dynamically populated avatar image or initials -->
        </div>
        <h4 id="offcanvas-name" class="fw-bold text-primary mb-1"></h4>
        <div class="d-flex justify-content-center gap-2 mb-2">
          <span id="offcanvas-dept" class="badge bg-label-secondary small" style="font-size: 0.75rem; padding: 4px 8px;"></span>
          <span id="offcanvas-joined" class="badge bg-label-info small" style="font-size: 0.75rem; padding: 4px 8px;"></span>
        </div>
      </div>

      <!-- Quick Metrics Cards -->
      <div class="row g-3 mb-4">
        <!-- Card 1: Attendance Rate -->
        <div class="col-6">
          <div class="card bg-label-success border-0 p-3 h-100 text-center">
            <h3 id="offcanvas-rate" class="fw-bold text-success mb-1"></h3>
            <small class="text-muted fw-semibold uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Attendance Rate</small>
            <div id="offcanvas-rate-status" class="small mt-1"></div>
          </div>
        </div>
        <!-- Card 2: Cell Group -->
        <div class="col-6">
          <div class="card bg-label-primary border-0 p-3 h-100 text-center">
            <h4 id="offcanvas-cell-code" class="fw-bold text-primary mb-1 text-truncate" style="font-size: 1.1rem;"></h4>
            <small class="text-muted fw-semibold uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Cell Group</small>
            <div id="offcanvas-cell-name" class="small mt-1 text-truncate text-secondary"></div>
          </div>
        </div>
      </div>

      <!-- Profile Information -->
      <div class="mb-4">
        <h6 class="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3" style="font-size: 0.8rem; letter-spacing: 0.05em;">Personal Information</h6>
        <div class="row g-3">
          <div class="col-12">
            <small class="text-muted d-block small">Email Address</small>
            <span id="offcanvas-email" class="fw-semibold"></span>
          </div>
          <div class="col-12">
            <small class="text-muted d-block small">Phone Number</small>
            <span id="offcanvas-phone" class="fw-semibold"></span>
          </div>
          <div class="col-12">
            <small class="text-muted d-block small">Residence Center</small>
            <span id="offcanvas-residence" class="fw-semibold"></span>
          </div>
          <div class="col-6">
            <small class="text-muted d-block small">Gender</small>
            <span id="offcanvas-gender" class="fw-semibold"></span>
          </div>
          <div class="col-6">
            <small class="text-muted d-block small">Marital Status</small>
            <span id="offcanvas-marital" class="fw-semibold"></span>
          </div>
          <div class="col-12">
            <small class="text-muted d-block small">Employment Status</small>
            <span id="offcanvas-emp" class="fw-semibold"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="offcanvas-footer p-3 border-top bg-light">
    <div class="d-flex gap-2">
      <button type="button" class="btn btn-label-secondary w-100" data-bs-dismiss="offcanvas">Close</button>
      <a id="offcanvas-edit-btn" href="javascript:void(0);" class="btn btn-primary w-100" style="background:var(--c-accent);border:none;">Edit Profile</a>
    </div>
  </div>
</div>

<?php include('includes/scripts.html');?>
<script>
  // Bootstrap Toast Helper
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

  $(document).ready(function() {
    // Initialize regular members table
    $('#usersTable').DataTable({
      "paging": true,
      "searching": true,
      "ordering": true,
      "info": true,
      "lengthChange": true,
      "pageLength": 20,
      "lengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]],
      dom: 'Blfrtip',
      buttons: [
        { extend: 'copy', className: 'btn btn-outline-primary btn-sm me-1 mb-2' },
        { extend: 'csv', className: 'btn btn-outline-success btn-sm me-1 mb-2' },
        { extend: 'excel', className: 'btn btn-outline-success btn-sm me-1 mb-2' },
        { extend: 'pdf', className: 'btn btn-outline-danger btn-sm me-1 mb-2' },
        { extend: 'print', className: 'btn btn-outline-info btn-sm mb-2', text: '<i class="bx bx-printer"></i> Print' }
      ]
    });
    
    // Initialize committed members table
    $('#committedTable').DataTable({
      "paging": true,
      "searching": true,
      "ordering": true,
      "info": true,
      "lengthChange": true,
      "pageLength": 20,
      "lengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]],
      dom: 'Blfrtip',
      buttons: [
        { extend: 'copy', className: 'btn btn-outline-primary btn-sm me-1 mb-2' },
        { extend: 'csv', className: 'btn btn-outline-success btn-sm me-1 mb-2' },
        { extend: 'excel', className: 'btn btn-outline-success btn-sm me-1 mb-2' },
        { extend: 'pdf', className: 'btn btn-outline-danger btn-sm me-1 mb-2' },
        { extend: 'print', className: 'btn btn-outline-info btn-sm mb-2', text: '<i class="bx bx-printer"></i> Print' }
      ]
    });
  });

  // Add commitment for a member
  function addCommitment(memberId, memberName, memberPhone, memberEmail) {
    $('#commitment_member_id').val(memberId);
    $('#commitment_member_name').val(memberName);
    $('#commitment_member_phone').val(memberPhone || '');
    $('#commitment_member_email').val(memberEmail || '');
    $('#addCommitmentModalTitle').text('Add Commitment for ' + memberName);
    $('#addCommitmentModal').modal('show');
  }

  // Save commitment
  function saveCommitment() {
    const formData = new FormData();
    formData.append('member_id', $('#commitment_member_id').val());
    formData.append('full_name', $('#commitment_member_name').val());
    formData.append('phone', $('#commitment_member_phone').val());
    formData.append('email', $('#commitment_member_email').val());
    formData.append('residence', $('#commitment_residence').val());
    formData.append('committed_on', $('#commitment_date').val());
    formData.append('action', 'save_commitment');
    
    $.ajax({
      url: 'manage/commitment-handler.php',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        if (response.success) {
          showToast(response.message, 'success');
          $('#addCommitmentModal').modal('hide');
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(response.message, 'error');
        }
      },
      error: function(xhr, status, error) {
        showToast('Error saving commitment: ' + error, 'error');
      }
    });
  }

  // View committed member details
  function viewCommitted(committedId) {
    $.ajax({
      url: 'manage/get-committed.php',
      type: 'GET',
      data: { id: committedId },
      dataType: 'json',
      success: function(data) {
        if (data.success) {
          $('#view_full_name').text(data.data.full_name);
          $('#view_phone').text(data.data.phone || 'Not provided');
          $('#view_email').text(data.data.email || 'Not provided');
          $('#view_residence').text(data.data.residence || 'Not provided');
          $('#view_committed_on').text(data.data.committed_on ? formatDate(data.data.committed_on) : 'Not set');
          $('#view_member_id').html(data.data.member_id ? 
            '<span class="badge bg-success">Linked (ID: ' + data.data.member_id + ')</span>' + 
            (data.data.linked_member_name ? '<br><small class="text-muted">' + data.data.linked_member_name + '</small>' : '') :
            '<span class="badge bg-warning text-dark">Not Linked</span>');
          $('#viewCommittedModal').modal('show');
        } else {
          showToast(data.message, 'error');
        }
      },
      error: function() {
        showToast('Error loading committed member details', 'error');
      }
    });
  }

  // Link to existing member
  function linkToMember(committedId) {
    $('#link_committed_id').val(committedId);
    $('#member_search').val('');
    $('#search_results').html('');
    $('#selected_member_info').hide();
    $('#linkToMemberModal').modal('show');
  }

  // Live search members
  $('#member_search').on('input', function() {
    const searchTerm = $(this).val().trim();
    if (searchTerm.length < 3) {
      $('#search_results').html('');
      return;
    }
    $.ajax({
      url: 'manage/search-members.php',
      type: 'GET',
      data: { q: searchTerm },
      success: function(data) {
        $('#search_results').html(data);
      }
    });
  });

  // Select a member for linking
  function selectMemberForLink(memberId, memberName, memberPhone, memberEmail) {
    $('#selected_member_name').text(memberName);
    $('#selected_member_phone').text(memberPhone || 'N/A');
    $('#selected_member_email').text(memberEmail || 'N/A');
    $('#selected_member_info').show();
    $('#search_results').html('<div class="alert alert-success py-2 mb-0 mt-2">Target profile selected successfully.</div>');
  }

  // Confirm linking
  function confirmLinkMember() {
    const committedId = $('#link_committed_id').val();
    const selectedName = $('#selected_member_name').text();
    
    if (!selectedName) {
      showToast('Please select a member first', 'warning');
      return;
    }
    
    $.ajax({
      url: 'manage/link-committed.php',
      type: 'POST',
      data: { 
        committed_id: committedId,
        member_name: selectedName
      },
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          showToast(response.message, 'success');
          $('#linkToMemberModal').modal('hide');
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(response.message, 'error');
        }
      },
      error: function() {
        showToast('Error linking members', 'error');
      }
    });
  }

  // Delete committed guest
  function deleteCommitted(committedId) {
    if (confirm('Are you sure you want to delete this committed guest?')) {
      $.ajax({
        url: 'manage/delete-committed.php',
        type: 'POST',
        data: { id: committedId },
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            showToast(response.message, 'success');
            setTimeout(() => location.reload(), 1000);
          } else {
            showToast(response.message, 'error');
          }
        },
        error: function() {
          showToast('Error deleting committed guest', 'error');
        }
      });
    }
  }

  // Helper date format
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // View member profile in offcanvas
  function viewMember(memberId) {
    const offcanvasEl = document.getElementById('viewMemberOffcanvas');
    const offcanvas = new bootstrap.Offcanvas(offcanvasEl);
    offcanvas.show();

    // Reset layout to loading state
    $('#offcanvas-loading').show();
    $('#offcanvas-content').hide();

    $.ajax({
      url: 'manage/get-member-details.php',
      type: 'GET',
      data: { id: memberId },
      dataType: 'json',
      success: function(response) {
        if (response.success) {
          const data = response.data;
          
          // Populate fields
          $('#offcanvas-name').text(data.name);
          $('#offcanvas-dept').text(data.department);
          $('#offcanvas-joined').text('Joined ' + data.joined_on);
          
          // Contact Details
          $('#offcanvas-email').text(data.email || 'Not provided');
          $('#offcanvas-phone').text(data.phone_no || 'Not provided');
          $('#offcanvas-residence').text(data.location || 'Not provided');
          
          // Personal Details
          $('#offcanvas-gender').text(data.gender);
          $('#offcanvas-marital').text(data.marital);
          $('#offcanvas-emp').text(data.emp_status);
          
          // Attendance Rate card
          $('#offcanvas-rate').text(data.attendance_rate + '%');
          let rateStatusClass = 'text-success';
          let rateStatusLabel = 'Regular';
          if (data.attendance_rate < 50) {
            rateStatusClass = 'text-danger';
            rateStatusLabel = 'Needs Follow-up';
          } else if (data.attendance_rate < 80) {
            rateStatusClass = 'text-warning';
            rateStatusLabel = 'Irregular';
          }
          $('#offcanvas-rate-status').html('<span class="fw-bold ' + rateStatusClass + '">' + rateStatusLabel + '</span> <small class="text-muted">(' + data.attended_count + '/' + data.total_meetings + ')</small>');
          
          // Cell Group card
          $('#offcanvas-cell-code').text(data.cell_code || 'N/A');
          $('#offcanvas-cell-name').text(data.cell_name);
          
          // Avatar Image/Initials rendering
          let avatarHtml = '';
          if (data.photo && data.photo.trim() !== '') {
            avatarHtml = '<img src="uploads/' + data.photo + '" alt="Avatar" class="rounded-circle" style="width: 80px; height: 80px; object-fit: cover; border: 3px solid #ede5fc;">';
          } else {
            const initial = data.first_name ? data.first_name.charAt(0).toUpperCase() : '?';
            const colors = ['#6f42c1', '#0ec2e6', '#28a745', '#ffc107', '#dc3545', '#1a0533'];
            const colorIdx = memberId % colors.length;
            const acolor = colors[colorIdx];
            avatarHtml = '<div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-2" style="width: 80px; height: 80px; background-color: ' + acolor + '; border: 3px solid #ede5fc;">' + initial + '</div>';
          }
          $('#offcanvas-avatar-container').html(avatarHtml);
          
          // Edit Button link
          $('#offcanvas-edit-btn').attr('onclick', 'editMember(' + data.id + ')');

          // Switch views
          $('#offcanvas-loading').hide();
          $('#offcanvas-content').show();
        } else {
          showToast(response.message, 'error');
          offcanvas.hide();
        }
      },
      error: function() {
        showToast('Error loading profile details.', 'error');
        offcanvas.hide();
      }
    });
  }
</script>
</body>
</html>