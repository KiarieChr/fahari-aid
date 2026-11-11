  <!-- Large Modal -->
  <div class="modal fade" id="newMember" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel3">New Member</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/add-member.php" method="post">
        <div class="modal-body">
            <div class="row">
              <div class="col mb-6">
                <label>Name</label>
                <input type="text" name="name" class="form-control" placeholder="John Wafula" />
              </div>
              <div class="col mb-6">
                <label>Email Address</label>
                <input type="email" name="email" class="form-control" placeholder="johnwafula@gmail.com" />
              </div>
            </div>
            <div class="row">
              <div class="col mb-6">
                <label>Phone Number</label>
                <input type="text" name="phone-no" class="form-control" placeholder="0700000000" />
              </div>
              <div class="col mb-6">
                <label>Date of Birth</label>
                <input type="date" name="dob" class="form-control" placeholder="4/30/2025" />
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