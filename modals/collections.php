<?php

//  modals for collections page

?>

<!-- bootstrap static modal -->
 <div class="modal fade" id="newCollection" tabindex="-1" aria-hidden="true" >
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalCenterTitle">Record New Collection/Receipt</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form id="collectionForm" action="manage/record_collection.php" method="POST">
        <div class="modal-body">
          
            <div class="row">
              <div class="mb-3 col-md-6">
                <label for="payee" class="form-label">Payee Full Name</label>
                <input
                  type="text"
                  id="payee"
                  name="payee"
                  class="form-control"
                  placeholder="Enter full name of payee"
                  required
                />
                <div class="invalid-feedback">Please enter the payee's full name.</div>
              </div>
              <div class="mb-3 col-md-6">
                <label for="payment_mode" class="form-label">Payment Method</label>
                <select id="payment_mode" name="payment_mode" class="form-select" required>
                  <option value="" disabled selected>Select payment method</option>
                  <option value="Cash">Cash</option>
                  <option value="MPESA">Mobile Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
                <div class="invalid-feedback">Please select a payment method.</div>
              </div>
            </div>
            
            <div class="row">
              <div class="mb-3 col-md-6">
                <label for="payment_for" class="form-label">Payment For</label>
                <select name="payment_for" id="payment_for" class="form-select" required>
                  <option value="" disabled selected>Select payment purpose</option>
                  <option value="Event Registration">Event Registration</option>
                  <option value="Pledge Redemption">Commitment Redemption</option>
                  <option value="Tithe">Tithe</option>
                  <option value="Offering">Offering</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Other">Other (Specify)</option>
                </select>
                <div class="invalid-feedback">Please enter what the payment is for.</div>

              </div>
              <div class="mb-3 col-md-6" id="purpose">
                <!-- Automatically prompt the user to select the registration event if payment for is Event Registration, pledge redemption user or etc using js -->

              </div>
            </div>
            <div class="row">
              <div class="mb-3 col-md-6">
                <label for="amount" class="form-label">Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  class="form-control"
                  placeholder="Enter amount"
                  required
                />
                <div class="invalid-feedback">Please enter the amount.</div>
              </div>
              <div class="mb-3 col-md-6">
                <label for="transaction_id" class="form-label">Transaction ID (if applicable)</label>
                <input
                  type="text"
                  id="transaction_id"
                  name="transaction_id"
                  class="form-control"
                  placeholder="Enter transaction ID"
                />
                <div class="invalid-feedback">Please enter the transaction ID.</div>
              </div>
            </div>
            <div class="row">
                <div class="mb-3 col-md-6">
                    <label for="recorded_on" class="form-label">Collection Date</label>
                    <input
                      type="date"
                      id="recorded_on"
                      name="recorded_on"
                      class="form-control"
                       required
                       value="<?php echo date('Y-m-d'); ?>"
                       disabled
                    />
                    <div class="invalid-feedback">Please select the collection date.</div>
                    </div>
                </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
                Close
            </button>
            <button type="submit" class="btn btn-primary">Save Collection</button>
        </div>
        </form>
        </div>
    </div>
    </div>
<!--/ bootstrap static modal -->
<!-- Javascript to handle backend calls and front end user experience -->
 <script>
  document.addEventListener('DOMContentLoaded', () => {
    const paymentFor = document.getElementById('payment_for');
    const purpose = document.getElementById('purpose');
    const collectionForm = document.getElementById('collectionForm');
    const submitBtn = collectionForm ? collectionForm.querySelector('button[type="submit"]') : null;

    function createSelect(id, name, placeholder, options = []){
      const wrapper = document.createElement('div');
      wrapper.className = 'mb-3';

      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.className = 'form-label';
      label.textContent = placeholder;

      const select = document.createElement('select');
      select.id = id;
      select.name = name;
      select.className = 'form-select';
      select.required = true;

      const empty = document.createElement('option');
      empty.value = '';
      empty.disabled = true;
      empty.selected = true;
      empty.textContent = `Select ${placeholder.toLowerCase()}`;
      select.appendChild(empty);

      options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        select.appendChild(o);
      });

      const feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      feedback.textContent = `Please select ${placeholder.toLowerCase()}.`;

      wrapper.appendChild(label);
      wrapper.appendChild(select);
      wrapper.appendChild(feedback);

      return wrapper;
    }

    function createTextInput(id, name, labelText, placeholderText){
      const wrapper = document.createElement('div');
      wrapper.className = 'mb-3 col-md-6';

      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.className = 'form-label';
      label.textContent = labelText;

      const input = document.createElement('input');
      input.type = 'text';
      input.id = id;
      input.name = name;
      input.className = 'form-control';
      input.placeholder = placeholderText;
      input.required = true;

      const feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      feedback.textContent = `Please enter ${labelText.toLowerCase()}.`;

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      wrapper.appendChild(feedback);

      return wrapper;
    }

    async function fetchOptions(endpoint){
      try{
        const res = await fetch(endpoint, {cache: 'no-store'});
        if(!res.ok) throw new Error('Network response not ok');
        const data = await res.json();
        if(!Array.isArray(data)) return [];
        return data;
      }catch(err){
        return [];
      }
    }

    async function renderPurpose(value){
      purpose.innerHTML = '';
      if(!value) return;

      if(value === 'Event Registration'){
        const options = await fetchOptions('api/events_list.php');
        if(options.length){
          purpose.appendChild(createSelect('event_id', 'event_id', 'Event', options));
        }else{
          purpose.appendChild(createTextInput('event_name', 'event_name', 'Event Name', 'Enter event name'));
        }
      } else if(value === 'Pledge Redemption'){
        const options = await fetchOptions('api/pledges_list.php');
        if(options.length){
          purpose.appendChild(createSelect('pledge_id', 'pledge_id', 'Pledge', options));
        }else{
          purpose.appendChild(createTextInput('pledge_name', 'pledge_name', 'Pledge Reference', 'Enter pledge reference'));
        }
      } else if(value === 'Partnership'){
        purpose.appendChild(createTextInput('partnership_note', 'partnership_note', 'Partnership Note', 'e.g., Partner organization or reason'));
      } else if(value === 'Other'){
        purpose.appendChild(createTextInput('other_purpose', 'other_purpose', 'Specify Purpose', 'Describe the payment purpose'));
      } else {
        // For Tithe, Offering, etc. we do not need additional fields
        purpose.innerHTML = '';
      }
    }

    if(paymentFor && paymentFor.value) renderPurpose(paymentFor.value);

    if(paymentFor){
      paymentFor.addEventListener('change', (e) => {
        renderPurpose(e.target.value);
      });
    }

    if(collectionForm){
      collectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        collectionForm.classList.add('was-validated');
        if(!collectionForm.checkValidity()) return;

        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        if(submitBtn){ submitBtn.disabled = true; submitBtn.innerHTML = 'Saving...'; }

        try{
          const formData = new FormData(collectionForm);
          const recordedOn = document.getElementById('recorded_on');
          if(recordedOn && recordedOn.disabled){ formData.set(recordedOn.name, recordedOn.value); }

          const res = await fetch(collectionForm.action, { method: collectionForm.method || 'POST', body: formData });
          const data = await res.json().catch(() => ({ success: false, message: 'Invalid JSON response from server' }));

          if(res.ok && data && data.success){
            const alert = document.createElement('div');
            alert.className = 'alert alert-success w-100';
            alert.role = 'alert';
            alert.textContent = data.message || 'Collection recorded successfully.';
            collectionForm.prepend(alert);

            setTimeout(() => {
              const modalEl = document.getElementById('newCollection');
              const modal = (window.bootstrap && bootstrap.Modal) ? (bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)) : null;
              if(modal) modal.hide();
              collectionForm.reset();
              collectionForm.classList.remove('was-validated');
              alert.remove();
            }, 900);
          } else {
            const errMsg = (data && data.message) ? data.message : 'Failed to record collection.';
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger w-100';
            alert.role = 'alert';
            alert.textContent = errMsg;
            collectionForm.prepend(alert);
          }
        } catch(err){
          const alert = document.createElement('div');
          alert.className = 'alert alert-danger w-100';
          alert.role = 'alert';
          alert.textContent = 'Network error — could not save. Please try again.';
          collectionForm.prepend(alert);
        } finally {
          if(submitBtn){ submitBtn.disabled = false; submitBtn.innerHTML = originalBtnHtml; }
        }
      });
    }
  });
 </script>