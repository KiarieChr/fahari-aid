  <!-- Small Modal -->
  <div class="modal fade" id="newCohort" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel2">New Cohort</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="manage/add-cohort.php" method="post">
                <div class="modal-body">
                    <div class="row">
                        <div class="col mb-6">
                            <label>Cohort Name</label>
                            <input type="text" name="name" class="form-control" placeholder="2025 Cohort" />
                        </div>
                        <div class="col mb-6">
                            
                            <label for="nameSmall" class="form-label">Grade One Year</label>
                            <input type="text" name="grade_one" id="grade_one" class="form-control" placeholder="2025">
                        </div>
                    </div>

                    <div class="row">
                        <div class="col mb-6">
                            
                            <label for="nameSmall" class="form-label">Grade Six Expected Year</label>
                            <input type="text" name="grade_six" id="grade_six" class="form-control" placeholder="2030">
                        </div>
                        <div class="col mb-6">
                            
                            <label for="nameSmall" class="form-label">Grade Nine Expected Year</label>
                            <input type="text" name="grade_nine" id="grade_six" class="form-control" placeholder="2033">
                        </div>
                       <!-- Closing div for column -->
                    </div> <!-- Closing div for row -->
                    
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Save changes</button>
                </div>
            </form>
        </div>
    </div>
</div>

                        
  <!-- Large Modal -->
  <div class="modal fade" id="largeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel3">Modal title</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <div class="modal-body">
          
          
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <button type="button" class="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>
  <!-- Extra Large Modal -->
  <div class="modal fade" id="exLargeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel4">Modal title</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <div class="modal-body">
         
        


        
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <button type="button" class="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>