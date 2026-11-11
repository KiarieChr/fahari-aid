<!DOCTYPE html>
<html lang="en">
<?PHP include('includes/connection.php');?>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commitment Registration | Jesus Enthroned Network</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: linear-gradient(135deg, #0ec2e6 0%, #0d0221 100%), url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(255,255,255,0.1)"/></svg>');
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

        .container {
            width: 100%;
            max-width: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #0d0221 0%, #1c024bff 100%);
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

        .description {
            padding: 12px;
            margin: 20px;
            border-left: 3px solid #0d0221;
            border-radius: 15px;
            border-right: 3px solid #0d0221;
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
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
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
            width: 100%;
            padding: 14px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s;
        }

        .input-group input:focus,
        .input-group select:focus,
        .input-group textarea:focus {
            border-color: #0ec2e6;
            outline: none;
            box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .input-group.error input,
        .input-group.error select,
        .input-group.error textarea {
            border-color: #ff3860;
        }

        .error-message {
            color: #ff3860;
            font-size: 14px;
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
            color: #0ec2e6;
            margin-bottom: 10px;
            font-size: 16px;
        }

        .info-card p {
            color: #555;
            font-size: 14px;
            margin-bottom: 8px;
        }

        .member-found-message {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }

        .member-found-message.show {
            display: block;
        }

        .member-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }

        .member-details.show {
            display: block;
        }

        .member-detail-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
        }

        .member-detail-item:last-child {
            border-bottom: none;
        }

        .member-detail-item label {
            font-weight: 600;
            color: #333;
        }

        .member-detail-item span {
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
            background: linear-gradient(135deg, #0ec2e6 0%, #2c3e50 100%);
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
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
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
            <h1>JESUS ENTHRONED NETWORK</h1>
            <p>KINGDOM | UNITY | PURPOSE</p>
        </div>

        <div class="form-container">
            <div class="step-indicator">
                <div class="step active" id="step1Indicator">
                    <div class="step-circle">1</div>
                    <div class="step-label">Verify Member</div>
                </div>
                <div class="step" id="step2Indicator">
                    <div class="step-circle">2</div>
                    <div class="step-label">Commitment Details</div>
                </div>
                <div class="step" id="step3Indicator">
                    <div class="step-circle">3</div>
                    <div class="step-label">Confirmation</div>
                </div>
            </div>

            <form id="commitmentForm">
                <!-- Step 1: Member Verification -->
                <div class="form-step active" id="step1">
                    <div class="description">
                        <h3 style="margin-bottom: 10px; color: #2c3e50; margin-top:10px;">Member Commitment Registration</h3>
                        <p>Please provide your phone number or email to check if you're already in our member database. If found, your details will be pre-filled.</p>
                    </div>

                    <div class="input-group" id="phoneGroup">
                        <label for="phone">
                            <i class="fas fa-phone"></i> Phone Number
                        </label>
                        <input type="tel" id="phone" name="phone" placeholder="e.g., 0712xxxxxx/0112xxxxxx">
                        <div class="error-message">Please enter a valid phone number</div>
                    </div>

                    <div class="input-group" id="emailGroup">
                        <label for="email">
                            <i class="fas fa-envelope"></i> Email Address (Optional)
                        </label>
                        <input type="email" id="email" name="email" placeholder="e.g., example@domain.com">
                        <div class="error-message">Please enter a valid email address</div>
                    </div>

                    <div class="member-found-message" id="memberFoundMessage">
                        <i class="fas fa-check-circle"></i>
                        <strong>Member Found!</strong>
                        <p>We found your details in our database. Your information has been pre-filled below.</p>
                    </div>

                    <button type="button" class="btn btn-primary" id="verifyBtn" onclick="verifyMember()">
                        <i class="fas fa-search"></i>
                        <span id="verifyBtnText">Check Member Status</span>
                    </button>
                </div>

                <!-- Step 2: Commitment Details -->
                <div class="form-step" id="step2">
                    <h3 style="margin-bottom: 20px; color: #2c3e50;">Commitment Details</h3>

                    <div class="member-details" id="memberDetails">
                        <h4 style="margin-bottom: 15px; color: #0d0221;">Member Information</h4>
                        <div class="member-detail-item">
                            <label>Member ID:</label>
                            <span id="displayMemberId">Not Found</span>
                        </div>
                        <div class="member-detail-item">
                            <label>Name:</label>
                            <span id="displayFullName">-</span>
                        </div>
                        <div class="member-detail-item">
                            <label>Phone:</label>
                            <span id="displayPhone">-</span>
                        </div>
                        <div class="member-detail-item">
                            <label>Email:</label>
                            <span id="displayEmail">-</span>
                        </div>
                    </div>

                    <div class="input-group" id="fullNameGroup">
                        <label for="full_name">
                            <i class="fas fa-user"></i> Full Name *
                        </label>
                        <input type="text" id="full_name" name="full_name" placeholder="Enter your full name" required>
                        <div class="error-message">Please enter your full name</div>
                    </div>

                    <div class="input-group" id="phoneGroup2">
                        <label for="phone2">
                            <i class="fas fa-phone"></i> Phone Number *
                        </label>
                        <input type="tel" id="phone2" name="phone2" placeholder="e.g., 0712xxxxxx/0112xxxxxx" required>
                        <div class="error-message">Please enter a valid phone number</div>
                    </div>

                    <div class="input-group" id="emailGroup2">
                        <label for="email2">
                            <i class="fas fa-envelope"></i> Email Address
                        </label>
                        <input type="email" id="email2" name="email2" placeholder="e.g., example@domain.com">
                        <div class="error-message">Please enter a valid email address</div>
                    </div>

                    <div class="input-group" id="residenceGroup">
                        <label for="residence">
                            <i class="fas fa-home"></i> Residence
                        </label>
                        <input type="text" id="residence" name="residence" placeholder="Enter your current residence">
                    </div>

                    <div class="input-group" id="committedOnGroup">
                        <label for="committed_on">
                            <i class="fas fa-calendar-alt"></i> Committed On
                        </label>
                        <input type="date" id="committed_on" name="committed_on">
                        <div class="error-message">Please enter a valid date</div>
                    </div>

                    <div class="btn-group">
                        <button type="button" class="btn btn-secondary" onclick="goToStep(1)" style="flex: 1;">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <button type="button" class="btn btn-primary" onclick="saveCommitment()" style="flex: 2;">
                            <i class="fas fa-save"></i>
                            <span id="saveBtnText">Save Commitment</span>
                        </button>
                    </div>
                </div>

                <!-- Step 3: Confirmation -->
                <div class="form-step" id="step3">
                    <div class="success-message show">
                        <i class="fas fa-check-circle"></i>
                        <h2>Commitment Saved Successfully!</h2>
                        <p id="successDetails">Your commitment has been recorded successfully.</p>
                        <p>Member ID: <strong id="successMemberId">Not assigned</strong></p>
                        <p>Thank you for your commitment!</p>
                        
                        <div class="btn-group" style="margin-top: 30px;">
                            <button type="button" class="btn btn-secondary" onclick="goToStep(1)" style="flex: 1;">
                                <i class="fas fa-plus"></i> New Commitment
                            </button>
                            <button type="button" class="btn btn-primary" onclick="printConfirmation()" style="flex: 1;">
                                <i class="fas fa-print"></i> Print
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Hidden fields for member_id and other data -->
                <input type="hidden" id="member_id" name="member_id" value="">
            </form>
        </div>
    </div>

    <script>
        let currentStep = 1;
        let memberData = null;

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

            // Reset form if going back to step 1
            if (step === 1) {
                resetForm();
            }
        }

        // Reset form function
        function resetForm() {
            document.getElementById('commitmentForm').reset();
            document.getElementById('member_id').value = '';
            document.getElementById('memberFoundMessage').classList.remove('show');
            document.getElementById('memberDetails').classList.remove('show');
            memberData = null;
        }

        // Verify member via AJAX
        function verifyMember() {
            // Reset error states
            document.querySelectorAll('.input-group').forEach(group => {
                group.classList.remove('error');
            });

            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();

            // Validation - at least one field should be filled
            if (!phone && !email) {
                document.getElementById('phoneGroup').classList.add('error');
                document.getElementById('emailGroup').classList.add('error');
                showToast('Please enter either phone number or email address', 'error');
                return;
            }

            // Show loading state
            const verifyBtn = document.getElementById('verifyBtn');
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<span class="spinner"></span> Checking...';

            // Prepare form data
            const formData = new FormData();
            formData.append('phone', phone);
            formData.append('email', email);
            formData.append('action', 'verify_member');

            // Send AJAX request
            fetch('manage/commitment-handler.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    memberData = data.member;
                    
                    // Show member found message
                    document.getElementById('memberFoundMessage').classList.add('show');
                    
                    // Update hidden member_id field
                    document.getElementById('member_id').value = memberData.id || '';
                    
                    // Pre-fill step 2 fields
                    document.getElementById('full_name').value = memberData.full_name || '';
                    document.getElementById('phone2').value = memberData.phone || phone;
                    document.getElementById('email2').value = memberData.email || email;
                    document.getElementById('residence').value = memberData.residence || '';
                    
                    // Update display fields
                    document.getElementById('displayMemberId').textContent = memberData.id || 'Not Found';
                    document.getElementById('displayFullName').textContent = memberData.full_name || '-';
                    document.getElementById('displayPhone').textContent = memberData.phone || '-';
                    document.getElementById('displayEmail').textContent = memberData.email || '-';
                    
                    // Show member details
                    document.getElementById('memberDetails').classList.add('show');
                    
                    showToast(data.message || 'Member found! Details pre-filled.', 'success');
                    
                    // Move to step 2
                    setTimeout(() => {
                        goToStep(2);
                    }, 1000);
                } else {
                    // Member not found, still proceed to step 2 but with empty member_id
                    document.getElementById('member_id').value = '';
                    document.getElementById('memberFoundMessage').classList.remove('show');
                    
                    // Pre-fill with entered phone/email
                    document.getElementById('phone2').value = phone;
                    document.getElementById('email2').value = email;
                    
                    // Clear member details display
                    document.getElementById('displayMemberId').textContent = 'Not Found';
                    document.getElementById('displayFullName').textContent = '-';
                    document.getElementById('displayPhone').textContent = phone || '-';
                    document.getElementById('displayEmail').textContent = email || '-';
                    
                    // Show member details (empty)
                    document.getElementById('memberDetails').classList.add('show');
                    
                    showToast(data.message || 'No existing member found. Please fill in your details.', 'info');
                    
                    // Move to step 2
                    setTimeout(() => {
                        goToStep(2);
                    }, 1000);
                }
            })
            .catch(error => {
                console.error('Verification error:', error);
                showToast('An error occurred during verification. Please try again.', 'error');
            })
            .finally(() => {
                // Restore button state
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = '<i class="fas fa-search"></i><span>Check Member Status</span>';
            });
        }

        // Save commitment via AJAX
        function saveCommitment() {
            // Reset error states
            document.querySelectorAll('.input-group').forEach(group => {
                group.classList.remove('error');
            });

            const fullName = document.getElementById('full_name').value.trim();
            const phone = document.getElementById('phone2').value.trim();
            const email = document.getElementById('email2').value.trim();
            const residence = document.getElementById('residence').value.trim();
            const committedOn = document.getElementById('committed_on').value;
            const memberId = document.getElementById('member_id').value;

            // Validation
            let isValid = true;

            if (!fullName) {
                document.getElementById('fullNameGroup').classList.add('error');
                isValid = false;
            }

            if (!phone || phone.length < 10) {
                document.getElementById('phoneGroup2').classList.add('error');
                isValid = false;
            }

            if (email && !isValidEmail(email)) {
                document.getElementById('emailGroup2').classList.add('error');
                isValid = false;
            }

            if (!isValid) {
                showToast('Please fill in all required fields correctly', 'error');
                return;
            }

            // Show loading state
            const saveBtn = document.querySelector('#step2 .btn-primary');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner"></span> Saving...';

            // Prepare form data
            const formData = new FormData();
            formData.append('member_id', memberId);
            formData.append('full_name', fullName);
            formData.append('phone', phone);
            formData.append('email', email);
            formData.append('residence', residence);
            formData.append('committed_on', committedOn);
            formData.append('action', 'save_commitment');

            // Send AJAX request
            fetch('manage/commitment-handler.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update success message with member_id
                    document.getElementById('successMemberId').textContent = data.member_id || 'Not assigned';
                    
                    // Show success message and move to step 3
                    showToast(data.message || 'Commitment saved successfully!', 'success');
                    goToStep(3);
                } else {
                    showToast(data.message || 'Failed to save commitment. Please try again.', 'error');
                }
            })
            .catch(error => {
                console.error('Save error:', error);
                showToast('An error occurred while saving. Please try again.', 'error');
            })
            .finally(() => {
                // Restore button state
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i><span>Save Commitment</span>';
            });
        }

        // Email validation helper
        function isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        // Print confirmation
        function printConfirmation() {
            window.print();
        }

        // Real-time validation
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', function () {
                if (this.value) {
                    this.parentElement.classList.remove('error');
                }
            });
        });

        // Set default date to today
        document.getElementById('committed_on').valueAsDate = new Date();
    </script>
</body>
</html>