<?php
// fasting_dashboard.php - Integrated version

date_default_timezone_set("Africa/Nairobi");
include('includes/checklogin.php');

$title = "Prayer & Fasting Dashboard | Jesus Enthroned Network";
include("includes/get_user.php");

// Get filter parameters
$filter_day = $_GET['day'] ?? '';
$filter_date = $_GET['date'] ?? '';

// Build query
$sql = "SELECT 
            fc.id, 
            fc.member_id,
            fc.name, 
            fc.email, 
            fc.phone,
            fc.monday,
            fc.tuesday,
            fc.wednesday,
            fc.thursday,
            fc.friday,
            fc.saturday,
            fc.sunday,
            DATE(fc.created_at) as created_date,
            TIME(fc.created_at) as created_time,
            m.first_name,
            m.last_name
        FROM fasting_commitments fc
        LEFT JOIN member m ON fc.member_id = m.id
        WHERE 1=1";

$params = [];

// Apply day filter
if ($filter_day && in_array($filter_day, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])) {
    $sql .= " AND fc.$filter_day = 1";
}

// Apply date filter
if ($filter_date && preg_match('/^\d{4}-\d{2}-\d{2}$/', $filter_date)) {
    $sql .= " AND DATE(fc.created_at) = :date";
    $params[':date'] = $filter_date;
}

$sql .= " ORDER BY fc.created_at DESC";

// Execute query
$stmt = $db->prepare($sql);
$stmt->execute($params);
$commitments = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get statistics
$statsStmt = $db->query("
    SELECT 
        COUNT(*) as total_commitments,
        COUNT(DISTINCT email) as unique_participants,
        SUM(monday) as monday_count,
        SUM(tuesday) as tuesday_count,
        SUM(wednesday) as wednesday_count,
        SUM(thursday) as thursday_count,
        SUM(friday) as friday_count,
        SUM(saturday) as saturday_count,
        SUM(sunday) as sunday_count,
        DATE(created_at) as date,
        COUNT(*) as daily_count
    FROM fasting_commitments 
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 7
");
$stats = $statsStmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!doctype html>
<html lang="en" class="layout-navbar-fixed layout-menu-fixed layout-compact" data-assets-path="../assets/" data-template="vertical-menu-template-free">
<?php @include('includes/header.php'); ?>

<style>
    :root {
        --primary: #0d0221;
        --accent: #0ec2e6;
        --light: #eff3c1;
        --white: #ffffff;
        --border: #e0e0e0;
        --success: #28a745;
        --warning: #ffc107;
        --info: #17a2b8;
        --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        --radius: 12px;
        --radius-sm: 8px;
    }

    .fasting-dashboard-container {
        background: var(--light);
        color: #333;
        line-height: 1.6;
    }

    .fasting-header {
        background: linear-gradient(135deg, var(--primary) 0%, #1a0340 100%);
        color: var(--white);
        padding: 30px;
        border-radius: var(--radius);
        margin-bottom: 30px;
        box-shadow: var(--shadow);
        position: relative;
        overflow: hidden;
    }

    .fasting-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(14,194,230,0.1)"/></svg>');
    }

    .fasting-header h1 {
        font-size: 2.5rem;
        margin-bottom: 10px;
        position: relative;
        z-index: 1;
    }

    .fasting-header p {
        font-size: 1.1rem;
        opacity: 0.9;
        position: relative;
        z-index: 1;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .stat-card {
        background: var(--white);
        padding: 25px;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        transition: transform 0.3s ease;
    }

    .stat-card:hover {
        transform: translateY(-5px);
    }

    .stat-card h3 {
        color: var(--primary);
        font-size: 1rem;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .stat-card .number {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--accent);
        line-height: 1;
    }

    .stat-card .subtext {
        color: #666;
        font-size: 0.9rem;
        margin-top: 10px;
    }

    .filter-section {
        background: var(--white);
        padding: 25px;
        border-radius: var(--radius);
        margin-bottom: 30px;
        box-shadow: var(--shadow);
    }

    .filter-section h2 {
        color: var(--primary);
        margin-bottom: 20px;
        font-size: 1.5rem;
    }

    .filter-form {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        align-items: flex-end;
    }

    .form-group {
        flex: 1;
        min-width: 200px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--primary);
    }

    .form-control-custom {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid var(--border);
        border-radius: var(--radius-sm);
        font-size: 1rem;
        transition: all 0.3s ease;
        background: var(--white);
        color: #333;
    }

    .form-control-custom:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(14, 194, 230, 0.1);
    }

    .btn-custom {
        padding: 12px 30px;
        border: none;
        border-radius: var(--radius-sm);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .btn-primary-custom {
        background: var(--accent);
        color: var(--white);
    }

    .btn-primary-custom:hover {
        background: #0aa8c9;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(14, 194, 230, 0.3);
    }

    .btn-secondary-custom {
        background: #6c757d;
        color: var(--white);
    }

    .btn-secondary-custom:hover {
        background: #5a6268;
    }

    .commitments-table-container {
        background: var(--white);
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow);
        margin-bottom: 30px;
    }

    .table-responsive-custom {
        overflow-x: auto;
    }

    .custom-table {
        width: 100%;
        border-collapse: collapse;
    }

    .custom-table thead {
        background: var(--primary);
        color: var(--white);
    }

    .custom-table th {
        padding: 18px 15px;
        text-align: left;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.9rem;
    }

    .custom-table tbody tr {
        border-bottom: 1px solid var(--border);
        transition: background-color 0.3s ease;
    }

    .custom-table tbody tr:hover {
        background-color: rgba(14, 194, 230, 0.05);
    }

    .custom-table td {
        padding: 15px;
        vertical-align: middle;
    }

    .day-indicator {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        font-weight: 600;
        font-size: 0.85rem;
    }

    .day-active {
        background: var(--success);
        color: var(--white);
    }

    .day-inactive {
        background: #f8f9fa;
        color: #6c757d;
    }

    .export-buttons {
        display: flex;
        gap: 15px;
        margin-top: 20px;
    }

    @media (max-width: 768px) {
        .fasting-header h1 {
            font-size: 2rem;
        }
        
        .stats-grid {
            grid-template-columns: 1fr;
        }
        
        .filter-form {
            flex-direction: column;
        }
        
        .form-group {
            min-width: 100%;
        }
        
        .custom-table th, 
        .custom-table td {
            padding: 12px 8px;
        }
    }
</style>

<body>
    <!-- Layout wrapper -->
    <div class="layout-wrapper layout-content-navbar">
        <div class="layout-container">
            <!-- Menu -->
            <?php @include('includes/sidebar.php'); ?>
            <!-- / Menu -->

            <!-- Layout container -->
            <div class="layout-page">
                <!-- Navbar -->
                <?php @include('includes/nav.php'); ?>
                <!-- / Navbar -->

                <!-- Content wrapper -->
                <div class="content-wrapper">
                    <!-- Content -->
                    <div class="container-xxl flex-grow-1 container-p-y fasting-dashboard-container">
                        <div class="fasting-header">
                            <h1><i class="fas fa-pray"></i> Prayer & Fasting Dashboard</h1>
                            <p>Manage and view fasting commitments across the network</p>
                        </div>

                        <!-- Statistics -->
                        <div class="stats-grid">
                            <div class="stat-card">
                                <h3>Total Commitments</h3>
                                <div class="number"><?php echo count($commitments); ?></div>
                                <div class="subtext">Total prayer commitments</div>
                            </div>
                            
                            <div class="stat-card">
                                <h3>Unique Participants</h3>
                                <div class="number"><?php echo !empty($stats[0]['unique_participants']) ? $stats[0]['unique_participants'] : 0; ?></div>
                                <div class="subtext">Distinct participants</div>
                            </div>
                            
                            <div class="stat-card">
                                <h3>Most Popular Day</h3>
                                <?php
                                $dayCounts = [];
                                if (!empty($stats[0])) {
                                    $dayCounts = [
                                        'Monday' => $stats[0]['monday_count'] ?? 0,
                                        'Tuesday' => $stats[0]['tuesday_count'] ?? 0,
                                        'Wednesday' => $stats[0]['wednesday_count'] ?? 0,
                                        'Thursday' => $stats[0]['thursday_count'] ?? 0,
                                        'Friday' => $stats[0]['friday_count'] ?? 0,
                                        'Saturday' => $stats[0]['saturday_count'] ?? 0,
                                        'Sunday' => $stats[0]['sunday_count'] ?? 0
                                    ];
                                    arsort($dayCounts);
                                    $mostPopular = key($dayCounts);
                                } else {
                                    $mostPopular = 'N/A';
                                }
                                ?>
                                <div class="number"><?php echo $mostPopular; ?></div>
                                <div class="subtext">Most selected fasting day</div>
                            </div>
                            
                            <div class="stat-card">
                                <h3>Today's Commitments</h3>
                                <?php
                                $today = date('Y-m-d');
                                $todayCount = 0;
                                foreach ($commitments as $commitment) {
                                    if ($commitment['created_date'] == $today) {
                                        $todayCount++;
                                    }
                                }
                                ?>
                                <div class="number"><?php echo $todayCount; ?></div>
                                <div class="subtext">Commitments submitted today</div>
                            </div>
                        </div>

                        <!-- Filters -->
                        <div class="filter-section">
                            <h2><i class="fas fa-filter"></i> Filter Commitments</h2>
                            <form method="GET" class="filter-form">
                                <div class="form-group">
                                    <label for="day">Filter by Day</label>
                                    <select name="day" id="day" class="form-control-custom">
                                        <option value="">All Days</option>
                                        <option value="monday" <?php echo $filter_day == 'monday' ? 'selected' : ''; ?>>Monday</option>
                                        <option value="tuesday" <?php echo $filter_day == 'tuesday' ? 'selected' : ''; ?>>Tuesday</option>
                                        <option value="wednesday" <?php echo $filter_day == 'wednesday' ? 'selected' : ''; ?>>Wednesday</option>
                                        <option value="thursday" <?php echo $filter_day == 'thursday' ? 'selected' : ''; ?>>Thursday</option>
                                        <option value="friday" <?php echo $filter_day == 'friday' ? 'selected' : ''; ?>>Friday</option>
                                        <option value="saturday" <?php echo $filter_day == 'saturday' ? 'selected' : ''; ?>>Saturday</option>
                                        <option value="sunday" <?php echo $filter_day == 'sunday' ? 'selected' : ''; ?>>Sunday</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="date">Filter by Date</label>
                                    <input type="date" name="date" id="date" class="form-control-custom" value="<?php echo $filter_date; ?>">
                                </div>
                                
                                <div class="form-group">
                                    <button type="submit" class="btn-custom btn-primary-custom">
                                        <i class="fas fa-search"></i> Apply Filters
                                    </button>
                                    <a href="?page=fasting" class="btn-custom btn-secondary-custom">
                                        <i class="fas fa-redo"></i> Reset
                                    </a>
                                </div>
                            </form>
                        </div>

                        <!-- Commitments Table -->
                        <div class="commitments-table-container">
                            <div class="table-responsive-custom">
                                <table class="custom-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Member ID</th>
                                            <th>Days</th>
                                            <th>Date Submitted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (empty($commitments)): ?>
                                            <tr>
                                                <td colspan="7" style="text-align: center; padding: 40px;">
                                                    No commitments found. <?php echo $filter_day || $filter_date ? 'Try different filters.' : ''; ?>
                                                </td>
                                            </tr>
                                        <?php else: ?>
                                            <?php foreach ($commitments as $commitment): ?>
                                                <tr>
                                                    <td><?php echo htmlspecialchars($commitment['id']); ?></td>
                                                    <td>
                                                        <?php echo htmlspecialchars($commitment['name']); ?>
                                                        <?php if ($commitment['member_id']): ?>
                                                            <br><small style="color: #666;">(Member: <?php echo htmlspecialchars($commitment['first_name'] . ' ' . $commitment['last_name']); ?>)</small>
                                                        <?php endif; ?>
                                                    </td>
                                                    <td><?php echo htmlspecialchars($commitment['email']); ?></td>
                                                    <td><?php echo htmlspecialchars($commitment['phone']); ?></td>
                                                    <td><?php echo $commitment['member_id'] ? htmlspecialchars($commitment['member_id']) : '-'; ?></td>
                                                    <td>
                                                        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                                            <?php
                                                            $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                                                            foreach ($days as $day):
                                                                $isActive = $commitment[$day] == 1;
                                                            ?>
                                                                <span class="day-indicator <?php echo $isActive ? 'day-active' : 'day-inactive'; ?>" 
                                                                      title="<?php echo ucfirst($day); ?>">
                                                                    <?php echo strtoupper(substr($day, 0, 1)); ?>
                                                                </span>
                                                            <?php endforeach; ?>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <?php echo date('M j, Y', strtotime($commitment['created_date'])); ?>
                                                        <br>
                                                        <small style="color: #666;"><?php echo $commitment['created_time']; ?></small>
                                                    </td>
                                                </tr>
                                            <?php endforeach; ?>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Export Buttons -->
                        <div class="export-buttons">
                            <button class="btn-custom btn-primary-custom" onclick="exportToCSV()">
                                <i class="fas fa-file-csv"></i> Export to CSV
                            </button>
                            <button class="btn-custom btn-primary-custom" onclick="window.print()">
                                <i class="fas fa-print"></i> Print Report
                            </button>
                        </div>
                    </div>
                    <!-- / Content -->
                </div>
                <!-- / Content wrapper -->

                <!-- Footer -->
                <?php @include('includes/footer.php'); ?>
                <!-- / Footer -->
            </div>
            <!-- / Layout page -->
        </div>

        <!-- Overlay -->
        <div class="layout-overlay layout-menu-toggle"></div>
    </div>
    <!-- / Layout wrapper -->

    <!-- Core JS -->
    <?php include("includes/scripts.html"); ?>

    <script>
        // Export to CSV function
        function exportToCSV() {
            // Get table data
            const table = document.querySelector('.custom-table');
            const rows = table.querySelectorAll('tr');
            const csv = [];
            
            // Add headers
            const headers = [];
            table.querySelectorAll('th').forEach(th => {
                headers.push(th.textContent.trim());
            });
            csv.push(headers.join(','));
            
            // Add rows
            rows.forEach(row => {
                const rowData = [];
                row.querySelectorAll('td').forEach(td => {
                    let text = td.textContent.trim();
                    // Handle day indicators
                    if (td.querySelector('.day-indicator')) {
                        const days = [];
                        td.querySelectorAll('.day-indicator').forEach(indicator => {
                            if (indicator.classList.contains('day-active')) {
                                days.push(indicator.title);
                            }
                        });
                        text = days.join('; ');
                    }
                    // Escape commas and quotes
                    text = text.replace(/"/g, '""');
                    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                        text = '"' + text + '"';
                    }
                    rowData.push(text);
                });
                if (rowData.length > 0) {
                    csv.push(rowData.join(','));
                }
            });
            
            // Create download link
            const csvContent = csv.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'fasting_commitments_' + new Date().toISOString().slice(0,10) + '.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        // Set default date to today in filter
        document.addEventListener('DOMContentLoaded', function() {
            const dateInput = document.getElementById('date');
            if (!dateInput.value) {
                dateInput.value = new Date().toISOString().slice(0,10);
            }
        });
    </script>
</body>
</html>