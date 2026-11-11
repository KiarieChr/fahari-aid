<?php
// expenditures.php
require_once('includes/checklogin.php');
$title = "Jesus Enthroned Network - Finance | Expenditures & Bills";
include("includes/get_user.php");
?>
<!doctype html>
<html lang="en" class="layout-navbar-fixed layout-menu-fixed layout-compact " dir="ltr" data-skin="default" data-theme="light" data-assets-path="assets/" data-template="vertical-menu-template">
    <?php @include('includes/header.php');?>
    
    <style>
      /* Premium KPI Card Styles */
      .kpi-card {
        border: 1px solid rgba(0, 0, 0, 0.06) !important;
        border-radius: 16px !important;
        background: #ffffff;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02) !important;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
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
      .kpi-card-danger::before { background: linear-gradient(to bottom, #ff3e1d, #ff6a52); }
      .kpi-card-success::before { background: linear-gradient(to bottom, #71dd37, #93e461); }
      .kpi-card-primary::before { background: linear-gradient(to bottom, #696cff, #8592fc); }
      .kpi-card-warning::before { background: linear-gradient(to bottom, #ffab00, #ffc140); }

      .kpi-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 30px rgba(105, 108, 255, 0.12) !important;
      }
      
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
      
      .icon-box-danger {
        background: linear-gradient(135deg, rgba(255, 62, 29, 0.1) 0%, rgba(255, 62, 29, 0.2) 100%);
        color: #ff3e1d;
      }
      .icon-box-success {
        background: linear-gradient(135deg, rgba(113, 221, 55, 0.1) 0%, rgba(113, 221, 55, 0.2) 100%);
        color: #71dd37;
      }
      .icon-box-primary {
        background: linear-gradient(135deg, rgba(105, 108, 255, 0.1) 0%, rgba(105, 108, 255, 0.2) 100%);
        color: #696cff;
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
      .badge.bg-label-primary {
        background-color: rgba(105, 108, 255, 0.12) !important;
        color: #696cff !important;
        border: 1px solid rgba(105, 108, 255, 0.2) !important;
      }
      .badge.bg-label-danger {
        background-color: rgba(255, 62, 29, 0.12) !important;
        color: #ff3e1d !important;
        border: 1px solid rgba(255, 62, 29, 0.2) !important;
      }
      .badge.bg-label-info {
        background-color: rgba(3, 195, 236, 0.12) !important;
        color: #03c3ec !important;
        border: 1px solid rgba(3, 195, 236, 0.2) !important;
      }

      /* Table styling */
      .custom-table-card {
        border: 1px solid rgba(0, 0, 0, 0.06) !important;
        border-radius: 16px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02) !important;
        overflow: hidden;
      }
      .custom-table-card .card-header {
        background: #fbfbfc;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        font-weight: 600;
      }
      .table tbody tr {
        transition: background-color 0.2s ease;
      }
      .table tbody tr:hover {
        background-color: rgba(105, 108, 255, 0.02) !important;
      }
      .table th {
        font-size: 0.75rem !important;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        font-weight: 600;
        color: #566a7f !important;
        background-color: #f8f9fa !important;
      }

      /* Filter card */
      .filter-card {
        border: 1px solid rgba(0, 0, 0, 0.06) !important;
        border-radius: 12px !important;
        background: rgba(248, 249, 250, 0.7) !important;
        margin: 15px !important;
        padding: 15px !important;
      }

      /* Button styles */
      .btn-record-bill {
        background: linear-gradient(135deg, #696cff 0%, #5f62f1 100%) !important;
        border: none !important;
        box-shadow: 0 4px 15px rgba(105, 108, 255, 0.3) !important;
        transition: all 0.3s ease !important;
        color: #fff !important;
      }
      .btn-record-bill:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(105, 108, 255, 0.4) !important;
        background: linear-gradient(135deg, #5f62f1 0%, #5558e6 100%) !important;
      }

      /* Tab bar customization */
      .nav-tabs .nav-link {
        font-weight: 500;
        color: #566a7f;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 12px 20px;
        transition: all 0.2s ease;
      }
      .nav-tabs .nav-link.active {
        color: #696cff !important;
        border: none;
        border-bottom: 2px solid #696cff;
        background: transparent;
      }
      .nav-tabs .nav-link:hover:not(.active) {
        border-color: transparent;
        color: #696cff;
      }
    </style>

  <body>
    <!-- Layout wrapper -->
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <!-- Menu -->
        <?php @include('includes/sidebar.php'); ?>
        <!-- / Menu -->

        <!-- Layout container -->
        <div class="layout-page">
          <!-- Navbar -->
          <?php @include('includes/nav.php'); ?>
          <!-- / Navbar -->

          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
              
              <!-- Action Buttons Card -->
              <div class="card mb-4">
                <div class="card-body">
                  <div class="demo-inline-spacing">
                    <button
                      type="button"
                      class="btn btn-primary btn-record-bill"
                      data-bs-toggle="modal"
                      data-bs-target="#newBillModal">
                        <i class="bx bx-plus-circle me-1"></i> Record Vendor Bill
                    </button>
                    <a
                      href="budgeting.php"
                      class="btn btn-outline-primary">
                        <i class="bx bx-pie-chart-alt-2 me-1"></i> Budgets Directory
                    </a>
                  </div>
                </div>
              </div>

              <!-- KPI Cards Row -->
              <div class="row g-3 mb-4">
                <!-- Card 1: Total Unpaid Liability -->
                <div class="col-sm-6 col-xl-3">
                  <div class="card kpi-card kpi-card-danger">
                    <div class="card-body">
                      <div class="d-flex align-items-start justify-content-between">
                        <div class="content-left">
                          <span class="text-muted d-block mb-1 fw-medium">Unpaid Liability</span>
                          <div class="d-flex align-items-end mt-2">
                            <h4 class="mb-0 me-2 fw-bold text-danger" id="kpi-unpaid">KES 0.00</h4>
                          </div>
                        </div>
                        <div class="icon-box icon-box-danger">
                          <i class="bx bx-trending-down bx-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Card 2: Total Paid this Month -->
                <div class="col-sm-6 col-xl-3">
                  <div class="card kpi-card kpi-card-success">
                    <div class="card-body">
                      <div class="d-flex align-items-start justify-content-between">
                        <div class="content-left">
                          <span class="text-muted d-block mb-1 fw-medium">Paid This Month</span>
                          <div class="d-flex align-items-end mt-2">
                            <h4 class="mb-0 me-2 fw-bold text-success" id="kpi-paid-month">KES 0.00</h4>
                          </div>
                        </div>
                        <div class="icon-box icon-box-success">
                          <i class="bx bx-check-double bx-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Card 3: Event Linked Expenditures -->
                <div class="col-sm-6 col-xl-3">
                  <div class="card kpi-card kpi-card-primary">
                    <div class="card-body">
                      <div class="d-flex align-items-start justify-content-between">
                        <div class="content-left">
                          <span class="text-muted d-block mb-1 fw-medium">Event Linked Bills</span>
                          <div class="d-flex align-items-end mt-2">
                            <h4 class="mb-0 me-2 fw-bold text-primary" id="kpi-event-linked">0</h4>
                          </div>
                        </div>
                        <div class="icon-box icon-box-primary">
                          <i class="bx bx-calendar-event bx-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Card 4: Unpaid Bills count -->
                <div class="col-sm-6 col-xl-3">
                  <div class="card kpi-card kpi-card-warning">
                    <div class="card-body">
                      <div class="d-flex align-items-start justify-content-between">
                        <div class="content-left">
                          <span class="text-muted d-block mb-1 fw-medium">Pending Unpaid Bills</span>
                          <div class="d-flex align-items-end mt-2">
                            <h4 class="mb-0 me-2 fw-bold text-warning" id="kpi-pending">0</h4>
                          </div>
                        </div>
                        <div class="icon-box icon-box-warning">
                          <i class="bx bx-time-five bx-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Main Card with Tabs -->
              <div class="card custom-table-card">
                <div class="card-header p-0">
                  <ul class="nav nav-tabs card-header-tabs" role="tablist">
                    <li class="nav-item">
                      <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-bills" type="button" role="tab"><i class="bx bx-receipt me-1"></i> Bills Ledger</button>
                    </li>
                    <li class="nav-item">
                      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-payments" type="button" role="tab"><i class="bx bx-credit-card me-1"></i> Payments Feed</button>
                    </li>
                  </ul>
                </div>
                
                <!-- Filters Section -->
                <div class="filters filter-card">
                  <div class="row g-3">
                    <div class="col-12 mb-1">
                      <h6 class="mb-0 text-primary d-flex align-items-center"><i class="bx bx-filter-alt me-2"></i> Filter Records</h6>
                    </div>
                    <div class="col-md-3">
                      <label for="start-date" class="form-label small text-muted">Start Date</label>
                      <input type="date" id="start-date" class="form-control" />
                    </div>
                    <div class="col-md-3">
                      <label for="end-date" class="form-label small text-muted">End Date</label>
                      <input type="date" id="end-date" class="form-control" />
                    </div>
                    <div class="col-md-2">
                      <label for="filter-status" class="form-label small text-muted">Status</label>
                      <select id="filter-status" class="form-select">
                        <option value="">All Statuses</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                    <div class="col-md-2">
                      <label for="filter-event" class="form-label small text-muted">Event</label>
                      <select id="filter-event" class="form-select">
                        <option value="">All Events</option>
                      </select>
                    </div>
                    <div class="col-md-2 align-self-end">
                      <div class="d-flex gap-2">
                        <button id="filter-btn" class="btn btn-primary w-100"><i class="bx bx-search-alt me-1"></i> Filter</button>
                        <button id="reset-btn" class="btn btn-outline-secondary w-100"><i class="bx bx-reset me-1"></i> Reset</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="tab-content p-0">
                  <!-- Tab: Bills -->
                  <div class="tab-pane fade show active" id="tab-bills" role="tabpanel">
                    <div class="table-responsive text-nowrap">
                      <table class="table" id="bills-table">
                        <thead>
                          <tr>
                            <th>Bill Number</th>
                            <th>Vendor</th>
                            <th>Bill Date</th>
                            <th>Due Date</th>
                            <th>GL Expense Account</th>
                            <th>Amount</th>
                            <th>Balance Due</th>
                            <th>Status</th>
                            <th>Linked Event</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody class="table-border-bottom-0" id="bills-tbody">
                          <!-- AJAX loaded -->
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <!-- Tab: Payments -->
                  <div class="tab-pane fade" id="tab-payments" role="tabpanel">
                    <div class="table-responsive text-nowrap">
                      <table class="table" id="payments-table">
                        <thead>
                          <tr>
                            <th>Payment Date</th>
                            <th>Reference Bill</th>
                            <th>Payment Method</th>
                            <th>Reference Number</th>
                            <th>Amount Paid</th>
                            <th>Recorded By</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody class="table-border-bottom-0" id="payments-tbody">
                          <!-- AJAX loaded -->
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- MODAL: Record Vendor Bill -->
              <div class="modal fade" id="newBillModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title"><i class="bx bx-plus-circle text-primary me-1"></i> Record New Vendor Bill</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form id="record-bill-form">
                      <div class="modal-body">
                        <div class="row g-3">
                          <div class="col-md-6">
                            <label for="bill_vendor" class="form-label">Vendor Name <span class="text-danger">*</span></label>
                            <input type="text" id="bill_vendor" class="form-control" placeholder="e.g. Acme Sound Services" required />
                          </div>
                          <div class="col-md-6">
                            <label for="bill_no" class="form-label">Bill / Invoice Number <span class="text-danger">*</span></label>
                            <input type="text" id="bill_no" class="form-control" placeholder="e.g. INV-2026-904" required />
                          </div>
                          <div class="col-md-6">
                            <label for="bill_date" class="form-label">Bill Date <span class="text-danger">*</span></label>
                            <input type="date" id="bill_date" class="form-control" required />
                          </div>
                          <div class="col-md-6">
                            <label for="bill_due_date" class="form-label">Due Date <span class="text-danger">*</span></label>
                            <input type="date" id="bill_due_date" class="form-control" required />
                          </div>
                          <div class="col-md-6">
                            <label for="bill_amount" class="form-label">Total Bill Amount (KES) <span class="text-danger">*</span></label>
                            <input type="number" step="0.01" min="0.01" id="bill_amount" class="form-control" placeholder="0.00" required />
                          </div>
                          <div class="col-md-6">
                            <label for="gl_account_id" class="form-label">Expense GL Account <span class="text-danger">*</span></label>
                            <select id="gl_account_id" class="form-select" required>
                              <!-- AJAX loaded -->
                            </select>
                          </div>
                          <div class="col-md-6">
                            <label for="event_id" class="form-label">Link to Event (Optional)</label>
                            <select id="event_id" class="form-select">
                              <!-- AJAX loaded -->
                            </select>
                          </div>
                          <div class="col-md-6">
                            <label for="event_budget_item_id" class="form-label">Event Budget Item (Optional)</label>
                            <select id="event_budget_item_id" class="form-select" disabled>
                              <option value="">-- Select an Event first --</option>
                            </select>
                          </div>
                          <div class="col-12">
                            <label for="bill_desc" class="form-label">Description / Particulars</label>
                            <textarea id="bill_desc" class="form-control" rows="2" placeholder="Provide description for this bill..."></textarea>
                          </div>
                        </div>
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Vendor Bill</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <!-- MODAL: Pay Bill -->
              <div class="modal fade" id="recordPaymentModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title"><i class="bx bx-credit-card text-success me-1"></i> Record Bill Payment</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form id="record-payment-form">
                      <input type="hidden" id="pay-bill-id" />
                      <div class="modal-body">
                        <div class="p-3 bg-light rounded-3 mb-3">
                          <div class="row">
                            <div class="col-6 mb-2">
                              <small class="text-muted d-block">Vendor</small>
                              <span id="pay-vendor-name" class="fw-bold"></span>
                            </div>
                            <div class="col-6 mb-2">
                              <small class="text-muted d-block">Bill Number</small>
                              <span id="pay-bill-number" class="fw-bold"></span>
                            </div>
                            <div class="col-12">
                              <small class="text-muted d-block">Remaining Balance Due</small>
                              <span id="pay-balance-due" class="fw-bold text-danger fs-5">KES 0.00</span>
                            </div>
                          </div>
                        </div>
                        <div class="row g-3">
                          <div class="col-12">
                            <label for="pay-amount" class="form-label">Payment Amount (KES) <span class="text-danger">*</span></label>
                            <input type="number" step="0.01" min="0.01" id="pay-amount" class="form-control" required />
                          </div>
                          <div class="col-md-6">
                            <label for="pay-date" class="form-label">Payment Date <span class="text-danger">*</span></label>
                            <input type="date" id="pay-date" class="form-control" required />
                          </div>
                          <div class="col-md-6">
                            <label for="pay-method" class="form-label">Payment Method <span class="text-danger">*</span></label>
                            <select id="pay-method" class="form-select" required>
                              <option value="Cash">Cash</option>
                              <option value="MPesa">M-Pesa</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Card">Credit/Debit Card</option>
                            </select>
                          </div>
                          <div class="col-12">
                            <label for="pay-reference" class="form-label">Reference Number (e.g. MPesa Code, Cheque No)</label>
                            <input type="text" id="pay-reference" class="form-control" placeholder="e.g. RK45MT92J" />
                          </div>
                          <div class="col-12">
                            <label for="pay-notes" class="form-label">Notes</label>
                            <textarea id="pay-notes" class="form-control" rows="2" placeholder="Payment notes..."></textarea>
                          </div>
                        </div>
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success">Record Payment</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <!-- MODAL: View Bill Details -->
              <div class="modal fade" id="viewBillDetailsModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title"><i class="bx bx-receipt text-primary me-1"></i> Bill & Payment Details</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <div class="row">
                        <!-- Invoice Info -->
                        <div class="col-md-6">
                          <table class="table table-bordered table-sm">
                            <tbody>
                              <tr>
                                <th style="width: 40%;">Bill Number</th>
                                <td id="detail-bill-number" class="fw-bold"></td>
                              </tr>
                              <tr>
                                <th>Vendor Name</th>
                                <td id="detail-vendor-name"></td>
                              </tr>
                              <tr>
                                <th>Bill Date</th>
                                <td id="detail-bill-date"></td>
                              </tr>
                              <tr>
                                <th>Due Date</th>
                                <td id="detail-due-date"></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div class="col-md-6">
                          <table class="table table-bordered table-sm">
                            <tbody>
                              <tr>
                                <th style="width: 40%;">Total Amount</th>
                                <td id="detail-amount" class="fw-bold text-primary"></td>
                              </tr>
                              <tr>
                                <th>Balance Due</th>
                                <td id="detail-balance" class="fw-bold text-danger"></td>
                              </tr>
                              <tr>
                                <th>GL Account</th>
                                <td id="detail-gl-account" class="small"></td>
                              </tr>
                              <tr>
                                <th>Status</th>
                                <td id="detail-status"></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        
                        <!-- Description -->
                        <div class="col-12 mt-3">
                          <h6>Description / Particulars</h6>
                          <div class="p-3 bg-light rounded-3 text-muted" id="detail-description"></div>
                        </div>

                        <!-- Event linked info if any -->
                        <div class="col-12 mt-3" id="detail-event-section" style="display: none;">
                          <h6>Linked Event Budget Info</h6>
                          <table class="table table-bordered table-sm">
                            <tbody>
                              <tr>
                                <th style="width: 30%;">Event Name</th>
                                <td id="detail-event-title" class="fw-bold text-info"></td>
                              </tr>
                              <tr>
                                <th>Budget Line Item</th>
                                <td id="detail-event-item"></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <!-- Payments Feed history -->
                        <div class="col-12 mt-4">
                          <h6>Payment Allocation History</h6>
                          <div class="table-responsive">
                            <table class="table table-striped table-bordered table-sm">
                              <thead>
                                <tr>
                                  <th>Payment Date</th>
                                  <th>Method</th>
                                  <th>Reference Number</th>
                                  <th>Amount Paid</th>
                                </tr>
                              </thead>
                              <tbody id="detail-payments-tbody">
                                <!-- AJAX loaded -->
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        <!-- Metadata -->
                        <div class="col-12 mt-3 text-end">
                          <small class="text-muted">Recorded by: <span id="detail-recorded-by" class="fw-medium"></span></small>
                        </div>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
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
    </div>

    <?php @include('includes/scripts.html');?>

    <script>
      let eventsData = [];
      let budgetItemsData = [];
      let expenseAccountsData = [];
      let allBills = [];
      let allPayments = [];

      function loadDropdownData() {
          $.getJSON('manage/get_events_for_dropdown.php', function(res) {
              if (res.success) {
                  eventsData = res.events;
                  budgetItemsData = res.budget_items;
                  expenseAccountsData = res.expense_accounts;

                  // Populate GL account dropdown in Record Bill modal
                  let glOpt = '<option value="">-- Select GL Account --</option>';
                  expenseAccountsData.forEach(function(acc) {
                      glOpt += `<option value="${acc.id}">${acc.account_code} - ${acc.account_name}</option>`;
                  });
                  $('#gl_account_id').html(glOpt);

                  // Populate Event dropdown in Record Bill modal
                  let eventOpt = '<option value="">-- None (General Expense) --</option>';
                  eventsData.forEach(function(ev) {
                      eventOpt += `<option value="${ev.id}">${ev.ename}</option>`;
                  });
                  $('#event_id').html(eventOpt);
                  
                  // Populate Event dropdown in filters
                  let filterEventOpt = '<option value="">All Events</option>';
                  eventsData.forEach(function(ev) {
                      filterEventOpt += `<option value="${ev.id}">${ev.ename}</option>`;
                  });
                  $('#filter-event').html(filterEventOpt);
              } else {
                  console.error("Error loading dropdown data: " + res.error);
              }
          });
      }

      function loadData() {
          let params = {
              start_date: $('#start-date').val(),
              end_date: $('#end-date').val(),
              status: $('#filter-status').val(),
              event_id: $('#filter-event').val()
          };

          $.getJSON('manage/get_bills.php', params, function(res) {
              if (res.success) {
                  allBills = res.bills;
                  allPayments = res.payments;

                  // Render stats
                  $('#kpi-unpaid').text('KES ' + res.stats.total_unpaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
                  $('#kpi-paid-month').text('KES ' + res.stats.total_paid_this_month.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
                  $('#kpi-event-linked').text(res.stats.event_linked_count);
                  $('#kpi-pending').text(res.stats.pending_count);

                  // Set date bounds if empty initially
                  if (!$('#start-date').val()) $('#start-date').val(res.date_bounds.start_date);
                  if (!$('#end-date').val()) $('#end-date').val(res.date_bounds.end_date);

                  renderBillsTable(res.bills);
                  renderPaymentsTable(res.payments);
              } else {
                  Swal.fire('Error', res.error || 'Failed to load data', 'error');
              }
          });
      }

      function renderBillsTable(bills) {
          let tbody = $('#bills-tbody');
          tbody.empty();
          if (bills.length === 0) {
              tbody.html('<tr><td colspan="10" class="text-center text-muted py-4">No bills recorded in this period</td></tr>');
              return;
          }

          bills.forEach(function(bill) {
              let statusBadge = '';
              if (bill.status === 'paid') {
                  statusBadge = '<span class="badge bg-label-success">Paid</span>';
              } else if (bill.status === 'partially_paid') {
                  statusBadge = '<span class="badge bg-label-warning">Partially Paid</span>';
              } else {
                  statusBadge = '<span class="badge bg-label-danger">Unpaid</span>';
              }

              let eventText = bill.event_title ? `<span class="badge bg-label-primary" title="${bill.event_budget_item_description || ''}"><i class="bx bx-calendar-event me-1"></i>${bill.event_title}</span>` : '<span class="text-muted small">-</span>';

              let payBtn = bill.status !== 'paid' ? `
                  <button class="btn btn-sm btn-icon btn-outline-success pay-bill-btn" data-id="${bill.id}" title="Pay Bill">
                      <i class="bx bx-credit-card"></i>
                  </button>
              ` : '';

              let row = `
                  <tr>
                      <td><strong>${bill.bill_number}</strong></td>
                      <td>${bill.vendor_name}</td>
                      <td>${bill.bill_date}</td>
                      <td>${bill.due_date}</td>
                      <td><span class="text-muted small">${bill.account_code} - ${bill.account_name}</span></td>
                      <td>KES ${bill.amount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                      <td>KES ${bill.balance_due.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                      <td>${statusBadge}</td>
                      <td>${eventText}</td>
                      <td>
                          <div class="d-flex gap-1">
                              <button class="btn btn-sm btn-icon btn-outline-primary view-bill-btn" data-id="${bill.id}" title="View Details">
                                  <i class="bx bx-show"></i>
                              </button>
                              ${payBtn}
                          </div>
                      </td>
                  </tr>
              `;
              tbody.append(row);
          });
      }

      function renderPaymentsTable(payments) {
          let tbody = $('#payments-tbody');
          tbody.empty();
          if (payments.length === 0) {
              tbody.html('<tr><td colspan="7" class="text-center text-muted py-4">No payments recorded in this period</td></tr>');
              return;
          }

          payments.forEach(function(payment) {
              let methodBadge = `<span class="badge bg-label-info">${payment.payment_method}</span>`;
              let row = `
                  <tr>
                      <td>${payment.payment_date}</td>
                      <td><strong>${payment.bill_number}</strong> <span class="text-muted small">(${payment.vendor_name})</span></td>
                      <td>${methodBadge}</td>
                      <td><code class="text-primary">${payment.reference_no || '-'}</code></td>
                      <td><strong>KES ${payment.amount.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</strong></td>
                      <td>${payment.recorded_by_name || 'System'}</td>
                      <td>
                          <button class="btn btn-sm btn-icon btn-outline-primary view-bill-btn" data-id="${payment.bill_id}" title="View Bill Details">
                              <i class="bx bx-show"></i>
                          </button>
                      </td>
                  </tr>
              `;
              tbody.append(row);
          });
      }

      function showBillDetailsModal(bill, payments) {
          $('#detail-bill-number').text(bill.bill_number);
          $('#detail-vendor-name').text(bill.vendor_name);
          $('#detail-bill-date').text(bill.bill_date);
          $('#detail-due-date').text(bill.due_date);
          $('#detail-amount').text('KES ' + bill.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
          $('#detail-balance').text('KES ' + bill.balance_due.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
          $('#detail-gl-account').text(`${bill.account_code} - ${bill.account_name}`);
          $('#detail-description').text(bill.description || '-');
          $('#detail-recorded-by').text(bill.recorded_by_name || 'System');
          
          let badge = '';
          if (bill.status === 'paid') badge = '<span class="badge bg-label-success">Paid</span>';
          else if (bill.status === 'partially_paid') badge = '<span class="badge bg-label-warning">Partially Paid</span>';
          else badge = '<span class="badge bg-label-danger">Unpaid</span>';
          $('#detail-status').html(badge);

          if (bill.event_title) {
              $('#detail-event-section').show();
              $('#detail-event-title').text(bill.event_title);
              $('#detail-event-item').text(bill.event_budget_item_description || '-');
          } else {
              $('#detail-event-section').hide();
          }

          let pTbody = $('#detail-payments-tbody');
          pTbody.empty();
          if (payments.length === 0) {
              pTbody.html('<tr><td colspan="4" class="text-center text-muted small py-2">No payments recorded for this bill</td></tr>');
          } else {
              payments.forEach(function(p) {
                  pTbody.append(`
                      <tr>
                          <td>${p.payment_date}</td>
                          <td><span class="badge bg-label-info">${p.payment_method}</span></td>
                          <td><code>${p.reference_no || '-'}</code></td>
                          <td><strong>KES ${p.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                      </tr>
                  `);
              });
          }

          $('#viewBillDetailsModal').modal('show');
      }

      $(document).ready(function() {
          // Initial loads
          loadDropdownData();
          loadData();

          // Date inputs defaults to today
          let todayStr = new Date().toISOString().split('T')[0];
          $('#bill_date').val(todayStr);
          $('#bill_due_date').val(todayStr);

          // Event Selection Changes
          $('#event_id').change(function() {
              let selEventId = $(this).val();
              let itemDropdown = $('#event_budget_item_id');
              
              if (!selEventId) {
                  itemDropdown.html('<option value="">-- Select an Event first --</option>').prop('disabled', true);
                  return;
              }

              let filteredItems = budgetItemsData.filter(item => item.event_id == selEventId);
              let itemOpt = '<option value="">-- Select Event Budget Item --</option>';
              if (filteredItems.length === 0) {
                  itemOpt += '<option value="" disabled>No approved budget items found for this event</option>';
              } else {
                  filteredItems.forEach(function(item) {
                      itemOpt += `<option value="${item.item_id}" data-gl="${item.gl_account_id}" data-bal="${item.remaining_balance}">
                          ${item.description} (Remaining: KES ${item.remaining_balance.toFixed(2)})
                      </option>`;
                  });
              }
              itemDropdown.html(itemOpt).prop('disabled', false);
          });

          // Auto-select GL account when budget item changes
          $('#event_budget_item_id').change(function() {
              let selectedOption = $(this).find('option:selected');
              let glId = selectedOption.data('gl');
              if (glId) {
                  $('#gl_account_id').val(glId);
              }
          });

          // View Details click
          $(document).on('click', '.view-bill-btn', function() {
              let billId = $(this).data('id');
              let bill = allBills.find(b => b.id == billId);
              if (!bill) {
                  $.getJSON('manage/get_bills.php', {start_date: '1970-01-01', end_date: '2100-12-31'}, function(res) {
                      if (res.success) {
                          let fb = res.bills.find(b => b.id == billId);
                          if (fb) showBillDetailsModal(fb, res.payments.filter(p => p.bill_id == billId));
                      }
                  });
                  return;
              }
              let billPayments = allPayments.filter(p => p.bill_id == billId);
              showBillDetailsModal(bill, billPayments);
          });

          // Pay Button click
          $(document).on('click', '.pay-bill-btn', function() {
              let billId = $(this).data('id');
              let bill = allBills.find(b => b.id == billId);
              if (bill) {
                  $('#pay-bill-id').val(bill.id);
                  $('#pay-vendor-name').text(bill.vendor_name);
                  $('#pay-bill-number').text(bill.bill_number);
                  $('#pay-balance-due').text('KES ' + bill.balance_due.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
                  
                  $('#pay-amount').val(bill.balance_due).attr('max', bill.balance_due);
                  $('#pay-date').val(new Date().toISOString().split('T')[0]);
                  $('#pay-method').val('Cash');
                  $('#pay-reference').val('');
                  $('#pay-notes').val('');

                  $('#recordPaymentModal').modal('show');
              }
          });

          // Record Bill Submit
          $('#record-bill-form').submit(function(e) {
              e.preventDefault();
              let data = {
                  vendor_name: $('#bill_vendor').val(),
                  bill_number: $('#bill_no').val(),
                  bill_date: $('#bill_date').val(),
                  due_date: $('#bill_due_date').val(),
                  amount: parseFloat($('#bill_amount').val()),
                  gl_account_id: parseInt($('#gl_account_id').val()),
                  description: $('#bill_desc').val(),
                  event_id: $('#event_id').val(),
                  event_budget_item_id: $('#event_budget_item_id').val()
              };

              $.ajax({
                  url: 'manage/record_bill.php',
                  method: 'POST',
                  data: JSON.stringify(data),
                  contentType: 'application/json',
                  success: function(res) {
                      if (res.success) {
                          $('#newBillModal').modal('hide');
                          Swal.fire('Success', 'Bill recorded successfully!', 'success');
                          $('#record-bill-form')[0].reset();
                          $('#event_budget_item_id').html('<option value="">-- Select an Event first --</option>').prop('disabled', true);
                          loadData();
                          loadDropdownData();
                      } else {
                          Swal.fire('Error', res.error || 'Failed to record bill', 'error');
                      }
                  },
                  error: function(xhr) {
                      let err = xhr.responseJSON ? xhr.responseJSON.error : 'Failed to record bill';
                      Swal.fire('Error', err, 'error');
                  }
              });
          });

          // Record Payment Submit
          $('#record-payment-form').submit(function(e) {
              e.preventDefault();
              let data = {
                  bill_id: parseInt($('#pay-bill-id').val()),
                  amount: parseFloat($('#pay-amount').val()),
                  payment_date: $('#pay-date').val(),
                  payment_method: $('#pay-method').val(),
                  reference_no: $('#pay-reference').val(),
                  notes: $('#pay-notes').val()
              };

              $.ajax({
                  url: 'manage/record_bill_payment.php',
                  method: 'POST',
                  data: JSON.stringify(data),
                  contentType: 'application/json',
                  success: function(res) {
                      if (res.success) {
                          $('#recordPaymentModal').modal('hide');
                          Swal.fire('Success', 'Payment recorded successfully!', 'success');
                          loadData();
                          loadDropdownData();
                      } else {
                          Swal.fire('Error', res.error || 'Failed to record payment', 'error');
                      }
                  },
                  error: function(xhr) {
                      let err = xhr.responseJSON ? xhr.responseJSON.error : 'Failed to record payment';
                      Swal.fire('Error', err, 'error');
                  }
              });
          });

          // Filters handlers
          $('#filter-btn').click(function() {
              loadData();
          });

          $('#reset-btn').click(function() {
              $('#start-date').val('');
              $('#end-date').val('');
              $('#filter-status').val('');
              $('#filter-event').val('');
              loadData();
          });
      });
    </script>
  </body>
</html>
