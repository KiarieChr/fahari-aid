<?php
date_default_timezone_set("Africa/Nairobi");
require_once('includes/checklogin.php');
$title = "Pledge Analytics — Jesus Enthroned Network";
include("includes/get_user.php");
?>
<!doctype html>
<html lang="en" class="layout-navbar-fixed layout-menu-fixed layout-compact" dir="ltr"
      data-skin="default" data-theme="light" data-assets-path="assets/" data-template="vertical-menu-template">
<?php @include('includes/header.php'); ?>

<style>
  /* ── Load Chart.js from CDN (lightweight, no build step) ─── */

  /* ── Glass & page tokens ─────────────────────────────────── */
  .glass-card {
    background: rgba(255,255,255,0.52) !important;
    backdrop-filter: blur(14px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(14px) saturate(180%) !important;
    border: 1px solid rgba(255,255,255,0.6) !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 32px rgba(31,38,135,0.05) !important;
    transition: all .3s cubic-bezier(.25,.8,.25,1) !important;
  }
  .glass-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 36px rgba(105,108,255,0.1) !important;
  }

  /* ── KPI cards ───────────────────────────────────────────── */
  .kpi-card { border-radius: 16px !important; overflow: hidden; position: relative; }
  .kpi-card::before {
    content: ''; position: absolute; top:0; left:0;
    width: 4px; height: 100%; transition: width .3s ease;
  }
  .kpi-card:hover::before { width: 6px; }
  .kpi-primary::before  { background: linear-gradient(to bottom,#696cff,#8592fc); }
  .kpi-success::before  { background: linear-gradient(to bottom,#71dd37,#93e461); }
  .kpi-danger::before   { background: linear-gradient(to bottom,#ff3e1d,#ff6c57); }
  .kpi-warning::before  { background: linear-gradient(to bottom,#ffab00,#ffc140); }
  .kpi-info::before     { background: linear-gradient(to bottom,#03c3ec,#35d0f1); }

  .icon-box {
    width:48px;height:48px;border-radius:12px;
    display:flex;align-items:center;justify-content:center;
    transition: all .3s ease;
  }
  .kpi-card:hover .icon-box { transform: scale(1.1) rotate(5deg); }
  .ib-primary { background:linear-gradient(135deg,rgba(105,108,255,.1),rgba(105,108,255,.22)); color:#696cff; }
  .ib-success { background:linear-gradient(135deg,rgba(113,221,55,.1), rgba(113,221,55,.22));  color:#71dd37; }
  .ib-danger  { background:linear-gradient(135deg,rgba(255,62,29,.1),  rgba(255,62,29,.22));   color:#ff3e1d; }
  .ib-warning { background:linear-gradient(135deg,rgba(255,171,0,.1),  rgba(255,171,0,.22));   color:#ffab00; }
  .ib-info    { background:linear-gradient(135deg,rgba(3,195,236,.1),  rgba(3,195,236,.22));   color:#03c3ec; }

  /* ── Page hero ───────────────────────────────────────────── */
  .page-hero {
    background: linear-gradient(135deg,rgba(105,108,255,0.08),rgba(113,221,55,0.05));
    border: 1px solid rgba(105,108,255,0.12);
    border-radius: 20px; padding: 28px 32px;
    position: relative; overflow: hidden; margin-bottom: 24px;
  }
  .page-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:200px; height:200px;
    background:radial-gradient(circle,rgba(105,108,255,.12) 0%,transparent 70%);
    border-radius:50%;
  }

  /* ── Filter bar ──────────────────────────────────────────── */
  .filter-bar {
    background: rgba(255,255,255,0.65);
    border: 1px solid rgba(105,108,255,0.1);
    border-radius: 14px; padding: 18px 22px;
    margin-bottom: 24px; backdrop-filter: blur(8px);
  }

  /* ── Chart cards ─────────────────────────────────────────── */
  .chart-card {
    border-radius: 16px; overflow: hidden;
    border: 1px solid rgba(105,108,255,0.08);
  }
  .chart-card .card-header {
    background: rgba(105,108,255,0.04);
    border-bottom: 1px solid rgba(105,108,255,0.08);
    padding: 14px 20px; font-weight: 600;
  }

  /* ── Risk items ──────────────────────────────────────────── */
  .risk-item {
    display: flex; align-items: flex-start;
    gap: 12px; padding: 14px 0;
    border-bottom: 1px solid rgba(0,0,0,0.04);
  }
  .risk-item:last-child { border-bottom: none; }
  .risk-icon {
    width:38px; height:38px; border-radius:10px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; font-size:16px;
  }
  .risk-high   { background:rgba(255,62,29,.1); color:#ff3e1d; }
  .risk-medium { background:rgba(255,171,0,.1); color:#ffab00; }
  .risk-low    { background:rgba(113,221,55,.1); color:#71dd37; }

  /* ── Top-pledgers table ──────────────────────────────────── */
  #top-pledgers-table tbody tr:hover { background: rgba(105,108,255,0.03); }

  /* ── Progress ring (mini donut) ──────────────────────────── */
  .prog-ring { transform: rotate(-90deg); }
</style>

<body>
<div class="layout-wrapper layout-content-navbar">
  <div class="layout-container">
    <?php @include('includes/sidebar.php'); ?>
    <div class="menu-mobile-toggler d-xl-none rounded-1">
      <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large text-bg-secondary p-2 rounded-1">
        <i class="bx bx-menu icon-base"></i>
        <i class="bx bx-chevron-right icon-base"></i>
      </a>
    </div>

    <div class="layout-page">
      <?php @include('includes/nav.php'); ?>

      <div class="content-wrapper">
        <div class="container-xxl flex-grow-1 container-p-y">

          <!-- Chart.js CDN -->
          <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>

          <!-- ── Page Hero ──────────────────────────────────── -->
          <div class="page-hero">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div class="d-flex align-items-center gap-3">
                <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#696cff,#8592fc);display:flex;align-items:center;justify-content:center;">
                  <i class="bx bx-bar-chart-alt-2 text-white bx-sm"></i>
                </div>
                <div>
                  <h4 class="mb-0 fw-bold">Pledge Analytics</h4>
                  <small class="text-muted">Commitments · Redemptions · Risk · Trends</small>
                </div>
              </div>
              <div class="d-flex gap-2">
                <a href="contributions.php" class="btn btn-outline-primary">
                  <i class="bx bx-arrow-back me-1"></i> Pledges Dashboard
                </a>
                <button class="btn btn-primary" id="btn-refresh">
                  <i class="bx bx-refresh me-1"></i> Refresh
                </button>
              </div>
            </div>
          </div>

          <!-- ── Period / Date Filter ───────────────────────── -->
          <div class="filter-bar mb-4">
            <div class="row g-3 align-items-end">
              <div class="col-12 mb-1">
                <h6 class="mb-0 text-primary d-flex align-items-center">
                  <i class="bx bx-calendar me-2"></i> Filter by Accounting Period
                </h6>
              </div>
              <div class="col-md-4">
                <label class="form-label small text-muted">Accounting Period</label>
                <select id="analytics-period" class="form-select"></select>
              </div>
              <div class="col-md-3">
                <label class="form-label small text-muted">Start Date</label>
                <input type="date" id="analytics-start" class="form-control" />
              </div>
              <div class="col-md-3">
                <label class="form-label small text-muted">End Date</label>
                <input type="date" id="analytics-end" class="form-control" />
              </div>
              <div class="col-md-2 d-flex gap-2">
                <button id="analytics-filter-btn" class="btn btn-primary flex-fill">
                  <i class="bx bx-search-alt me-1"></i> Apply
                </button>
                <button id="analytics-reset-btn" class="btn btn-outline-secondary flex-fill">
                  <i class="bx bx-reset"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- ── KPI Cards ──────────────────────────────────── -->
          <div class="row g-4 mb-4" id="kpi-row">
            <div class="col-sm-6 col-xl-3">
              <div class="card glass-card kpi-card kpi-primary">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <span class="text-muted small fw-medium d-block mb-1">Total Pledged</span>
                      <h4 class="fw-bold text-primary mb-0" id="kpi-total-pledged">—</h4>
                      <small class="text-muted" id="kpi-period-lbl"></small>
                    </div>
                    <div class="icon-box ib-primary"><i class="bx bx-donate-heart bx-sm"></i></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-xl-3">
              <div class="card glass-card kpi-card kpi-success">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <span class="text-muted small fw-medium d-block mb-1">Total Redeemed</span>
                      <h4 class="fw-bold text-success mb-0" id="kpi-total-redeemed">—</h4>
                      <small class="text-muted">Payments received</small>
                    </div>
                    <div class="icon-box ib-success"><i class="bx bx-check-circle bx-sm"></i></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-xl-3">
              <div class="card glass-card kpi-card kpi-danger">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <span class="text-muted small fw-medium d-block mb-1">Outstanding</span>
                      <h4 class="fw-bold text-danger mb-0" id="kpi-outstanding">—</h4>
                      <small class="text-muted">Pledged − Redeemed</small>
                    </div>
                    <div class="icon-box ib-danger"><i class="bx bx-time-five bx-sm"></i></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-sm-6 col-xl-3">
              <div class="card glass-card kpi-card kpi-warning">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <span class="text-muted small fw-medium d-block mb-1">Pledgers</span>
                      <h4 class="fw-bold text-warning mb-0" id="kpi-count">—</h4>
                      <small class="text-muted">Unique commitments</small>
                    </div>
                    <div class="icon-box ib-warning"><i class="bx bx-user-check bx-sm"></i></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Charts Row 1: Status donut + Trend bar ────── -->
          <div class="row g-4 mb-4">
            <!-- Redemption Status Donut -->
            <div class="col-lg-4">
              <div class="card chart-card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <span><i class="bx bx-pie-chart-alt-2 me-1 text-primary"></i> Redemption Status</span>
                </div>
                <div class="card-body d-flex flex-column align-items-center justify-content-center">
                  <div style="position:relative;width:200px;height:200px;">
                    <canvas id="statusDonut" width="200" height="200"></canvas>
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                      <div class="fw-bold text-dark" id="donut-center-val">—</div>
                      <small class="text-muted">total</small>
                    </div>
                  </div>
                  <div class="d-flex gap-3 mt-3 flex-wrap justify-content-center" id="donut-legend"></div>
                </div>
              </div>
            </div>

            <!-- Monthly Pledge Trend Bar -->
            <div class="col-lg-8">
              <div class="card chart-card h-100">
                <div class="card-header">
                  <i class="bx bx-trending-up me-1 text-primary"></i> Monthly Pledge vs Redemption Trend
                </div>
                <div class="card-body">
                  <canvas id="trendBar" height="110"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Charts Row 2: Purpose breakdown + Top pledgers ── -->
          <div class="row g-4 mb-4">
            <!-- Purpose Breakdown -->
            <div class="col-lg-5">
              <div class="card chart-card h-100">
                <div class="card-header">
                  <i class="bx bx-category me-1 text-primary"></i> Pledges by Purpose
                </div>
                <div class="card-body">
                  <canvas id="purposeBar" height="160"></canvas>
                </div>
              </div>
            </div>

            <!-- Top Pledgers Table -->
            <div class="col-lg-7">
              <div class="card chart-card h-100">
                <div class="card-header">
                  <i class="bx bx-trophy me-1 text-warning"></i> Top Pledgers
                </div>
                <div class="table-responsive">
                  <table class="table table-borderless mb-0" id="top-pledgers-table">
                    <thead class="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Pledged</th>
                        <th>Redeemed</th>
                        <th>Balance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody id="top-pledgers-tbody">
                      <tr><td colspan="6" class="text-center text-muted py-4">Loading…</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Risk Assessment ────────────────────────────── -->
          <div class="row g-4 mb-4">
            <div class="col-12">
              <div class="card chart-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <span><i class="bx bx-shield-alt-2 me-1 text-danger"></i> Risk Assessment</span>
                  <span class="badge bg-label-secondary" id="risk-count-badge">Loading…</span>
                </div>
                <div class="card-body" id="risk-container">
                  <div class="text-center text-muted py-4">
                    <i class="bx bx-loader-alt bx-spin me-1"></i> Analysing risk…
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        <!-- /Content -->
        <?php @include('includes/footer.php'); ?>
        <div class="content-backdrop fade"></div>
      </div>
    </div>
  </div>
</div>

<?php @include('includes/scripts.html'); ?>
<script>
$(document).ready(function () {

  // ──────────────────────────────────────────────────────────
  // State
  // ──────────────────────────────────────────────────────────
  let allPledges   = [];
  let defaultStart = '';
  let defaultEnd   = '';
  let activePeriodId = null;

  let statusChart  = null;
  let trendChart   = null;
  let purposeChart = null;

  // ──────────────────────────────────────────────────────────
  // Formatters
  // ──────────────────────────────────────────────────────────
  function fmt(v) {
    return new Intl.NumberFormat('en-KE',{style:'currency',currency:'KES',minimumFractionDigits:0}).format(v);
  }
  function fmtDate(s) {
    if (!s) return '—';
    const d = new Date(s);
    return isNaN(d) ? s : d.toLocaleDateString('en-KE',{year:'numeric',month:'short',day:'numeric'});
  }
  function esc(s){ return $('<span>').text(s||'').html(); }

  // ──────────────────────────────────────────────────────────
  // Populate period dropdown
  // ──────────────────────────────────────────────────────────
  function populatePeriods(periods, activeId) {
    const $sel = $('#analytics-period');
    $sel.find('option:not(:first)').remove();
    periods.forEach(function(p){
      const closed = p.is_closed == 1 ? ' (Closed)' : '';
      const sel    = (activeId && parseInt(p.id) === parseInt(activeId)) ? ' selected' : '';
      $sel.append(`<option value="${p.id}" data-start="${p.start_date}" data-end="${p.end_date}"${sel}>${esc(p.label)}${closed}</option>`);
    });
  }

  $('#analytics-period').on('change', function(){
    const $o = $(this).find('option:selected');
    if ($o.data('start')) {
      $('#analytics-start').val($o.data('start'));
      $('#analytics-end').val($o.data('end'));
    }
  });

  // ──────────────────────────────────────────────────────────
  // Load data
  // ──────────────────────────────────────────────────────────
  function loadAnalytics(params) {
    // Show loading states
    $('#kpi-total-pledged,#kpi-total-redeemed,#kpi-outstanding,#kpi-count').text('—');
    $('#top-pledgers-tbody').html('<tr><td colspan="6" class="text-center text-muted py-3"><i class="bx bx-loader-alt bx-spin me-1"></i>Loading…</td></tr>');

    // 1. Pledges data (period-aware, from manage/get_pledges.php)
    $.ajax({
      url: 'manage/get_pledges.php',
      method: 'GET',
      data: params || {},
      success: function(res) {
        if (!res || !res.success) return;
        const d = res.data;
        allPledges = d.pledges;

        // Period dropdown (first load)
        if ($('#analytics-period option').length <= 1 && d.periods) {
          populatePeriods(d.periods, d.active_period_id);
        }
        if (!defaultStart) {
          defaultStart = d.start_date;
          defaultEnd   = d.end_date;
          activePeriodId = d.active_period_id;
        }
        if (!$('#analytics-start').val()) $('#analytics-start').val(d.start_date);
        if (!$('#analytics-end').val())   $('#analytics-end').val(d.end_date);

        // KPIs
        const s = d.stats;
        $('#kpi-total-pledged').text(fmt(s.total_pledged));
        $('#kpi-total-redeemed').text(fmt(s.total_redeemed));
        $('#kpi-outstanding').text(fmt(s.outstanding));
        $('#kpi-count').text(s.count);
        $('#kpi-period-lbl').text(fmtDate(d.start_date) + ' – ' + fmtDate(d.end_date));

        // Charts
        renderStatusDonut(allPledges);
        renderTrendBar(allPledges);
        renderPurposeBar(allPledges);
        renderTopPledgers(allPledges);
      }
    });

    // 2. Risk assessment (existing API, period-agnostic)
    $.ajax({
      url: 'api/get_risk_assessment.php',
      method: 'GET',
      success: function(data) {
        renderRisk(Array.isArray(data) ? data : []);
      },
      error: function() {
        $('#risk-container').html('<div class="text-muted text-center py-3">Unable to load risk data.</div>');
      }
    });
  }

  // ──────────────────────────────────────────────────────────
  // Chart: Redemption Status Donut
  // ──────────────────────────────────────────────────────────
  function renderStatusDonut(pledges) {
    let pending = 0, partial = 0, redeemed = 0;
    pledges.forEach(p => {
      if (p.redemption_status === 'redeemed')    redeemed++;
      else if (p.redemption_status === 'partial') partial++;
      else                                         pending++;
    });
    const total = pledges.length;
    $('#donut-center-val').text(total);

    const data = {
      labels: ['Pending','Partial','Redeemed'],
      datasets:[{
        data:[pending,partial,redeemed],
        backgroundColor:['#ff3e1d','#ffab00','#71dd37'],
        borderWidth:0, hoverOffset:6
      }]
    };

    if (statusChart) statusChart.destroy();
    statusChart = new Chart(document.getElementById('statusDonut'), {
      type: 'doughnut',
      data: data,
      options: {
        cutout: '72%',
        plugins: { legend: { display:false }, tooltip: { callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.raw} (${total?Math.round(ctx.raw/total*100):0}%)`
        }}},
        animation: { animateScale: true }
      }
    });

    // Custom legend
    const colors = { Pending:'#ff3e1d', Partial:'#ffab00', Redeemed:'#71dd37' };
    const counts = { Pending:pending, Partial:partial, Redeemed:redeemed };
    $('#donut-legend').html(
      Object.entries(colors).map(([k,c]) =>
        `<div class="d-flex align-items-center gap-1">
           <span style="width:10px;height:10px;border-radius:50%;background:${c};display:inline-block;"></span>
           <small class="text-muted">${k} <strong class="text-dark">(${counts[k]})</strong></small>
         </div>`
      ).join('')
    );
  }

  // ──────────────────────────────────────────────────────────
  // Chart: Monthly Trend
  // ──────────────────────────────────────────────────────────
  function renderTrendBar(pledges) {
    // Group by month (YYYY-MM)
    const monthlyPledged   = {};
    const monthlyRedeemed  = {};

    pledges.forEach(p => {
      const month = (p.date || '').substring(0,7);
      if (!month) return;
      monthlyPledged[month]  = (monthlyPledged[month]  || 0) + parseFloat(p.pledges_amount);
      monthlyRedeemed[month] = (monthlyRedeemed[month] || 0) + parseFloat(p.total_redeemed);
    });

    const labels  = Object.keys(monthlyPledged).sort();
    const pledged = labels.map(m => monthlyPledged[m]  || 0);
    const red     = labels.map(m => monthlyRedeemed[m] || 0);
    const fmtLabel = m => { const d=new Date(m+'-01'); return d.toLocaleDateString('en-KE',{month:'short',year:'2-digit'}); };

    if (trendChart) trendChart.destroy();
    trendChart = new Chart(document.getElementById('trendBar'), {
      type: 'bar',
      data: {
        labels: labels.map(fmtLabel),
        datasets:[
          { label:'Pledged',   data:pledged, backgroundColor:'rgba(105,108,255,0.75)', borderRadius:6 },
          { label:'Redeemed',  data:red,     backgroundColor:'rgba(113,221,55,0.75)',  borderRadius:6 }
        ]
      },
      options:{
        responsive:true, plugins:{ legend:{ position:'top' } },
        scales:{ y:{ ticks:{ callback:v=>fmt(v) }, grid:{ color:'rgba(0,0,0,0.04)' } } }
      }
    });
  }

  // ──────────────────────────────────────────────────────────
  // Chart: Purpose Breakdown
  // ──────────────────────────────────────────────────────────
  function renderPurposeBar(pledges) {
    const byPurpose = {};
    pledges.forEach(p => {
      const k = (p.purpose || 'General').trim();
      byPurpose[k] = (byPurpose[k] || 0) + parseFloat(p.pledges_amount);
    });

    const sorted  = Object.entries(byPurpose).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const labels  = sorted.map(e=>e[0]);
    const values  = sorted.map(e=>e[1]);
    const palette = ['#696cff','#71dd37','#ffab00','#03c3ec','#ff3e1d','#8592fc','#93e461','#35d0f1'];

    if (purposeChart) purposeChart.destroy();
    purposeChart = new Chart(document.getElementById('purposeBar'), {
      type: 'bar',
      data: {
        labels,
        datasets:[{ label:'Total Pledged', data:values,
          backgroundColor: labels.map((_,i)=>palette[i%palette.length]),
          borderRadius:6 }]
      },
      options:{
        indexAxis:'y', responsive:true,
        plugins:{ legend:{ display:false } },
        scales:{ x:{ ticks:{ callback:v=>fmt(v) }, grid:{ color:'rgba(0,0,0,0.04)' } } }
      }
    });
  }

  // ──────────────────────────────────────────────────────────
  // Top Pledgers Table (top 10 by pledged amount)
  // ──────────────────────────────────────────────────────────
  function renderTopPledgers(pledges) {
    const agg = {};
    pledges.forEach(p => {
      // Group by email, fallback to phone, then name
      const key = (p.email || p.phone_no || p.full_name || 'unknown').trim().toLowerCase();
      if (!agg[key]) {
        agg[key] = {
          full_name: p.full_name,
          email: p.email,
          phone_no: p.phone_no,
          pledges_amount: 0,
          total_redeemed: 0,
          balance: 0
        };
      }
      agg[key].pledges_amount += parseFloat(p.pledges_amount) || 0;
      agg[key].total_redeemed += parseFloat(p.total_redeemed) || 0;
      agg[key].balance += parseFloat(p.balance) || 0;
    });

    const aggArr = Object.values(agg).map(p => {
      if (p.pledges_amount <= 0) p.redemption_status = 'pending';
      else if (p.total_redeemed >= p.pledges_amount) p.redemption_status = 'redeemed';
      else if (p.total_redeemed > 0) p.redemption_status = 'partial';
      else p.redemption_status = 'pending';
      return p;
    });

    const top = aggArr.sort((a,b)=>b.pledges_amount - a.pledges_amount).slice(0,10);
    const $tbody = $('#top-pledgers-tbody');
    if (!top.length) {
      $tbody.html('<tr><td colspan="6" class="text-center text-muted py-4">No data</td></tr>');
      return;
    }
    const statusMap = { redeemed:'bg-label-success', partial:'bg-label-warning', pending:'bg-label-danger' };
    $tbody.html(top.map((p,i)=>{
      const bal = parseFloat(p.balance) || 0;
      return `<tr>
        <td class="text-muted fw-medium">${i+1}</td>
        <td>
          <div class="fw-semibold">${esc(p.full_name)}</div>
          <small class="text-muted">${esc(p.email||p.phone_no||'')}</small>
        </td>
        <td class="fw-bold text-primary">${fmt(p.pledges_amount)}</td>
        <td class="text-success">${fmt(p.total_redeemed)}</td>
        <td class="${bal>0?'text-danger':'text-success'}">${fmt(bal)}</td>
        <td><span class="badge ${statusMap[p.redemption_status]||'bg-label-secondary'}">${p.redemption_status||'—'}</span></td>
      </tr>`;
    }).join(''));
  }

  // ──────────────────────────────────────────────────────────
  // Risk Assessment render
  // ──────────────────────────────────────────────────────────
  function renderRisk(risks) {
    const $c = $('#risk-container');
    $('#risk-count-badge').text(risks.length + ' factor' + (risks.length !== 1 ? 's' : ''));
    if (!risks.length) {
      $c.html('<div class="text-center text-success py-4"><i class="bx bx-shield-check bx-lg mb-2"></i><br><strong>No risk factors identified</strong> — all systems healthy!</div>');
      return;
    }
    const levelIcon = { high:'bx-error-circle', medium:'bx-error', low:'bx-info-circle' };
    $c.html(risks.map(r=>`
      <div class="risk-item">
        <div class="risk-icon risk-${r.level}">
          <i class="bx ${levelIcon[r.level]||'bx-info-circle'}"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <h6 class="mb-0 fw-semibold">${esc(r.title)}</h6>
            <span class="badge ${r.level==='high'?'bg-danger':r.level==='medium'?'bg-warning text-dark':'bg-success'} ms-2">
              ${r.level?.toUpperCase()}
            </span>
          </div>
          <p class="text-muted small mb-1">${esc(r.description)}</p>
          <small class="text-muted">
            <i class="bx bx-group me-1"></i>${r.count} item${r.count!==1?'s':''} affected
            ${r.impact ? ` &nbsp;·&nbsp; <i class="bx bx-target-lock me-1"></i>Impact: <strong>${esc(r.impact)}</strong>` : ''}
          </small>
        </div>
      </div>
    `).join(''));
  }

  // ──────────────────────────────────────────────────────────
  // Filter / Reset
  // ──────────────────────────────────────────────────────────
  $('#analytics-filter-btn').on('click', function(){
    loadAnalytics({
      start_date: $('#analytics-start').val(),
      end_date:   $('#analytics-end').val(),
    });
  });

  $('#analytics-reset-btn').on('click', function(){
    $('#analytics-start').val(defaultStart);
    $('#analytics-end').val(defaultEnd);
    if (activePeriodId) $('#analytics-period').val(activePeriodId);
    loadAnalytics({ start_date:defaultStart, end_date:defaultEnd });
  });

  $('#btn-refresh').on('click', function(){
    loadAnalytics({
      start_date: $('#analytics-start').val(),
      end_date:   $('#analytics-end').val(),
    });
  });

  // ──────────────────────────────────────────────────────────
  // Initial load
  // ──────────────────────────────────────────────────────────
  loadAnalytics({});
});
</script>
</body>
</html>