<?php
include('includes/checklogin.php');

// Fetch event_id from GET
$title = "Events | Jesus Enthroned Events Registration Form Setting";
include("includes/get_user.php");

$event_id = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;

// Save new/updated fields
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Reset all unique identifiers first
    $db->query("UPDATE event_registration_fields SET is_unique_identifier = 0 WHERE event_id = $event_id");
    
    foreach ($_POST['fields'] as $i => $field) {
        $label = trim($field['label']);
        $type = trim($field['type']);
        $options = trim($field['options']);
        $required = isset($field['required']) ? 1 : 0;
        $order = (int)$field['order'];
        $class = trim($field['class']);
        $is_unique = isset($field['is_unique']) ? 1 : 0;

        if (!empty($field['id'])) {
            // Update existing
            $id = (int)$field['id'];
            $db->query("UPDATE event_registration_fields SET 
                field_label='$label', field_type='$type', field_options='$options', 
                is_required=$required, field_order=$order, field_class='$class',
                is_unique_identifier=$is_unique
                WHERE id=$id AND event_id=$event_id");
        } else {
            // Insert new
            $db->query("INSERT INTO event_registration_fields 
                (event_id, field_label, field_type, field_options, is_required, field_order, field_class, is_unique_identifier)
                VALUES ($event_id, '$label', '$type', '$options', $required, $order, '$class', $is_unique)");
        }
    }
    header("Location: event_form_setting.php?event_id=$event_id&saved=1");
    exit;
}

// Fetch current fields
$fields = $db->query("SELECT * FROM event_registration_fields WHERE event_id = $event_id ORDER BY field_order ASC")->fetchAll(PDO::FETCH_ASSOC);
?>

<!doctype html>
<html lang="en">
    <?php @include('includes/header.php');?>

<!-- [Rest of your head section remains the same] -->
<body>
       <!-- Layout wrapper -->
<div class="layout-wrapper layout-content-navbar  ">
  <div class="layout-container">
     <!-- Menu -->
    <?php
          @include('includes/sidebar.php');
          ?>
        <!-- / Menu -->
         

    <div class="menu-mobile-toggler d-xl-none rounded-1">
      <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large text-bg-secondary p-2 rounded-1">
        <i class="bx bx-menu icon-base"></i>
        <i class="bx bx-chevron-right icon-base"></i>
      </a>
    </div>
    <!-- / Menu -->
     <!-- Layout container -->
    <div class="layout-page">
        <?php
          @include('includes/nav.php');
          ?>
        <div class="content-wrapper">
            <div class="container-xxl flex-grow-1 container-p-y">
                <div class="card my-6 border-0">
                    <div class="card-body row p-5 pb-6 g-6">
                        <h5 class="mb-2">Manage Registration Fields for Event</h5>
                        <div class="col-12">
                            <?php if (isset($_GET['saved'])): ?>
                                <div class="alert alert-success">Fields saved successfully!</div>
                            <?php endif; ?>

                            <form method="post">
                                <div id="fields-container">
                                    <?php foreach ($fields as $i => $field): ?>
                                        <div class="field-group row border p-3 mb-3">
                                            <div class="col-md-6">
                                                <input type="hidden" name="fields[<?= $i ?>][id]" value="<?= $field['id'] ?>">
                                                
                                                <div class="mb-3">
                                                    <label class="form-label">Label</label>
                                                    <input name="fields[<?= $i ?>][label]" class="form-control" value="<?= htmlspecialchars($field['field_label']) ?>" required>
                                                </div>
                                                
                                                <div class="mb-3">
                                                    <label class="form-label">CSS Class</label>
                                                    <input name="fields[<?= $i ?>][class]" class="form-control" value="<?= htmlspecialchars($field['field_class']) ?>">
                                                </div>
                                                
                                                <div class="mb-3">
                                                    <label class="form-label">Type</label>
                                                    <select class="form-select" name="fields[<?= $i ?>][type]">
                                                        <?php foreach (['text','email','number','date','select','textarea'] as $type): ?>
                                                            <option value="<?= $type ?>" <?= $field['field_type']==$type ? 'selected' : '' ?>>
                                                                <?= ucfirst($type) ?>
                                                            </option>
                                                        <?php endforeach; ?>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Options (for select)</label>
                                                    <input name="fields[<?= $i ?>][options]" class="form-control" 
                                                        value="<?= htmlspecialchars($field['field_options']) ?>" 
                                                        placeholder="Comma separated options">
                                                </div>
                                                
                                                <div class="mb-3 form-check">
                                                    <input type="checkbox" class="form-check-input" name="fields[<?= $i ?>][required]" 
                                                        id="required_<?= $i ?>" <?= $field['is_required'] ? 'checked' : '' ?>>
                                                    <label class="form-check-label" for="required_<?= $i ?>">Required Field</label>
                                                </div>
                                                
                                                <div class="mb-3 form-check">
                                                    <input type="checkbox" class="form-check-input" name="fields[<?= $i ?>][is_unique]" 
                                                        id="unique_<?= $i ?>" <?= $field['is_unique_identifier'] ? 'checked' : '' ?>
                                                        onchange="updateUniqueCheckboxes(this)">
                                                    <label class="form-check-label" for="unique_<?= $i ?>">Unique Identifier (prevents duplicates)</label>
                                                </div>
                                                
                                                <div class="mb-3">
                                                    <label class="form-label">Display Order</label>
                                                    <input type="number" class="form-control" name="fields[<?= $i ?>][order]" 
                                                        value="<?= $field['field_order'] ?>">
                                                </div>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                                
                                <button type="button" class="btn btn-outline-primary me-2" onclick="addField()">
                                    <i class="bx bx-plus"></i> Add Field
                                </button>
                                <button type="submit" class="btn btn-outline-success">
                                    <i class="bx bx-save"></i> Save Fields
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div> 
    </div>
    </div> 

    <?php include('includes/scripts.html'); ?>
    
    <script>
        let fieldIndex = <?= count($fields) ?>;
        
        function addField() {
            const container = document.getElementById('fields-container');
            const html = `
                <div class="field-group row border p-3 mb-3">
                    <div class="col-md-6">
                        <input type="hidden" name="fields[${fieldIndex}][id]" value="">
                        
                        <div class="mb-3">
                            <label class="form-label">Label</label>
                            <input name="fields[${fieldIndex}][label]" class="form-control" required>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">CSS Class</label>
                            <input name="fields[${fieldIndex}][class]" class="form-control">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Type</label>
                            <select name="fields[${fieldIndex}][type]" class="form-select">
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="select">Select</option>
                                <option value="textarea">Textarea</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Options (for select)</label>
                            <input name="fields[${fieldIndex}][options]" class="form-control" 
                                placeholder="Comma separated options">
                        </div>
                        
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" name="fields[${fieldIndex}][required]" 
                                id="required_${fieldIndex}">
                            <label class="form-check-label" for="required_${fieldIndex}">Required Field</label>
                        </div>
                        
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" name="fields[${fieldIndex}][is_unique]" 
                                id="unique_${fieldIndex}" onchange="updateUniqueCheckboxes(this)">
                            <label class="form-check-label" for="unique_${fieldIndex}">Unique Identifier</label>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Display Order</label>
                            <input type="number" class="form-control" name="fields[${fieldIndex}][order]" value="${fieldIndex}">
                        </div>
                    </div>
                </div>`;
            
            container.insertAdjacentHTML('beforeend', html);
            fieldIndex++;
        }
        
        function updateUniqueCheckboxes(clickedCheckbox) {
            if (clickedCheckbox.checked) {
                // Uncheck all other unique checkboxes
                document.querySelectorAll('input[name^="fields"][name$="[is_unique]"]').forEach(checkbox => {
                    if (checkbox !== clickedCheckbox) {
                        checkbox.checked = false;
                    }
                });
            }
        }
    </script>
</body>
</html>