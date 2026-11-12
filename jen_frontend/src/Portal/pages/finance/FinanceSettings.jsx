import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { getFinanceSettings, manageFinanceSetting } from '../../../services/financeApi';

const TABS = [
    {
        key: 'accounting_periods',
        label: 'Accounting Periods',
        description: 'Define fiscal years and monthly/quarterly accounting cycles',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
        ),
    },
    {
        key: 'payment_methods',
        label: 'Payment Methods',
        description: 'Payment channels for receiving tithes, offerings, and event facilitation',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
        ),
    },
    {
        key: 'income_types',
        label: 'Income Types',
        description: 'Revenue classifications linked directly to General Ledger accounts',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
        ),
    },
    {
        key: 'expense_types',
        label: 'Expense Types',
        description: 'Operating and capital expenditure classifications with GL mapping',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
            </svg>
        ),
    },
    {
        key: 'contribution_types',
        label: 'Contribution Types',
        description: 'Tithes, thanksgiving, pledges, and general contribution designations',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        ),
    },
    {
        key: 'funds',
        label: 'Church Funds',
        description: 'Designated asset pools (Building, Missions, Youth, Welfare)',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="21" x2="21" y2="21"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <polyline points="5 10 5 3 19 3 19 10"></polyline>
                <line x1="4" y1="10" x2="4" y2="21"></line>
                <line x1="20" y1="10" x2="20" y2="21"></line>
                <line x1="8" y1="14" x2="8" y2="17"></line>
                <line x1="12" y1="14" x2="12" y2="17"></line>
                <line x1="16" y1="14" x2="16" y2="17"></line>
            </svg>
        ),
    },
];

const FinanceSettings = () => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [activeTab, setActiveTab] = useState('accounting_periods');
    const [data, setData] = useState({});
    const [glAccounts, setGlAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
    const [toast, setToast] = useState(null);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [closingPeriod, setClosingPeriod] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form states
    const [formName, setFormName] = useState('');
    const [formGlId, setFormGlId] = useState('');
    const [formStartDate, setFormStartDate] = useState('');
    const [formEndDate, setFormEndDate] = useState('');
    const [formNote, setFormNote] = useState('');

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getFinanceSettings('all');
            if (res?.success && res?.data) {
                setData(res.data);
                setGlAccounts(res.data.gl_accounts || []);
            }
        } catch (err) {
            console.error('Failed to load finance settings:', err);
            showToast('Failed to load finance settings from Django', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Active tab definition
    const currentTabMeta = TABS.find(t => t.key === activeTab) || TABS[0];
    const rawItems = data[activeTab] || [];
    const hasGl = activeTab === 'income_types' || activeTab === 'expense_types';
    const isPeriods = activeTab === 'accounting_periods';

    // Filter items based on search and status
    const filteredItems = useMemo(() => {
        return rawItems.filter(item => {
            const nameMatch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.account_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.account_name || '').toLowerCase().includes(searchTerm.toLowerCase());

            if (!nameMatch) return false;

            if (statusFilter === 'all') return true;
            if (isPeriods) {
                if (statusFilter === 'active') return !item.is_closed;
                if (statusFilter === 'inactive') return Boolean(item.is_closed);
            } else {
                const isActive = Number(item.delete_status) === 0;
                if (statusFilter === 'active') return isActive;
                if (statusFilter === 'inactive') return !isActive;
            }
            return true;
        });
    }, [rawItems, searchTerm, statusFilter, isPeriods]);

    // Modal handlers
    const openCreateModal = () => {
        setEditingItem(null);
        setFormName('');
        setFormGlId('');
        setFormStartDate('');
        setFormEndDate('');
        setFormNote('');
        setShowAddModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormName(item.name || '');
        setFormGlId(item.gl_account_id || '');
        setFormStartDate(item.start_date || '');
        setFormEndDate(item.end_date || '');
        setFormNote(item.note || '');
        setShowAddModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formName.trim()) {
            showToast('Name is required', 'error');
            return;
        }

        if (isPeriods && (!formStartDate || !formEndDate)) {
            showToast('Start and End dates are required', 'error');
            return;
        }

        setSaving(true);
        try {
            const isEdit = Boolean(editingItem);
            const payload = {
                section: activeTab,
                action: isEdit ? 'update' : 'create',
                id: editingItem?.id,
                name: formName.trim(),
                gl_account_id: formGlId || null,
                start_date: formStartDate,
                end_date: formEndDate,
                note: formNote.trim(),
            };

            const res = await manageFinanceSetting(payload);
            if (res?.success) {
                showToast(res.message || (isEdit ? 'Item updated' : 'Item created'));
                setShowAddModal(false);
                setEditingItem(null);
                await fetchData();
            } else {
                showToast(res?.error || 'Operation failed', 'error');
            }
        } catch (err) {
            showToast(err?.response?.data?.error || err.message || 'Operation failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (item) => {
        try {
            const res = await manageFinanceSetting({
                section: activeTab,
                action: 'toggle',
                id: item.id,
            });
            if (res?.success) {
                showToast(res.message || 'Status updated');
                await fetchData();
            }
        } catch (err) {
            showToast(err?.message || 'Failed to toggle status', 'error');
        }
    };

    const handleClosePeriod = async () => {
        if (!closingPeriod) return;
        setSaving(true);
        try {
            const res = await manageFinanceSetting({
                section: 'accounting_periods',
                action: 'close_period',
                id: closingPeriod.id,
            });
            if (res?.success) {
                showToast(`Accounting period "${closingPeriod.name}" closed successfully`);
                setClosingPeriod(null);
                await fetchData();
            }
        } catch (err) {
            showToast(err?.message || 'Failed to close period', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleReopenPeriod = async (period) => {
        setSaving(true);
        try {
            const res = await manageFinanceSetting({
                section: 'accounting_periods',
                action: 'reopen_period',
                id: period.id,
            });
            if (res?.success) {
                showToast(`Accounting period "${period.name}" reopened`);
                await fetchData();
            }
        } catch (err) {
            showToast(err?.message || 'Failed to reopen period', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="stitch-finance-settings">
            {/* Breadcrumbs Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Financial Management</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Finance Settings</span>
                </div>

                <div className="sync-live-status">
                    <span className="sync-live-dot">●</span>
                    <span>Django API live</span>
                    <span className="sync-sep">•</span>
                    <span>Updated just now</span>
                    <button className="sync-refresh-btn" onClick={fetchData} title="Refresh data">
                        ⟳
                    </button>
                </div>
            </div>

            {/* Title Header */}
            <div className="stitch-page-heading">
                <div className="heading-content">
                    <h1 className="heading-title">General Finance Settings</h1>
                    <p className="heading-sub">
                        Configure financial accounting periods, payment receiving channels, GL account linkages, and designated funds.
                    </p>
                </div>
            </div>

            {/* Navigation Tab Pills */}
            <div className="stitch-tab-strip">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.key;
                    const count = (data[tab.key] || []).length;
                    return (
                        <button
                            key={tab.key}
                            className={`stitch-tab-pill ${isActive ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(tab.key);
                                setSearchTerm('');
                                setStatusFilter('all');
                            }}
                        >
                            <span className="tab-pill-icon">{tab.icon}</span>
                            <span className="tab-pill-label">{tab.label}</span>
                            <span className="tab-pill-badge">{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Active Section Action Bar */}
            <div className="stitch-action-bar">
                <div className="action-meta">
                    <h2 className="action-title">{currentTabMeta.label}</h2>
                    <p className="action-sub">{currentTabMeta.description}</p>
                </div>

                <div className="action-controls">
                    {/* Search */}
                    <div className="stitch-search-wrap">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder={`Search ${currentTabMeta.label.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="clear-btn" onClick={() => setSearchTerm('')}>✕</button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <select
                        className="stitch-select-filter"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">{isPeriods ? 'Closed Only' : 'Inactive Only'}</option>
                    </select>

                    {/* Add Item Button */}
                    {activeTab !== 'contribution_types' && (
                        <button className="stitch-primary-btn" onClick={openCreateModal}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>Add {currentTabMeta.label.replace(/s$/, '')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Table Card */}
            <div className="stitch-table-card">
                {isPeriods ? (
                    <table className="stitch-enterprise-table">
                        <thead>
                            <tr>
                                <th style={{ width: '28%' }}>Period Name</th>
                                <th style={{ width: '18%' }}>Start Date</th>
                                <th style={{ width: '18%' }}>End Date</th>
                                <th style={{ width: '12%' }}>Journal Entries</th>
                                <th style={{ width: '12%' }}>Status</th>
                                <th style={{ width: '12%', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="table-state-cell">
                                        <div className="loading-spinner"></div>
                                        <span>Loading accounting periods from Django...</span>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="table-state-cell empty">
                                        <p>No accounting periods matching your query</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map(p => {
                                    const isClosed = Boolean(p.is_closed);
                                    return (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="item-primary-text">{p.name}</div>
                                            </td>
                                            <td>
                                                <span className="mono-date">{p.start_date || '—'}</span>
                                            </td>
                                            <td>
                                                <span className="mono-date">{p.end_date || '—'}</span>
                                            </td>
                                            <td>
                                                <span className="entry-pill">{p.entry_count || 0} entries</span>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${isClosed ? 'closed' : 'active'}`}>
                                                    <span className="status-dot">●</span>
                                                    {isClosed ? 'Closed' : 'Active'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="row-action-group">
                                                    {!isClosed ? (
                                                        <>
                                                            <button
                                                                className="stitch-action-link"
                                                                onClick={() => openEditModal(p)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="stitch-action-link danger"
                                                                onClick={() => setClosingPeriod(p)}
                                                            >
                                                                Close
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="stitch-action-link warning"
                                                            onClick={() => handleReopenPeriod(p)}
                                                        >
                                                            Reopen
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="stitch-enterprise-table">
                        <thead>
                            <tr>
                                <th style={{ width: hasGl ? '35%' : '55%' }}>Name</th>
                                {hasGl && <th style={{ width: '30%' }}>Linked General Ledger Account</th>}
                                {activeTab === 'funds' && <th style={{ width: '25%' }}>Description / Note</th>}
                                <th style={{ width: '15%' }}>Status</th>
                                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={hasGl ? 4 : 3} className="table-state-cell">
                                        <div className="loading-spinner"></div>
                                        <span>Loading data...</span>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={hasGl ? 4 : 3} className="table-state-cell empty">
                                        <p>No items found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map(item => {
                                    const isActive = Number(item.delete_status) === 0;
                                    return (
                                        <tr key={item.id} className={!isActive ? 'row-inactive' : ''}>
                                            <td>
                                                <div className="item-primary-text">{item.name}</div>
                                            </td>
                                            {hasGl && (
                                                <td>
                                                    {item.account_code ? (
                                                        <div className="gl-pill">
                                                            <span className="gl-code">{item.account_code}</span>
                                                            <span className="gl-name">{item.account_name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="unlinked-pill">Not linked</span>
                                                    )}
                                                </td>
                                            )}
                                            {activeTab === 'funds' && (
                                                <td>
                                                    <span className="note-text">{item.note || '—'}</span>
                                                </td>
                                            )}
                                            <td>
                                                <span className={`status-pill ${isActive ? 'active' : 'inactive'}`}>
                                                    <span className="status-dot">●</span>
                                                    {isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="row-action-group">
                                                    {activeTab !== 'contribution_types' && (
                                                        <>
                                                            <button
                                                                className="stitch-action-link"
                                                                onClick={() => openEditModal(item)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className={`stitch-action-link ${isActive ? 'danger' : 'success'}`}
                                                                onClick={() => handleToggle(item)}
                                                            >
                                                                {isActive ? 'Disable' : 'Enable'}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showAddModal && (
                <div className="modal-backdrop" onClick={() => !saving && setShowAddModal(false)}>
                    <div className="stitch-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">
                                    {editingItem ? 'Edit ' : 'New '}
                                    {currentTabMeta.label.replace(/s$/, '')}
                                </h3>
                                <p className="modal-subtitle">
                                    {isPeriods
                                        ? 'Specify accounting period boundaries for financial reporting'
                                        : 'Update settings metadata and General Ledger mappings'}
                                </p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => !saving && setShowAddModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">
                                        {isPeriods ? 'Period Name *' : 'Name *'}
                                    </label>
                                    <input
                                        type="text"
                                        className="stitch-input"
                                        placeholder={isPeriods ? 'e.g. FY 2026-2027 or Q1 2026' : 'Enter name...'}
                                        value={formName}
                                        onChange={e => setFormName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                {isPeriods && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Start Date *</label>
                                            <input
                                                type="date"
                                                className="stitch-input"
                                                value={formStartDate}
                                                onChange={e => setFormStartDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">End Date *</label>
                                            <input
                                                type="date"
                                                className="stitch-input"
                                                value={formEndDate}
                                                onChange={e => setFormEndDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {hasGl && (
                                    <div className="form-group">
                                        <label className="form-label">Linked General Ledger Account</label>
                                        <select
                                            className="stitch-input"
                                            value={formGlId}
                                            onChange={e => setFormGlId(e.target.value)}
                                        >
                                            <option value="">None / Unlinked</option>
                                            {glAccounts
                                                .filter(a => activeTab === 'income_types' ? a.account_type === 'Revenue' : a.account_type === 'Expense')
                                                .map(a => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.account_code} — {a.account_name} ({a.account_type})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}

                                {activeTab === 'funds' && (
                                    <div className="form-group">
                                        <label className="form-label">Fund Purpose / Notes</label>
                                        <textarea
                                            className="stitch-input"
                                            rows="3"
                                            placeholder="Optional notes or purpose of this fund..."
                                            value={formNote}
                                            onChange={e => setFormNote(e.target.value)}
                                        ></textarea>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="stitch-secondary-btn"
                                    onClick={() => setShowAddModal(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="stitch-primary-btn"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Close Period Confirmation Modal */}
            {closingPeriod && (
                <div className="modal-backdrop" onClick={() => !saving && setClosingPeriod(null)}>
                    <div className="stitch-modal-card confirm-card" onClick={e => e.stopPropagation()}>
                        <div className="confirm-icon danger">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <h3 className="confirm-title">Close Accounting Period?</h3>
                        <p className="confirm-body">
                            Are you sure you want to close <strong>{closingPeriod.name}</strong> ({closingPeriod.start_date} to {closingPeriod.end_date})?
                            <br />
                            Once closed, financial transactions for this cycle will be sealed from new modifications without administrative reopening.
                        </p>
                        <div className="confirm-footer">
                            <button
                                className="stitch-secondary-btn"
                                onClick={() => setClosingPeriod(null)}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                className="stitch-danger-btn"
                                onClick={handleClosePeriod}
                                disabled={saving}
                            >
                                {saving ? 'Closing...' : 'Yes, Close Period'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Alerts */}
            {toast && (
                <div className={`stitch-toast ${toast.type}`}>
                    <span>{toast.message}</span>
                </div>
            )}

            <style>{`
                .stitch-finance-settings {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding-bottom: 3rem;
                    font-family: inherit;
                }

                /* Breadcrumbs */
                .stitch-breadcrumbs-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.25rem;
                }
                .breadcrumbs-path {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                }
                .crumb-sep {
                    color: ${isDark ? '#475569' : '#cbd5e1'};
                }
                .crumb-current {
                    color: #2563eb;
                    font-weight: 600;
                }
                .sync-live-status {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.75rem;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                }
                .sync-live-dot {
                    color: #10b981;
                    font-size: 0.85rem;
                }
                .sync-refresh-btn {
                    background: transparent;
                    border: none;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    cursor: pointer;
                    font-size: 0.95rem;
                    padding: 0 0.2rem;
                    transition: transform 0.2s;
                }
                .sync-refresh-btn:hover {
                    color: #2563eb;
                    transform: rotate(45deg);
                }

                /* Heading */
                .stitch-page-heading {
                    margin-bottom: 1.5rem;
                }
                .heading-title {
                    font-size: 1.7rem;
                    font-weight: 800;
                    letter-spacing: -0.025em;
                    margin: 0 0 0.25rem;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                }
                .heading-sub {
                    font-size: 0.88rem;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    margin: 0;
                }

                /* Tabs Strip */
                .stitch-tab-strip {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.35rem;
                    border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                }
                .stitch-tab-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.65rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    font-size: 0.83rem;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.15s ease;
                }
                .stitch-tab-pill:hover {
                    border-color: #2563eb;
                    color: #2563eb;
                }
                .stitch-tab-pill.active {
                    background: #2563eb;
                    border-color: #2563eb;
                    color: #ffffff;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
                }
                .tab-pill-icon {
                    display: flex;
                    align-items: center;
                }
                .tab-pill-badge {
                    padding: 0.1rem 0.45rem;
                    border-radius: 1rem;
                    font-size: 0.72rem;
                    background: ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#f1f5f9'};
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                }
                .stitch-tab-pill.active .tab-pill-badge {
                    background: rgba(255, 255, 255, 0.22);
                    color: #ffffff;
                }

                /* Action Bar */
                .stitch-action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                    flex-wrap: wrap;
                }
                .action-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin: 0 0 0.15rem;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                }
                .action-sub {
                    font-size: 0.8rem;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    margin: 0;
                }
                .action-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }

                .stitch-search-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.45rem 0.8rem;
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'};
                    border-radius: 0.65rem;
                    font-size: 0.85rem;
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                }
                .stitch-search-wrap input {
                    border: none;
                    background: transparent;
                    outline: none;
                    color: inherit;
                    font-size: 0.85rem;
                    width: 170px;
                }
                .clear-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 0.75rem;
                }

                .stitch-select-filter {
                    padding: 0.5rem 0.85rem;
                    border-radius: 0.65rem;
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'};
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                    font-size: 0.85rem;
                    font-weight: 500;
                    outline: none;
                }

                .stitch-primary-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.55rem 1rem;
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.65rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.22);
                    transition: background 0.15s;
                }
                .stitch-primary-btn:hover {
                    background: #1d4ed8;
                }
                .stitch-secondary-btn {
                    padding: 0.55rem 1rem;
                    background: ${isDark ? '#2a2438' : '#f1f5f9'};
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'};
                    border-radius: 0.65rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .stitch-danger-btn {
                    padding: 0.55rem 1rem;
                    background: #dc2626;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.65rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                /* Table Card */
                .stitch-table-card {
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
                }
                .stitch-enterprise-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .stitch-enterprise-table thead tr {
                    background: ${isDark ? '#252038' : '#f8fafc'};
                    border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                }
                .stitch-enterprise-table th {
                    padding: 0.85rem 1.25rem;
                    font-size: 0.76rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                }
                .stitch-enterprise-table tbody tr {
                    border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'};
                    transition: background 0.15s;
                }
                .stitch-enterprise-table tbody tr:hover {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc'};
                }
                .stitch-enterprise-table tbody tr.row-inactive {
                    opacity: 0.6;
                }
                .stitch-enterprise-table td {
                    padding: 0.95rem 1.25rem;
                    font-size: 0.85rem;
                    color: ${isDark ? '#e2e8f0' : '#334155'};
                }

                .item-primary-text {
                    font-weight: 600;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                }
                .mono-date {
                    font-family: monospace;
                    font-size: 0.82rem;
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                }
                .entry-pill {
                    font-size: 0.78rem;
                    padding: 0.2rem 0.55rem;
                    border-radius: 0.4rem;
                    background: ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'};
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    font-weight: 500;
                }
                .note-text {
                    font-size: 0.8rem;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                }

                /* Status Pills */
                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.2rem 0.6rem;
                    border-radius: 1rem;
                    font-size: 0.74rem;
                    font-weight: 600;
                }
                .status-pill.active {
                    background: #ecfdf5;
                    color: #059669;
                }
                .status-pill.inactive {
                    background: #f1f5f9;
                    color: #64748b;
                }
                .status-pill.closed {
                    background: #fef2f2;
                    color: #dc2626;
                }
                .status-dot {
                    font-size: 0.65rem;
                }

                /* GL Pills */
                .gl-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .gl-code {
                    font-family: monospace;
                    font-weight: 700;
                    padding: 0.15rem 0.45rem;
                    border-radius: 0.35rem;
                    background: #eff6ff;
                    color: #2563eb;
                    font-size: 0.78rem;
                }
                .gl-name {
                    font-size: 0.82rem;
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                }
                .unlinked-pill {
                    font-size: 0.78rem;
                    color: #d97706;
                    background: #fffbeb;
                    padding: 0.15rem 0.5rem;
                    border-radius: 0.35rem;
                    font-weight: 500;
                }

                /* Row Actions */
                .row-action-group {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .stitch-action-link {
                    background: transparent;
                    border: none;
                    color: #2563eb;
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0.25rem 0.45rem;
                    border-radius: 0.35rem;
                }
                .stitch-action-link:hover {
                    background: ${isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff'};
                }
                .stitch-action-link.danger {
                    color: #dc2626;
                }
                .stitch-action-link.danger:hover {
                    background: ${isDark ? 'rgba(220, 38, 38, 0.15)' : '#fef2f2'};
                }
                .stitch-action-link.success {
                    color: #059669;
                }
                .stitch-action-link.warning {
                    color: #d97706;
                }

                .table-state-cell {
                    text-align: center;
                    padding: 3rem 1rem !important;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                }
                .loading-spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid rgba(37, 99, 235, 0.2);
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 0.75rem;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Modals */
                .modal-backdrop {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .stitch-modal-card {
                    background: ${isDark ? '#1e1a2e' : '#ffffff'};
                    border-radius: 1rem;
                    width: 100%;
                    max-width: 520px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'};
                    overflow: hidden;
                    animation: modalIn 0.2s ease-out;
                }
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.96) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                }
                .modal-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin: 0 0 0.2rem;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                }
                .modal-subtitle {
                    font-size: 0.8rem;
                    color: ${isDark ? '#94a3b8' : '#64748b'};
                    margin: 0;
                }
                .modal-close-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 1.1rem;
                }
                .modal-body {
                    padding: 1.25rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }
                .form-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                }
                .stitch-input {
                    padding: 0.6rem 0.85rem;
                    border-radius: 0.55rem;
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'};
                    background: ${isDark ? '#171324' : '#ffffff'};
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                    font-size: 0.85rem;
                    outline: none;
                    transition: border-color 0.15s;
                }
                .stitch-input:focus {
                    border-color: #2563eb;
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.65rem;
                    padding: 1.15rem 1.5rem;
                    border-top: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
                    background: ${isDark ? '#252038' : '#f8fafc'};
                }

                /* Confirm Card */
                .confirm-card {
                    max-width: 440px;
                    padding: 1.75rem;
                    text-align: center;
                }
                .confirm-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                }
                .confirm-icon.danger {
                    background: #fef2f2;
                    color: #dc2626;
                }
                .confirm-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin: 0 0 0.5rem;
                    color: ${isDark ? '#ffffff' : '#0f172a'};
                }
                .confirm-body {
                    font-size: 0.85rem;
                    color: ${isDark ? '#cbd5e1' : '#475569'};
                    line-height: 1.5;
                    margin: 0 0 1.5rem;
                }
                .confirm-footer {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: center;
                }

                /* Toast */
                .stitch-toast {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    padding: 0.75rem 1.25rem;
                    border-radius: 0.75rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #ffffff;
                    z-index: 2000;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                    animation: toastIn 0.2s ease-out;
                }
                @keyframes toastIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .stitch-toast.success { background: #059669; }
                .stitch-toast.error { background: #dc2626; }
            `}</style>
        </div>
    );
};

export default FinanceSettings;
