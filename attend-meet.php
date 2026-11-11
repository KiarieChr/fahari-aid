<!DOCTYPE html>
<html lang="en">
<?PHP include('includes/connection.php');?>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Session Attendance | Jesus Enthroned Network</title>
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

        /* Countdown Timer Styles */
        .countdown-container {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            border: 2px solid #0ec2e6;
            display: none;
        }

        .countdown-container.active {
            display: block;
            animation: fadeIn 0.5s;
        }

        .countdown-title {
            color: #0d0221;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .countdown-title i {
            color: #0ec2e6;
        }

        .countdown-timer {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 15px;
        }

        .countdown-unit {
            background: white;
            border-radius: 10px;
            padding: 15px 10px;
            min-width: 70px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .countdown-value {
            font-size: 28px;
            font-weight: 700;
            color: #0ec2e6;
            display: block;
            line-height: 1;
        }

        .countdown-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 5px;
            display: block;
        }

        .countdown-message {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
            line-height: 1.5;
        }

        .countdown-warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            border-radius: 8px;
            margin-top: 15px;
            text-align: left;
        }

        .countdown-warning i {
            color: #ffc107;
            margin-right: 8px;
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

            .countdown-timer {
                gap: 10px;
            }

            .countdown-unit {
                min-width: 60px;
                padding: 12px 8px;
            }

            .countdown-value {
                font-size: 24px;
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
        <?php 
        $meetingData = null;
        if(isset($_GET['meeting_id'])) {
            $meeting_id2 = $_GET['meeting_id'];
            $stmt = $db->prepare("SELECT * FROM meeting WHERE id=:meeting_id");
            $stmt->execute([':meeting_id' => $meeting_id2]);
            $meeting = $stmt->fetch(PDO::FETCH_ASSOC);

            if(!empty($meeting)) {
                $description = $meeting['description'] . "\n Kindly provide your phone number. This ensures we continually pray for you.";
                $meetingData = $meeting;
            } else {
                $description = "Kindly Provide your phone number below for our records and that we may also continually pray for you";
            }
        } else {
            $description = "Kindly Provide your phone number below for our records and that we may also continually pray for you";
        }
        ?>
        
        <!-- Countdown Timer (hidden by default) -->
        <div class="countdown-container" id="countdownContainer">
            <div class="countdown-title">
                <i class="fas fa-clock"></i>
                <span>Session Starts In:</span>
            </div>
            <div class="countdown-timer">
                <div class="countdown-unit">
                    <span class="countdown-value" id="countdownDays">00</span>
                    <span class="countdown-label">Days</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-value" id="countdownHours">00</span>
                    <span class="countdown-label">Hours</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-value" id="countdownMinutes">00</span>
                    <span class="countdown-label">Minutes</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-value" id="countdownSeconds">00</span>
                    <span class="countdown-label">Seconds</span>
                </div>
            </div>
            <div class="countdown-message" id="countdownMessage">
                The session will begin shortly. Please wait...
            </div>
            <div class="countdown-warning">
                <i class="fas fa-exclamation-circle"></i>
                <span>You will be redirected automatically when the session starts.</span>
            </div>
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
                    <div class="step-label">Go to Meeting</div>
                </div>
            </div>

            <form id="attendanceForm">
                <!-- Step 1: Verification -->
                <div class="form-step active" id="step1">
                    <div class="description" id="email">
                        <h3 style="margin-bottom: 10px; color: #2c3e50; margin-top:10px;">Attend Today's Session</h3>
                        <span><?php if(!empty($description)) echo $description; ?></span> <br>                   </div>
                    
                  <?php if(isset($_GET['meeting_id'])): ?>
                        <input type="hidden" id="meeting_id" name="meeting_id" value="<?= $meeting_id2; ?>">
                    <?php else: ?> 
                        <div class="input-group" id="meetingGroup">
                            <label for="meeting_id"> <i class="fas fa-video"></i>Meeting</label>
                            <select name="meeting_id" id="meeting_id">
                                <option value="" disabled class="">Select Meeting</option>
                                <?php 
                                try { 
                                    $get_mt = $db->query("SELECT * FROM meeting WHERE end_time >= CURDATE() ORDER BY start_time ASC");
                                    $meetings = $get_mt->fetchAll(PDO::FETCH_ASSOC);
                                    
                                    if(!empty($meetings)) {
                                        foreach($meetings as $index => $row) {
                                            $id = $row['id'];
                                            $name = $row['name'];
                                            $start_time = $row['start_time'];
                                            $end_time = $row['end_time'];
                                            
                                            // Format time for display
                                            $start_display = date("M d, Y h:i A", strtotime($start_time));
                                            $end_display = date("M d, Y h:i A", strtotime($end_time));
                                ?>
                                            <option value="<?php echo $id; ?>" data-start="<?php echo htmlspecialchars($start_time); ?>" data-end="<?php echo htmlspecialchars($end_time); ?>">
                                                <?php echo htmlspecialchars($name) . " (" . htmlspecialchars($start_display) . " - " . htmlspecialchars($end_display) . ")"; ?>
                                            </option>
                                <?php 
                                        } // End foreach
                                    } // End if(!empty($meetings))
                                } catch(PDOException $e) {
                                    // Handle error gracefully
                                    echo '<option value="" disabled>Error loading meetings</option>';
                                    error_log("Database error: " . $e->getMessage());
                                }
                                ?>
                            </select>
                        </div>
                    <?php endif; ?>
                    
                    <div class="input-group" id="phoneGroup">
                        <label for="phone_number">
                            <i class="fas fa-phone"></i> Phone Number
                        </label>
                        <input type="tel" id="phone_no" name="phone_no" placeholder="e.g., 0712xxxxxx/0112xxxxxx" required>
                        <div class="error-message">Please enter a valid phone number (10+ digits)</div>
                    </div>

                    <button type="button" class="btn btn-primary" id="verifyBtn" onclick="verifyCommitment()">
                        <i class="fas fa-check-circle"></i>
                        <span id="verifyBtnText">Verify & Continue</span>
                    </button>
                </div>

                <!-- Step 2: Meeting Details -->
                <div class="form-step" id="step2">
                    <div class="success-message show" id="successMessage">
                        <i class="fas fa-check-circle"></i>
                        <h2 id="meetingStatusTitle">Meeting Verified!</h2>
                        <p id="meetingStatusMessage">Welcome! Please join the session.</p>
                        <div id="meetingDetails" style="margin-top: 20px; text-align: left; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <h4 style="color: #0d0221; margin-bottom: 10px;">Meeting Details:</h4>
                            <p><strong>Meeting:</strong> <span id="displayMeetingName">-</span></p>
                            <p><strong>Start Time:</strong> <span id="displayStartTime">-</span></p>
                            <p><strong>End Time:</strong> <span id="displayEndTime">-</span></p>
                            <p><strong>Status:</strong> <span id="displayStatus" class="badge" style="padding: 5px 10px; border-radius: 20px;">-</span></p>
                        </div>
                        
                        <!-- Join Button -->
                        <div style="margin-top: 25px;">
                            <button type="button" class="btn btn-primary" id="joinMeetingBtn" style="width: auto; padding: 12px 30px;">
                                <i class="fas fa-video"></i>
                                <span id="joinBtnText">Join Meeting Now</span>
                            </button>
                        </div>
                    </div>

                    <div class="btn-group">
                        <button type="button" class="btn btn-secondary" onclick="goToStep(1)" style="flex: 1;">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <button type="button" class="btn btn-primary" id="redirectBtn" style="flex: 2;" onclick="redirectToMeeting()">
                            <i class="fas fa-external-link-alt"></i>
                            <span id="redirectBtnText">Open Meeting</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script>
        let currentStep = 1;
        let meetingInfo = null;
        let countdownInterval = null;
        let meetingStartTime = null;
        let meetingEndTime = null;
        let meetingUrl = null;

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
            
            // Clear countdown if going back to step 1
            if (step === 1) {
                clearCountdown();
            }
        }

        // Clear countdown
        function clearCountdown() {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
            document.getElementById('countdownContainer').classList.remove('active');
        }

        // Start countdown timer
        function startCountdown(startTime) {
            clearCountdown();
            
            const countdownContainer = document.getElementById('countdownContainer');
            countdownContainer.classList.add('active');
            
            function updateCountdown() {
                const now = new Date().getTime();
                const distance = startTime - now;
                
                if (distance < 0) {
                    // Session has started
                    clearInterval(countdownInterval);
                    countdownContainer.classList.remove('active');
                    updateMeetingStatus('live');
                    return;
                }
                
                // Calculate time units
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                // Update display
                document.getElementById('countdownDays').textContent = days.toString().padStart(2, '0');
                document.getElementById('countdownHours').textContent = hours.toString().padStart(2, '0');
                document.getElementById('countdownMinutes').textContent = minutes.toString().padStart(2, '0');
                document.getElementById('countdownSeconds').textContent = seconds.toString().padStart(2, '0');
                
                // Update message based on time remaining
                const messageElement = document.getElementById('countdownMessage');
                if (days > 0) {
                    messageElement.textContent = `Session starts in ${days} day${days > 1 ? 's' : ''}`;
                } else if (hours > 0) {
                    messageElement.textContent = `Session starts in ${hours} hour${hours > 1 ? 's' : ''}`;
                } else if (minutes > 0) {
                    messageElement.textContent = `Session starts in ${minutes} minute${minutes > 1 ? 's' : ''}`;
                } else {
                    messageElement.textContent = `Session starts in ${seconds} second${seconds > 1 ? 's' : ''}`;
                }
            }
            
            // Update immediately
            updateCountdown();
            
            // Update every second
            countdownInterval = setInterval(updateCountdown, 1000);
        }

        // Update meeting status display
        function updateMeetingStatus(status) {
            const statusElement = document.getElementById('displayStatus');
            const joinBtn = document.getElementById('joinMeetingBtn');
            const redirectBtn = document.getElementById('redirectBtn');
            const titleElement = document.getElementById('meetingStatusTitle');
            const messageElement = document.getElementById('meetingStatusMessage');
            
            switch(status) {
                case 'upcoming':
                    statusElement.textContent = 'Upcoming';
                    statusElement.style.backgroundColor = '#ffc107';
                    statusElement.style.color = '#212529';
                    titleElement.textContent = 'Meeting Verified!';
                    messageElement.textContent = 'The session will start soon. Please wait for the countdown.';
                    joinBtn.disabled = true;
                    joinBtn.innerHTML = '<i class="fas fa-clock"></i><span>Meeting Starts Soon</span>';
                    redirectBtn.disabled = true;
                    break;
                    
                case 'live':
                    statusElement.textContent = 'Live Now';
                    statusElement.style.backgroundColor = '#28a745';
                    statusElement.style.color = 'white';
                    titleElement.textContent = 'Meeting is Live!';
                    messageElement.textContent = 'The session has started. You can join now!';
                    joinBtn.disabled = false;
                    joinBtn.innerHTML = '<i class="fas fa-video"></i><span>Join Meeting Now</span>';
                    redirectBtn.disabled = false;
                    break;
                    
                case 'ended':
                    statusElement.textContent = 'Ended';
                    statusElement.style.backgroundColor = '#6c757d';
                    statusElement.style.color = 'white';
                    titleElement.textContent = 'Meeting Ended';
                    messageElement.textContent = 'This session has already ended.';
                    joinBtn.disabled = true;
                    joinBtn.innerHTML = '<i class="fas fa-calendar-times"></i><span>Meeting Ended</span>';
                    redirectBtn.disabled = true;
                    break;
            }
        }

        // Verify commitment via AJAX
        function verifyCommitment() {
            // Reset error states
            document.querySelectorAll('.input-group').forEach(group => {
                group.classList.remove('error');
            });

            const meetingId = document.getElementById('meeting_id').value.trim();
            const phoneNumber = document.getElementById('phone_no').value.trim();

            // Validation
            let isValid = true;

            if (!phoneNumber || phoneNumber.length < 10) {
                document.getElementById('phoneGroup').classList.add('error');
                isValid = false;
            }

            if (!isValid) {
                showToast('Please enter a valid phone number (10+ digits)', 'error');
                return;
            }

            // Show loading state
            const verifyBtn = document.getElementById('verifyBtn');
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<span class="spinner"></span> Processing...';

            // Prepare form data
            const formData = new FormData();
            formData.append('meeting_id', meetingId);
            formData.append('phone_no', phoneNumber);
            formData.append('action', 'verify_commitment');

            // Send AJAX request
            fetch('manage/mark-attendance.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Store meeting info
                    //meetingInfo = data.meeting_info || {};
                    meetingUrl = data.redirect;
                    
                    // Update display with meeting details
                    //if (meetingInfo) {
                       // document.getElementById('displayMeetingName').textContent = meetingInfo.name || '-';
                       // document.getElementById('displayStartTime').textContent = meetingInfo.start_time_formatted || '-';
                      //  document.getElementById('displayEndTime').textContent = meetingInfo.end_time_formatted || '-';
                        
                        // Check meeting time status
                        //const now = new Date();
                       // const startTime = new Date(meetingInfo.start_time);
                        //const endTime = new Date(meetingInfo.end_time);
                        
                     //   meetingStartTime = startTime.getTime();
                      //  meetingEndTime = endTime.getTime();
                        
                      //  if (now < startTime) {
                            // Meeting hasn't started yet
                       //     updateMeetingStatus('upcoming');
                       //     startCountdown(meetingStartTime);
                      //  } else if (now >= startTime && now <= endTime) {
                            // Meeting is live
                      //      updateMeetingStatus('live');
                      //  } else {
                            // Meeting has ended
                        //    updateMeetingStatus('ended');
                       // }
                    //}
                    
                    showToast(data.message || 'Attendance marked successfully!', 'success');
                    
                    // Move to step 2
                    setTimeout(() => {
                        goToStep(2);
                    }, 1000);
                    
                    window.location.href = meetingUrl;
                    
                } else {
                    showToast(data.message || 'Verification failed. Please try again.', 'error');
                    // Optional: redirect to registration
                    if(data.redirect) {
                        setTimeout(() => {
                            window.location.href = data.redirect;
                        }, 2000);
                    }
                }
            })
            .catch(error => {
                console.error('Verification error:', error);
                showToast('An error occurred during verification. Please try again.', 'error');
            })
            .finally(() => {
                // Restore button state
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Verify & Continue</span>';
            });
        }

        // Redirect to meeting
        function redirectToMeeting() {
            if (!meetingUrl) {
                showToast('Meeting URL not available', 'error');
                return;
            }
            
            const now = new Date().getTime();
            
            // Check if meeting has started
            if (now < meetingStartTime) {
                showToast('Meeting has not started yet. Please wait for the countdown.', 'warning');
                return;
            }
            
            // Check if meeting has ended
            if (now > meetingEndTime) {
                showToast('Meeting has already ended.', 'error');
                return;
            }
            
            // Redirect to meeting
            window.open(meetingUrl, '_blank');
            
            // Optional: mark attendance as joined
            markAttendanceAsJoined();
        }

        // Mark attendance as joined
        function markAttendanceAsJoined() {
            // You can implement this function to update attendance status
            // when user actually joins the meeting
            console.log('User joined the meeting');
        }

        // Join meeting button click
        document.getElementById('joinMeetingBtn').addEventListener('click', function() {
            redirectToMeeting();
        });

        // Form submission
        document.getElementById('attendanceForm').addEventListener('submit', function (e) {
            e.preventDefault();
            if (currentStep === 2) {
                redirectToMeeting();
            }
        });

        // Real-time validation
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', function () {
                if (this.value) {
                    this.parentElement.classList.remove('error');
                }
            });
        });

        // Initialize based on meeting_id from URL
        <?php if(isset($_GET['meeting_id']) && !empty($meetingData)): ?>
        document.addEventListener('DOMContentLoaded', function() {
            // Pre-fill meeting info if from URL
            meetingInfo = <?php echo json_encode($meetingData); ?>;
            
            // Parse dates
            const startTime = new Date('<?php echo $meetingData['start_time']; ?>');
            const endTime = new Date('<?php echo $meetingData['end_time']; ?>');
            const now = new Date();
            
            // Format dates for display
            function formatDate(date) {
                return date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            // Update description with meeting time
            const descriptionElement = document.querySelector('.description span');
            if (descriptionElement && meetingInfo) {
                descriptionElement.textContent = meetingInfo.description + 
                    "\n\nSession Time: " + formatDate(startTime) + 
                    "\nKindly provide your phone number to join.";
            }
            
            // Check if we should show countdown
            if (now < startTime) {
                meetingStartTime = startTime.getTime();
                startCountdown(meetingStartTime);
            }
        });
        <?php endif; ?>

        // Check meeting time when selection changes
        document.getElementById('meeting_id')?.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const startTime = selectedOption.getAttribute('data-start');
            const endTime = selectedOption.getAttribute('data-end');
            
            if (startTime && endTime) {
                const now = new Date();
                const start = new Date(startTime);
                const end = new Date(endTime);
                
                meetingStartTime = start.getTime();
                meetingEndTime = end.getTime();
                
                // Clear any existing countdown
                clearCountdown();
                
                // Show countdown if meeting hasn't started
                if (now < start) {
                    startCountdown(meetingStartTime);
                }
            }
        });
    </script>
</body>
</html>