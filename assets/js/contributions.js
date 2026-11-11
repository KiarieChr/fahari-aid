// javascript code for contributions page

// function to handle ajax population of contributions table
// convert to 
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function loadContributions() {
    fetch('api/get_contributions.php')
        .then(function(response) {
            if (!response.ok) throw new Error(response.statusText || 'Network response was not ok');
            return response.json();
        })
        .then(function(data) {
            var contributionsTableBody = document.getElementById('contributionsTableBody');
            if (!contributionsTableBody) return;
            contributionsTableBody.innerHTML = '';

            data.forEach(function(contribution, index) {
                var row = '\
<tr>\
    <td>' + (index + 1) + '</td>\
    <td>' + escapeHtml(contribution.full_name) + '</td>\
    <td>' + escapeHtml(contribution.phone_no) + '</td>\
    <td>' + escapeHtml(contribution.total_pledged) + '</td>\
    <td>' + escapeHtml(contribution.total_redeemed) + '</td>\
    <td>\
        <div class="dropdown">\
            <button class="btn btn-sm btn-secondary dropdown-toggle hide-arrow" type="button" data-bs-toggle="dropdown" aria-expanded="false">\
                <i class="bx bx-dots-vertical-rounded"></i>Actions\
            </button>\
            <div class="dropdown-menu">\
                <li><a class="dropdown-item btn btn-primary" href="view_contribution.php?id=' + encodeURIComponent(contribution.email) + '"><i class="bx bx-file"></i> Contribution Statement</a></li>\
                <li><a class="dropdown-item edit-contribution" href="#" data-id="' + encodeURIComponent(contribution.email) + '"><i class="bx bx-envelope "></i> Send Verification</a></li>\
                <li><a class="dropdown-item delete-contribution" href="#" data-id="' + encodeURIComponent(contribution.email) + '"><i class="bx bx-trash"></i> Delete</a></li>\
            </div>\
        </div>\
    </td>\
</tr>';

                contributionsTableBody.insertAdjacentHTML('beforeend', row);
            });
        })
        .catch(function(err) {
            console.error('Error loading contributions:', err);
        });
}
document.addEventListener('DOMContentLoaded', function () {
    const selectEl = document.getElementById('contributors');
    const infoWrapper = document.getElementById('contributor-info');
    const hiddenId = document.getElementById('contributor');
    const hiddenEmail = document.getElementById('email');
    const totalPledgedInput = document.getElementById('total_pledged');
    const totalRedeemedInput = document.getElementById('total_redeemed');

    let controller = null;
    // tomselect for contributors select input
    new TomSelect(selectEl, {
        placeholder: 'Select contributor',
        plugins: ['remove_button'],
        onChange: (value) => {
            fetchContributor(value);
        }
    });

    function clearInfo() {
        hiddenId.value = '';
        hiddenEmail.value = '';
        infoWrapper.innerHTML = '';
    }
    function showToast(title, message, icon){
        // create a boostrap toast dynamically
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1100';   
        const toastEl = document.createElement('div');
        toastEl.className = 'toast align-items-center text-bg-' + (icon === 'success' ? 'success' : 'danger') + ' border-0';
        toastEl.setAttribute('role', 'alert');  
        toastEl.setAttribute('aria-live', 'assertive');  
        toastEl.setAttribute('aria-atomic', 'true');
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}:</strong> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        toastContainer.appendChild(toastEl);
        document.body.appendChild(toastContainer);

        // Show the toast
        const toast = new bootstrap.Toast(toastEl);
        toast.show();

        // Remove the toast after a timeout
        setTimeout(() => {
            toast.hide();
            toastEl.remove();
        }, 5000);
    }

    function renderInfo(data) {
        // clear previous
        infoWrapper.innerHTML = '';

        const container = document.createElement('div');
        container.className = 'card p-2';

        const name = document.createElement('div');
        name.className = 'fw-semibold';
        name.textContent = data.full_name || 'Unknown';

        const email = document.createElement('div');
        email.className = 'text-muted small';
        email.textContent = data.email ? `Email: ${data.email}` : 'Email: —';

        const phone = document.createElement('div');
        phone.className = 'text-muted small';
        if (data.phone_no) phone.textContent = `Phone: ${data.phone_no}`;

        const meta = document.createElement('div');
        meta.className = 'small mt-1';
        const last = data.total_pledged ? `Total Committed: ${data.total_pledged}` : '';
        const total = (data.total_redeemed !== undefined) ? `Total Redeemed: ${data.total_redeemed}` : '';
        meta.textContent = [last, total].filter(Boolean).join(' • ');
        // set hidden inputs for totals
        totalPledgedInput.value = data.total_pledged || 0;
        if (data.total_redeemed !== undefined || data.total_redeemed === 'null') {
            totalRedeemedInput.value = data.total_redeemed || 0;
        }
        totalRedeemedInput.value = data.total_redeemed || 0;


        container.appendChild(name);
        container.appendChild(email);
        if (phone.textContent) container.appendChild(phone);
        if (meta.textContent) container.appendChild(meta);

        infoWrapper.appendChild(container);

        // set hidden fields for form
        if (data.full_name) hiddenId.value = data.full_name;
        if (data.email) hiddenEmail.value = data.email;
    }
    function verifyAmount(){
        const amountInput = document.getElementById('amount');
        const amount = parseFloat(amountInput.value) || 0;
        const total_pledged = parseFloat(totalPledgedInput.value) || 0;
        const total_redeemed = parseFloat(totalRedeemedInput.value) || 0;
        const remaining = total_pledged - total_redeemed;

        if(amount > remaining){
            // SShow a confirmation sweetalert
        const modalEl = document.querySelector('.modal.show');
        if (modalEl) modalEl.classList.add('blurred');

            Swal.fire({
            title: 'Exceeds Commitment',
            text: `The contribution amount exceeds the remaining commitment of ${remaining}`,
            icon: 'warning',
            confirmButtonText: 'Confirm & Proceed',
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            focusConfirm: true,
            cancelButtonText: 'Cancel',
            didOpen: (popup) => {
                popup.focus(); // ensure SweetAlert takes focus
                // temporarily remove aria-hidden from Bootstrap modal
                document.querySelectorAll('.modal').forEach(modal => modal.removeAttribute('aria-hidden'));
            }
            }).then((result) => {
            if (modalEl) modalEl.classList.remove('blurred');
            if (result.isConfirmed) {
                    // proceed with submission
                    return true;
                } else {
                    // clear amount field
                    document.getElementById('amount').value = '';
                    return false;
                }   
            });
            return false;
        }

    }
    // add an event listener on the amount input to verify against remaining commitment
    document.getElementById('amount').addEventListener('blur', function(){
        const amount = parseFloat(this.value) || 0;
        if(amount > 0){
            verifyAmount();
        }
    });

    async function fetchContributor(id) {
        if (!id) {
            clearInfo();
            return;
        }

        // abort previous
        if (controller) controller.abort();
        controller = new AbortController();

        // loading state
        infoWrapper.innerHTML = '<div class="small text-muted">Loading contributor info…</div>';

        try {
            // adjust URL to match your backend endpoint
            const res = await fetch('api/get_contributor.php?id=' + encodeURIComponent(id), {
                method: 'GET',
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) throw new Error('Network response was not ok');

            const data = await res.json();
            // expect JSON like { id, full_name, email, phone, last_contribution, total_contributions }
            renderInfo(data);
        } catch (err) {
            if (err.name === 'AbortError') return;
            infoWrapper.innerHTML = '<div class="text-danger small">Unable to load contributor info.</div>';
            hiddenId.value = '';
            hiddenEmail.value = '';
            console.error('fetchContributor error:', err);
        }
    }

    // initial clear
    clearInfo();

    selectEl.addEventListener('change', function (e) {
        const selected = e.target.value;
        // ignore placeholder values like "Select contributor" or "Active"
        if (!selected || selected === 'Select contributor' || selected === 'Active') {
            clearInfo();
            return;
        }
        fetchContributor(selected.trim());
    });
    // Handle form submission
    const form = document.querySelector('#contributionForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent default form submission

        //show loading state
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerText = 'Processing...';
        // disable the submit button
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        form.appendChild(loadingIndicator);
        loadingIndicator.scrollIntoView({ behavior: 'smooth' });


        const formData = new FormData(form);

        fetch('manage/process_contribution.php', {
            method: 'POST',
            body: formData
        }).then(response => {
            return response.json();
        }).then(data => {
            // remove loading state
            loadingIndicator.remove();
            submitButton.disabled = false;

            if (data.success) {
                // show a toast notification
                showToast('Success', data.message || 'Contribution recorded successfully.', 'success');
                // close the modal
                const modalEl = document.getElementById'newContribution');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                // Optionally, refresh the contributions table or update the UI
                // Reset the form
                form.reset();
            } else {
                showToast('Error', data.message || 'An error occurred while recording the contribution.', 'error');
            }
        }).catch(error => {
            // remove loading state
            loadingIndicator.remove();
            submitButton.disabled = false;

           showToast('Error', 'An unexpected error occurred. Please try again later.', 'error');
            console.error('Error submitting form:', error);
        });

        // Clean up
        controller = null;

    });

    // Load contributions on page load and refresh after every 60 seconds
    loadContributions();
    setInterval(loadContributions, 10000);

});

