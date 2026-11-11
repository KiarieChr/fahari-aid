<?php

$event_id = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;

echo "<script> window.location.href='registration.php?id=$event_id'</script>";
include('includes/connection.php');

// Fetch custom fields
$fields = $db->query("SELECT * FROM event_registration_fields WHERE event_id = $event_id ORDER BY field_order ASC")->fetchAll(PDO::FETCH_ASSOC);

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Insert into event_registrations
    $db->query("INSERT INTO event_registrations (event_id) VALUES ($event_id)");
    $registration_id = $db->lastInsertId();

    // Insert each field value
    
    $has_duplicate = false;
    $message = '';
    
    foreach ($fields as $field) {
        if ($field['is_unique_identifier']) {
            $field_id = $field['id'];
            $value = $_POST['field_' . $field_id] ?? '';
            
            // Check if this unique value already exists
            $stmt = $db->prepare("SELECT COUNT(*) FROM event_registration_data 
                                WHERE field_id = ? AND value = ?");
            $stmt->execute([$field_id, $value]);
            $count = $stmt->fetchColumn();
            
            if ($count > 0) {
                $has_duplicate = true;
                $message = "Error: The value '".htmlspecialchars($value)."' for field '".htmlspecialchars($field['field_label'])."' is already registered. You may have already registered!";
            }
        }
    }
    
    // If no duplicates found, proceed with registration
    if (!$has_duplicate) {
        try {
            $db->beginTransaction();
            
            // Insert into event_registrations
            $db->query("INSERT INTO event_registrations (event_id) VALUES ($event_id)");
            $registration_id = $db->lastInsertId();

            // Insert each field value
            foreach ($fields as $field) {
                $field_id = $field['id'];
                $value = $_POST['field_' . $field_id] ?? '';
                
                // Use prepared statement to prevent SQL injection
                $stmt = $db->prepare("INSERT INTO event_registration_data (registration_id, field_id, value)
                                    VALUES (?, ?, ?)");
                $stmt->execute([$registration_id, $field_id, $value]);
            }
            
            $db->commit();
            $message =  "Registration successful!";
        } catch (Exception $e) {
            $db->rollBack();
            $message =  "Registration failed: ".htmlspecialchars($e->getMessage());
        }
    }
}

?>

<html
  lang="en"
  class="layout-wide customizer-hide"
  data-assets-path="../assets/"
  data-template="vertical-menu-template-free">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />

    <title>Event Registration| JEN Events Registration Form</title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../assets/img/favicon/favic" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
      rel="stylesheet" />

    <link rel="stylesheet" href="../assets/vendor/fonts/iconify-icons.css" />

    <!-- Core CSS -->
    <!-- build:css assets/vendor/css/theme.css  -->

    <link rel="stylesheet" href="../assets/vendor/css/core.css" />
    <link rel="stylesheet" href="../assets/css/demo.css" />

    <!-- Vendors CSS -->

    <link rel="stylesheet" href="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />

    <!-- endbuild -->

    <!-- Page CSS -->
    <!-- Page -->
    <link rel="stylesheet" href="../assets/vendor/css/pages/page-auth.css" />

    <!-- Helpers -->
    <script src="../assets/vendor/js/helpers.js"></script>
    

    <script src="../assets/js/config.js"></script>
  </head>
  <body>
   
    <div class="container-xxl">
        <div class="authentication-wrapper authentication-basic container-p-y">
            <div class="authentication-inner">
                <!-- Register Card -->
                <div class="card px-sm-6 px-0">
                    <div class="card-body">
                    <!-- Logo -->
                    <div class="app-brand justify-content-center mb-6">
                        <a href="index.php" class="app-brand-link gap-2">
                        <span class="app-brand-logo demo">
                            <span class="text-primary">
                            
                            </span>
                        </span>
                        <span class="app-brand-text demo text-heading fw-bold">Jesus Enthroned Network</span>
                        </a>
                    </div>
                    <!-- /Logo --> 
                     <?php
                        // get the event details
                        $query = $db->query("SELECT *FROM event where id=$event_id");

                        $results= $query->fetch(PDO::FETCH_ASSOC);
                        $start_date = $results['start_date'];
                        $end_date = $results['end_date'];
                        $name = $results['ename'];
                    ?>           
                    <h4 class="mb-1"><?= $name ?> Event Registration</h4>
                    <p class='mb-6'>Scheduled on <?= date('M d, Y h:i a',strtotime($start_date));?> to <?= date('M d, Y h:i a',strtotime($end_date));?> </p>
                    <?php if (!empty($message)){?>
                      <div class="alert alert-info">
                        <?= $message; ?>
                      </div>
                      <?php }?>

                    <form method="post" method="post" class="mb-1">
                        <?php foreach ($fields as $field): ?>
                            <div style="margin-bottom: 10px;">
                                <label class="w-100"><?= htmlspecialchars($field['field_label']) ?><?= $field['is_required'] ? '<span style="color:red;"> * </span>' : '' ?>
                                    <?php
                                        $name = 'field_' . $field['id'];
                                        $required = $field['is_required'] ? 'required' : '';
                                        $class = $field['field_class'];
                                        $value = $_POST[$name] ?? '';

                                        switch ($field['field_type']) {
                                            case 'text':
                                            case 'email':
                                            case 'number':
                                            case 'date':
                                                echo "<input type='{$field['field_type']}' name='$name' value='".htmlspecialchars($value)."' $required class='$class'>";
                                                break;
                                            case 'textarea':
                                                echo "<textarea name='$name' $required class='$class'>" . htmlspecialchars($value) . "</textarea>";
                                                break;
                                            case 'select':
                                                echo "<select name='$name' $required class='$class'>";
                                                foreach (explode(',', $field['field_options']) as $option) {
                                                    $option = trim($option);
                                                    $selected = ($value == $option) ? "selected" : "";
                                                    echo "<option value='$option' $selected>$option</option>";
                                                }
                                                echo "</select>";
                                                break;
                                        }
                                    ?>
                                </label>
                            </div>
                        <?php endforeach; ?>
                        <button class="btn btn-outline-primary" type="submit">Register</button>
                    </form>
                    <p class="text-center">
                <span>Already have an account?</span>
                <a href="login.php">
                  <span>Sign in instead</span>
                </a>
              </p>
            </div>
          </div>
          <!-- Register Card -->
        </div>
      </div>
    </div>
    <script src="../assets/vendor/libs/jquery/jquery.js"></script>

<script src="../assets/vendor/libs/popper/popper.js"></script>
<script src="../assets/vendor/js/bootstrap.js"></script>

<script src="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>

<script src="../assets/vendor/js/menu.js"></script>

<!-- endbuild -->

<!-- Vendors JS -->

<!-- Main JS -->

<script src="../assets/js/main.js"></script>

<!-- Page JS -->

<!-- Place this tag before closing body tag for github widget button. -->
<script async defer src="https://buttons.github.io/buttons.js"></script>
</body>
</html>
