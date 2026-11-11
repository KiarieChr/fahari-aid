<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conference Pledge Form</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
        
        .container {
            width: 100%;
            max-width: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }
        
        .header {
            background:linear-gradient(135deg, #0d0221 0%, #1c024bff 100%);
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
        
        .sponsor-options {
            display: none;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 15px;
            border-left: 4px solid #3498db;
        }
        
        .sponsor-type {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .sponsor-option {
            flex: 1;
            text-align: center;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .sponsor-option:hover {
            border-color: #3498db;
            background: #f0f8ff;
        }
        
        .sponsor-option.selected {
            border-color: #3498db;
            background: #e1f0ff;
            box-shadow: 0 0 10px rgba(52, 152, 219, 0.2);
        }
        
        .sponsor-option i {
            font-size: 24px;
            margin-bottom: 10px;
            color: #3498db;
        }
        
        .pledge-details {
            display: none;
            margin-top: 15px;
            animation: fadeIn 0.5s;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .amount-slider {
            margin-top: 10px;
            -webkit-appearance: none;
            width: 100%;
            height: 8px;
            border-radius: 5px;
            background: #ddd;
            outline: none;
        }
        
        .input-control{
            margin-top:20px;
            -webkit-appearance:none;
            width: 100%;
            height: 100%;
            border-radius:5px;
            padding:15px;
            font-size:15px;
            font-weight:600;
                       
        }
        
        .amount-value {
            text-align: center;
            font-size: 24px;
            font-weight: 700;
            color: #3498db;
            margin: 15px 0;
        }
        
        .attendee-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin: 15px 0;
        }
        
        .attendee-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: #3498db;
            color: white;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .attendee-btn:hover {
            background: #2980b9;
            transform: scale(1.1);
        }
        
        .attendee-count {
            font-size: 24px;
            font-weight: 700;
            min-width: 50px;
            text-align: center;
            color: #3498db;
        }
        
        .pledge-button {
            background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
            color: white;
            border: none;
            padding: 16px;
            font-size: 18px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s;
            box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
            margin-top: 20px;
        }
        
        .pledge-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
        }
        
        .pledge-button:active {
            transform: translateY(0);
        }
        
        .success-message {
            display: none;
            text-align: center;
            padding: 30px;
            background: #f5f9ff;
            border-radius: 0 0 16px 16px;
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
            
            .form-container {
                padding: 20px;
            }
            
            .sponsor-type {
                flex-direction: column;
            }
            
            .toast-container {
                left: 20px;
                right: 20px;
            }
            
            .toast {
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <!-- Toast container -->
    <div class="toast-container" id="toastContainer"></div>
    
    <div class="container">
        <div class="header">
            <h1>Make Sponsorship Commitment</h1>
            <p>Your support makes a difference</p>
        </div>
        
        <div class="form-container">
            <form id="pledgeForm">
                <div class="input-group">
                    <label for="purpose"><i class="fas fa-bullseye"></i> Purpose of Commitment</label>
                    <select id="purpose" required>
                        <option value="" disabled selected>Select a purpose</option>
                        <option value="conference">December Conference</option>
                        <option value="partnership">High School Reachout</option>
                        <option value="other">Other Partnerships</option>
                    </select>
                    <div class="error-message">Please select a purpose for your pledge</div>
                </div>
                
                <div class="sponsor-options" id="conferenceOptions">
                    <h3>Sponsorship Type</h3>
                    <p>How would you like to support the December Conference?</p>
                    
                    <div class="sponsor-type">
                        <div class="sponsor-option" data-type="cash">
                            <i class="fas fa-money-bill-wave"></i>
                            <h4>Commit to Give Cash</h4>
                            <p>Commit to Give in Cash</p>
                        </div>
                        <div class="sponsor-option" data-type="attendee">
                            <i class="fas fa-users"></i>
                            <h4>Sponsor Attendee</h4>
                            <p>Commit to Sponsor Attendees to the Conference</p>
                        </div>
                    </div>
                    
                    <div class="pledge-details" id="cashDetails">
                        <input type="text" id="amount" class="input-control" min="100" max="10000" step="100" value="500">
                        <p class="info">Enter the Amount you will support with.</p>
                    </div>
                    
                    <div class="pledge-details" id="attendeeDetails">
                        <div class="attendee-controls">
                            <button type="button" class="attendee-btn" id="decreaseAttendees">-</button>
                            <div class="attendee-count" id="attendeeCount">1</div>
                            <button type="button" class="attendee-btn" id="increaseAttendees">+</button>
                        </div>
                        <p class="info">Each attendee costs KES 1,500 for the conference</p>
                        <div class="amount-value">Total: KES <span id="totalAmount">1500</span></div>
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="fullname"><i class="fas fa-user"></i> Full Name</label>
                    <input type="text" id="fullname" placeholder="Enter your full name" required>
                    <div class="error-message">Please enter your full name</div>
                </div>
                
                <div class="input-group">
                    <label for="email"><i class="fas fa-envelope"></i> Email Address</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email address" required>
                    <div class="error-message">Please enter a valid email address</div>
                </div>
                
                <div class="input-group">
                    <label for="notes"><i class="fas fa-sticky-note"></i> Please Put the Duration we can start reminding you.</label>
                    <input id="notes" name="notes" placeholder="Kindly Put duration like 2 Weeks, 2 Days etc..."/>
                    <small style="color:orange;">Kindly put enter the duration as either 2 days,, something one can put to understand don't put just 2(number)</small>
                </div>

                <div class="input-group">
                    <label>
                        <input type="checkbox" id="recurring" name="recurring">
                        <i class="fas fa-sync-alt"></i> This is a recurring pledge
                    </label>
                </div>
                
                <div class="input-group">
                    <label for="mobile"><i class="fas fa-mobile-alt"></i> Mobile Number</label>
                    <input type="tel" id="mobile" placeholder="Enter your mobile number" required>
                    <div class="error-message">Please enter a valid mobile number</div>
                </div>
                
                <button type="submit" class="pledge-button">
                    <i class="fas fa-hand-holding-heart"></i> Make Pledge
                </button>
            </form>
        </div>
        
        <div class="success-message" id="successMessage">
            <i class="fas fa-check-circle"></i>
            <h2>Commitment Submitted!</h2>
            <p>Thank you for your generous support</p>
            <p id="successDetails"></p>
        </div>
    </div>

    <script>
        // Toast notification function
        function showToast(message, type = 'info', duration = 5000) {
            const toastContainer = document.getElementById('toastContainer');
            
            // Create toast element
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            // Set icon based on type
            let icon = 'info-circle';
            if (type === 'success') icon = 'check-circle';
            if (type === 'error') icon = 'exclamation-circle';
            if (type === 'warning') icon = 'exclamation-triangle';
            
            toast.innerHTML = `
                <i class="fas fa-${icon}"></i>
                <div class="toast-content">${message}</div>
                <button class="toast-close"><i class="fas fa-times"></i></button>
            `;
            
            
            // Add to container
            toastContainer.appendChild(toast);
            
            // Auto remove after duration
            const timeout = setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    toastContainer.removeChild(toast);
                }, 300);
            }, duration);
            
            // Close on button click
            toast.querySelector('.toast-close').addEventListener('click', () => {
                clearTimeout(timeout);
                toast.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    toastContainer.removeChild(toast);
                }, 300);
            });
        }

        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('pledgeForm');
            const purposeSelect = document.getElementById('purpose');
            const conferenceOptions = document.getElementById('conferenceOptions');
            const sponsorOptions = document.querySelectorAll('.sponsor-option');
            const cashDetails = document.getElementById('cashDetails');
            const attendeeDetails = document.getElementById('attendeeDetails');
            const amountInput = document.getElementById('amount');
            const decreaseAttendees = document.getElementById('decreaseAttendees');
            const increaseAttendees = document.getElementById('increaseAttendees');
            const attendeeCount = document.getElementById('attendeeCount');
            const totalAmount = document.getElementById('totalAmount');
            const successMessage = document.getElementById('successMessage');
            const successDetails = document.getElementById('successDetails');
            
            let selectedSponsorType = null;
            let attendees = 1;
            const attendeeCost = 1500;
            
            // Show/hide conference options based on purpose
            purposeSelect.addEventListener('change', function() {
                if (this.value === 'conference') {
                    conferenceOptions.style.display = 'block';
                } else {
                    conferenceOptions.style.display = 'none';
                    cashDetails.style.display = 'none';
                    attendeeDetails.style.display = 'none';
                    selectedSponsorType = null;
                    
                    // Reset sponsor option selections
                    sponsorOptions.forEach(option => {
                        option.classList.remove('selected');
                    });
                }
            });
            
            // Sponsor type selection
            sponsorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Remove selected class from all options
                    sponsorOptions.forEach(opt => opt.classList.remove('selected'));
                    
                    // Add selected class to clicked option
                    this.classList.add('selected');
                    
                    selectedSponsorType = this.dataset.type;
                    
                    // Show the appropriate details section
                    if (selectedSponsorType === 'cash') {
                        cashDetails.style.display = 'block';
                        attendeeDetails.style.display = 'none';
                    } else if (selectedSponsorType === 'attendee') {
                        cashDetails.style.display = 'none';
                        attendeeDetails.style.display = 'block';
                        updateAttendeeTotal();
                    }
                });
            });
            
            // Validate amount input (numbers only)
            amountInput.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
            
            // Attendee controls
            decreaseAttendees.addEventListener('click', function() {
                if (attendees > 1) {
                    attendees--;
                    attendeeCount.textContent = attendees;
                    updateAttendeeTotal();
                }
            });
            
            increaseAttendees.addEventListener('click', function() {
                if (attendees < 20) {
                    attendees++;
                    attendeeCount.textContent = attendees;
                    updateAttendeeTotal();
                }
            });
            
            function updateAttendeeTotal() {
                totalAmount.textContent = attendees * attendeeCost;
            }
            
            // Form submission
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Show loading state
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                submitBtn.disabled = true;
                
                // Reset error states
                const inputGroups = document.querySelectorAll('.input-group');
                inputGroups.forEach(group => {
                    group.classList.remove('error');
                });
                
                let isValid = true;
                let errorMessage = '';
                
                // Validate purpose
                const purpose = document.getElementById('purpose');
                if (!purpose.value) {
                    purpose.parentElement.classList.add('error');
                    isValid = false;
                    errorMessage = 'Please select a purpose for your pledge';
                }
                
                // Validate conference sponsorship type if purpose is conference
                if (purpose.value === 'conference' && !selectedSponsorType) {
                    isValid = false;
                    errorMessage = 'Please select a sponsorship type for the conference';
                }
                
                // Validate full name
                const fullname = document.getElementById('fullname');
                if (!fullname.value.trim()) {
                    fullname.parentElement.classList.add('error');
                    isValid = false;
                    errorMessage = 'Please enter your full name';
                }
                
                // Validate email
                const email = document.getElementById('email');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email.value.match(emailRegex)) {
                    email.parentElement.classList.add('error');
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                
                // Validate mobile number (more flexible validation)
                const mobile = document.getElementById('mobile');
                const mobileRegex = /^[\d\s\-\+\(\)]{10,}$/;
                if (!mobile.value.match(mobileRegex)) {
                    mobile.parentElement.classList.add('error');
                    isValid = false;
                    errorMessage = 'Please enter a valid mobile number';
                }
                
                // Validate amount for cash sponsorship
                if (purpose.value === 'conference' && selectedSponsorType === 'cash') {
                    const amount = document.getElementById('amount').value;
                    if (!amount || isNaN(amount) || parseInt(amount) < 100) {
                        isValid = false;
                        errorMessage = 'Please enter a valid amount (minimum KES 100)';
                    }
                }
                
                // If form is valid, process submission
                if (isValid) {
                    // Prepare form data
                    const formData = new FormData();
                    formData.append('full_name', document.getElementById('fullname').value);
                    formData.append('phone_no', document.getElementById('mobile').value);
                    formData.append('email', document.getElementById('email').value);
                    formData.append('purpose', document.getElementById('purpose').value);
                    
                    // Add notes if available
                    if (document.getElementById('notes').value) {
                        formData.append('notes', document.getElementById('notes').value);
                    }
                    
                    // Add recurring information
                    formData.append('recurring', document.getElementById('recurring').checked ? '1' : '0');
                    
                    // Handle conference-specific data
                    if (document.getElementById('purpose').value === 'conference') {
                        formData.append('sponsorship_type', selectedSponsorType);
                        
                        if (selectedSponsorType === 'cash') {
                            formData.append('amount', document.getElementById('amount').value);
                        } else if (selectedSponsorType === 'attendee') {
                            formData.append('attendees', document.getElementById('attendeeCount').textContent);
                            formData.append('amount', attendees * attendeeCost);
                        }
                    }
                    
                    // Send AJAX request
                    fetch('manage/record_pledge.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Show success message
                            form.style.display = 'none';
                            successMessage.style.display = 'block';
                            
                            // Prepare success details
                            let detailsText = '';
                            if (purpose.value === 'conference') {
                                if (selectedSponsorType === 'cash') {
                                    detailsText = `You've pledged KES ${amountInput.value} for the December Conference`;
                                } else {
                                    detailsText = `You've pledged to sponsor ${attendees} attendee(s) for the December Conference (Total: KES ${attendees * attendeeCost})`;
                                }
                            } else {
                                detailsText = `You've pledged to support: ${purpose.options[purpose.selectedIndex].text}`;
                            }
                            
                            successDetails.textContent = detailsText;
                            
                            // Show success toast
                            showToast('Pledge submitted successfully!', 'success');
                        } else {
                            // Show error toast
                            showToast(data.message || 'Error submitting pledge', 'error');
                            
                            // Restore button state
                            submitBtn.innerHTML = originalText;
                            submitBtn.disabled = false;
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        // Show error toast
                        showToast('An error occurred while submitting the form.', 'error');
                        
                        // Restore button state
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    });
                } else {
                    // Show error toast
                    showToast(errorMessage, 'error');
                    
                    // Form is invalid, reset button state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }); 
            
            // Add real-time validation
            const inputs = document.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.addEventListener('input', function() {
                    if (this.value) {
                        this.parentElement.classList.remove('error');
                    }
                });
            });
        });
    </script>
</body>
</html>