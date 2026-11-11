// assets/js/collections.js
// Javascript code to manage receipt collections and display summaries

$(document).ready(function() {
    let collectionsList = [];
    let currentViewItem = null; // track the item currently shown in the view modal

    // Currency Formatter
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 2
        }).format(amount);
    }

    // Date Formatter (e.g. Jun 3, 2026)
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Function to fetch and display collections
    function fetchCollections(startDate, endDate) {
        $.ajax({
            url: 'manage/get_collections.php',
            method: 'GET',
            data: {
                start_date: startDate,
                end_date: endDate
            },
            success: function(response) {
                if (response && response.success) {
                    collectionsList = response.data.collections;
                    displayCollections(collectionsList);
                    updateKPIs(response.data.stats);
                    
                    // Pre-fill date inputs with the active financial year limits returned by the server if empty
                    if (!$('#start-date').val() && response.data.start_date) {
                        $('#start-date').val(response.data.start_date);
                    }
                    if (!$('#end-date').val() && response.data.end_date) {
                        $('#end-date').val(response.data.end_date);
                    }
                } else if (Array.isArray(response)) {
                    collectionsList = response;
                    displayCollections(collectionsList);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching collections:', error);
            }
        });
    }

    // Function to update the KPI metrics cards
    function updateKPIs(stats) {
        if (!stats) return;
        $('#kpi-today').text(formatCurrency(stats.today));
        $('#kpi-month').text(formatCurrency(stats.month));
        $('#kpi-pledges').text(formatCurrency(stats.pledges));
        $('#kpi-count').text(stats.count);
    }

    // Function to display collections in the bootstrap table
    function displayCollections(data) {
        var tableBody = $('#collections-table tbody');
        tableBody.empty(); // Clear existing data

        if (data.length === 0) {
            tableBody.append('<tr><td colspan="7" class="text-center text-muted py-4">No collection records found.</td></tr>');
            return;
        }

        // Populate table with new data
        $.each(data, function(index, item) {
            var row = $('<tr>');
            row.append($('<td>').html('<strong>' + item.id + '</strong>'));
            row.append($('<td>').text(item.payee));
            
            // Payment Method Badge
            var methodClass = 'bg-label-secondary';
            if (item.payment_mode === 'MPESA') methodClass = 'bg-label-success';
            else if (item.payment_mode === 'Cash') methodClass = 'bg-label-warning';
            else if (item.payment_mode === 'Bank Transfer') methodClass = 'bg-label-info';
            else if (item.payment_mode === 'Cheque') methodClass = 'bg-label-danger';
            var methodBadge = $('<span class="badge">').addClass(methodClass).text(item.payment_mode);
            row.append($('<td>').append(methodBadge));
            
            // Amount
            row.append($('<td>').addClass('fw-bold text-dark').text(formatCurrency(item.amount)));
            
            // Date
            row.append($('<td>').text(formatDate(item.recorded_on)));
            
            // Purpose Badge
            var purposeClass = 'bg-label-secondary';
            if (item.payment_for === 'Tithe') purposeClass = 'bg-label-success';
            else if (item.payment_for === 'Offering') purposeClass = 'bg-label-info';
            else if (item.payment_for === 'Pledge Redemption' || item.payment_for === 'Commitment Redemption') purposeClass = 'bg-label-primary';
            else if (item.payment_for === 'Event Registration') purposeClass = 'bg-label-warning';
            else if (item.payment_for === 'Partnership') purposeClass = 'bg-label-primary';
            var purposeBadge = $('<span class="badge">').addClass(purposeClass).text(item.payment_for);
            row.append($('<td>').append(purposeBadge));

            // Actions Button
            var actionBtn = $('<button type="button" class="btn btn-sm btn-outline-primary btn-view-details">')
                            .attr('data-id', item.id)
                            .html('<i class="bx bx-show-alt me-1"></i> View');
            row.append($('<td>').append(actionBtn));

            tableBody.append(row);
        });
    }

    // Render posting status badge in the modal
    function renderJournalStatus(item) {
        var $statusCell = $('#view-journal-status');
        var $panel = $('#post-journal-panel');
        var $alert = $('#post-journal-alert');

        $alert.hide().html('');
        $panel.hide();

        if (parseInt(item.is_posted) === 1 && item.journal_entry_id) {
            $statusCell.html(
                '<span class="badge bg-label-success me-2"><i class="bx bx-check-circle me-1"></i>Posted</span>' +
                '<small class="text-muted">Journal Entry #' + item.journal_entry_id + '</small>'
            );
        } else {
            $statusCell.html(
                '<span class="badge bg-label-warning"><i class="bx bx-time me-1"></i>Pending — Not Posted</span>'
            );
            // Pre-fill date with collection date
            var rawDate = item.recorded_on ? item.recorded_on.substring(0, 10) : new Date().toISOString().substring(0, 10);
            $('#post-entry-date').val(rawDate);
            $panel.show();
        }
    }

    // View Details button click event
    $(document).on('click', '.btn-view-details', function() {
        const id = $(this).attr('data-id');
        const item = collectionsList.find(x => String(x.id) == String(id));
        if (!item) return;

        currentViewItem = item;

        $('#view-receipt-id').text(item.id);
        $('#view-payee').text(item.payee);
        $('#view-method').text(item.payment_mode);
        $('#view-purpose').text(item.payment_for);
        $('#view-transaction-id').text(item.transaction_id || '—');
        $('#view-amount').text(formatCurrency(item.amount));
        $('#view-date').text(formatDate(item.recorded_on));
        $('#view-description').text(item.description || 'General Collection receipt record.');
        $('#view-modal-subtitle').text(item.source_type === 'pledge_redeem' ? 'Pledge Redemption Record' : 'Collection Record');

        renderJournalStatus(item);

        // Show Modal
        $('#viewReceiptModal').modal('show');
    });

    // Post to Journal button
    $(document).on('click', '#btn-post-journal', function() {
        if (!currentViewItem) return;

        var entryDate = $('#post-entry-date').val();
        var $btn = $(this);
        var $alert = $('#post-journal-alert');

        if (!entryDate) {
            $alert.show().html('<div class="alert alert-warning py-2 mb-0"><i class="bx bx-error-circle me-1"></i>Please select a transaction date before posting.</div>');
            return;
        }

        // Disable button while posting
        $btn.prop('disabled', true).html('<i class="bx bx-loader-alt bx-spin me-1"></i>Posting...');
        $alert.hide();

        $.ajax({
            url: 'manage/post_collection.php',
            method: 'POST',
            data: {
                collection_id: currentViewItem.id,
                entry_date: entryDate
            },
            success: function(res) {
                if (res && res.success) {
                    $alert.show().html(
                        '<div class="alert alert-success py-2 mb-0"><i class="bx bx-check-circle me-1"></i>' +
                        res.message + ' (JE #' + res.data.journal_entry_id + ')</div>'
                    );
                    // Update local data and re-render status
                    currentViewItem.is_posted = 1;
                    currentViewItem.journal_entry_id = res.data.journal_entry_id;
                    // Update in the main list too
                    var idx = collectionsList.findIndex(x => String(x.id) == String(currentViewItem.id));
                    if (idx !== -1) {
                        collectionsList[idx].is_posted = 1;
                        collectionsList[idx].journal_entry_id = res.data.journal_entry_id;
                    }
                    // Re-render status section
                    setTimeout(function() {
                        renderJournalStatus(currentViewItem);
                    }, 1500);
                } else {
                    $alert.show().html(
                        '<div class="alert alert-danger py-2 mb-0"><i class="bx bx-x-circle me-1"></i>' +
                        (res.message || 'Failed to post to journal.') + '</div>'
                    );
                    $btn.prop('disabled', false).html('<i class="bx bx-send me-1"></i> Post to Journal');
                }
            },
            error: function(xhr) {
                var msg = 'Server error. Please try again.';
                try { msg = JSON.parse(xhr.responseText).message || msg; } catch(e) {}
                $alert.show().html('<div class="alert alert-danger py-2 mb-0"><i class="bx bx-x-circle me-1"></i>' + msg + '</div>');
                $btn.prop('disabled', false).html('<i class="bx bx-send me-1"></i> Post to Journal');
            }
        });
    });

    // Event listener for date range filter
    $('#filter-btn').on('click', function() {
        var startDate = $('#start-date').val();
        var endDate = $('#end-date').val();
        fetchCollections(startDate, endDate);
    });

    // Event listener for reset
    $('#reset-btn').on('click', function() {
        $('#start-date').val('');
        $('#end-date').val('');
        fetchCollections('', '');
    });

    // Initial fetch
    fetchCollections('', '');
});