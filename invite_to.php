<!DOCTYPE html>
<?php
$event_id = isset($_GET['id']) ? $_GET['id'] : null;
# get event details 
require_once('includes/connection.php');

if ($event_id) {
    $stmt = $db->prepare("SELECT * FROM event WHERE id = ?");
   
    $stmt->execute([$event_id]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    $stmt->closeCursor();

    if (!$event) {
        die("Invalid Event Passed.");
    }
    else{
        $event_name = $event['ename'];
    }

} else {
    die("No Event Passed.");
}
?>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commitment Redemption Form</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- include cdn bootstrap 5 -->
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg,  #0ec2e6 0%, #0d0221 100%),url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(255,255,255,0.1)"/></svg>');
            background-size: cover;
            background-blend-mode: overlay;
            background-repeat: no-repeat;
            background-position: center;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .row{
            --bs-gutter-x: 1.625rem;
            --bs-gutter-y: 0;
            display:flex;
            flex-wrap:wrap;
            margin-top:calc(-1*var(--bs-gutter-y));
            margin-right:calc(-0.5*var(--bs-gutter-x));
            margin-left:calc(-0.5*var(--bs-gutter-x))
        }
        
        .container {
            width: 100% !important;
            margin:0 !important;
            --bs-gutter-x: 0 !important;
            max-width: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 25px;
            text-align: center;
            position: relative;
        }
        
        .header h1 {
            font-weight: 600;
            font-size: 1.8rem;
            margin-bottom: 5px;
        }
        
        .header p {
            opacity: 0.9;
        }
        
        .form-container {
            padding: 25px;
        }
        
        .step-indicator {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            position: relative;
        }
        
        .step-indicator::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 0;
            right: 0;
            height: 2px;
            background: #ddd;
            z-index: 0;
        }
        
        .step {
            flex: 1;
            text-align: center;
            position: relative;
            z-index: 1;
        }
        
        .step-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #ddd;
            color: #999;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .step.active .step-circle {
            background: #3498db;
            color: white;
        }
        
        .step.completed .step-circle {
            background: #27ae60;
            color: white;
        }
        
        .step-label {
            font-size: 12px;
            color: #666;
        }
        
        .step.active .step-label {
            color: #3498db;
            font-weight: 600;
        }
        
        .form-step {
            display: none;
        }
        
        .form-step.active {
            display: block;
            animation: fadeIn 0.5s;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .input-group {
            margin-bottom: 20px;
            position: relative;
        }
        
        .input-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
            display: flex;
            align-items: center;
        }
        
        .input-group label i {
            margin-right: 10px;
            color: #2c3e50;
        }
        
        .input-group input, 
        .input-group select, 
        .input-group textarea {
            width: 100% !important;
            padding: 14px !important;
            border: 2px solid #ddd !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            transition: all 0.3s;
        }
        .form-control{
            padding: 14px !important;
            border: 2px solid #ddd !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            transition: all 0.3s !important;

        }
        .form-control:focus{
            border-color: #0ec2e6 !important;
            outline: none !important;
            box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        .input-group input:focus, 
        .input-group select:focus, 
        .input-group textarea:focus {
            border-color: #0ec2e6 !important;
            outline: none !important;
            box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2) !important;
        }
        
        .input-group.error input,
        .input-group.error select {
            border-color: #ff3860 !important;
        }
        
        .error-message {
            color: #ff3860 !important;
            font-size: 14px !important;
            margin-top: 5px;
            display: none;
        }
        
        .input-group.error .error-message {
            display: block;
        }
        
        .info-card {
            background: #e3f2fd;
            border-left: 4px solid #0ec2e6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .info-card h5 {
            color: #0ec2e6be;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .info-card p {
            color: #555;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .info-card ol {
            margin-left: 20px;
            color: #555;
        }
        
        .info-card ol li {
            margin-bottom: 5px;
            font-size: 14px;
        }
        
        .info-card strong {
            color: #0ec2e6be;
        }
        
        .commitment-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }
        
        .commitment-details.show {
            display: block;
        }
        
        .commitment-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
        }
        
        .commitment-item:last-child {
            border-bottom: none;
        }
        
        .commitment-item label {
            font-weight: 600;
            color: #333;
        }
        
        .commitment-item span {
            color: #666;
        }
        
        .btn {
            padding: 14px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
            color: white;
            width: 100%;
            justify-content: center;
        }
        
        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
        }
        
        .btn-secondary {
            background: #95a5a6;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #7f8c8d;
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .btn-group {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 3px solid white;
            width: 16px;
            height: 16px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .success-message {
            display: none;
            text-align: center;
            padding: 40px 30px;
        }
        
        .success-message.show {
            display: block;
        }
        
        .success-message i {
            font-size: 60px;
            color: #27ae60;
            margin-bottom: 20px;
        }
        
        .success-message h2 {
            color: #2e7d32;
            margin-bottom: 10px;
        }
        
        .success-message p {
            color: #666;
            line-height: 1.6;
        }
        
        /* Toast notification styles */
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .toast {
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            display: flex;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease-out;
            max-width: 350px;
            min-width: 300px;
        }
        
        .toast.success {
            background-color: #27ae60;
        }
        
        .toast.error {
            background-color: #e74c3c;
        }
        
        .toast.warning {
            background-color: #f39c12;
        }
        
        .toast.info {
            background-color: #3498db;
        }
        
        .toast i {
            margin-right: 12px;
            font-size: 20px;
        }
        
        .toast .toast-content {
            flex: 1;
        }
        
        .toast .toast-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
            margin-left: 12px;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @media (max-width: 600px) {
            .container {
                border-radius: 12px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 1.5rem;
            }
            
            .form-container {
                padding: 20px;
            }
            
            .btn-group {
                flex-direction: column;
            }
            
            .toast-container {
                left: 20px;
                right: 20px;
            }
            
            .toast {
                max-width: 100%;
                min-width: auto;
            }
            
            .step-label {
                font-size: 10px;
            }
        }
    </style>
</head>
<body>
    <!-- Toast container -->
    <div class="toast-container" id="toastContainer"></div>
    
    <div class="container">
        <div class="header">
            <h1><?= $event_name ?> Invitation List</h1>
            <p>List the individuals you will be inviting.</p>
        </div>
        
        <!-- Step Indicator -->
        <div class="form-container">
            <div class="step-indicator">
                <div class="step active" id="step1Indicator">
                    <div class="step-circle">1</div>
                    <div class="step-label">Verify Registration</div>
                </div>
                <div class="step" id="step2Indicator">
                    <div class="step-circle">2</div>
                    <div class="step-label">List Individuals</div>
                </div>
                <div class="step" id="step3Indicator">
                    <div class="step-circle">3</div>
                    <div class="step-label">Complete</div>
                </div>
            </div>
            
            <form id="redemptionForm">
                <!-- Step 1: Verification -->
                <div class="form-step active" id="step1">
                    <h3 style="margin-bottom: 20px; color: #2c3e50;">Verify Your Registration</h3>
                    
                    <div class="input-group" id="emailGroup">
                        <label for="email">
                            <i class="fas fa-envelope"></i> Email Used During Registration
                        </label>
                        <input type="email" id="email" name="email" placeholder="Enter your email address" required>
                        <div class="error-message">Please enter a valid email address</div>
                    </div>
                    
                    <div class="input-group" id="phoneGroup">
                        <label for="phone_number">
                            <i class="fas fa-phone"></i> Phone Number Used During Registration
                        </label>
                        <input type="tel" id="phone_number" name="phone_number" placeholder="e.g., 0712345678" required>
                        <div class="error-message">Please enter a valid phone number</div>
                    </div>
                    
                    <button type="button" class="btn btn-primary" id="verifyBtn" onclick="verifyCommitment()">
                        <i class="fas fa-check-circle"></i>
                        <span id="verifyBtnText">Verify Registration</span>
                    </button>
                </div>
                
                <!-- Step 2: Payment Details -->
                <div class="form-step" id="step2">
                    <h3 style="margin-bottom: 20px; color: #2c3e50;">Registration Details and Invite Listing</h3>
                    
                    
                    <!-- M-Pesa Payment Instructions -->
                    <div class="info-card">
                        <h5><i class="fas fa-mobile-alt"></i> Invitees to the <span class="displayEvent"></span></h5>
                        <p>List of Invitees</p>
                        
                    </div>
                    
                    <input type="hidden" id='invited_by' name='email' value=''>
                    <input type="hidden" id='event_id' name='event_id' value='<?= htmlspecialchars($event_id); ?>'>

                    <!-- Add new invitee input row -->
                    <div  class="row g-2 mb-3" >
                        <div style="width:50%; margin-bottom:1.2rem" >
                            <input type="text" id="new_fullname" placeholder="Full name" class='form-control' style='width:100%;'>
                        </div>
                        <div class="" style="width:50%; margin-bottom:1.2rem">
                            <input type="text" id="new_contact" placeholder="Contact (Phone/Email)" class='form-control' style='width:100%;'>
                        </div>
                        <div class="col-md-6 col-lg-6 mb-3" style= "width:50%; margin-bottom:1.2rem">
                            <input type="text" id="new_relationship" placeholder="Residence" class='form-control' style='width:100%;'>
                        </div>
                        <div class="col-md-6 col-lg-6 mb-3" style="width:50%; margin-bottom:1.2rem">
                            <select id="new_gender" class='form-control' style='width:100%;'>
                                <option value="" disabled selected>Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                
                            </select>
                        </div>

                    
                        <button type="button" class="btn btn-secondary" onclick="addInviteFromInputs()" style="flex:0.8;">
                            <i class="fas fa-plus"></i> Add Invitee
                        </button>
                    </div>

                    <div class="table table-responsive">
                        <table class="table table-striped " id="inviteesTable" style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="text-align:left; border-bottom:1px solid #e5e5e5;">
                                    <th style="padding:8px; width:30px">#</th>
                                    <th style="padding:8px">Full Name</th>
                                    <th style="padding:8px">Contact Info</th>
                                    <th style="padding:8px">Residence</th>
                                    <th style="padding:8px">Gender</th>
                                    <th style="padding:8px; width:80px">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="inviteesBody">
                                <!-- Invitees will be dynamically added here -->
                            </tbody>
                        </table>
                    </div>

                    <div class="btn-group">
                        <button type="button" class="btn btn-secondary" onclick="goToStep(1)" style="flex: 1;">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <button type="submit" class="btn btn-primary" id="submitBtn" style="flex: 2;">
                            <i class="fas fa-check"></i>
                            <span id="submitBtnText">Complete Submission</span>
                        </button>
                    </div>

                </div>

   
                <!-- Step 3: Success -->
                <div class="form-step" id="step3">
                    <div class="success-message show">
                        <i class="fas fa-check-circle"></i>
                        <h2>Mobilisation Submission Completed!</h2>
                        <p id="successDetails">Thank you for your generous support and partnership. In case of any questions kindly reach to us.</p>
                        <button type="button" class="btn btn-primary" onclick="resetForm()" style="margin-top: 20px; width: auto;">
                            <i class="fas fa-home"></i> Return to Home
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script>
        let currentStep = 1;
        let verifiedCommitment = null;

        // Toast notification function
        function showToast(message, type = 'info', duration = 5000) {
            const toastContainer = document.getElementById('toastContainer');
            
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            let icon = 'info-circle';
            if (type === 'success') icon = 'check-circle';
            if (type === 'error') icon = 'exclamation-circle';
            if (type === 'warning') icon = 'exclamation-triangle';
            
            toast.innerHTML = `
                <i class="fas fa-${icon}"></i>
                <div class="toast-content">${message}</div>
                <button class="toast-close"><i class="fas fa-times"></i></button>
            `;
            
            toastContainer.appendChild(toast);
            
            const timeout = setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toastContainer.removeChild(toast);
                    }
                }, 300);
            }, duration);
            
            toast.querySelector('.toast-close').addEventListener('click', () => {
                clearTimeout(timeout);
                toast.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toastContainer.removeChild(toast);
                    }
                }, 300);
            });
        }

        // Step navigation
        function goToStep(step) {
            // Hide all steps
            document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
            
            // Show target step
            document.getElementById(`step${step}`).classList.add('active');
            
            // Update step indicators
            document.querySelectorAll('.step').forEach((s, index) => {
                s.classList.remove('active', 'completed');
                if (index + 1 < step) {
                    s.classList.add('completed');
                } else if (index + 1 === step) {
                    s.classList.add('active');
                }
            });
            
            currentStep = step;
        }

        // Verify commitment via AJAX
        function verifyCommitment() {
            // Reset error states
            document.querySelectorAll('.input-group').forEach(group => {
                group.classList.remove('error');
            });
            
            const email = document.getElementById('email').value.trim();
            const phoneNumber = document.getElementById('phone_number').value.trim();
            const eventId = <?= json_encode($event_id); ?>;
            
            // Validation
            let isValid = true;
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !email.match(emailRegex)) {
                document.getElementById('emailGroup').classList.add('error');
                isValid = false;
            }
            
            if (!phoneNumber || phoneNumber.length < 10) {
                document.getElementById('phoneGroup').classList.add('error');
                isValid = false;
            }
            
            if (!isValid) {
                showToast('Please fill in all fields correctly', 'error');
                return;
            }
            
            // Show loading state
            const verifyBtn = document.getElementById('verifyBtn');
            const verifyBtnText = document.getElementById('verifyBtnText');
            verifyBtn.disabled = true;
            verifyBtnText.textContent = 'Verifying...';
            verifyBtn.innerHTML = '<div class="spinner"></div><span>Verifying...</span>';
            
            // Prepare form data
            const formData = new FormData();
            formData.append('email', email);
            formData.append('phone_number', phoneNumber);
            formData.append('event_id', eventId);
            formData.append('action', 'verify_registration');
            
            // Send AJAX request
            fetch('manage/verify_registration.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    registration = data.registration;
                    event_name = registration.ename;
                    registrant = registration.names;
                    invites = registration.attendees;

                    document.getElementById('invited_by').value = data.registration.email || email;
                    document.querySelector('.displayEvent').textContent = event_name;
                    
                    showToast('Registration verified successfully!', 'success');
                    
                    // Move to step 2
                    setTimeout(() => {
                        goToStep(2);
                    }, 1000);
                } else {
                    showToast(data.message || 'Registration not found. Please check your details.', 'error');
                }
            })
            .catch(error => {
                console.error('Verification error:', error);
                showToast('An error occurred during verification. Please try again.', 'error');
            })
            .finally(() => {
                // Restore button state
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Verify Registration</span>';
            });
        }

        // Local incremental ID for rows
        let _inviteRowId = 0;

        // Add invite row from the "new" inputs
        function addInviteFromInputs() {
            const fullname = document.getElementById('new_fullname').value.trim();
            const contact = document.getElementById('new_contact').value.trim();
            const relationship = document.getElementById('new_relationship').value.trim();
            const gender = document.getElementById('new_gender').value;

            if (!fullname) {
                showToast('Please enter the full name for the invitee', 'warning');
                return;
            }
            if (!contact) {
                showToast('Please enter contact info for the invitee', 'warning');
                return;
            }
            // add the information to backend database 
            formData = new FormData();
            formData.append('event_id', <?= json_encode($event_id); ?>);
            formData.append('email', document.getElementById('invited_by').value);
            formData.append('fullname', fullname);
            formData.append('contact', contact);
            formData.append('relationship', relationship);
            formData.append('gender', gender);
            formData.append('action', 'add_invitee');
            fetch('api/invitees.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    addInviteRow({ fullname, contact, relationship, gender });
                } else {
                    showToast(data.message || 'Failed to add invitee. Please try again.', 'error');
                }
            })
            .catch(error => {
                console.error('Error adding invitee:', error);
                showToast('An error occurred. Please try again.', 'error');
            });

            // clear inputs
            document.getElementById('new_fullname').value = '';
            document.getElementById('new_contact').value = '';
            document.getElementById('new_relationship').value = '';
            document.getElementById('new_gender').value = '';
        }

        // Render a single row into the table
        // fetch data from backend database
        function fetchInvitees() {
            const email = document.getElementById('email').value
            const formData = new FormData();
            formData.append('event_id', <?= json_encode($event_id); ?>);
            formData.append('email', email);
            formData.append('action', 'get_invitees');
            fetch('api/invitees.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && Array.isArray(data.invitees)) {
                    populateInvitees(data.invitees);
                } else {
                    showToast(data.message || 'Failed to fetch invitees. Please try again.', 'error');
                }
            })
            .catch(error => {
                console.error('Error fetching invitees:', error);
                showToast('An error occurred. Please try again.', 'error');
            });
        }
        // remove row
        function addInviteRow(invite){
            _inviteRowId++;
            const rowId = _inviteRowId;
            const tbody = document.getElementById('inviteesBody');

            const tr = document.createElement('tr');
            tr.setAttribute('data-row-id', rowId);
            tr.setAttribute('data-fullname', invite.fullname || '');
            tr.setAttribute('data-contact', invite.contact || '');
            tr.setAttribute('data-relationship', invite.relationship || '');
            tr.setAttribute('data-gender', invite.gender || '');
            if (invite.id) tr.setAttribute('data-id', invite.id); // optional backend id

            // index cell (will be reindexed later)
            const idxTd = document.createElement('td');
            idxTd.style.padding = '8px';
            idxTd.textContent = tbody.children.length + 1;

            const nameTd = document.createElement('td');
            nameTd.style.padding = '8px';
            nameTd.textContent = invite.fullname || '';

            const contactTd = document.createElement('td');
            contactTd.style.padding = '8px';
            contactTd.textContent = invite.contact || '';

            const relTd = document.createElement('td');
            relTd.style.padding = '8px';
            relTd.textContent = invite.relationship || '';

            const genderTd = document.createElement('td');
            genderTd.style.padding = '8px';
            genderTd.textContent = invite.gender || '';

            const actionsTd = document.createElement('td');
            actionsTd.style.padding = '8px';
            actionsTd.style.width = '80px';

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'btn btn-secondary';
            delBtn.style.padding = '6px 8px';
            delBtn.innerHTML = '<i class="fas fa-trash"></i>';
            delBtn.title = 'Remove invitee';
            delBtn.addEventListener('click', () => {
                if (!confirm('Remove this invitee?')) return;

                // If this row corresponds to a server-side record, attempt to delete on server first
                const serverId = tr.getAttribute('data-id');
                if (serverId) {
                    const fd = new FormData();
                    fd.append('action', 'delete_invitee');
                    fd.append('id', serverId);
                    fd.append('event_id', <?= json_encode($event_id); ?>);

                    fetch('api/invitees.php', {
                        method: 'POST',
                        body: fd
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            removeInviteRow(rowId);
                            showToast('Invitee removed', 'success');
                        } else {
                            showToast(data.message || 'Failed to remove invitee', 'error');
                        }
                    })
                    .catch(err => {
                        console.error('Error deleting invitee:', err);
                        showToast('An error occurred while removing invitee', 'error');
                    });
                } else {
                    // just remove from UI
                    removeInviteRow(rowId);
                    showToast('Invitee removed', 'success');
                }
            });

            // Optional: small edit button (inline edit)
            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-secondary';
            editBtn.style.padding = '6px 8px';
            editBtn.style.marginRight = '6px';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit invitee';
            editBtn.addEventListener('click', () => {
                // simple inline edit: replace cells with inputs
                const nameInput = document.createElement('input');
                nameInput.value = tr.getAttribute('data-fullname');
                nameInput.className = 'form-control';
                const contactInput = document.createElement('input');
                contactInput.value = tr.getAttribute('data-contact');
                contactInput.className = 'form-control';
                const relInput = document.createElement('input');
                relInput.value = tr.getAttribute('data-relationship');
                relInput.className = 'form-control';
                const genderInput = document.createElement('input');
                genderInput.value = tr.getAttribute('data-gender');
                genderInput.className = 'form-control';

                nameTd.innerHTML = ''; nameTd.appendChild(nameInput);
                contactTd.innerHTML = ''; contactTd.appendChild(contactInput);
                relTd.innerHTML = ''; relTd.appendChild(relInput);
                genderTd.innerHTML = ''; genderTd.appendChild(genderInput);

                // change edit button to save
                editBtn.disabled = true;
                const saveBtn = document.createElement('button');
                saveBtn.type = 'button';
                saveBtn.className = 'btn btn-primary';
                saveBtn.style.padding = '6px 8px';
                saveBtn.innerHTML = '<i class="fas fa-save"></i>';
                saveBtn.title = 'Save changes';
                saveBtn.addEventListener('click', () => {
                    const newName = nameInput.value.trim();
                    const newContact = contactInput.value.trim();
                    const newRel = relInput.value.trim();
                    const newGender = genderInput.value.trim();

                    // update UI and data attributes
                    tr.setAttribute('data-fullname', newName);
                    tr.setAttribute('data-contact', newContact);
                    tr.setAttribute('data-relationship', newRel);
                    tr.setAttribute('data-gender', newGender);

                    nameTd.textContent = newName;
                    contactTd.textContent = newContact;
                    relTd.textContent = newRel;
                    genderTd.textContent = newGender;

                    // If server id exists, send update to backend (best-effort)
                    const serverId2 = tr.getAttribute('data-id');
                    if (serverId2) {
                        const fd2 = new FormData();
                        fd2.append('action', 'update_invitee');
                        fd2.append('id', serverId2);
                        fd2.append('fullname', newName);
                        fd2.append('contact', newContact);
                        fd2.append('relationship', newRel);
                        fd2.append('gender', newGender);
                        fd2.append('event_id', <?= json_encode($event_id); ?>);

                        fetch('api/invitees.php', { method: 'POST', body: fd2 })
                        .then(r => r.json())
                        .then(d => {
                            if (d.success) showToast('Invitee updated', 'success');
                            else showToast(d.message || 'Failed to update invitee', 'warning');
                        })
                        .catch(e => {
                            console.error('Error updating invitee:', e);
                            showToast('An error occurred while updating invitee', 'error');
                        });
                    } else {
                        showToast('Invitee updated locally', 'success');
                    }

                    // restore buttons
                    editBtn.disabled = false;
                    actionsTd.removeChild(saveBtn);
                });

                actionsTd.appendChild(saveBtn);
            });

            // assemble action buttons
            actionsTd.appendChild(editBtn);
            actionsTd.appendChild(delBtn);

            // append cells to row
            tr.appendChild(idxTd);
            tr.appendChild(nameTd);
            tr.appendChild(contactTd);
            tr.appendChild(relTd);
            tr.appendChild(genderTd);
            tr.appendChild(actionsTd);

            tbody.appendChild(tr);
            reindexInviteRows();
            return rowId;
        }
        

        // Remove a row by id
        function removeInviteRow(rowId) {
            const tbody = document.getElementById('inviteesBody');
            const tr = tbody.querySelector(`tr[data-row-id="${rowId}"]`);
            if (tr) {
                tbody.removeChild(tr);
                reindexInviteRows();
            }
        }

        // Recompute index numbers
        function reindexInviteRows() {
            const rows = document.querySelectorAll('#inviteesBody tr');
            rows.forEach((r, i) => {
                const idxCell = r.querySelector('td:first-child');
                if (idxCell) idxCell.textContent = i + 1;
            });
        }

        // Read attendees from table into array of objects
        function getAttendeesFromTable() {
            const rows = document.querySelectorAll('#inviteesBody tr');
            const attendees = [];
            rows.forEach(r => {
                attendees.push({
                    fullname: r.getAttribute('data-fullname') || r.children[1].textContent,
                    contact: r.getAttribute('data-contact') || r.children[2].textContent,
                    relationship: r.getAttribute('data-relationship') || r.children[3].textContent,
                    gender: r.getAttribute('data-gender') || r.children[4].textContent
                });
            });
            return attendees;
        }

        // Populate table with existing invitees (e.g., from verification response)
        function populateInvitees(invites) {
            // Accept array of objects or simple strings
            if (!Array.isArray(invites)) return;
            // clear existing
            document.getElementById('inviteesBody').innerHTML = '';
            _inviteRowId = 0;
            invites.forEach(item => {
                // item may be an object with various keys
                const invite = {
                    fullname: item.fullname || item.name || item.names || item.fullName || '',
                    contact: item.contact || item.phone || item.phone_number || item.contact_info || '',
                    relationship: item.relationship || item.relation || '',
                    gender: item.gender || ''
                };
                addInviteRow(invite);
            });
        }
        
        // Auto-populate invitees after verification:
        // verifyCommitment sets a global `invites` variable. Watch for it.
        (function watchForInvites() {
            let populated = false;
            const interval = setInterval(() => {
                if (typeof invites !== 'undefined' && Array.isArray(invites) && !populated) {
                    populateInvitees(invites);
                    populated = true;
                }
                // stop watching after some time
            }, 200);
            // stop after 10s to avoid infinite loop
            setTimeout(() => clearInterval(interval), 10000);
        })();

        // Monkey-patch fetch to append attendees before redeem_commitment call
        (function patchFetchToAttachAttendees() {
            if (!window.fetch) return;
            const originalFetch = window.fetch.bind(window);
            window.fetch = function(resource, init = {}) {
                try {
                    // Identify the redemption endpoint call
                    if (typeof resource === 'string' && resource.indexOf('manage/redeem_commitment.php') !== -1) {
                        // If the request has a FormData body, attach attendees JSON
                        if (init.body instanceof FormData) {
                            const attendees = getAttendeesFromTable();
                            init.body.append('attendees', JSON.stringify(attendees));
                        }
                    }
                } catch (e) {
                    console.error('Error attaching attendees to fetch:', e);
                }
                return originalFetch(resource, init);
            };
        })();

        document.addEventListener('DOMContentLoaded', function(){
            if(currentStep===2){
            fetchInvitees();
            }
            // form submit button

            const submitBtn = document.getElementById('submitBtn');
            submitBtn.addEventListener('click', function(){
                submitBtn.disabled = true,
                submitBtn.innerHTML = '<div class=" fa fa-spinner"> </div> <span> Submitting .. </span>';
                goToStep(3);
            });

        });
    </script>
</body>
</html>