<?php
// budgeting.php
require_once('includes/checklogin.php');
$title = "Jesus Enthroned Network - Finance | Budgeting Management";
include("includes/get_user.php");
?>
<!doctype html>
<html lang="en" class="layout-navbar-fixed layout-menu-fixed layout-compact" dir="ltr" data-skin="default" data-theme="light" data-assets-path="assets/" data-template="vertical-menu-template">
    <?php @include('includes/header.php');?>
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
                <h4 class="fw-bold py-3 mb-0"><span class="text-muted fw-light">Finance /</span> Budgeting Management</h4>
                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newBudgetModal">
                  <i class="bx bx-plus-circle me-1"></i> Create New Budget
                </button>
              </div>

              <!-- Budgets Table Card -->
              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Budgets Directory</h5>
                  <button class="btn btn-sm btn-outline-secondary" id="btn-refresh-budgets">
                    <i class="bx bx-refresh me-1"></i> Refresh
                  </button>
                </div>
                <div class="table-responsive text-nowrap">
                  <table class="table table-striped table-hover" id="budgets-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Budget Name</th>
                        <th>Purpose / Description</th>
                        <th>Total Allocated</th>
                        <th>Items Count</th>
                        <th>Status</th>
                        <th>Created Date</th>
                      </tr>
                    </thead>
                    <tbody id="budgets-tbody">
                      <!-- Loaded via Ajax -->
                      <tr>
                        <td colspan="7" class="text-center py-5">
                          <div class="spinner-border text-primary" role="status"></div>
                          <p class="mt-2 text-muted">Retrieving budgets list...</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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

    <!-- Modal: Create New Budget -->
    <div class="modal fade" id="newBudgetModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bx bx-plus-circle text-primary me-1"></i>Create New Budget Plan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form id="newBudgetForm">
            <div class="modal-body">
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label for="budget-name" class="form-label">Budget Name</label>
                  <input type="text" id="budget-name" class="form-control" placeholder="e.g. Youth Outreach 2026" required>
                </div>
                <div class="col-md-6">
                  <label for="budget-purpose" class="form-label">Purpose / Event / Description</label>
                  <input type="text" id="budget-purpose" class="form-control" placeholder="e.g. Budget allocation for secondary schools visit" required>
                </div>
              </div>

              <h6 class="fw-semibold">Budget Details / Line Items</h6>
              <div class="table-responsive">
                <table class="table table-bordered align-middle" id="budget-items-table">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 65%;">Item Description</th>
                      <th style="width: 25%;">Allocated Amount (KES)</th>
                      <th style="width: 10%;" class="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody id="budget-items-tbody">
                    <!-- Line items added dynamically -->
                  </tbody>
                  <tfoot>
                    <tr>
                      <th class="text-end">Total Allocation:</th>
                      <th id="budget-total-cell" class="fw-bold text-primary">0.00</th>
                      <th></th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <button type="button" class="btn btn-outline-secondary btn-sm mt-3" id="btn-add-budget-item">
                <i class="bx bx-plus me-1"></i> Add Line Item
              </button>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" class="btn btn-primary">Create Budget</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <?php @include('includes/scripts.html');?>

    <script>
      $(document).ready(function() {
          // Format Currency helper
          function formatCurrency(amount) {
              return new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES',
                  minimumFractionDigits: 2
              }).format(amount);
          }

          // Fetch budgets list
          function fetchBudgets() {
              $.ajax({
                  url: 'manage/get_budgets.php',
                  method: 'GET',
                  success: function(res) {
                      if (res.success) {
                          renderBudgets(res.data.budgets);
                      } else {
                          $('#budgets-tbody').html('<tr><td colspan="7" class="text-center text-danger">Failed to fetch budgets.</td></tr>');
                      }
                  },
                  error: function(xhr) {
                      $('#budgets-tbody').html('<tr><td colspan="7" class="text-center text-danger">Server connection error.</td></tr>');
                  }
              });
          }

          // Render budgets table rows
          function renderBudgets(budgets) {
              const tbody = $('#budgets-tbody');
              tbody.empty();
              if (budgets.length === 0) {
                  tbody.append('<tr><td colspan="7" class="text-center text-muted">No budget records found.</td></tr>');
                  return;
              }
              budgets.forEach(b => {
                  const badgeClass = b.is_active ? 'bg-label-success' : 'bg-label-danger';
                  const statusText = b.is_active ? 'Active' : 'Inactive';
                  
                  // Format created date
                  const createdDate = b.created_at ? b.created_at.split(' ')[0] : '—';

                  const row = `
                      <tr>
                          <td><strong>#${b.id}</strong></td>
                          <td><strong>${b.budget_name}</strong></td>
                          <td>${b.budget_purpose || '—'}</td>
                          <td class="fw-bold text-success">${formatCurrency(b.total_allocated)}</td>
                          <td>${b.item_count} items</td>
                          <td><span class="badge ${badgeClass}">${statusText}</span></td>
                          <td>${createdDate}</td>
                      </tr>
                  `;
                  tbody.append(row);
              });
          }

          // Dynamic line items row for create budget
          function addBudgetItemRow() {
              const tr = `
                  <tr class="budget-item-row">
                      <td>
                          <input type="text" class="form-control item-desc" placeholder="e.g. Venue setup or Printing banners" required>
                      </td>
                      <td>
                          <input type="number" class="form-control item-amount" min="0" step="0.01" placeholder="0.00" style="text-align: right;" required>
                      </td>
                      <td class="text-center">
                          <button type="button" class="btn btn-outline-danger btn-sm btn-remove-item-row"><i class="bx bx-trash"></i></button>
                      </td>
                  </tr>
              `;
              $('#budget-items-tbody').append(tr);
          }

          $('#btn-add-budget-item').on('click', addBudgetItemRow);

          // Remove line row
          $(document).on('click', '.btn-remove-item-row', function() {
              $(this).closest('tr').remove();
              recalculateBudgetTotal();
          });

          // Recalculate total budget allocation
          $(document).on('input', '.item-amount', recalculateBudgetTotal);

          function recalculateBudgetTotal() {
              let total = 0;
              $('.item-amount').each(function() {
                  total += parseFloat($(this).val()) || 0;
              });
              $('#budget-total-cell').text(formatCurrency(total));
          }

          // Refresh button click
          $('#btn-refresh-budgets').on('click', fetchBudgets);

          // Handle form submit
          $('#newBudgetForm').on('submit', function(e) {
              e.preventDefault();

              let items = [];
              let isValid = true;

              $('.budget-item-row').each(function() {
                  const desc = $(this).find('.item-desc').val().trim();
                  const amount = parseFloat($(this).find('.item-amount').val()) || 0;

                  if (!desc) {
                      alert('Please provide description for all items.');
                      isValid = false;
                      return false;
                  }
                  if (amount <= 0) {
                      alert('All items must have an amount greater than 0.');
                      isValid = false;
                      return false;
                  }

                  items.push({
                      description: desc,
                      amount: amount
                  });
              });

              if (!isValid) return;

              const payload = {
                  budget_name: $('#budget-name').val(),
                  budget_purpose: $('#budget-purpose').val(),
                  items: items
              };

              // Post new budget via AJAX
              $.ajax({
                  url: 'manage/add_budget.php',
                  method: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify(payload),
                  success: function(res) {
                      if (res.success) {
                          alert('Budget created successfully.');
                          $('#newBudgetModal').modal('hide');
                          $('#newBudgetForm')[0].reset();
                          $('#budget-items-tbody').empty();
                          recalculateBudgetTotal();
                          fetchBudgets();
                      } else {
                          alert('Error creating budget: ' + res.error);
                      }
                  },
                  error: function(xhr) {
                      const res = xhr.responseJSON;
                      alert('Failed to save budget: ' + (res ? res.error : 'Server error'));
                  }
              });
          });

          // Initialization: Fetch budgets list and init with 1 item row
          fetchBudgets();
          addBudgetItemRow();
      });
    </script>
  </body>
</html>
