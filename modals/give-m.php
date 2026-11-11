
<div class="modal fade" id="makePayment" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel4">Update My Bio</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/process-payment.php" method="post" enctype="multipart/form-data">
          <div class="modal-body">
              <input type="hidden" name="user_id" value="<?= $user_id;?>">
              <label for="bod">Reason For Payment</label>
              <input type="text" name="reference" required class="form-control">
              <label for="bod">Mpesa Number</label>
              <input type="text" name="phone_no" required class="form-control">
              <label for="bod">Amount</label>
              <input type="text" name="amount" required class="form-control">
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