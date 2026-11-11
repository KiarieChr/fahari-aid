<?php

//  this the pae to load all receipts majorly will be filter by 
// the current date
// check if user is logged in
require_once('includes/checklogin.php');
$title = " Jesus Enthroned Netwrok - Finance | Collections";
// get user details
include("includes/get_user.php");
// collections will be loaded via ajax calls


?>
<!doctype html>
<html lang="en" class="layout-navbar-fixed layout-menu-fixed layout-compact " dir="ltr" data-skin="default" data-theme="light" data-assets-path="assets/" data-template="vertical-menu-template">
    <?php @include('includes/header.php');?>
    
    <style>
      /* Glassmorphism KPI & General Card Styles */
      .glass-card {
        background: rgba(255, 255, 255, 0.45) !important;
        backdrop-filter: blur(12px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
        border: 1px solid rgba(255, 255, 255, 0.55) !important;
        border-radius: 16px !important;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04) !important;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        overflow: hidden;
      }
      
      .glass-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 30px rgba(105, 108, 255, 0.08) !important;
        background: rgba(255, 255, 255, 0.65) !important;
      }
      
      .kpi-card {
        border-radius: 16px !important;
        overflow: hidden;
        position: relative;
      }
      .kpi-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        transition: all 0.3s ease;
      }
      .kpi-card-primary::before { background: linear-gradient(to bottom, #696cff, #8592fc); }
      .kpi-card-success::before { background: linear-gradient(to bottom, #71dd37, #93e461); }
      .kpi-card-info::before { background: linear-gradient(to bottom, #03c3ec, #35d0f1); }
      .kpi-card-warning::before { background: linear-gradient(to bottom, #ffab00, #ffc140); }

      /* Icon Box Styling */
      .icon-box {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      .kpi-card:hover .icon-box {
        transform: scale(1.1) rotate(5deg);
      }
      
      .icon-box-primary {
        background: linear-gradient(135deg, rgba(105, 108, 255, 0.1) 0%, rgba(105, 108, 255, 0.2) 100%);
        color: #696cff;
      }
      .icon-box-success {
        background: linear-gradient(135deg, rgba(113, 221, 55, 0.1) 0%, rgba(113, 221, 55, 0.2) 100%);
        color: #71dd37;
      }
      .icon-box-info {
        background: linear-gradient(135deg, rgba(3, 195, 236, 0.1) 0%, rgba(3, 195, 236, 0.2) 100%);
        color: #03c3ec;
      }
      .icon-box-warning {
        background: linear-gradient(135deg, rgba(255, 171, 0, 0.1) 0%, rgba(255, 171, 0, 0.2) 100%);
        color: #ffab00;
      }

      /* Premium Pill Badges styling */
      .badge.bg-label-success {
        background-color: rgba(113, 221, 55, 0.12) !important;
        color: #71dd37 !important;
        border: 1px solid rgba(113, 221, 55, 0.2) !important;
      }
      .badge.bg-label-warning {
        background-color: rgba(255, 171, 0, 0.12) !important;
        color: #ffab00 !important;
        border: 1px solid rgba(255, 171, 0, 0.2) !important;
      }
      .badge.bg-label-info {
        background-color: rgba(3, 195, 236, 0.12) !important;
        color: #03c3ec !important;
        border: 1px solid rgba(3, 195, 236, 0.2) !important;
      }
      .badge.bg-label-primary {
        background-color: rgba(105, 108, 255, 0.12) !important;
        color: #696cff !important;
        border: 1px solid rgba(105, 108, 255, 0.2) !important;
      }
      .badge.bg-label-secondary {
        background-color: rgba(133, 146, 163, 0.12) !important;
        color: #8592a3 !important;
        border: 1px solid rgba(133, 146, 163, 0.2) !important;
      }
      .badge.bg-label-danger {
        background-color: rgba(255, 62, 29, 0.12) !important;
        color: #ff3e1d !important;
        border: 1px solid rgba(255, 62, 29, 0.2) !important;
      }

      /* Table styling */
      .custom-table-card {
        background: rgba(255, 255, 255, 0.6) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255, 255, 255, 0.5) !important;
        border-radius: 16px !important;
        box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.03) !important;
        overflow: hidden;
      }
      .custom-table-card .card-header {
        background: rgba(248, 249, 250, 0.7);
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        font-weight: 600;
      }
      .table tbody tr {
        transition: background-color 0.2s ease;
      }
      .table tbody tr:hover {
        background-color: rgba(105, 108, 255, 0.03) !important;
      }
      .table th {
        font-size: 0.75rem !important;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        font-weight: 600;
        color: #566a7f !important;
        background-color: rgba(248, 249, 250, 0.9) !important;
      }

      /* Filter card */
      .filter-card {
        border: 1px solid rgba(255, 255, 255, 0.6) !important;
        border-radius: 12px !important;
        background: rgba(248, 249, 250, 0.45) !important;
        backdrop-filter: blur(5px) !important;
        -webkit-backdrop-filter: blur(5px) !important;
        margin: 15px !important;
        padding: 15px !important;
      }

      /* Button styles */
      .btn-record-collection {
        background: linear-gradient(135deg, #696cff 0%, #5f62f1 100%) !important;
        border: none !important;
        box-shadow: 0 4px 15px rgba(105, 108, 255, 0.3) !important;
        transition: all 0.3s ease !important;
        color: #fff !important;
      }
      .btn-record-collection:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(105, 108, 255, 0.4) !important;
        background: linear-gradient(135deg, #5f62f1 0%, #5558e6 100%) !important;
      }

      /* Modal Details table */
      .modal-detail-table th {
        background-color: #f8f9fa;
        color: #495057;
        font-weight: 600;
      }
    </style>

  <body>
   <!-- Layout wrapper -->
   <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <!-- Menu -->
         <?php
          @include('includes/sidebar.php');
          ?> 
        <!-- / Menu -->
         <div class="menu-mobile-toggler d-xl-none rounded-1">
                <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large text-bg-secondary p-2 rounded-1">
                    <i class="bx bx-menu icon-base"></i>
                    <i class="bx bx-chevron-right icon-base"></i>
                </a>
            </div>

        <!-- Layout container -->
        <div class="layout-page">
          <!-- Navbar -->
          <?php
          @include('includes/nav.php');
          @include('modals/collections.php');
          ?>

          <!-- / Navbar -->

          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
             
              <!-- Page Header -->
              <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <div>
                  <h4 class="fw-bold mb-0 text-dark">Cash Collections & Income Receipts</h4>
                  <p class="text-muted mb-0 small">Real-time ledger tracking, tithes, offerings, and partnership pledges redemption.</p>
                </div>
                <div class="d-flex gap-2">
                  <button
                    type="button"
                    class="btn btn-primary btn-record-collection"
                    data-bs-toggle="modal"
                    data-bs-target="#newCollection">
                      <i class="bx bx-plus-circle me-1"></i> Record New Receipt / Collection
                  </button>
                  <a
                    href="collection-analytics.php"
                    class="btn btn-outline-primary <?php if(!userHasPermission($db, $user_id, 'collection_analytics')){ echo 'disabled'; } ?>">
                    <i class="bx bx-bar-chart-alt-2 me-1"></i> Analytics
                  </a>
                </div>
              </div>

              <!-- KPI Cards Row -->
              <div class="row g-3 mb-4">
                <!-- Card 1: Today's Collections -->
                <div class="col-sm-6 col-xl-3">
                  <div class="card glass-card kpi-card kpi-card-primary">
                    <div class="card-body">
                      <div class="d-flex align-items-start justify-content-between">
                        <div class="content-left">
                          <span class="text-muted d-block mb-1 fw-medium">Today's Collections</span>
                          <div class="d-flex align-items-end mt-2">
                            <h4 class="mb-0 me-2 fw-bold text-primary" id="kpi-today">KES 0.00</h4>
                          </div>
                        </div>
                        <div class="icon-box icon-box-primary">
                          <i class="bx bx-money bx-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Card 2: This Month's Collections -->
                <div class="col-sm-6 col-xl-3">
                  <div class="card glass-card kpi-card kpi-card-success">
                    <div class="card-body">
                      <div class="d-flex align-items-start justify-content-between">
                        <div class="content-left">
                          <span class="text-muted d-block mb-1 fw-medium">This Month</span>
                          <div class="d-flex align-items-end mt-2">
                            <h4 class="mb-0 me-2 fw-bold text-success" id="kpi-month">KES 0.00</h4>
                          </div>
                        </div>
                        <div class="icon-box icon-box-success">
                          <i class="bx bx-calendar bx-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Card 3: Total Pledge Redemptions -->
                <div class="col-sm-6 col-xl-3">
                  <div class="card glass-card kpi-card kpi-card-info">
                    <div class="card-body">
                      <div class="d-flex align-items-start justify-content-between">
                        <div class="content-left">
                          <span class="text-muted d-block mb-1 fw-medium">Pledges Redeemed</span>
                          <div class="d-flex align-items-end mt-2">
                            <h4 class="mb-0 me-2 fw-bold text-info" id="kpi-pledges">KES 0.00</h4>
                          </div>
                        </div>
                        <div class="icon-box icon-box-info">
                          <i class="bx bx-heart bx-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Card 4: Total Cash Transactions -->
                <div class="col-sm-6 col-xl-3">
                  <div class="card glass-card kpi-card kpi-card-warning">
                    <div class="card-body">
                      <div class="d-flex align-items-start justify-content-between">
                        <div class="content-left">
                          <span class="text-muted d-block mb-1 fw-medium">Transactions Count</span>
                          <div class="d-flex align-items-end mt-2">
                            <h4 class="mb-0 me-2 fw-bold text-warning" id="kpi-count">0</h4>
                          </div>
                        </div>
                        <div class="icon-box icon-box-warning">
                          <i class="bx bx-receipt bx-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Basic Bootstrap Table -->
              <div class="card custom-table-card">
                <h5 class="card-header d-flex justify-content-between align-items-center">
                  <span>Collections/Receipts Dashboard</span>
                  <span class="badge bg-label-primary"><i class="bx bx-refresh me-1"></i> Auto-updating Ledger</span>
                </h5>
                <div class="filters filter-card">
                  <div class="row g-3">
                    <div class="col-12 mb-1">
                      <h6 class="mb-0 text-primary d-flex align-items-center"><i class="bx bx-filter-alt me-2"></i> Filter Receipts</h6>
                    </div>
                    <div class="col-md-4">
                      <label for="start-date" class="form-label small text-muted">Start Date</label>
                      <input type="date" id="start-date" class="form-control" />
                    </div>
                    <div class="col-md-4">
                      <label for="end-date" class="form-label small text-muted">End Date</label>
                      <input type="date" id="end-date" class="form-control" />
                    </div>
                    <div class="col-md-4 align-self-end">
                      <div class="d-flex gap-2">
                        <button id="filter-btn" class="btn btn-primary w-100"><i class="bx bx-search-alt me-1"></i> Filter</button>
                        <button id="reset-btn" class="btn btn-outline-secondary w-100"><i class="bx bx-reset me-1"></i> Reset</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="table table-responsive text-nowrap">
                  <table class="table" id="collections-table">
                    <thead>
                      <tr>
                        <th>Receipt Number</th>
                        <th>Full Name</th>
                        <th>Payment Method</th>
                        <th>Amount</th>
                        <th>Collection Date</th>
                        <th>Payment For</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody class="table-border-bottom-0" id="collections">
                        <!-- Collections will be loaded here via AJAX -->
                    </tbody>
                  </table>
                </div>
              </div>
              <!--/ Basic Bootstrap Table -->

              <!-- Modal: View Receipt Details -->
              <div class="modal fade" id="viewReceiptModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                  <div class="modal-content">
                    <div class="modal-header bg-primary bg-opacity-10 border-0 pb-0">
                      <div class="d-flex align-items-center gap-2">
                        <div style="width:38px;height:38px;border-radius:10px;background:rgba(105,108,255,0.15);display:flex;align-items:center;justify-content:center;">
                          <i class="bx bx-receipt text-primary"></i>
                        </div>
                        <div>
                          <h5 class="modal-title mb-0">Receipt Details</h5>
                          <small class="text-muted" id="view-modal-subtitle">Collection Record</small>
                        </div>
                      </div>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body pt-2">
                      <div class="table-responsive">
                        <table class="table table-borderless mb-0">
                          <tbody>
                            <tr class="border-bottom">
                              <th class="text-muted fw-medium" style="width:40%;vertical-align:middle;">Receipt Number</th>
                              <td id="view-receipt-id" class="fw-bold text-primary"></td>
                            </tr>
                            <tr class="border-bottom">
                              <th class="text-muted fw-medium" style="vertical-align:middle;">Payee Name</th>
                              <td id="view-payee"></td>
                            </tr>
                            <tr class="border-bottom">
                              <th class="text-muted fw-medium" style="vertical-align:middle;">Payment Method</th>
                              <td><span class="badge bg-label-success" id="view-method"></span></td>
                            </tr>
                            <tr class="border-bottom">
                              <th class="text-muted fw-medium" style="vertical-align:middle;">Payment Purpose</th>
                              <td><span class="badge bg-label-primary" id="view-purpose"></span></td>
                            </tr>
                            <tr class="border-bottom">
                              <th class="text-muted fw-medium" style="vertical-align:middle;">Transaction ID</th>
                              <td id="view-transaction-id" class="fw-semibold text-info font-monospace"></td>
                            </tr>
                            <tr class="border-bottom">
                              <th class="text-muted fw-medium" style="vertical-align:middle;">Amount Received</th>
                              <td id="view-amount" class="fw-bold text-success fs-5"></td>
                            </tr>
                            <tr class="border-bottom">
                              <th class="text-muted fw-medium" style="vertical-align:middle;">Collection Date</th>
                              <td id="view-date"></td>
                            </tr>
                            <tr class="border-bottom">
                              <th class="text-muted fw-medium" style="vertical-align:middle;">Description</th>
                              <td id="view-description" class="text-muted small"></td>
                            </tr>
                            <tr>
                              <th class="text-muted fw-medium" style="vertical-align:middle;">Journal Status</th>
                              <td id="view-journal-status"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <!-- Post to Journal Panel (shown when unposted) -->
                      <div id="post-journal-panel" class="mt-3 p-3 rounded-3" style="background:rgba(105,108,255,0.05);border:1px dashed rgba(105,108,255,0.3);display:none;">
                        <h6 class="mb-2 text-primary"><i class="bx bx-book-open me-1"></i> Post to General Ledger</h6>
                        <p class="text-muted small mb-3">Select the transaction date to use for the journal entry. This will create a balanced double-entry in the ledger.</p>
                        <div class="row g-2 align-items-end">
                          <div class="col-sm-7">
                            <label for="post-entry-date" class="form-label small fw-medium">Transaction Date <span class="text-danger">*</span></label>
                            <input type="date" id="post-entry-date" class="form-control" />
                          </div>
                          <div class="col-sm-5">
                            <button type="button" id="btn-post-journal" class="btn btn-primary w-100">
                              <i class="bx bx-send me-1"></i> Post to Journal
                            </button>
                          </div>
                        </div>
                        <div id="post-journal-alert" class="mt-2" style="display:none;"></div>
                      </div>

                    </div>
                    <div class="modal-footer border-0 pt-0">
                      <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal"><i class="bx bx-x me-1"></i>Close</button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <!-- / Content -->

            <!-- Footer -->
            <?php @include('includes/footer.php');?>
            <!-- / Footer -->
            <div class="content-backdrop fade"></div>
          </div>
            <!-- Content wrapper -->
        </div>
        <!-- / Layout page -->

        </div>

    <?php @include('includes/scripts.html');?>


    <!-- load collections.js -->
    <script defer src="assets/js/collections.js"></script>
    </body>
</html>