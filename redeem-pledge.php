<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commitment Redemption Form</title>
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
            border-color: #3498db;
            outline: none;
            box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .input-group.error input,
        .input-group.error select {
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
            border-left: 4px solid #2196f3;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .info-card h5 {
            color: #1976d2;
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
            color: #1976d2;
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
            <h1>Commitment Redemption</h1>
            <p>Thank you for redeeming your commitment. God Bless you.</p>
        </div>

        <!-- Step Indicator -->
        <div class="form-container">
            <div class="step-indicator">
                <div class="step active" id="step1Indicator">
                    <div class="step-circle">1</div>
                    <div class="step-label">Verify</div>
                </div>
                <div class="step" id="step2Indicator">
                    <div class="step-circle">2</div>
                    <div class="step-label">Payment</div>
                </div>
                <div class="step" id="step3Indicator">
                    <div class="step-circle">3</div>
                    <div class="step-label">Complete</div>
                </div>
            </div>

            <form id="redemptionForm">
                <!-- Step 1: Verification -->
                <div class="form-step active" id="step1">
                    <h3 style="margin-bottom: 20px; color: #2c3e50;">Verify Your Commitment</h3>

                    <div class="input-group" id="emailGroup">
                        <label for="email">
                            <i class="fas fa-envelope"></i> Email Used During Commitment
                        </label>
                        <input type="email" id="email" name="email" placeholder="Enter your email address" required>
                        <div class="error-message">Please enter a valid email address</div>
                    </div>

                    <div class="input-group" id="phoneGroup">
                        <label for="phone_number">
                            <i class="fas fa-phone"></i> Phone Number Used During Commitment
                        </label>
                        <input type="tel" id="phone_number" name="phone_number" placeholder="e.g., 0712345678" required>
                        <div class="error-message">Please enter a valid phone number</div>
                    </div>

                    <button type="button" class="btn btn-primary" id="verifyBtn" onclick="verifyCommitment()">
                        <i class="fas fa-check-circle"></i>
                        <span id="verifyBtnText">Verify Commitment</span>
                    </button>
                </div>

                <!-- Step 2: Payment Details -->
                <div class="form-step" id="step2">
                    <h3 style="margin-bottom: 20px; color: #2c3e50;">Payment Information</h3>

                    <!-- Display Commitment Details -->
                    <div class="commitment-details" id="commitmentDetails">
                        <h4 style="margin-bottom: 15px; color: #2c3e50;">Your Commitment Details</h4>
                        <div class="commitment-item">
                            <label>Full Name:</label>
                            <span id="displayName">-</span>
                            <!-- get the email of the individual to be used to record the payment made toward the commitment redemption -->

                        </div>
                        <div class="commitment-item">
                            <label>Purpose:</label>
                            <span id="displayPurpose">-</span>
                        </div>
                        <div class="commitment-item">
                            <label>Amount Commited :</label>
                            <span id="displayAmount" style="color: #27ae60; font-weight: 700;">-</span>
                        </div>
                        <div class="commitment-item">
                            <label>Date Committed:</label>
                            <span id="displayDate">-</span>
                        </div>
                    </div>

                    <!-- M-Pesa Payment Instructions -->
                    <div class="info-card">
                        <h5><i class="fas fa-mobile-alt"></i> M-Pesa Payment Instructions</h5>
                        <p>To complete your commitment redemption, please follow these steps:</p>
                        <ol>
                            <li>Go to M-Pesa menu on your phone</li>
                            <li>Select "Lipa na M-Pesa"</li>
                            <li>Choose "Buy Goods and Services"</li>
                            <li>Enter Till Number: <strong>3548432</strong></li>
                            <li>Enter the amount shown above or any Amount you wish to contribute</li>
                            <li>Enter your M-Pesa PIN and confirm</li>
                        </ol>
                    </div>
                    <!-- Notice Card -->
                    <div class="info-card">
                        <h5><i class="fas fa-info-circle"></i> Important Notice</h5>
                        <p>Note that the transaction reference must be provided for our accounting purposes. Kindly
                            proceed as advised above. We are currently working on an MPESA STK Push integration to
                            simplify this process.</p>
                    </div>
                    <input type="hidden" id='email' name='email' value=''>
                    <div class="input-group">
                        <label for="mpesa_code">
                            <i class="fas fa-receipt"></i> M-Pesa Transaction Code
                        </label>
                        <input type="text" id="mpesa_code" name="mpesa_code" placeholder="e.g., QGH1X2Y3Z4" required>
                        <small style="color: #666;">Enter the M-Pesa confirmation code you received via SMS</small>
                        <div class="error-message">Please enter the M-Pesa transaction code</div>
                    </div>

                    <div class="input-group">
                        <label for="payment_phone_number">
                            <i class="fas fa-clock"></i> Phone Number Used to make the Payment
                        </label>
                        <input type="text" id="payment_phone_number" name="payment_phone_number"
                            placeholder="e.g., 0712345678" required>
                        <small style="color: #f39c12;">Enter the phone number you used to make the payment</small>
                    </div>

                    <div class="input-group">
                        <label for="redeemed_amount">
                            <i class="fas fa-dollar-sign"></i> Amount Redeemed
                        </label>
                        <input type="text" id="redeemed_amount" name="redeemed_amount"
                            placeholder="Enter the amount redeemed" required>
                        <div class="error-message">Please enter a valid amount</div>
                    </div>

                    <div class="btn-group">
                        <button type="button" class="btn btn-secondary" onclick="goToStep(1)" style="flex: 1;">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <button type="submit" class="btn btn-primary" id="submitBtn" style="flex: 2;">
                            <i class="fas fa-check"></i>
                            <span id="submitBtnText">Complete Redemption</span>
                        </button>
                    </div>
                </div>

                <!-- Step 3: Success -->
                <div class="form-step" id="step3">
                    <div class="success-message show">
                        <i class="fas fa-check-circle"></i>
                        <h2>Redemption Completed!</h2>
                        <p id="successDetails">Thank you for your generous support. Your commitment has been
                            successfully redeemed. Incase you need a statement of your commitments click here</p>
                        <button type="button" class="btn btn-primary" onclick="resetForm()"
                            style="margin-top: 20px; width: auto;">
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
            formData.append('action', 'verify_commitment');

            // Send AJAX request
            fetch('manage/verify_commitment.php', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // get the data from the verified commitments

                        //to ppulate the name we need the first commitment
                        verifiedCommitment = data.commitments[0];
                        document.getElementById('displayName').textContent = verifiedCommitment.full_name || 'N/A';
                        $purpose = verifiedCommitment.purpose || 'N/A';

                        if ($purpose === 'conference') {
                            $purpose = 'IPC 2025 December Conference';
                        } else if ($purpose === 'tithe') {
                            $purpose = 'Tithe';
                        } else if ($purpose === 'offering') {
                            $purpose = 'Offering';
                        } else if ($purpose === 'project_support') {
                            $purpose = 'Project Support';
                        } else if ($purpose === 'other') {
                            $purpose = 'Other';
                        }

                        document.getElementById('displayPurpose').textContent = $purpose;
                        document.getElementById('displayAmount').textContent = `KES ${parseFloat(verifiedCommitment.pledges_amount).toLocaleString()}` || 'N/A';

                        // Get the email of the individual to be used to record the payment made toward the commitment redemption
                        document.getElementById('email').value = verifiedCommitment.email || email;

                        // Format date
                        if (verifiedCommitment.date) {
                            const date = new Date(verifiedCommitment.date);
                            document.getElementById('displayDate').textContent = date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        } else if (data.commitment.created_at) {
                            const date = new Date(data.commitment.created_at);
                            document.getElementById('displayDate').textContent = date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        } else if (data.commitment.created_at) {
                            const date = new Date(data.commitment.created_at);
                            document.getElementById('displayDate').textContent = date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        }

                        // Pre-fill mobile number
                        //document.getElementById('mobile').value = data.phone_number || phoneNumber;

                        // Show commitment details
                        document.getElementById('commitmentDetails').classList.add('show');

                        showToast('Commitment verified successfully!', 'success');

                        // Move to step 2
                        setTimeout(() => {
                            goToStep(2);
                        }, 1000);
                    } else {
                        showToast(data.message || 'Commitment not found. Please check your details.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Verification error:', error);
                    showToast('An error occurred during verification. Please try again.', 'error');
                })
                .finally(() => {
                    // Restore button state
                    verifyBtn.disabled = false;
                    verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Verify Commitment</span>';
                });
        }

        // Form submission
        document.getElementById('redemptionForm').addEventListener('submit', function (e) {
            e.preventDefault();

            if (currentStep !== 2) return;

            // Reset error states
            document.querySelectorAll('.input-group').forEach(group => {
                group.classList.remove('error');
            });

            // Get form values
            const mpesaCode = document.getElementById('mpesa_code').value.trim();
            const email = document.getElementById('email').value.trim();
            const paymentPhoneNumber = document.getElementById('payment_phone_number').value.trim();
            const redeemedAmount = document.getElementById('redeemed_amount').value.trim();


            // Validation
            let isValid = true;

            if (!mpesaCode || mpesaCode.length < 8) {
                document.getElementById('mpesa_code').parentElement.classList.add('error');
                isValid = false;
            }

            const mobileRegex = /^[\d\s\-\+\(\)]{10,}$/;
            if (!paymentPhoneNumber || !paymentPhoneNumber.match(mobileRegex)) {
                document.getElementById('payment_phone_number').parentElement.classList.add('error');
                isValid = false;
            }

            if (!isValid) {
                showToast('Please fill in all required fields correctly', 'error');
                return;
            }

            // Show loading state
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner"></div><span>Processing...</span>';

            // Prepare form data
            const formData = new FormData();
            formData.append('email', document.getElementById('email').value);
            formData.append('payment_phone_number', document.getElementById('payment_phone_number').value);
            formData.append('mpesa_code', mpesaCode);
            formData.append('redeemed_amount', redeemedAmount);
            formData.append('action', 'redeem_commitment');

            // Add commitment ID if available
            //if (verifiedCommitment && verifiedCommitment.id) {
            formData.append('commitment_id', verifiedCommitment.id);
            // }

            // Send AJAX request
            fetch('manage/redeem_commitment.php', {
                method: 'POST',
                body: formData
            }).then(response => response.json()).then(data => {
                if (data.success) {
                    // Update success message
                    let successMsg = 'Thank you for redeeming your commitment! ';
                    if (verifiedCommitment) {
                        successMsg += `Your payment of KES ${parseFloat(redeemedAmount).toLocaleString()} has been recorded.`;
                    }


                    document.getElementById('successDetails').textContent = successMsg;

                    showToast('Redemption completed successfully!', 'success');

                    // Move to step 3
                    setTimeout(() => {
                        goToStep(3);
                    }, 1000);
                } else {
                    showToast(data.message || 'Failed to process redemption. Please try again.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-check"></i><span>Complete Redemption</span>';
                }
            })
                .catch(error => {
                    console.error('Submission error:', error);
                    showToast('An error occurred. Please try again.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-check"></i><span>Complete Redemption</span>';
                });
        });

        // Reset form
        function resetForm() {
            document.getElementById('redemptionForm').reset();
            verifiedCommitment = null;
            document.getElementById('commitmentDetails').classList.remove('show');
            goToStep(1);
        }

        // Real-time validation
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', function () {
                if (this.value) {
                    this.parentElement.classList.remove('error');
                }
            });
        });
    </script>
</body>

</html>