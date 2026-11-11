<?php
// accounting.php
require_once('includes/checklogin.php');
$title = "Jesus Enthroned Network - Finance | General Ledger & Statements";
include("includes/get_user.php");
?>
<!doctype html>
<html lang="en" class="layout-navbar-fixed layout-menu-fixed layout-compact" dir="ltr" data-skin="default" data-theme="light" data-assets-path="assets/" data-template="vertical-menu-template">
    <?php @include('includes/header.php');?>
    <style>
        .nav-tabs .nav-link.active {
            background-color: #f5f5f9;
            border-bottom-color: transparent;
            font-weight: 600;
        }
        .table-je-lines {
            background-color: #fafafa;
            border-left: 3px solid #696cff;
        }
        .debit-val {
            color: #2e7d32;
            font-weight: 600;
        }
        .credit-val {
            color: #c62828;
            font-weight: 600;
        }
        .balance-check {
            font-weight: bold;
            font-size: 1.1rem;
        }
        .balanced-text {
            color: #2e7d32;
        }
        .unbalanced-text {
            color: #c62828;
        }
    </style>
  <body>
    <!-- Layout wrapper -->
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <!-- Menu -->
        <?php @include('includes/sidebar.php'); ?> 
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
          <?php @include('includes/nav.php'); ?>
          <!-- / Navbar -->

          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Content -->
            <div class="container-xxl flex-grow-1 container-p-y">
              
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h4 class="fw-bold py-3 mb-0"><span class="text-muted fw-light">Finance /</span> General Ledger & Statements</h4>
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newJournalEntryModal">
                  <i class="bx bx-plus-circle me-1"></i> Add Manual Journal Entry
                </button>
              </div>

              <!-- Main Card with Tabs -->
              <div class="card mb-4">
                <div class="card-header p-0">
                  <ul class="nav nav-tabs nav-fill" role="tablist">
                    <li class="nav-item">
                      <button type="button" class="nav-link active" role="tab" data-bs-toggle="tab" data-bs-target="#navs-financial-statements" aria-controls="navs-financial-statements" aria-selected="true">
                        <i class="bx bx-file me-1"></i> Financial Statements
                      </button>
                    </li>
                    <li class="nav-item">
                      <button type="button" class="nav-link" role="tab" data-bs-toggle="tab" data-bs-target="#navs-chart-of-accounts" aria-controls="navs-chart-of-accounts" aria-selected="false">
                        <i class="bx bx-list-ul me-1"></i> Chart of Accounts
                      </button>
                    </li>
                    <li class="nav-item">
                      <button type="button" class="nav-link" role="tab" data-bs-toggle="tab" data-bs-target="#navs-journal-entries" aria-controls="navs-journal-entries" aria-selected="false">
                        <i class="bx bx-transfer-alt me-1"></i> Journal Entries
                      </button>
                    </li>
                  </ul>
                </div>
                <div class="card-body">
                  <div class="tab-content p-0">
                    
                    <!-- Tab 1: Financial Statements -->
                    <div class="tab-pane fade show active" id="navs-financial-statements" role="tabpanel">
                      <div class="row g-3 mb-4 align-items-end">
                        <div class="col-md-3">
                          <label class="form-label" for="statement-select">Select Statement</label>
                          <select id="statement-select" class="form-select">
                            <option value="balance_sheet">Balance Sheet</option>
                            <option value="income_statement" selected>Income Statement (P&L)</option>
                            <option value="trial_balance">Trial Balance</option>
                          </select>
                        </div>
                        <div class="col-md-3 date-range-inputs">
                          <label class="form-label" for="statement-start-date">Start Date</label>
                          <input type="date" id="statement-start-date" class="form-control" value="<?php echo date('Y-01-01'); ?>">
                        </div>
                        <div class="col-md-3 date-range-inputs">
                          <label class="form-label" for="statement-end-date">End Date</label>
                          <input type="date" id="statement-end-date" class="form-control" value="<?php echo date('Y-12-31'); ?>">
                        </div>
                        <div class="col-md-3 date-as-of-inputs d-none">
                          <label class="form-label" for="statement-as-of-date">As Of Date</label>
                          <input type="date" id="statement-as-of-date" class="form-control" value="<?php echo date('Y-m-d'); ?>">
                        </div>
                        <div class="col-md-3">
                          <button type="button" id="btn-load-statements" class="btn btn-outline-primary w-100">
                            <i class="bx bx-refresh me-1"></i> Load Statement
                          </button>
                        </div>
                      </div>

                      <div id="statement-output-container">
                        <!-- Statements Rendered here dynamically -->
                        <div class="text-center py-5">
                          <div class="spinner-border text-primary" role="status"></div>
                          <p class="mt-2 text-muted">Retrieving financial statement data...</p>
                        </div>
                      </div>
                    </div>

                    <!-- Tab 2: Chart of Accounts -->
                    <div class="tab-pane fade" id="navs-chart-of-accounts" role="tabpanel">
                      <div class="row mb-3 align-items-center">
                        <div class="col-md-8">
                          <h5 class="mb-0">Church General Ledger Accounts</h5>
                        </div>
                        <div class="col-md-4">
                          <select id="coa-filter-type" class="form-select">
                            <option value="all">All Account Types</option>
                            <option value="Asset">Assets</option>
                            <option value="Liability">Liabilities</option>
                            <option value="Equity">Equity</option>
                            <option value="Revenue">Revenues</option>
                            <option value="Expense">Expenses</option>
                          </select>
                        </div>
                      </div>

                      <div class="table-responsive text-nowrap">
                        <table class="table table-striped table-hover" id="coa-table">
                          <thead>
                            <tr>
                              <th>Code</th>
                              <th>Account Name</th>
                              <th>Account Type</th>
                              <th>Normal Balance</th>
                              <th>Associated Fund</th>
                              <th>Status</th>
                              <th>Description</th>
                            </tr>
                          </thead>
                          <tbody id="coa-tbody">
                            <!-- Accounts loaded via Ajax -->
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- Tab 3: Journal Entries -->
                    <div class="tab-pane fade" id="navs-journal-entries" role="tabpanel">
                      <div class="row g-3 mb-3 align-items-end">
                        <div class="col-md-3">
                          <label class="form-label" for="je-filter-type">Source Type</label>
                          <select id="je-filter-type" class="form-select">
                            <option value="">All Transactions</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                            <option value="contribution">Contribution</option>
                            <option value="pledge">Pledge</option>
                            <option value="pledge_redeem">Pledge Redemption</option>
                            <option value="adjustment">Manual Adjustment</option>
                            <option value="payroll">Payroll</option>
                          </select>
                        </div>
                        <div class="col-md-3">
                          <label class="form-label" for="je-start-date">Start Date</label>
                          <input type="date" id="je-start-date" class="form-control">
                        </div>
                        <div class="col-md-3">
                          <label class="form-label" for="je-end-date">End Date</label>
                          <input type="date" id="je-end-date" class="form-control">
                        </div>
                        <div class="col-md-3">
                          <button type="button" id="btn-load-je" class="btn btn-outline-primary w-100">
                            <i class="bx bx-filter me-1"></i> Filter Entries
                          </button>
                        </div>
                      </div>

                      <div class="table-responsive text-nowrap">
                        <table class="table table-hover" id="je-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Reference #</th>
                              <th>Description</th>
                              <th>Type</th>
                              <th>Period</th>
                              <th>Lines</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody id="je-tbody">
                            <!-- Journal entries loaded via Ajax -->
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
            <!-- / Content -->

            <!-- Footer -->
            <?php @include('includes/footer.php');?>
            <!-- / Footer -->
          </div>
          <!-- Content wrapper -->
        </div>
        <!-- / Layout page -->
      </div>
    </div>

    <!-- Modal: Add Manual Journal Entry -->
    <div class="modal fade" id="newJournalEntryModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bx bx-plus-circle me-1 text-primary"></i>Record Manual Journal Entry</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form id="newJournalEntryForm">
            <div class="modal-body">
              <div class="row g-3 mb-4">
                <div class="col-md-4">
                  <label for="je-entry-date" class="form-label">Entry Date</label>
                  <input type="date" id="je-entry-date" class="form-control" value="<?php echo date('Y-m-d'); ?>" required>
                </div>
                <div class="col-md-8">
                  <label for="je-description" class="form-label">Description / Memo</label>
                  <input type="text" id="je-description" class="form-control" placeholder="e.g. Correct bank charge account allocations" required>
                </div>
              </div>

              <h6 class="fw-semibold">Journal Entry Lines (Double-Entry Ledger)</h6>
              <div class="table-responsive">
                <table class="table table-bordered align-middle" id="je-lines-table">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 35%;">Account</th>
                      <th style="width: 20%;">Debit (KES)</th>
                      <th style="width: 20%;">Credit (KES)</th>
                      <th style="width: 20%;">Memo / Note</th>
                      <th style="width: 5%;" class="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody id="je-lines-tbody">
                    <!-- Lines appended here dynamically -->
                  </tbody>
                  <tfoot>
                    <tr>
                      <th class="text-end">Total:</th>
                      <th id="total-debit-cell" class="debit-val">0.00</th>
                      <th id="total-credit-cell" class="credit-val">0.00</th>
                      <th colspan="2" id="balanced-indicator" class="balance-check unbalanced-text">Unbalanced</th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <button type="button" class="btn btn-outline-secondary btn-sm mt-3" id="btn-add-je-line">
                <i class="bx bx-plus me-1"></i> Add Account Line
              </button>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" class="btn btn-primary" id="btn-save-je">Post Journal Entry</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <?php @include('includes/scripts.html');?>

    <!-- Custom accounting.js handler -->
    <script>
      $(document).ready(function() {
          let accountsList = [];

          // Format Currency helper
          function formatCurrency(amount) {
              return new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES',
                  minimumFractionDigits: 2
              }).format(amount);
          }

          // Fetch accounts list to populate selects and the Chart of Accounts tab
          function fetchAccounts() {
              $.ajax({
                  url: 'manage/get_chart_of_accounts.php',
                  method: 'GET',
                  data: { type: $('#coa-filter-type').val() },
                  success: function(res) {
                      if (res.success) {
                          accountsList = res.data.accounts;
                          renderCOA(accountsList);
                          
                          // Initialize journal entry form with 2 empty lines
                          if ($('#je-lines-tbody').children().length === 0) {
                              addJournalEntryLine();
                              addJournalEntryLine();
                          }
                      }
                  },
                  error: function(xhr) {
                      console.error('Error fetching accounts:', xhr);
                  }
              });
          }

          // Render Chart of Accounts
          function renderCOA(accounts) {
              const tbody = $('#coa-tbody');
              tbody.empty();
              if (accounts.length === 0) {
                  tbody.append('<tr><td colspan="7" class="text-center text-muted">No accounts found.</td></tr>');
                  return;
              }
              accounts.forEach(a => {
                  const badgeClass = a.is_active ? 'bg-label-success' : 'bg-label-danger';
                  const row = `
                      <tr>
                          <td><strong>${a.account_code}</strong></td>
                          <td>${a.account_name}</td>
                          <td><span class="badge bg-label-primary">${a.account_type}</span></td>
                          <td>${a.normal_balance}</td>
                          <td>${a.fund_name || '—'}</td>
                          <td><span class="badge ${badgeClass}">${a.is_active ? 'Active' : 'Inactive'}</span></td>
                          <td class="text-truncate" style="max-width: 200px;" title="${a.description || ''}">${a.description || '—'}</td>
                      </tr>
                  `;
                  tbody.append(row);
              });
          }

          // Fetch Journal Entries
          function fetchJournalEntries() {
              $.ajax({
                  url: 'manage/get_journal_entries.php',
                  method: 'GET',
                  data: {
                      source_type: $('#je-filter-type').val(),
                      start_date: $('#je-start-date').val(),
                      end_date: $('#je-end-date').val()
                  },
                  success: function(res) {
                      if (res.success) {
                          renderJournalEntries(res.data.entries);
                      }
                  },
                  error: function(xhr) {
                      console.error('Error fetching journal entries:', xhr);
                  }
              });
          }

          // Render Journal Entries
          function renderJournalEntries(entries) {
              const tbody = $('#je-tbody');
              tbody.empty();
              if (entries.length === 0) {
                  tbody.append('<tr><td colspan="7" class="text-center text-muted">No journal entries found.</td></tr>');
                  return;
              }
              entries.forEach(je => {
                  const badgeClass = je.is_reversed ? 'bg-label-danger' : 'bg-label-success';
                  const statusText = je.is_reversed ? 'Reversed' : 'Posted';
                  
                  // Construct line details
                  let linesHtml = '<table class="table table-sm table-borderless table-je-lines m-0">';
                  je.lines.forEach(line => {
                      const debitText = line.debit > 0 ? formatCurrency(line.debit) : '—';
                      const creditText = line.credit > 0 ? formatCurrency(line.credit) : '—';
                      linesHtml += `
                          <tr>
                              <td style="width: 50%;"><strong>${line.account_code}</strong> - ${line.account_name}</td>
                              <td style="width: 25%;" class="debit-val text-end">${debitText}</td>
                              <td style="width: 25%;" class="credit-val text-end">${creditText}</td>
                          </tr>
                      `;
                  });
                  linesHtml += '</table>';

                  const row = `
                      <tr>
                          <td>${je.entry_date}</td>
                          <td><strong>${je.reference_no}</strong></td>
                          <td>${je.description}</td>
                          <td><span class="badge bg-label-info">${je.source_type}</span></td>
                          <td>${je.period_name || '—'}</td>
                          <td>${linesHtml}</td>
                          <td><span class="badge ${badgeClass}">${statusText}</span></td>
                      </tr>
                  `;
                  tbody.append(row);
              });
          }

          // Fetch and render Financial Statements
          function fetchFinancialStatements() {
              const stmtType = $('#statement-select').val();
              const start = $('#statement-start-date').val();
              const end = $('#statement-end-date').val();
              const asOf = $('#statement-as-of-date').val();

              $('#statement-output-container').html(`
                  <div class="text-center py-5">
                      <div class="spinner-border text-primary" role="status"></div>
                      <p class="mt-2 text-muted">Processing financial values...</p>
                  </div>
              `);

              $.ajax({
                  url: 'manage/get_financial_statements.php',
                  method: 'GET',
                  data: {
                      type: stmtType,
                      start_date: start,
                      end_date: end,
                      as_of_date: asOf
                  },
                  success: function(res) {
                      if (res.success) {
                          renderStatement(stmtType, res.data);
                      } else {
                          $('#statement-output-container').html(`<div class="alert alert-danger">Error: ${res.error}</div>`);
                      }
                  },
                  error: function(xhr) {
                      $('#statement-output-container').html('<div class="alert alert-danger">Failed to connect to ledger statement API.</div>');
                  }
              });
          }

          // Render specific financial statements
          function renderStatement(type, data) {
              const container = $('#statement-output-container');
              container.empty();

              if (type === 'balance_sheet') {
                  const bs = data.balance_sheet;
                  let assetsRows = '';
                  bs.assets.forEach(a => {
                      assetsRows += `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${a.account_code} - ${a.account_name}</td><td class="text-end">${formatCurrency(a.balance)}</td></tr>`;
                  });

                  let liabilitiesRows = '';
                  bs.liabilities.forEach(l => {
                      liabilitiesRows += `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${l.account_code} - ${l.account_name}</td><td class="text-end">${formatCurrency(l.balance)}</td></tr>`;
                  });

                  let equityRows = '';
                  bs.equity.forEach(e => {
                      equityRows += `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${e.account_code} - ${e.account_name}</td><td class="text-end">${formatCurrency(e.balance)}</td></tr>`;
                  });

                  const html = `
                      <div class="border rounded p-4 bg-light">
                          <h5 class="text-center fw-bold mb-1">JESUS ENTHRONED NETWORK</h5>
                          <h6 class="text-center text-muted mb-4">Balance Sheet — As of ${bs.as_of_date}</h6>
                          
                          <table class="table table-sm table-bordered bg-white">
                              <thead class="table-dark">
                                  <tr><th>Account details</th><th class="text-end" style="width: 30%;">Balance</th></tr>
                              </thead>
                              <tbody>
                                  <tr class="table-secondary"><th colspan="2">ASSETS</th></tr>
                                  ${assetsRows || '<tr><td colspan="2" class="text-center text-muted">No asset balances.</td></tr>'}
                                  <tr class="fw-bold bg-label-success"><td>Total Assets</td><td class="text-end">${formatCurrency(bs.total_assets)}</td></tr>

                                  <tr class="table-secondary"><th colspan="2">LIABILITIES</th></tr>
                                  ${liabilitiesRows || '<tr><td colspan="2" class="text-center text-muted">No liability balances.</td></tr>'}
                                  <tr class="fw-bold text-danger"><td>Total Liabilities</td><td class="text-end">${formatCurrency(bs.total_liabilities)}</td></tr>

                                  <tr class="table-secondary"><th colspan="2">EQUITY</th></tr>
                                  ${equityRows}
                                  <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Current Period Net Income (Loss)</td><td class="text-end">${formatCurrency(bs.net_income)}</td></tr>
                                  <tr class="fw-bold bg-label-info"><td>Total Equity</td><td class="text-end">${formatCurrency(bs.total_equity + bs.net_income)}</td></tr>

                                  <tr class="table-dark fw-bold">
                                      <td>TOTAL LIABILITIES AND EQUITY</td>
                                      <td class="text-end">${formatCurrency(bs.total_liabilities_and_equity)}</td>
                                  </tr>
                              </tbody>
                          </table>
                          <div class="mt-3 text-end">
                              <span class="badge ${bs.is_balanced ? 'bg-success' : 'bg-danger'} p-2">
                                  ${bs.is_balanced ? 'Balanced' : 'Out of Balance'}
                              </span>
                          </div>
                      </div>
                  `;
                  container.html(html);
              } 
              else if (type === 'income_statement') {
                  const pl = data.income_statement;
                  let revRows = '';
                  pl.revenue.forEach(r => {
                      revRows += `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${r.account_code} - ${r.account_name}</td><td class="text-end">${formatCurrency(r.amount)}</td></tr>`;
                  });

                  let expRows = '';
                  pl.expenses.forEach(e => {
                      expRows += `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${e.account_code} - ${e.account_name}</td><td class="text-end">${formatCurrency(e.amount)}</td></tr>`;
                  });

                  const html = `
                      <div class="border rounded p-4 bg-light">
                          <h5 class="text-center fw-bold mb-1">JESUS ENTHRONED NETWORK</h5>
                          <h6 class="text-center text-muted mb-4">Income Statement (Profit & Loss) — Period: ${pl.period.start_date} to ${pl.period.end_date}</h6>
                          
                          <table class="table table-sm table-bordered bg-white">
                              <thead class="table-dark">
                                  <tr><th>Operating Account</th><th class="text-end" style="width: 30%;">Amount</th></tr>
                              </thead>
                              <tbody>
                                  <tr class="table-secondary"><th colspan="2">REVENUE</th></tr>
                                  ${revRows || '<tr><td colspan="2" class="text-center text-muted">No revenue records found in this period.</td></tr>'}
                                  <tr class="fw-bold bg-label-success"><td>Total Revenue</td><td class="text-end">${formatCurrency(pl.total_revenue)}</td></tr>

                                  <tr class="table-secondary"><th colspan="2">OPERATING EXPENSES</th></tr>
                                  ${expRows || '<tr><td colspan="2" class="text-center text-muted">No expense records found in this period.</td></tr>'}
                                  <tr class="fw-bold text-danger"><td>Total Expenses</td><td class="text-end">${formatCurrency(pl.total_expenses)}</td></tr>

                                  <tr class="table-dark fw-bold">
                                      <td>NET OPERATING INCOME / SURPLUS</td>
                                      <td class="text-end ${pl.net_income >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(pl.net_income)}</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  `;
                  container.html(html);
              } 
              else if (type === 'trial_balance') {
                  const tb = data.trial_balance;
                  let rows = '';
                  tb.accounts.forEach(a => {
                      rows += `
                          <tr>
                              <td><strong>${a.account_code}</strong></td>
                              <td>${a.account_name}</td>
                              <td><span class="badge bg-label-secondary">${a.account_type}</span></td>
                              <td class="text-end debit-val">${a.debit > 0 ? formatCurrency(a.debit) : '—'}</td>
                              <td class="text-end credit-val">${a.credit > 0 ? formatCurrency(a.credit) : '—'}</td>
                          </tr>
                      `;
                  });

                  const html = `
                      <div class="border rounded p-4 bg-light">
                          <h5 class="text-center fw-bold mb-1">JESUS ENTHRONED NETWORK</h5>
                          <h6 class="text-center text-muted mb-4">Trial Balance — Period: ${tb.period.start_date} to ${tb.period.end_date}</h6>
                          
                          <table class="table table-sm table-bordered bg-white">
                              <thead class="table-dark">
                                  <tr>
                                      <th style="width: 15%;">Account Code</th>
                                      <th>Account Name</th>
                                      <th style="width: 15%;">Type</th>
                                      <th class="text-end" style="width: 20%;">Debit (KES)</th>
                                      <th class="text-end" style="width: 20%;">Credit (KES)</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  ${rows || '<tr><td colspan="5" class="text-center text-muted">No transactions recorded in this period.</td></tr>'}
                                  <tr class="table-dark fw-bold">
                                      <td colspan="3" class="text-end">Total:</td>
                                      <td class="text-end debit-val">${formatCurrency(tb.total_debit)}</td>
                                      <td class="text-end credit-val">${formatCurrency(tb.total_credit)}</td>
                                  </tr>
                              </tbody>
                          </table>
                          <div class="mt-3 text-end">
                              <span class="badge ${tb.is_balanced ? 'bg-success' : 'bg-danger'} p-2">
                                  ${tb.is_balanced ? 'Balanced' : 'Out of Balance'}
                              </span>
                          </div>
                      </div>
                  `;
                  container.html(html);
              }
          }

          // Handle statement select toggle dates
          $('#statement-select').on('change', function() {
              if ($(this).val() === 'balance_sheet') {
                  $('.date-range-inputs').addClass('d-none');
                  $('.date-as-of-inputs').removeClass('d-none');
              } else {
                  $('.date-range-inputs').removeClass('d-none');
                  $('.date-as-of-inputs').addClass('d-none');
              }
          });

          // Trigger Loaders
          $('#btn-load-statements').on('click', fetchFinancialStatements);
          $('#btn-load-je').on('click', fetchJournalEntries);
          $('#coa-filter-type').on('change', fetchAccounts);

          // Add Dynamic Line Row in manual entry modal
          function addJournalEntryLine() {
              let options = '<option value="" disabled selected>Choose Account...</option>';
              accountsList.forEach(a => {
                  options += `<option value="${a.id}">${a.account_code} - ${a.account_name} (${a.account_type})</option>`;
              });

              const tr = `
                  <tr class="je-line-row">
                      <td>
                          <select class="form-select account-select" required>
                              ${options}
                          </select>
                      </td>
                      <td>
                          <input type="number" class="form-control line-debit" min="0" step="0.01" value="0.00" style="text-align: right;">
                      </td>
                      <td>
                          <input type="number" class="form-control line-credit" min="0" step="0.01" value="0.00" style="text-align: right;">
                      </td>
                      <td>
                          <input type="text" class="form-control line-memo" placeholder="Optional notes">
                      </td>
                      <td class="text-center">
                          <button type="button" class="btn btn-outline-danger btn-sm btn-remove-line"><i class="bx bx-trash"></i></button>
                      </td>
                  </tr>
              `;
              $('#je-lines-tbody').append(tr);
          }

          $('#btn-add-je-line').on('click', addJournalEntryLine);

          // Remove line row
          $(document).on('click', '.btn-remove-line', function() {
              if ($('#je-lines-tbody').children().length <= 2) {
                  alert('A manual journal entry must contain at least 2 account lines.');
                  return;
              }
              $(this).closest('tr').remove();
              recalculateTotals();
          });

          // Debit/Credit input behavior (a row can only have debit OR credit, not both)
          $(document).on('input', '.line-debit', function() {
              if (parseFloat($(this).val()) > 0) {
                  $(this).closest('tr').find('.line-credit').val('0.00');
              }
              recalculateTotals();
          });

          $(document).on('input', '.line-credit', function() {
              if (parseFloat($(this).val()) > 0) {
                  $(this).closest('tr').find('.line-debit').val('0.00');
              }
              recalculateTotals();
          });

          // Recalculate totals and check balances
          function recalculateTotals() {
              let totalDebit = 0;
              let totalCredit = 0;

              $('.line-debit').each(function() {
                  totalDebit += parseFloat($(this).val()) || 0;
              });

              $('.line-credit').each(function() {
                  totalCredit += parseFloat($(this).val()) || 0;
              });

              $('#total-debit-cell').text(totalDebit.toFixed(2));
              $('#total-credit-cell').text(totalCredit.toFixed(2));

              const diff = Math.abs(totalDebit - totalCredit);
              const indicator = $('#balanced-indicator');

              if (diff < 0.01 && totalDebit > 0) {
                  indicator.text('Balanced').removeClass('unbalanced-text').addClass('balanced-text');
                  $('#btn-save-je').prop('disabled', false);
              } else {
                  indicator.text('Unbalanced').removeClass('balanced-text').addClass('unbalanced-text');
                  $('#btn-save-je').prop('disabled', true);
              }
          }

          // Handle Journal Entry Post Form Submit
          $('#newJournalEntryForm').on('submit', function(e) {
              e.preventDefault();

              let lines = [];
              let isValid = true;

              $('.je-line-row').each(function() {
                  const accountId = $(this).find('.account-select').val();
                  const debit = parseFloat($(this).find('.line-debit').val()) || 0;
                  const credit = parseFloat($(this).find('.line-credit').val()) || 0;
                  const memo = $(this).find('.line-memo').val();

                  if (!accountId) {
                      alert('Please select an account for all lines.');
                      isValid = false;
                      return false;
                  }

                  if (debit === 0 && credit === 0) {
                      alert('All lines must have a positive Debit or Credit value.');
                      isValid = false;
                      return false;
                  }

                  lines.push({
                      account_id: accountId,
                      debit: debit,
                      credit: credit,
                      description: memo
                  });
              });

              if (!isValid) return;

              const payload = {
                  entry_date: $('#je-entry-date').val(),
                  description: $('#je-description').val(),
                  lines: lines
              };

              // Post to custom AJAX endpoint
              $.ajax({
                  url: 'manage/add_journal_entry.php',
                  method: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify(payload),
                  success: function(res) {
                      if (res.success) {
                          alert('Journal entry posted successfully.');
                          $('#newJournalEntryModal').modal('hide');
                          $('#newJournalEntryForm')[0].reset();
                          $('#je-lines-tbody').empty();
                          addJournalEntryLine();
                          addJournalEntryLine();
                          recalculateTotals();
                          
                          // Refresh lists
                          fetchJournalEntries();
                          fetchFinancialStatements();
                      } else {
                          alert('Error posting journal entry: ' . res.error);
                      }
                  },
                  error: function(xhr) {
                      const res = xhr.responseJSON;
                      alert('Failed to post entry: ' + (res ? res.error : 'Server error'));
                  }
              });
          });

          // Initialization calls
          fetchAccounts();
          fetchJournalEntries();
          fetchFinancialStatements();
      });
    </script>
  </body>
</html>
