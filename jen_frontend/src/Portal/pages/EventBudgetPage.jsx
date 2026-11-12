import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../../services/api';
import { ThemeContext } from '../../context/ThemeContext';
import { getEvents, getEventBudget, saveEventBudget } from '../../services/eventsApi';

const CATEGORIES = [
    { value: 'venue', label: 'Venue & Facilities', color: '#2563eb', bg: '#eff6ff' },
    { value: 'catering', label: 'Catering', color: '#059669', bg: '#ecfdf5' },
    { value: 'transport', label: 'Transport & Logistics', color: '#d97706', bg: '#fffbeb' },
    { value: 'sound_av', label: 'Sound & AV', color: '#9333ea', bg: '#faf5ff' },
    { value: 'printing', label: 'Printing & Stationery', color: '#475569', bg: '#f1f5f9' },
    { value: 'decoration', label: 'Decoration', color: '#ea580c', bg: '#fff7ed' },
    { value: 'speaker_honorarium', label: 'Speaker Honorarium', color: '#0891b2', bg: '#ecfeff' },
    { value: 'marketing', label: 'Marketing & Publicity', color: '#db2777', bg: '#fdf2f8' },
    { value: 'accommodation', label: 'Accommodation', color: '#4f46e5', bg: '#eef2ff' },
    { value: 'miscellaneous', label: 'Miscellaneous', color: '#64748b', bg: '#f8fafc' },
];

const getCat = (val) => CATEGORIES.find(c => c.value === val) || CATEGORIES[CATEGORIES.length - 1];

const STATUS_BADGES = {
    draft: { label: 'Draft', bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
    pending_approval: { label: 'Pending Approval', bg: '#fffbeb', color: '#d97706', border: '#fef3c7' },
    approved: { label: 'Approved', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
    rejected: { label: 'Rejected', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    closed: { label: 'Closed', bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' },
};

const PAYMENT_METHODS = [
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'online', label: 'Online / Card' },
];

const formatKES = (n) => 'KES ' + Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 });

const EventBudgetPage = () => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    // State
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [budget, setBudget] = useState(null);
    const [items, setItems] = useState([]);
    const [versions, setVersions] = useState([]);
    const [categorySummary, setCategorySummary] = useState([]);
    const [audit, setAudit] = useState([]);
    const [eventInfo, setEventInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Modals
    const [showCreateBudget, setShowCreateBudget] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [showExpense, setShowExpense] = useState(false);
    const [showApproval, setShowApproval] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [expenseItem, setExpenseItem] = useState(null);
    const [uploadItem, setUploadItem] = useState(null);

    // Forms
    const [budgetForm, setBudgetForm] = useState({ budget_name: '', notes: '' });
    const [itemForm, setItemForm] = useState({ category: 'miscellaneous', description: '', estimated_amount: '', vendor: '', notes: '' });
    const [expenseForm, setExpenseForm] = useState({ actual_amount: '', payment_date: '', payment_method: 'mpesa', receipt_ref: '', vendor: '', notes: '' });
    const [approvalForm, setApprovalForm] = useState({ decision: 'approve', reason: '' });
    const [saving, setSaving] = useState(false);

    // Active tab
    const [tab, setTab] = useState('items'); // items | summary | audit

    // Load events from Django
    useEffect(() => {
        (async () => {
            try {
                const res = await getEvents({ page_size: 100 });
                if (res?.success) {
                    const list = res.data || [];
                    setEvents(list);
                    if (list.length > 0 && !selectedEventId) {
                        setSelectedEventId(String(list[0].id));
                    }
                }
            } catch (err) {
                console.error('Failed to load events from Django:', err);
            }
        })();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Fetch budget from Django
    const fetchBudget = useCallback(async (silent = false, version = null) => {
        if (!selectedEventId) return;
        if (!silent) setLoading(true);
        try {
            const res = await getEventBudget(selectedEventId, version);
            if (res?.success || res?.data) {
                const d = res.data || res;
                setBudget(d.budget || null);
                setItems(d.items || []);
                setVersions(d.versions || []);
                setCategorySummary(d.category_summary || []);
                setAudit(d.audit || []);
                setEventInfo(d.event || null);
            }
        } catch (err) {
            console.error('Failed to load budget from Django:', err);
            if (!silent) showToast('Failed to load budget', 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [selectedEventId]);

    useEffect(() => {
        fetchBudget();
    }, [fetchBudget]);

    // Budget CRUD actions
    const handleCreateBudget = async () => {
        if (!budgetForm.budget_name.trim()) return showToast('Budget name is required', 'error');
        setSaving(true);
        try {
            const res = await saveEventBudget(selectedEventId, {
                action: 'create_budget',
                event_id: parseInt(selectedEventId),
                budget_name: budgetForm.budget_name,
                notes: budgetForm.notes
            });
            if (res?.success) {
                showToast(res.message || 'Budget plan created successfully');
                setShowCreateBudget(false);
                setBudgetForm({ budget_name: '', notes: '' });
                fetchBudget(true);
            } else {
                showToast(res?.message || 'Failed', 'error');
            }
        } catch (err) {
            showToast(err?.response?.data?.message || err?.message || 'Failed to create budget', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddItem = async () => {
        if (!itemForm.description.trim() || !itemForm.estimated_amount) {
            return showToast('Description and estimated amount are required', 'error');
        }
        setSaving(true);
        try {
            const payload = editItem
                ? { action: 'update_item', item_id: editItem.id, ...itemForm }
                : { action: 'add_item', estimated_amount: parseFloat(itemForm.estimated_amount), ...itemForm };
            const res = await saveEventBudget(selectedEventId, payload);
            if (res?.success) {
                showToast(res.message || 'Line item saved');
                setShowAddItem(false);
                setEditItem(null);
                setItemForm({ category: 'miscellaneous', description: '', estimated_amount: '', vendor: '', notes: '' });
                fetchBudget(true);
            } else {
                showToast(res?.message || 'Failed', 'error');
            }
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to save item', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Delete this budget item?')) return;
        try {
            const res = await api.post('/save_event_budget.php', { action: 'delete_item', item_id: itemId });
            if (res?.success) {
                showToast('Item deleted');
                fetchBudget(true);
            } else {
                showToast(res?.message || 'Failed', 'error');
            }
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to delete item', 'error');
        }
    };

    const handleSubmitForApproval = async () => {
        if (!window.confirm('Submit this budget plan for pastoral council approval?')) return;
        try {
            const res = await api.post('/save_event_budget.php', { action: 'submit', budget_id: budget.id });
            if (res?.success) {
                showToast('Budget plan submitted for council review');
                fetchBudget(true);
            } else {
                showToast(res?.message || 'Failed', 'error');
            }
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to submit budget', 'error');
        }
    };

    const handleApproval = async () => {
        if (approvalForm.decision === 'reject' && !approvalForm.reason.trim()) {
            return showToast('Please state rejection reason', 'error');
        }
        setSaving(true);
        try {
            const res = await api.post('/approve_event_budget.php', { budget_id: budget.id, ...approvalForm });
            if (res?.success) {
                showToast(res.message || 'Decision recorded');
                setShowApproval(false);
                setApprovalForm({ decision: 'approve', reason: '' });
                fetchBudget(true);
            } else {
                showToast(res?.message || 'Failed', 'error');
            }
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to process decision', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRecordExpense = async () => {
        if (!expenseForm.actual_amount || !expenseForm.payment_date) {
            return showToast('Amount and payment date are required', 'error');
        }
        setSaving(true);
        try {
            const res = await api.post('/record_event_expense.php', {
                item_id: expenseItem.id,
                actual_amount: parseFloat(expenseForm.actual_amount),
                payment_date: expenseForm.payment_date,
                payment_method: expenseForm.payment_method,
                receipt_ref: expenseForm.receipt_ref,
                vendor: expenseForm.vendor,
                notes: expenseForm.notes
            });
            if (res?.success) {
                showToast(res.message || 'Expense recorded & journal entry created');
                setShowExpense(false);
                setExpenseItem(null);
                setExpenseForm({ actual_amount: '', payment_date: '', payment_method: 'mpesa', receipt_ref: '', vendor: '', notes: '' });
                fetchBudget(true);
            } else {
                showToast(res?.message || 'Failed', 'error');
            }
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to record expense', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleUploadReceipt = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !uploadItem) return;
        const fd = new FormData();
        fd.append('item_id', uploadItem.id);
        fd.append('receipt', file);
        setSaving(true);
        try {
            const res = await api.post('/upload_budget_receipt.php', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res?.success) {
                showToast('Receipt voucher uploaded');
                setShowUpload(false);
                setUploadItem(null);
                fetchBudget(true);
            } else {
                showToast(res?.message || 'Failed', 'error');
            }
        } catch (err) {
            showToast(err?.response?.data?.message || 'Upload failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const downloadPDF = async () => {
        try {
            const url = `${API_BASE_URL}event_budget_report_pdf.php?event_id=${selectedEventId}${budget?.version ? `&version=${budget.version}` : ''}`;
            const resp = await fetch(url, { headers: { Authorization: `Bearer ${getAccessToken()}` } });
            if (!resp.ok) throw new Error('PDF generation failed');
            const blob = await resp.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Budget_Report_${eventInfo?.ename || 'Event'}_v${budget?.version || 1}.pdf`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch (err) {
            showToast('Failed to download PDF financial report', 'error');
        }
    };

    // Computations
    const isEditable = budget && ['draft', 'rejected'].includes(budget.status);
    const isApproved = budget?.status === 'approved';
    const isPending = budget?.status === 'pending_approval';
    const totalEstimated = parseFloat(budget?.total_estimated || 0);
    const totalActual = parseFloat(budget?.total_actual || 0);
    const variance = totalActual - totalEstimated;
    const variancePct = totalEstimated > 0 ? (variance / totalEstimated * 100) : 0;
    const executionPct = totalEstimated > 0 ? Math.min(100, Math.round((totalActual / totalEstimated * 100))) : 0;
    const paidCount = items.filter(i => i.status === 'paid').length;
    const statusCfg = STATUS_BADGES[budget?.status] || STATUS_BADGES.draft;

    return (
        <div className="stitch-budget-container">
            {/* Toast Feedback */}
            {toast && (
                <div className={`stitch-toast ${toast.type}`}>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Breadcrumbs Header Bar */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Calendar & Events</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Event Budget & Expenditure</span>
                </div>

                <div className="sync-live-status">
                    <span className="sync-live-dot">●</span>
                    <span>Sync live</span>
                    <span className="sync-sep">•</span>
                    <span>{eventInfo ? eventInfo.ename : 'All Events'}</span>
                    <button className="sync-refresh-btn" onClick={() => fetchBudget(false)} title="Refresh ledger">
                        ⟳
                    </button>
                </div>
            </div>

            {/* Action Bar */}
            <div className="budget-action-bar">
                <div className="selectors-cluster">
                    {/* Event Dropdown */}
                    <div className="selector-field">
                        <div className="selector-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="selector-dropdown"
                        >
                            <option value="">-- Choose Event --</option>
                            {events.map(ev => (
                                <option key={ev.id} value={ev.id}>{ev.ename}</option>
                            ))}
                        </select>
                    </div>

                    {/* Version Selector */}
                    {selectedEventId && budget && (
                        <div className="selector-field version">
                            <select
                                value={budget.version || ''}
                                onChange={e => fetchBudget(false, e.target.value)}
                                className="selector-dropdown"
                            >
                                {versions.map(v => (
                                    <option key={v.id} value={v.version}>v{v.version} — {v.status}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="action-buttons-group">
                    {!budget && selectedEventId && !loading && (
                        <button
                            className="stitch-action-btn primary"
                            onClick={() => setShowCreateBudget(true)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>Create Budget Plan</span>
                        </button>
                    )}

                    {budget && isEditable && (
                        <>
                            <button
                                className="stitch-action-btn primary"
                                onClick={() => {
                                    setEditItem(null);
                                    setItemForm({ category: 'miscellaneous', description: '', estimated_amount: '', vendor: '', notes: '' });
                                    setShowAddItem(true);
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>Add Line Item</span>
                            </button>

                            <button
                                className="stitch-action-btn outline"
                                onClick={handleSubmitForApproval}
                                disabled={items.length === 0}
                            >
                                <span>Submit for Review</span>
                            </button>
                        </>
                    )}

                    {budget && isPending && (
                        <button
                            className="stitch-action-btn approval"
                            onClick={() => setShowApproval(true)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span>Council Review</span>
                        </button>
                    )}

                    {budget && (
                        <button
                            className="stitch-action-btn pdf"
                            onClick={downloadPDF}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="12" y2="18"></line>
                                <line x1="15" y1="15" x2="12" y2="18"></line>
                            </svg>
                            <span>Financial Report PDF</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 4 Stitch KPI Cards */}
            {budget && (
                <div className="stitch-stats-grid">
                    {/* Total Estimated */}
                    <div className="stitch-kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                    <line x1="2" y1="10" x2="22" y2="10"></line>
                                </svg>
                            </div>
                            <span className="kpi-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>Budgeted</span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">TOTAL ESTIMATE</span>
                            <div className="kpi-value">{formatKES(totalEstimated)}</div>
                        </div>
                        <div className="kpi-footer">
                            <div className="kpi-progress-track">
                                <div className="kpi-progress-fill" style={{ background: '#2563eb', width: '100%' }}></div>
                            </div>
                            <span className="kpi-subtext">{items.length} budgeted line items</span>
                        </div>
                    </div>

                    {/* Total Actual */}
                    <div className="stitch-kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <span className="kpi-badge" style={{ background: '#ecfdf5', color: '#059669' }}>Disbursed</span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">ACTUAL EXPENDITURE</span>
                            <div className="kpi-value">{formatKES(totalActual)}</div>
                        </div>
                        <div className="kpi-footer">
                            <div className="kpi-progress-track">
                                <div className="kpi-progress-fill" style={{ background: '#10b981', width: `${executionPct}%` }}></div>
                            </div>
                            <span className="kpi-subtext">{executionPct}% of budget utilized</span>
                        </div>
                    </div>

                    {/* Variance */}
                    <div className="stitch-kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrap" style={{ background: variance > 0 ? '#fef2f2' : '#ecfdf5', color: variance > 0 ? '#dc2626' : '#059669' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="19" x2="12" y2="5"></line>
                                    <polyline points="5 12 12 5 19 12"></polyline>
                                </svg>
                            </div>
                            <span className="kpi-badge" style={{ background: variance > 0 ? '#fef2f2' : '#ecfdf5', color: variance > 0 ? '#dc2626' : '#059669' }}>
                                {variance > 0 ? 'Overrun' : 'Surplus'}
                            </span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">NET VARIANCE</span>
                            <div className="kpi-value" style={{ color: variance > 0 ? '#dc2626' : '#059669' }}>
                                {variance >= 0 ? `+${formatKES(variance)}` : `-${formatKES(Math.abs(variance))}`}
                            </div>
                        </div>
                        <div className="kpi-footer">
                            <div className="kpi-progress-track">
                                <div className="kpi-progress-fill" style={{ background: variance > 0 ? '#ef4444' : '#10b981', width: '70%' }}></div>
                            </div>
                            <span className="kpi-subtext">{variancePct > 0 ? `+${variancePct.toFixed(1)}% variance` : `${variancePct.toFixed(1)}% variance`}</span>
                        </div>
                    </div>

                    {/* Status & Approval */}
                    <div className="stitch-kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrap" style={{ background: '#faf5ff', color: '#9333ea' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                            </div>
                            <span className="kpi-badge" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                                {statusCfg.label}
                            </span>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">SETTLED ITEMS</span>
                            <div className="kpi-value">{paidCount} / {items.length}</div>
                        </div>
                        <div className="kpi-footer">
                            <div className="kpi-progress-track">
                                <div className="kpi-progress-fill" style={{ background: '#9333ea', width: `${items.length > 0 ? (paidCount / items.length) * 100 : 0}%` }}></div>
                            </div>
                            <span className="kpi-subtext">Version {budget.version || 1} • {items.length - paidCount} pending payout</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-Tabs Navigation */}
            {budget && (
                <div className="budget-tabs-bar">
                    <button
                        className={`budget-tab-btn ${tab === 'items' ? 'active' : ''}`}
                        onClick={() => setTab('items')}
                    >
                        <span>Line Items ({items.length})</span>
                    </button>
                    <button
                        className={`budget-tab-btn ${tab === 'summary' ? 'active' : ''}`}
                        onClick={() => setTab('summary')}
                    >
                        <span>Category Summary</span>
                    </button>
                    <button
                        className={`budget-tab-btn ${tab === 'audit' ? 'active' : ''}`}
                        onClick={() => setTab('audit')}
                    >
                        <span>Audit Trail</span>
                    </button>
                </div>
            )}

            {/* TAB 1: Items Table */}
            {budget && tab === 'items' && (
                <div className="stitch-table-wrapper">
                    <div className="table-scroll-container">
                        <table className="stitch-data-table">
                            <thead>
                                <tr>
                                    <th>CATEGORY</th>
                                    <th>DESCRIPTION & VENDOR</th>
                                    <th>ESTIMATED (KES)</th>
                                    <th>ACTUAL PAID (KES)</th>
                                    <th>VARIANCE</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="table-empty-cell">
                                            No line items defined yet. Click "Add Line Item" to begin budget planning.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((it) => {
                                        const cat = getCat(it.category);
                                        const est = parseFloat(it.estimated_amount || 0);
                                        const act = parseFloat(it.actual_amount || 0);
                                        const v = act - est;
                                        const isPaid = it.status === 'paid';

                                        return (
                                            <tr key={it.id} className="budget-item-row">
                                                {/* Category */}
                                                <td>
                                                    <span
                                                        className="budget-cat-pill"
                                                        style={{ background: cat.bg, color: cat.color }}
                                                    >
                                                        {cat.label}
                                                    </span>
                                                </td>

                                                {/* Description */}
                                                <td>
                                                    <div className="desc-box">
                                                        <span className="desc-text">{it.description}</span>
                                                        {it.vendor && <span className="vendor-sub">Vendor: {it.vendor}</span>}
                                                    </div>
                                                </td>

                                                {/* Estimated */}
                                                <td>
                                                    <span className="amount-est">{formatKES(est)}</span>
                                                </td>

                                                {/* Actual */}
                                                <td>
                                                    <span className="amount-act">{act > 0 ? formatKES(act) : '—'}</span>
                                                </td>

                                                {/* Variance */}
                                                <td>
                                                    <span className={`variance-tag ${v > 0 ? 'over' : v < 0 ? 'under' : 'neutral'}`}>
                                                        {act > 0 ? (v >= 0 ? `+${formatKES(v)}` : `-${formatKES(Math.abs(v))}`) : '—'}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td>
                                                    <span className={`payment-status-pill ${isPaid ? 'paid' : 'unpaid'}`}>
                                                        {isPaid ? '✓ Paid' : 'Unpaid'}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="cell-actions">
                                                    {isApproved && !isPaid && (
                                                        <button
                                                            className="action-pill-btn record"
                                                            onClick={() => {
                                                                setExpenseItem(it);
                                                                setExpenseForm({ actual_amount: it.estimated_amount, payment_date: new Date().toISOString().split('T')[0], payment_method: 'mpesa', receipt_ref: '', vendor: it.vendor || '', notes: '' });
                                                                setShowExpense(true);
                                                            }}
                                                        >
                                                            Record Payout
                                                        </button>
                                                    )}

                                                    {it.receipt_path ? (
                                                        <a
                                                            href={`${API_BASE_URL}uploads/receipts/${it.receipt_path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="action-icon-btn view-receipt"
                                                            title="View Receipt"
                                                        >
                                                            🧾
                                                        </a>
                                                    ) : (
                                                        <button
                                                            className="action-icon-btn upload-receipt"
                                                            onClick={() => { setUploadItem(it); setShowUpload(true); }}
                                                            title="Upload Receipt Voucher"
                                                        >
                                                            📎
                                                        </button>
                                                    )}

                                                    {isEditable && (
                                                        <>
                                                            <button
                                                                className="action-icon-btn"
                                                                onClick={() => {
                                                                    setEditItem(it);
                                                                    setItemForm({ category: it.category, description: it.description, estimated_amount: it.estimated_amount, vendor: it.vendor || '', notes: it.notes || '' });
                                                                    setShowAddItem(true);
                                                                }}
                                                                title="Edit Line Item"
                                                            >
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                                </svg>
                                                            </button>

                                                            <button
                                                                className="action-icon-btn delete"
                                                                onClick={() => handleDeleteItem(it.id)}
                                                                title="Delete Item"
                                                            >
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: Category Breakdown */}
            {budget && tab === 'summary' && (
                <div className="stitch-table-wrapper">
                    <div className="table-scroll-container">
                        <table className="stitch-data-table">
                            <thead>
                                <tr>
                                    <th>CATEGORY</th>
                                    <th>ITEMS</th>
                                    <th>ESTIMATED BUDGET</th>
                                    <th>ACTUAL EXPENDED</th>
                                    <th>VARIANCE</th>
                                    <th>SHARE OF BUDGET</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorySummary.map((cs) => {
                                    const cat = getCat(cs.category);
                                    const est = parseFloat(cs.estimated || 0);
                                    const act = parseFloat(cs.actual || 0);
                                    const v = act - est;
                                    const share = totalEstimated > 0 ? (est / totalEstimated * 100).toFixed(1) : 0;

                                    return (
                                        <tr key={cs.category}>
                                            <td>
                                                <span className="budget-cat-pill" style={{ background: cat.bg, color: cat.color }}>
                                                    {cat.label}
                                                </span>
                                            </td>
                                            <td><span className="cell-num">{cs.count}</span></td>
                                            <td><span className="amount-est">{formatKES(est)}</span></td>
                                            <td><span className="amount-act">{formatKES(act)}</span></td>
                                            <td>
                                                <span className={`variance-tag ${v > 0 ? 'over' : v < 0 ? 'under' : 'neutral'}`}>
                                                    {v >= 0 ? `+${formatKES(v)}` : `-${formatKES(Math.abs(v))}`}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="share-col">
                                                    <span>{share}%</span>
                                                    <div className="share-bar-bg">
                                                        <div className="share-bar-fill" style={{ width: `${share}%`, background: cat.color }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: Audit Trail */}
            {budget && tab === 'audit' && (
                <div className="stitch-table-wrapper">
                    <div className="table-scroll-container">
                        <table className="stitch-data-table">
                            <thead>
                                <tr>
                                    <th>TIMESTAMP</th>
                                    <th>PERFORMED BY</th>
                                    <th>ACTION</th>
                                    <th>DETAILS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {audit.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="table-empty-cell">No audit log entries recorded.</td>
                                    </tr>
                                ) : (
                                    audit.map((a) => (
                                        <tr key={a.id}>
                                            <td><span className="time-text">{new Date(a.created_at).toLocaleString()}</span></td>
                                            <td><span className="auditor-name">{a.user_name || 'System User'}</span></td>
                                            <td><span className="audit-action-pill">{a.action}</span></td>
                                            <td><span className="audit-details-text">{a.notes || '—'}</span></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* No Event Selected State */}
            {!selectedEventId && (
                <div className="empty-budget-banner">
                    <div className="empty-icon-wrap">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                    </div>
                    <h3 className="empty-title">Select an Event</h3>
                    <p className="empty-sub">Choose an event above to manage financial appropriations, line items, and payout vouchers.</p>
                </div>
            )}

            {/* Create Budget Modal */}
            {showCreateBudget && (
                <div className="modal-backdrop" onClick={() => setShowCreateBudget(false)}>
                    <div className="stitch-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Create New Event Budget</h3>
                                <p className="modal-sub">{eventInfo?.ename} — Initial budget appropriation (v1)</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowCreateBudget(false)}>×</button>
                        </div>

                        <div className="modal-form-grid">
                            <div className="form-group">
                                <label className="form-label">Budget Plan Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Master Conference Budget 2026"
                                    value={budgetForm.budget_name}
                                    onChange={e => setBudgetForm(prev => ({ ...prev, budget_name: e.target.value }))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Appropriation Notes</label>
                                <textarea
                                    rows="3"
                                    placeholder="Summary notes regarding funding source or approval guidelines..."
                                    value={budgetForm.notes}
                                    onChange={e => setBudgetForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="form-textarea"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="modal-btn secondary" onClick={() => setShowCreateBudget(false)}>
                                Cancel
                            </button>
                            <button className="modal-btn primary" onClick={handleCreateBudget} disabled={saving}>
                                {saving ? 'Creating...' : 'Initialize Budget'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit Line Item Modal */}
            {showAddItem && (
                <div className="modal-backdrop" onClick={() => setShowAddItem(false)}>
                    <div className="stitch-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">{editItem ? 'Edit Budget Line Item' : 'Add Line Item'}</h3>
                                <p className="modal-sub">{budget?.budget_name || 'Event Budget Plan'}</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowAddItem(false)}>×</button>
                        </div>

                        <div className="modal-form-grid">
                            <div className="form-group">
                                <label className="form-label">Expense Category *</label>
                                <select
                                    value={itemForm.category}
                                    onChange={e => setItemForm(prev => ({ ...prev, category: e.target.value }))}
                                    className="form-select"
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Stage lighting & PA Sound system hire"
                                    value={itemForm.description}
                                    onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-row-split">
                                <div className="form-group">
                                    <label className="form-label">Estimated Amount (KES) *</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={itemForm.estimated_amount}
                                        onChange={e => setItemForm(prev => ({ ...prev, estimated_amount: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vendor / Service Provider</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SoundWave Ltd"
                                        value={itemForm.vendor}
                                        onChange={e => setItemForm(prev => ({ ...prev, vendor: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Accounting Notes</label>
                                <textarea
                                    rows="2"
                                    placeholder="Payment terms or quotation reference..."
                                    value={itemForm.notes}
                                    onChange={e => setItemForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="form-textarea"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="modal-btn secondary" onClick={() => setShowAddItem(false)}>
                                Cancel
                            </button>
                            <button className="modal-btn primary" onClick={handleAddItem} disabled={saving}>
                                {saving ? 'Saving...' : editItem ? 'Update Line Item' : 'Add to Budget'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Record Expense Modal */}
            {showExpense && (
                <div className="modal-backdrop" onClick={() => setShowExpense(false)}>
                    <div className="stitch-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Record Payout Disbursement</h3>
                                <p className="modal-sub">{expenseItem?.description}</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowExpense(false)}>×</button>
                        </div>

                        <div className="modal-form-grid">
                            <div className="form-row-split">
                                <div className="form-group">
                                    <label className="form-label">Actual Paid (KES) *</label>
                                    <input
                                        type="number"
                                        value={expenseForm.actual_amount}
                                        onChange={e => setExpenseForm(prev => ({ ...prev, actual_amount: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Payment Date *</label>
                                    <input
                                        type="date"
                                        value={expenseForm.payment_date}
                                        onChange={e => setExpenseForm(prev => ({ ...prev, payment_date: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-row-split">
                                <div className="form-group">
                                    <label className="form-label">Payment Method *</label>
                                    <select
                                        value={expenseForm.payment_method}
                                        onChange={e => setExpenseForm(prev => ({ ...prev, payment_method: e.target.value }))}
                                        className="form-select"
                                    >
                                        {PAYMENT_METHODS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Receipt / M-Pesa Ref</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. QK91823JX"
                                        value={expenseForm.receipt_ref}
                                        onChange={e => setExpenseForm(prev => ({ ...prev, receipt_ref: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Recipient / Vendor</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Stage Pros Kenya"
                                    value={expenseForm.vendor}
                                    onChange={e => setExpenseForm(prev => ({ ...prev, vendor: e.target.value }))}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="modal-btn secondary" onClick={() => setShowExpense(false)}>
                                Cancel
                            </button>
                            <button className="modal-btn primary" onClick={handleRecordExpense} disabled={saving}>
                                {saving ? 'Recording...' : 'Confirm Disbursement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {showApproval && (
                <div className="modal-backdrop" onClick={() => setShowApproval(false)}>
                    <div className="stitch-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Pastoral Council Budget Review</h3>
                                <p className="modal-sub">Evaluate budget total of {formatKES(totalEstimated)}</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowApproval(false)}>×</button>
                        </div>

                        <div className="modal-form-grid">
                            <div className="form-group">
                                <label className="form-label">Council Decision *</label>
                                <select
                                    value={approvalForm.decision}
                                    onChange={e => setApprovalForm(prev => ({ ...prev, decision: e.target.value }))}
                                    className="form-select"
                                >
                                    <option value="approve">Approve Budget for Disbursement</option>
                                    <option value="reject">Reject & Request Revision</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Reviewer Notes & Minutes Reference</label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter council meeting approval minutes or adjustment instructions..."
                                    value={approvalForm.reason}
                                    onChange={e => setApprovalForm(prev => ({ ...prev, reason: e.target.value }))}
                                    className="form-textarea"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="modal-btn secondary" onClick={() => setShowApproval(false)}>
                                Cancel
                            </button>
                            <button
                                className={`modal-btn ${approvalForm.decision === 'approve' ? 'primary' : 'danger'}`}
                                onClick={handleApproval}
                                disabled={saving}
                            >
                                {saving ? 'Processing...' : approvalForm.decision === 'approve' ? 'Approve Budget' : 'Reject Budget'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Receipt Modal */}
            {showUpload && (
                <div className="modal-backdrop" onClick={() => setShowUpload(false)}>
                    <div className="stitch-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Attach Receipt Voucher</h3>
                                <p className="modal-sub">{uploadItem?.description}</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setShowUpload(false)}>×</button>
                        </div>

                        <div style={{ padding: '1rem 0' }}>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleUploadReceipt}
                                className="form-input"
                            />
                        </div>

                        <div className="modal-footer">
                            <button className="modal-btn secondary" onClick={() => setShowUpload(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .stitch-budget-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding-bottom: 2.5rem;
                }

                .stitch-toast {
                    position: fixed;
                    top: 1.5rem;
                    right: 1.5rem;
                    z-index: 10000;
                    padding: 0.75rem 1.25rem;
                    border-radius: 0.5rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.25);
                    color: #ffffff;
                }
                .stitch-toast.success { background: #059669; }
                .stitch-toast.error { background: #dc2626; }
                .stitch-toast.warning { background: #d97706; }

                /* Breadcrumbs Bar */
                .stitch-breadcrumbs-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }
                .breadcrumbs-path {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.8rem;
                }
                .crumb-segment {
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .crumb-segment {
                    color: #94a3b8;
                }
                .crumb-sep {
                    color: #cbd5e1;
                    font-size: 0.75rem;
                }
                .crumb-current {
                    color: #0f172a;
                    font-weight: 700;
                }
                .portal-wrapper.dark-mode .crumb-current {
                    color: #ffffff;
                }
                .sync-live-status {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .sync-live-status {
                    color: #94a3b8;
                }
                .sync-live-dot {
                    color: #10b981;
                    font-size: 0.7rem;
                }
                .sync-refresh-btn {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    font-size: 0.85rem;
                    padding: 0.1rem;
                }

                /* Action Bar */
                .budget-action-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .selectors-cluster {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }
                .selector-field {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 0.75rem;
                    padding: 0.4rem 0.85rem;
                    min-width: 280px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
                }
                .portal-wrapper.dark-mode .selector-field {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.12);
                }
                .selector-field.version {
                    min-width: 140px;
                }
                .selector-icon {
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                }
                .portal-wrapper.dark-mode .selector-icon {
                    color: #60a5fa;
                }
                .selector-dropdown {
                    border: none;
                    background: transparent;
                    font-size: 0.84rem;
                    font-weight: 600;
                    color: #0f172a;
                    outline: none;
                    width: 100%;
                    cursor: pointer;
                }
                .portal-wrapper.dark-mode .selector-dropdown {
                    color: #ffffff;
                }
                .portal-wrapper.dark-mode .selector-dropdown option {
                    background: #151128;
                    color: #ffffff;
                }

                .action-buttons-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .stitch-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.5rem 0.95rem;
                    border-radius: 0.5rem;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .stitch-action-btn.primary {
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
                }
                .stitch-action-btn.primary:hover:not(:disabled) {
                    background: #1d4ed8;
                }
                .stitch-action-btn.outline {
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    color: #334155;
                }
                .stitch-action-btn.outline:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: #94a3b8;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .stitch-action-btn.outline {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.12);
                    color: #cbd5e1;
                }
                .stitch-action-btn.approval {
                    background: #fffbeb;
                    border: 1px solid #fef3c7;
                    color: #d97706;
                }
                .stitch-action-btn.approval:hover:not(:disabled) {
                    background: #fef3c7;
                }
                .portal-wrapper.dark-mode .stitch-action-btn.approval {
                    background: rgba(217, 119, 6, 0.15);
                    border-color: rgba(217, 119, 6, 0.3);
                    color: #fbbf24;
                }
                .stitch-action-btn.pdf {
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    color: #2563eb;
                }
                .stitch-action-btn.pdf:hover:not(:disabled) {
                    background: #dbeafe;
                }
                .portal-wrapper.dark-mode .stitch-action-btn.pdf {
                    background: rgba(37, 99, 235, 0.15);
                    border-color: rgba(37, 99, 235, 0.3);
                    color: #60a5fa;
                }

                /* 4 KPI Cards Grid */
                .stitch-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.25rem;
                    margin-bottom: 1.5rem;
                }
                @media (max-width: 1100px) {
                    .stitch-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 640px) {
                    .stitch-stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .stitch-kpi-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 1.2rem 1.35rem 1.1rem 1.35rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 140px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                .portal-wrapper.dark-mode .stitch-kpi-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }
                .stitch-kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.06);
                }
                .kpi-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                }
                .kpi-icon-wrap {
                    width: 36px;
                    height: 36px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-badge {
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                }
                .kpi-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .kpi-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #64748b;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }
                .portal-wrapper.dark-mode .kpi-label {
                    color: #94a3b8;
                }
                .kpi-value {
                    font-size: 1.7rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                }
                .portal-wrapper.dark-mode .kpi-value {
                    color: #ffffff;
                }
                .kpi-footer {
                    margin-top: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .kpi-progress-track {
                    height: 3.5px;
                    border-radius: 2px;
                    background: #f1f5f9;
                    overflow: hidden;
                }
                .portal-wrapper.dark-mode .kpi-progress-track {
                    background: rgba(255, 255, 255, 0.08);
                }
                .kpi-progress-fill {
                    height: 100%;
                    border-radius: 2px;
                }
                .kpi-subtext {
                    font-size: 0.72rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .portal-wrapper.dark-mode .kpi-subtext {
                    color: #94a3b8;
                }

                /* Sub-Tabs Bar */
                .budget-tabs-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.25rem;
                    overflow-x: auto;
                    padding-bottom: 0.25rem;
                }
                .budget-tab-btn {
                    padding: 0.55rem 1.15rem;
                    border-radius: 9999px;
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    color: #475569;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .budget-tab-btn:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .budget-tab-btn {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.12);
                    color: #94a3b8;
                }
                .budget-tab-btn.active {
                    background: #2563eb;
                    color: #ffffff;
                    border-color: #2563eb;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);
                }

                /* Table Wrapper */
                .stitch-table-wrapper {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    overflow: hidden;
                    transition: background 0.2s, border-color 0.2s;
                }
                .portal-wrapper.dark-mode .stitch-table-wrapper {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .table-scroll-container {
                    overflow-x: auto;
                }
                .stitch-data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.82rem;
                    text-align: left;
                }
                .stitch-data-table thead {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .portal-wrapper.dark-mode .stitch-data-table thead {
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom-color: rgba(255, 255, 255, 0.06);
                }
                .stitch-data-table th {
                    padding: 0.75rem 1rem;
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #64748b;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .portal-wrapper.dark-mode .stitch-data-table th {
                    color: #94a3b8;
                }

                .budget-item-row {
                    border-bottom: 1px solid #f1f5f9;
                    transition: background 0.15s;
                }
                .portal-wrapper.dark-mode .budget-item-row {
                    border-bottom-color: rgba(255, 255, 255, 0.04);
                }
                .budget-item-row:hover {
                    background: #f8fafc;
                }
                .portal-wrapper.dark-mode .budget-item-row:hover {
                    background: rgba(255, 255, 255, 0.03);
                }
                .stitch-data-table td {
                    padding: 0.85rem 1rem;
                    vertical-align: middle;
                }

                .budget-cat-pill {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                    display: inline-block;
                    white-space: nowrap;
                }
                .desc-box {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .desc-text {
                    font-weight: 600;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .desc-text {
                    color: #ffffff;
                }
                .vendor-sub {
                    font-size: 0.7rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .vendor-sub {
                    color: #94a3b8;
                }

                .amount-est {
                    font-weight: 600;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .amount-est {
                    color: #ffffff;
                }
                .amount-act {
                    font-weight: 700;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .amount-act {
                    color: #60a5fa;
                }

                .variance-tag {
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .variance-tag.over { color: #dc2626; }
                .variance-tag.under { color: #059669; }
                .variance-tag.neutral { color: #64748b; }

                .payment-status-pill {
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                }
                .payment-status-pill.paid {
                    background: #ecfdf5;
                    color: #059669;
                }
                .payment-status-pill.unpaid {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .cell-actions {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.35rem;
                }
                .action-pill-btn {
                    padding: 0.35rem 0.75rem;
                    border-radius: 0.4rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    border: none;
                    transition: all 0.15s;
                }
                .action-pill-btn.record {
                    background: #2563eb;
                    color: #ffffff;
                }
                .action-pill-btn.record:hover {
                    background: #1d4ed8;
                }

                .action-icon-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 0.35rem;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                    text-decoration: none;
                    font-size: 0.85rem;
                }
                .action-icon-btn:hover {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #bfdbfe;
                }
                .portal-wrapper.dark-mode .action-icon-btn {
                    background: #1a1630;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .action-icon-btn.delete:hover {
                    background: #fef2f2;
                    color: #dc2626;
                    border-color: #fecaca;
                }

                /* Category summary styles */
                .share-col {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .share-bar-bg {
                    width: 80px;
                    height: 5px;
                    border-radius: 3px;
                    background: #e2e8f0;
                    overflow: hidden;
                }
                .portal-wrapper.dark-mode .share-bar-bg {
                    background: rgba(255, 255, 255, 0.1);
                }
                .share-bar-fill {
                    height: 100%;
                    border-radius: 3px;
                }
                .cell-num {
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .cell-num {
                    color: #ffffff;
                }

                /* Audit table */
                .time-text {
                    font-size: 0.75rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .time-text {
                    color: #94a3b8;
                }
                .auditor-name {
                    font-weight: 600;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .auditor-name {
                    color: #ffffff;
                }
                .audit-action-pill {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 0.15rem 0.55rem;
                    border-radius: 4px;
                    background: #eff6ff;
                    color: #2563eb;
                }
                .audit-details-text {
                    font-size: 0.78rem;
                    color: #64748b;
                }

                .empty-budget-banner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 5rem 1.5rem;
                    text-align: center;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                }
                .portal-wrapper.dark-mode .empty-budget-banner {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }
                .empty-icon-wrap {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    background: #eff6ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0.85rem;
                }
                .empty-title {
                    margin: 0;
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .empty-title {
                    color: #ffffff;
                }
                .empty-sub {
                    margin: 0.35rem 0 0 0;
                    font-size: 0.82rem;
                    color: #64748b;
                    max-width: 440px;
                }
                .portal-wrapper.dark-mode .empty-sub {
                    color: #94a3b8;
                }

                .table-empty-cell {
                    padding: 3rem 1rem !important;
                    text-align: center;
                    color: #64748b;
                }

                /* Modals */
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.5);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1rem;
                }
                .portal-wrapper.dark-mode .modal-backdrop {
                    background: rgba(0, 0, 0, 0.75);
                }
                .stitch-modal-card {
                    background: #ffffff;
                    border-radius: 1.25rem;
                    padding: 1.75rem 2rem;
                    max-width: 520px;
                    width: 100%;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15);
                    color: #0f172a;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .portal-wrapper.dark-mode .stitch-modal-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #f8fafc;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.25rem;
                }
                .modal-title {
                    margin: 0;
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .modal-title {
                    color: #ffffff;
                }
                .modal-sub {
                    margin: 0.25rem 0 0 0;
                    font-size: 0.8rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .modal-sub {
                    color: #94a3b8;
                }
                .modal-close-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    font-size: 1.5rem;
                    cursor: pointer;
                    line-height: 1;
                }
                .modal-form-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.95rem;
                    margin-bottom: 1.5rem;
                }
                .form-row-split {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .form-label {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #334155;
                }
                .portal-wrapper.dark-mode .form-label {
                    color: #cbd5e1;
                }
                .form-input, .form-select, .form-textarea {
                    padding: 0.6rem 0.85rem;
                    border-radius: 0.5rem;
                    border: 1px solid #cbd5e1;
                    background: #ffffff;
                    color: #0f172a;
                    font-size: 0.84rem;
                    outline: none;
                    box-sizing: border-box;
                }
                .portal-wrapper.dark-mode .form-input,
                .portal-wrapper.dark-mode .form-select,
                .portal-wrapper.dark-mode .form-textarea {
                    background: #0d0a1a;
                    border-color: rgba(255, 255, 255, 0.12);
                    color: #ffffff;
                }
                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    border-color: #2563eb;
                }
                .modal-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 0.65rem;
                }
                .modal-btn {
                    padding: 0.55rem 1.15rem;
                    border-radius: 0.5rem;
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                }
                .modal-btn.primary {
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                }
                .modal-btn.primary:hover {
                    background: #1d4ed8;
                }
                .modal-btn.danger {
                    background: #dc2626;
                    color: #ffffff;
                    border: none;
                }
                .modal-btn.danger:hover {
                    background: #b91c1c;
                }
                .modal-btn.secondary {
                    background: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                }
                .portal-wrapper.dark-mode .modal-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default EventBudgetPage;
