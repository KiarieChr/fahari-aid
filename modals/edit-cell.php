<div class="modal fade" id="editCell-<?php echo $id;?>" tabindex="-1" aria-hidden="true">

    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel2">Re-Assign Cell Member</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"></button>
        </div>
        <form action="manage/update-cell.php" method="post">
          <div class="modal-body">
            <div class="row">
              <div class="col mb-6">
                <label>Member</label>
                <input type="hidden" value="<?=$id;?>" name="member">
                <input type="text" name="name" class="form-control disabled" placeholder="Manager" value = "<?php echo $name;?>" readonly/>
              </div>
            </div>
            <div class="row">
                <div class="col mb-6">
                <label class="form-label">Select Destination Cell</label>
                <select name="cell" class="form-select" required>
                    <option value="">Choose Cell...</option>
                    <?php
                    $stmt = $db->prepare("
                        SELECT c.id AS cell_id, c.code, c.name, m.first_name, m.last_name 
                        FROM cells c 
                        JOIN member m ON c.cell_leader = m.id 
                        WHERE c.id != :current_cell_id
                    ");
                    $stmt->execute([':current_cell_id' => $cell_id]);
                    $other_cells_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                    foreach ($other_cells_list as $oc_item) {
                        $fullName = htmlspecialchars($oc_item['first_name'] . ' ' . $oc_item['last_name']);
                        $cellDisp = htmlspecialchars($oc_item['code']);
                        if ($oc_item['name']) {
                            $cellDisp .= ' - ' . htmlspecialchars($oc_item['name']);
                        }
                        echo "<option value=\"{$oc_item['cell_id']}\">{$cellDisp} (Leader: {$fullName})</option>";
                    }
                    ?>
                </select>
                </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button name="re-assign" type="submit" class="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
</div>

<div class="modal fade" id="removeCell-<?php echo $id;?>" tabindex="-1" aria-hidden="true">

<div class="modal-dialog modal-sm" role="document">
  <div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel2">Remove From Cell</h5>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="modal"
        aria-label="Close"></button>
    </div>
    <form action="manage/update-cell.php" method="post">
      <div class="modal-body">
        <div class="row">
          <div class="col mb-6">
            <label>Member</label>
            <input type="hidden" value="<?=$id;?>" name="member">
            <input type="text" name="name" class="form-control disabled" placeholder="Manager" value = "<?php echo $name;?>" readonly/>
          </div>
        </div>
        <div class="row">
            <span>Are your sure you want to remove <br> this Record from the cell</span>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">
          Close
        </button>
        <button name="remove" type="submit" class="btn btn-danger">Yes, Remove From Cell</button>
      </div>
    </form>
  </div>
</div>