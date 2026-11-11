      <style>
    /* Custom styles for contributions page */
    .swal2-container {
      z-index: 9999 !important;
    }

    .modal {
      z-index: 1050 !important;
    }

    .modal-backdrop {
      z-index: 1040 !important;
    }

    /* Optional - subtle blur effect while SweetAlert is active */
    .modal.show.blurred {
      filter: blur(2px);
      transition: filter 0.2s ease-in-out;
    }
        /* Add border-radius for contrbutor infor card in the modal */
        #contributor-info{
            border-radius: 8px;
            border-left: 4px solid #1371ffff;
            padding: 0px;
            background-color: #f8f9fa;
            box-shadow: 0 2px 4px rgba(36, 5, 172, 0.59);

        }
    </style>
  <!-- Large Modal -->
  <div class="modal fade" id="newContribution" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel3">Record Commitment Contribution</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/process_contribution.php" method="post" id="contributionForm">
        <div class="modal-body">
            <div class="row">
              <div class=" mb-3">
                <label>Contributor Name</label>
                <!-- use tomselect to populate this field  -->
                 <select name="contributors" id="contributors" class="form-select mb-3">
                    <option value="Active">Select contributor</option>
                    <?php if (!empty($contributors)): ?>
                        <?php foreach ($contributors as $index => $row):
                    
                      ?>
                      <option value="<?php echo $row['id'];?> "><?php echo $row['full_name'];?></option>
                      <?php endforeach; ?> 
                     
                        <?php endif; ?>
                 </select>
                <div class="invalid-feedback">Please select a contributor.</div>
              </div>
              <div class="mb-3" id='contributor-info'>
                <!-- Contribution information will be displayed here dynamically using AJAX -->
                 
                
              </div>
            </div>
            
            
            <div class="row">
              <div class="mb-3">
                <!-- hide inputs that will be populated by the data from the ajax call   -->
                 <input type="hidden" id="total_pledged" name="total_pledged" value="">
                 <input type="hidden" id="total_redeemed" name="total_redeemed" value="">
                 <input type="hidden" id="contributor" name="contributor" value="">
                 <input type="hidden" id="email" name="email" value="">
                 <input type="hidden" id="user_id" name="user_id" value="<?= $user_id; ?>">
                <label for="amount" class="form-label">Contribution Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  class="form-control"
                  placeholder="Enter amount"
                />
              </div>
              <div class="mb-3">
                <label for="transaction_id" class="form-label">Transaction ID</label>
                <input
                  type="text"
                  id="transaction_id"
                  name="transaction_id"
                  class="form-control"
                  placeholder="Enter transaction ID"
                />
                <small>Enter the transaction reference for the payment. Eg. TRX123456 </small>
              </div>
            </div>
          
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <button type="submit" class="btn btn-primary">Save changes</button>
        </div>
        </form>
      </div>
    </div>
  </div>
<script>

</script>