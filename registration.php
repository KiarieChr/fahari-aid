<?php 
require_once 'includes/connection.php';

if (isset($_GET['id'])){
    $event_id = $_GET['id']? (int)($_GET['id']):0;
    # get the event details 

    $stmt = $db->prepare('SELECT *FROM event WHERE id=:id');

    $stmt->execute([':id'=>$event_id]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    $event_name = $event['ename'];
    $start_date = $event['start_date'];
    $end_date = $event['end_date'];

}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jesus Enthroned Function Registration</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #0ec2e6 0%, #0d0221 100%),url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(255,255,255,0.1)"/></svg>');
            background-size: cover;
            background-blend-mode: overlay;
            background-repeat: no-repeat;
            background-position: center;

            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #0d0221 0%, #1c024bff 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header p {
            font-size: 16px;
            opacity: 0.9;
        }

        .progress-bar {
            display: flex;
            justify-content: space-between;
            padding: 30px;
            background: #f8f9fa;
        }

        .progress-step {
            flex: 1;
            text-align: center;
            position: relative;
        }

        .progress-step::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 50%;
            width: 100%;
            height: 2px;
            background: #e0e0e0;
            z-index: 1;
        }

        .progress-step:first-child::before {
            display: none;
        }

        .progress-circle {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #e0e0e0;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            position: relative;
            z-index: 2;
            transition: all 0.3s ease;
        }

        .progress-step.active .progress-circle {
            background: #667eea;
            transform: scale(1.2);
        }

        .progress-step.completed .progress-circle {
            background: #10b981;
        }

        .progress-label {
            font-size: 12px;
            color: #666;
            font-weight: 500;
        }

        .form-content {
            padding: 40px 30px;
        }

        .step {
            display: none;
            animation: fadeIn 0.5s ease;
        }

        .step.active {
            display: block;
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

        .form-group {
            margin-bottom: 25px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 15px;
            transition: all 0.3s ease;
            font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group textarea {
            min-height: 100px;
            resize: vertical;
        }
        .form-group input[type='radio']{
            display:inline;
            padding: 10px!important;
            width: 20px!important;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .checkbox-group:hover {
            background: #e9ecef;
        }

        .checkbox-group input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }

        .checkbox-group label {
            margin: 0;
            cursor: pointer;
            flex: 1;
        }

        .button-group {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }

        .btn {
            flex: 1;
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: linear-gradient(135deg, #0d0221 0%, #1c024bff 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: #e0e0e0;
            color: #666;
        }

        .btn-secondary:hover {
            background: #d0d0d0;
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .event-card {
            padding: 15px; 
            border-left: 4px solid #3498db;
            border-radius: 10px;
            margin-bottom: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .event-card:hover {
            border-color: #3498db;
            background: #f8f9fa;
        }

        .event-card input[type="radio"] {
            margin-right: 15px;
        }

        .event-card label {
            cursor: pointer;
            display: flex;
            align-items: center;
            font-weight: normal;
        }

        .event-info {
            flex: 1;
        }

        .event-name {
            font-weight: 600;
            font-size: 16px;
            color: #333;
            margin-bottom: 5px;
        }

        .event-date {
            font-size: 14px;
            color: #666;
        }

        .success-message {
            text-align: center;
            padding: 60px 30px;
        }

        .success-icon {
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: scaleIn 0.5s ease;
        }

        @keyframes scaleIn {
            from {
                transform: scale(0);
            }
            to {
                transform: scale(1);
            }
        }

        .success-icon::after {
            content: '✓';
            color: white;
            font-size: 40px;
            font-weight: bold;
        }

        .success-message h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 28px;
        }

        .success-message p {
            color: #666;
            margin-bottom: 15px;
            line-height: 1.6;
        }

        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Jesus Enthroned Network</h1>
            <p>Join us for our December 2025 Conference</p>
        </div>

        <div class="progress-bar" id="progressBar">
            <div class="progress-step active" data-step="1">
                <div class="progress-circle">1</div>
                <div class="progress-label">Personal Details</div>
            </div>
            <div class="progress-step" data-step="2">
                <div class="progress-circle">2</div>
                <div class="progress-label">Event Details</div>
            </div>
            <div class="progress-step" data-step="3">
                <div class="progress-circle">3</div>
                <div class="progress-label">Additional Info</div>
            </div>
        </div>

        <form id="registrationForm" method="POST" action="manage/process-registration.php">
            <div class="form-content">
                <!-- Step 1: Personal Information -->
                <div class="step active" data-step="1">
                    <h2 style="margin-bottom: 25px; color: #333;">Personal Information</h2>
                    
                    <div class="form-group">
                        <label for="names">Full Name *</label>
                        <input type="text" id="names" name="names" required>
                    </div>

                    <div class="form-group">
                        <label for="phone_no">Phone Number*</label>
                        <input type="tel" id="phone_no" name="phone_no" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input type="email" id="email" name="email" required>
                        <small>If you don't have one put your phone-number@first.com 
                            eg <strong>0759437978@james.com</strong> 
                        </small>
                    </div>

                    <div class="form-group">
                        <label for="residence">Residence *</label>
                        <input type="tel" id="residence" name="residence" required>
                    </div>
                    <div class="form-group">
                        <label for="residence">Gender *</label>
                        <input type="radio" id="male" name="gender" value="male" required> Male
                         <input type="radio" id="female" name="gender" value="female" required> Female
                    </div>

                    <div class="button-group">
                        <button type="button" class="btn btn-primary" onclick="nextStep()">Next →</button>
                    </div>
                </div>

                <!-- Step 2: Event Details -->
                <div class="step" data-step="2">
                    <h2 style="margin-bottom: 25px; color: #333;">Event Information</h2>
                    
                    <?php if(isset($_GET['id'])){?>
                    <div class="form-group">
                        <div class="event-card">
                            <label>
                                <div class="event-info">
                                    <div class="event-name"><?= $event_name;?></div>
                                    <input type="hidden" value="<?= $event['id'];?>" name="event_id">
                                    <div class="event-date">Scheduled on:<?= date('M d, Y h:i a',strtotime($start_date));?> to <?= date('M d, Y h:i a',strtotime($end_date));?></div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="area_travel_from">Where will you be travelling From?</label>
                        <input type="text" name="area_travel_from" id="area_travel_from" required>
                    </div>
                    <div class="form-group">
                        <label for="area_travel_from">Guardian Phone No</label>
                        <input type="tel" name="guardian_telno" id="guardian_telno" >
                    </div>



                    <?php }
                     else {
                      ?>
                    <div class="form-group">
                        <div class="event-card">
                           <div class="card">
                            <i class="fa fa-info"></i>
                            <span>Sorry, We are unable to know which event or meetings you are registering for. Kindly reach out to our Secretariat for guidance</span>
                            <i class="fa fa-phone"></i><span>0702761913</span>
                           </div>
                        </div>
                    </div>
                    <?php }?>

                    <div class="form-group">
                        <label for="attendees">How many will you Mobilise for the Conference *</label>
                        <select id="attendees" name="attendees" required>
                            <option value="" disabled>Select Below</option>
                            <option value="2">2 People</option>
                            <option value="3">3 People</option>
                            <option value="4">4 People</option>
                            <option value="5">5 People</option>
                            <option value="10">10 People</option>
                            <option value="20">20 People</option>
                            <option value="50">50+ People</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="sponsorship">Will you be able to raise the Facilitation Fee</label>
                        <select name="sponsorship" id="sponsorship" id='sponsorship'>
                            <option value="Select" disabled>Select Below</option>
                            <option value="no-sponsor">Yes, I will Raise the full amount</option>
                            <option value="half-sponsor">No, I need half Assistance of half the amount</option>
                            <option value="sponsored-fully">No, I need full Assistance</option>

                        </select>
                    </div>

                    <div class="button-group">
                        <button type="button" class="btn btn-secondary" onclick="prevStep()">← Back</button>
                        <button type="button" class="btn btn-primary" onclick="nextStep()">Next →</button>
                    </div>
                </div>

                <!-- Step 3: Additional Information -->
                <div class="step" data-step="3">
                    <h2 style="margin-bottom: 25px; color: #333;">Additional Information</h2>
                    <div class="form-group">
                        <label for="category">Select Your Category</label>
                        <select name="category" id="category" required>
                            <option value="Select Category" disabled>Select</option>
                            <option value="minister">Minister Of the Gospel</option>
                            <option value="form4">Form Four Graduate</option>
                            <option value="form3">Form Three Student</option>
                            <option value="high-school">High School Student(F2)</option>
                            <option value="JSS">JSS Student</option>
                            <option value="college">College/University Student</option>
                            <option value="public-servant">Public Servant/ Formal Employee</option>
                            <option value="entreprenuer">Business Man/Lady</option>
                            <option value="others">Other Category</option>
                        </select>
                    </div>
                    
                    
                    <div class="form-group">
                        <label for="specialNeeds">Special Needs or Accommodations</label>
                        <textarea id="specialNeeds" name="specialNeeds" placeholder="Let us know if you require any special accommodations..."></textarea>
                    </div>

                    <div class="form-group">
                        <div class="checkbox-group">
                            <input type="checkbox" id="serve" name="serve" value="yes">
                            <label for="volunteer">I'm interested in Serve at the Conference</label>
                           
                        </div>
                         <small>Note that a form to register to serve will be shared and once share you will receive an email to register.</small>
                    </div>

                    <div class="form-group">
                        <label for="prayer">Expectations (Optional)</label>
                        <textarea id="prayer" name="prayer" placeholder="Share your expectations for the conference with us..."></textarea>
                    </div>

                    <div class="button-group">
                        <button type="button" class="btn btn-secondary" onclick="prevStep()">← Back</button>
                        <button type="submit" class="btn btn-primary">Complete Registration</button>
                    </div>
                </div>
            </div>
        </form>

        <!-- Success Message (hidden by default) -->
        <div id="successMessage" class="success-message hidden">
            <div class="success-icon"></div>
            <h2>Registration Complete!</h2>
            <p>Thank you for registering! We've received your information and a confirmation email has been sent to your email address.</p>
            <p style="color: #667eea; font-weight: 600;">We look forward to seeing you at the conference!</p>
        </div>
    </div>

    <script>
        let currentStep = 1;

        function updateProgressBar() {
            const steps = document.querySelectorAll('.progress-step');
            steps.forEach((step, index) => {
                const stepNum = index + 1;
                if (stepNum < currentStep) {
                    step.classList.add('completed');
                    step.classList.remove('active');
                } else if (stepNum === currentStep) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
        }

        function showStep(stepNumber) {
            const steps = document.querySelectorAll('.step');
            steps.forEach(step => {
                step.classList.remove('active');
            });
            document.querySelector(`.step[data-step="${stepNumber}"]`).classList.add('active');
            currentStep = stepNumber;
            updateProgressBar();
        }

        function nextStep() {
            const currentStepElement = document.querySelector(`.step[data-step="${currentStep}"]`);
            const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
            
            let isValid = true;
            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    isValid = false;
                    input.reportValidity();
                }
            });

            if (isValid && currentStep < 3) {
                showStep(currentStep + 1);
            }
        }

        function prevStep() {
            if (currentStep > 1) {
                showStep(currentStep - 1);
            }
        }

       document.getElementById('registrationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(this);
            
            // Convert FormData to JSON (optional, depending on your PHP backend preference)
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            // Show loading state (optional)
            const submitBtn = document.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            // Submit via AJAX
            fetch('manage/process-registration.php', {
                method: 'POST',
                body: formData
                
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // Hide form and progress bar
                    document.getElementById('progressBar').style.display = 'none';
                    document.querySelector('.form-content').style.display = 'none';
                    
                    // Show success message
                    document.getElementById('successMessage').classList.remove('hidden');
                } else {
                    // Handle error
                    alert('Error: ' + (result.message || 'Registration failed. Please try again.'));
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });

        // Initialize
        updateProgressBar();
    </script>
</body>
</html>