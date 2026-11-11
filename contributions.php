<?php
require_once('includes/checklogin.php');
$title = "Jesus Enthroned Network — Pledge Management";
include("includes/get_user.php");
?>
<!doctype html>
<html lang="en" class="layout-navbar-fixed layout-menu-fixed layout-compact" dir="ltr"
      data-skin="default" data-theme="light" data-assets-path="assets/" data-template="vertical-menu-template">
<?php @include('includes/header.php'); ?>

<style>
  /* ── Glass card base ─────────────────────────────────────── */
  .glass-card {
    background: rgba(255,255,255,0.5) !important;
    backdrop-filter: blur(14px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(14px) saturate(180%) !important;
    border: 1px solid rgba(255,255,255,0.6) !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 32px rgba(31,38,135,0.05) !important;
    transition: all 0.3s cubic-bezier(0.25,0.8,0.25,1) !important;
  }
  .glass-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 36px rgba(105,108,255,0.1) !important;
    background: rgba(255,255,255,0.7) !important;
  }

  /* ── KPI cards ───────────────────────────────────────────── */
  .kpi-card { border-radius: 16px !important; overflow: hidden; position: relative; }
  .kpi-card::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 4px; height: 100%; transition: width .3s ease;
  }
  .kpi-card:hover::before { width: 6px; }
  .kpi-card-primary::before  { background: linear-gradient(to bottom, #696cff, #8592fc); }
  .kpi-card-success::before  { background: linear-gradient(to bottom, #71dd37, #93e461); }
  .kpi-card-danger::before   { background: linear-gradient(to bottom, #ff3e1d, #ff6c57); }
  .kpi-card-warning::before  { background: linear-gradient(to bottom, #ffab00, #ffc140); }

  .icon-box {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    transition: all .3s ease;
  }
  .kpi-card:hover .icon-box { transform: scale(1.1) rotate(5deg); }
  .icon-box-primary { background: linear-gradient(135deg, rgba(105,108,255,.1), rgba(105,108,255,.22)); color:#696cff; }
  .icon-box-success { background: linear-gradient(135deg, rgba(113,221,55,.1),  rgba(113,221,55,.22));  color:#71dd37; }
  .icon-box-danger  { background: linear-gradient(135deg, rgba(255,62,29,.1),   rgba(255,62,29,.22));   color:#ff3e1d; }
  .icon-box-warning { background: linear-gradient(135deg, rgba(255,171,0,.1),   rgba(255,171,0,.22));   color:#ffab00; }

  /* ── Page header ─────────────────────────────────────────── */
  .page-hero {
    background: linear-gradient(135deg, rgba(105,108,255,0.08) 0%, rgba(113,221,55,0.05) 100%);
    border: 1px solid rgba(105,108,255,0.12);
    border-radius: 20px;
    padding: 28px 32px;
    position: relative;
    overflow: hidden;
    margin-bottom: 24px;
  }
  .page-hero::before {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(105,108,255,0.12) 0%, transparent 70%);
    border-radius: 50%;
  }
  .page-hero::after {
    content: '';
    position: absolute; bottom: -40px; left: 40%;
    width: 120px; height: 120px;
    background: radial-gradient(circle, rgba(113,221,55,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }

  /* ── Filter bar ──────────────────────────────────────────── */
  .filter-card {
    background: rgba(255,255,255,0.6);
    border: 1px solid rgba(105,108,255,0.1);
    border-radius: 14px;
    padding: 18px 22px;
    margin-bottom: 20px;
    backdrop-filter: blur(8px);
  }

  /* ── Table card ──────────────────────────────────────────── */
  .custom-table-card {
    border-radius: 16px !important;
    border: 1px solid rgba(105,108,255,0.08) !important;
    overflow: hidden;
  }
  .custom-table-card .card-header {
    background: rgba(105,108,255,0.04);
    border-bottom: 1px solid rgba(105,108,255,0.08);
    padding: 16px 24px;
    font-weight: 600;
  }
  #pledges-table tbody tr { transition: background .2s ease; }
  #pledges-table tbody tr:hover { background: rgba(105,108,255,0.03); }

  /* ── Progress bar ────────────────────────────────────────── */
  .redemption-bar {
    height: 6px; border-radius: 3px;
    background: #e9ecef;
    overflow: hidden;
    margin-top: 4px;
  }
  .redemption-bar-fill {
    height: 100%; border-radius: 3px;
    transition: width .6s ease;
  }

  /* ── Modals ──────────────────────────────────────────────── */
  .modal-content { border: none; border-radius: 20px; overflow: hidden; }
  .modal-header.hero-header {
    background: linear-gradient(135deg, rgba(105,108,255,0.08), rgba(113,221,55,0.05));
    border-bottom: 1px solid rgba(105,108,255,0.1);
    padding: 20px 24px 12px;
  }
  .detail-row th {
    color: #6c757d; font-weight: 500;
    font-size: .82rem; text-transform: uppercase; letter-spacing: .04em;
    width: 38%; vertical-align: middle;
  }
  .detail-row td { vertical-align: middle; }

  /* ── Redemption panel ─────────────────────────────────────── */
  .redeem-panel {
    background: rgba(113,221,55,0.05);
    border: 1px dashed rgba(113,221,55,0.4);
    border-radius: 12px;
    padding: 18px;
    margin-top: 16px;
  }
</style>

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

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">

          <!-- ── Page Hero ─────────────────────────────────── -->
          <div class="page-hero">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <div class="d-flex align-items-center gap-3 mb-1">
                  <div style="width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#696cff,#8592fc);display:flex;align-items:center;justify-content:center;">
                    <i class="bx bx-heart text-white bx-sm"></i>
                  </div>
                  <div>
                    <h4 class="mb-0 fw-bold">Pledge Management</h4>
                    <small class="text-muted">Record commitments, track redemptions &amp; view analytics</small>
                  </div>
                </div>
              </div>
              <div class="d-flex gap-2">
                <a href="pledge-report.php" class="btn btn-outline-primary">
                  <i class="bx bx-bar-chart-alt-2 me-1"></i> Analytics
                </a>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#recordPledgeModal">
                  <i class="bx bx-plus me-1"></i> Record Pledge
                </button>
              </div>
            </div>
          </div>

          <!-- ── KPI Cards ──────────────────────────────────── -->
          <div class="row g-4 mb-4">
            <!-- Total Pledged -->
            <div class="col-sm-6 col-xl-3">
              <div class="card glass-card kpi-card kpi-card-primary">
                <div class="card-body">
                  <div class="d-flex align-items-start justify-content-between">
                    <div>
                      <span class="text-muted d-block mb-1 fw-medium small">Total Pledged</span>
                      <h4 class="mb-0 fw-bold text-primary" id="kpi-pledged">KES 0.00</h4>
                      <small class="text-muted" id="kpi-period-label">Current Period</small>
                    </div>
                    <div class="icon-box icon-box-primary">
                      <i class="bx bx-donate-heart bx-sm"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Total Redeemed -->
            <div class="col-sm-6 col-xl-3">
              <div class="card glass-card kpi-card kpi-card-success">
                <div class="card-body">
                  <div class="d-flex align-items-start justify-content-between">
                    <div>
                      <span class="text-muted d-block mb-1 fw-medium small">Total Redeemed</span>
                      <h4 class="mb-0 fw-bold text-success" id="kpi-redeemed">KES 0.00</h4>
                      <small class="text-muted">Payments received</small>
                    </div>
                    <div class="icon-box icon-box-success">
                      <i class="bx bx-check-circle bx-sm"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Outstanding -->
            <div class="col-sm-6 col-xl-3">
              <div class="card glass-card kpi-card kpi-card-danger">
                <div class="card-body">
                  <div class="d-flex align-items-start justify-content-between">
                    <div>
                      <span class="text-muted d-block mb-1 fw-medium small">Outstanding</span>
                      <h4 class="mb-0 fw-bold text-danger" id="kpi-outstanding">KES 0.00</h4>
                      <small class="text-muted">Pledged − Redeemed</small>
                    </div>
                    <div class="icon-box icon-box-danger">
                      <i class="bx bx-time-five bx-sm"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Count -->
            <div class="col-sm-6 col-xl-3">
              <div class="card glass-card kpi-card kpi-card-warning">
                <div class="card-body">
                  <div class="d-flex align-items-start justify-content-between">
                    <div>
                      <span class="text-muted d-block mb-1 fw-medium small">Total Pledges</span>
                      <h4 class="mb-0 fw-bold text-warning" id="kpi-count">0</h4>
                      <small class="text-muted">Commitments made</small>
                    </div>
                    <div class="icon-box icon-box-warning">
                      <i class="bx bx-user-check bx-sm"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Filters ────────────────────────────────────── -->
          <div class="filter-card mb-3">
            <div class="row g-3 align-items-end">
              <div class="col-12 mb-1">
                <h6 class="mb-0 text-primary d-flex align-items-center">
                  <i class="bx bx-filter-alt me-2"></i> Filter Pledges
                </h6>
              </div>
              <!-- Accounting Period selector -->
              <div class="col-md-3">
                <label for="filter-period" class="form-label small text-muted">Accounting Period</label>
                <select id="filter-period" class="form-select">
                  <option value="">— Select Period —</option>
                </select>
              </div>
              <!-- Date Range -->
              <div class="col-md-2">
                <label for="filter-start" class="form-label small text-muted">Start Date</label>
                <input type="date" id="filter-start" class="form-control" />
              </div>
              <div class="col-md-2">
                <label for="filter-end" class="form-label small text-muted">End Date</label>
                <input type="date" id="filter-end" class="form-control" />
              </div>
              <!-- Status -->
              <div class="col-md-2">
                <label for="filter-status" class="form-label small text-muted">Status</label>
                <select id="filter-status" class="form-select">
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="redeemed">Fully Redeemed</option>
                </select>
              </div>
              <!-- Search -->
              <div class="col-md-2">
                <label for="filter-search" class="form-label small text-muted">Search</label>
                <input type="text" id="filter-search" class="form-control" placeholder="Name / email / phone" />
              </div>
              <!-- Buttons -->
              <div class="col-md-1 d-flex gap-1">
                <button id="filter-btn" class="btn btn-primary flex-fill">
                  <i class="bx bx-search-alt"></i>
                </button>
                <button id="reset-btn" class="btn btn-outline-secondary flex-fill">
                  <i class="bx bx-reset"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- ── Pledges Table ──────────────────────────────── -->
          <div class="card custom-table-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="bx bx-list-ul me-1 text-primary"></i> Pledges &amp; Commitments</span>
              <span class="badge bg-label-primary" id="table-count-badge">0 records</span>
            </div>
            <div class="table-responsive text-nowrap">
              <table class="table mb-0" id="pledges-table">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Pledger</th>
                    <th>Purpose</th>
                    <th>Type</th>
                    <th>Pledged</th>
                    <th>Redeemed</th>
                    <th>Balance</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="pledges-tbody">
                  <tr><td colspan="10" class="text-center text-muted py-5">
                    <i class="bx bx-loader-alt bx-spin me-2"></i>Loading pledges...
                  </td></tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
        <!-- /Content -->

        <!-- ── Modal: Record New Pledge ──────────────────────── -->
        <div class="modal fade" id="recordPledgeModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header hero-header">
                <div class="d-flex align-items-center gap-2">
                  <div style="width:36px;height:36px;border-radius:10px;background:rgba(105,108,255,0.15);display:flex;align-items:center;justify-content:center;">
                    <i class="bx bx-plus-circle text-primary"></i>
                  </div>
                  <div>
                    <h5 class="modal-title mb-0">Record New Pledge</h5>
                    <small class="text-muted">Admin-recorded commitment</small>
                  </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body p-4">
                <form id="pledge-form" novalidate>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label fw-medium">Full Name <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="pf-name" placeholder="e.g. John Doe" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-medium">Phone Number</label>
                      <input type="tel" class="form-control" id="pf-phone" placeholder="07XXXXXXXX" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-medium">Email Address</label>
                      <input type="email" class="form-control" id="pf-email" placeholder="john@example.com" />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-medium">Pledge Date <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" id="pf-date" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-medium">Purpose <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="pf-purpose" placeholder="e.g. Conference, Partnership…" required />
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-medium">Type</label>
                      <select class="form-select" id="pf-type">
                        <option value="cash">Cash</option>
                        <option value="attendee">Attendee Sponsorship</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-medium">Amount (KES) <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <span class="input-group-text">KES</span>
                        <input type="number" class="form-control" id="pf-amount" min="1" step="0.01" placeholder="0.00" required />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-medium">Reminder / Notes</label>
                      <input type="text" class="form-control" id="pf-notes" placeholder="e.g. 2 weeks, monthly…" />
                    </div>
                    <div class="col-12">
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="pf-recurring" value="1" />
                        <label class="form-check-label" for="pf-recurring">Recurring pledge</label>
                      </div>
                    </div>
                    <div class="col-12" id="pledge-form-alert" style="display:none;"></div>
                  </div>
                </form>
              </div>
              <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="btn-save-pledge">
                  <i class="bx bx-save me-1"></i> Save Pledge
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Modal: Pledge Details ──────────────────────────── -->
        <div class="modal fade" id="pledgeDetailModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
            <div class="modal-content">
              <div class="modal-header hero-header">
                <div class="d-flex align-items-center gap-2">
                  <div style="width:36px;height:36px;border-radius:10px;background:rgba(105,108,255,0.15);display:flex;align-items:center;justify-content:center;">
                    <i class="bx bx-info-circle text-primary"></i>
                  </div>
                  <div>
                    <h5 class="modal-title mb-0" id="detail-modal-name">Pledge Details</h5>
                    <small class="text-muted" id="detail-modal-purpose"></small>
                  </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body p-4">
                <div class="row g-4">
                  <!-- Left: Pledge info -->
                  <div class="col-lg-5">
                    <h6 class="text-muted text-uppercase fw-semibold small mb-3">Pledge Information</h6>
                    <table class="table table-borderless detail-row">
                      <tbody>
                        <tr><th>Name</th><td id="d-name"></td></tr>
                        <tr><th>Email</th><td id="d-email"></td></tr>
                        <tr><th>Phone</th><td id="d-phone"></td></tr>
                        <tr><th>Purpose</th><td id="d-purpose"></td></tr>
                        <tr><th>Type</th><td id="d-type"></td></tr>
                        <tr><th>Pledged</th><td id="d-pledged" class="fw-bold text-primary"></td></tr>
                        <tr><th>Redeemed</th><td id="d-redeemed" class="fw-bold text-success"></td></tr>
                        <tr><th>Balance</th><td id="d-balance" class="fw-bold text-danger"></td></tr>
                        <tr><th>Date</th><td id="d-date"></td></tr>
                        <tr><th>Notes</th><td id="d-notes" class="text-muted small"></td></tr>
                        <tr><th>Recurring</th><td id="d-recurring"></td></tr>
                      </tbody>
                    </table>

                    <!-- Redemption panel -->
                    <div class="redeem-panel" id="detail-redeem-panel">
                      <h6 class="mb-2 text-success"><i class="bx bx-transfer me-1"></i> Record Redemption</h6>
                      <div class="row g-2">
                        <div class="col-7">
                          <label class="form-label small fw-medium">Amount (KES) <span class="text-danger">*</span></label>
                          <input type="number" id="redeem-amount" class="form-control form-control-sm" min="1" step="0.01" placeholder="0.00" />
                        </div>
                        <div class="col-5">
                          <label class="form-label small fw-medium">M-Pesa Code <span class="text-danger">*</span></label>
                          <input type="text" id="redeem-mpesa" class="form-control form-control-sm" placeholder="QJX123…" />
                        </div>
                        <div class="col-7">
                          <label class="form-label small fw-medium">Phone</label>
                          <input type="tel" id="redeem-phone" class="form-control form-control-sm" placeholder="07XXXXXXXX" />
                        </div>
                        <div class="col-5">
                          <label class="form-label small fw-medium">Email</label>
                          <input type="email" id="redeem-email" class="form-control form-control-sm" placeholder="optional" />
                        </div>
                        <div class="col-12 mt-1">
                          <button type="button" class="btn btn-success btn-sm w-100" id="btn-record-redeem">
                            <i class="bx bx-check-circle me-1"></i> Record Redemption
                          </button>
                        </div>
                      </div>
                      <div id="redeem-alert" class="mt-2" style="display:none;"></div>
                    </div>
                  </div>

                  <!-- Right: Redemption history -->
                  <div class="col-lg-7">
                    <h6 class="text-muted text-uppercase fw-semibold small mb-3">Redemption History</h6>
                    <div id="redemption-history-wrap">
                      <div class="text-center text-muted py-4">
                        <i class="bx bx-loader-alt bx-spin me-1"></i> Loading...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                  <i class="bx bx-x me-1"></i> Close
                </button>
              </div>
            </div>
          </div>
        </div>

        <?php @include('includes/footer.php'); ?>
        <div class="content-backdrop fade"></div>
      </div><!-- /content-wrapper -->
    </div><!-- /layout-page -->
  </div><!-- /layout-container -->
</div><!-- /layout-wrapper -->

<?php @include('includes/scripts.html'); ?>
<script defer src="assets/js/pledges.js"></script>
</body>
</html>
