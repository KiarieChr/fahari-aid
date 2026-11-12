import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const PayrollManager = () => {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [form, setForm] = useState({
        pay_period_start: '', pay_period_end: '', description: '',
        items: [{ employee_name: '', member_id: 0, basic_salary: '', allowances: '', deductions: '', payment_method: '', bank_name: '', account_number: '' }]
    });

    const fetchRuns = async () => {
        setLoading(true);
        try {
            const res = await api.get('payroll.php');
            if (res.success) setRuns(res.data.runs);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRuns(); }, []);

    const addEmployee = () => setForm({ ...form, items: [...form.items, { employee_name: '', member_id: 0, basic_salary: '', allowances: '', deductions: '', payment_method: '', bank_name: '', account_number: '' }] });
    const removeEmployee = (i) => {
        if (form.items.length <= 1) return;
        setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
    };
    const updateItem = (i, field, val) => {
        const newItems = [...form.items];
        newItems[i] = { ...newItems[i], [field]: val };
        setForm({ ...form, items: newItems });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                action: 'create',
                pay_period_start: form.pay_period_start,
                pay_period_end: form.pay_period_end,
                description: form.description,
                items: form.items.map(it => ({
                    ...it,
                    basic_salary: parseFloat(it.basic_salary) || 0,
                    allowances: parseFloat(it.allowances) || 0,
                    deductions: parseFloat(it.deductions) || 0,
                }))
            };
            const res = await api.post('payroll.php', payload);
            if (res.success) {
                setShowForm(false);
                setForm({ pay_period_start: '', pay_period_end: '', description: '', items: [{ employee_name: '', member_id: 0, basic_salary: '', allowances: '', deductions: '', payment_method: '', bank_name: '', account_number: '' }] });
                fetchRuns();
            }
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const handleAction = async (runId, action) => {
        const confirmMsg = action === 'approve' ? 'Approve this payroll run?' : 'Mark this payroll as paid? This will create a journal entry.';
        if (!confirm(confirmMsg)) return;
        try {
            const res = await api.post('payroll.php', { action, run_id: runId });
            if (res.success) fetchRuns();
        } catch (err) { alert(err.message); }
    };

    const fmt = (n) => (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalNet = form.items.reduce((s, it) => s + (parseFloat(it.basic_salary) || 0) + (parseFloat(it.allowances) || 0) - (parseFloat(it.deductions) || 0), 0);

    const statusColors = { draft: '#f59e0b', approved: '#22c1e6', paid: '#4ade80' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{runs.length} payroll run(s)</div>
                <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>+ New Payroll Run</button>
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleCreate} style={{ background: 'var(--surface-1)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                            <label style={labelStyle}>Period Start</label>
                            <input type="date" required value={form.pay_period_start} onChange={e => setForm({ ...form, pay_period_start: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Period End</label>
                            <input type="date" required value={form.pay_period_end} onChange={e => setForm({ ...form, pay_period_end: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Description</label>
                            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. March 2026 Payroll" style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Employees</div>
                    {form.items.map((item, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 30px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end' }}>
                            <div>
                                {i === 0 && <label style={labelStyle}>Name</label>}
                                <input required value={item.employee_name} onChange={e => updateItem(i, 'employee_name', e.target.value)} placeholder="Employee name" style={inputStyle} />
                            </div>
                            <div>
                                {i === 0 && <label style={labelStyle}>Basic Salary</label>}
                                <input type="number" step="0.01" min="0" required value={item.basic_salary} onChange={e => updateItem(i, 'basic_salary', e.target.value)} placeholder="0" style={inputStyle} />
                            </div>
                            <div>
                                {i === 0 && <label style={labelStyle}>Allowances</label>}
                                <input type="number" step="0.01" min="0" value={item.allowances} onChange={e => updateItem(i, 'allowances', e.target.value)} placeholder="0" style={inputStyle} />
                            </div>
                            <div>
                                {i === 0 && <label style={labelStyle}>Deductions</label>}
                                <input type="number" step="0.01" min="0" value={item.deductions} onChange={e => updateItem(i, 'deductions', e.target.value)} placeholder="0" style={inputStyle} />
                            </div>
                            <div>
                                {form.items.length > 1 && (
                                    <button type="button" onClick={() => removeEmployee(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <button type="button" onClick={addEmployee} style={{ ...btnPrimary, background: 'var(--surface-2)', color: 'var(--text-color)' }}>+ Add Employee</button>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-color)' }}>Net Total: KES {fmt(totalNet)}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : 'Create Run'}</button>
                            <button type="button" onClick={() => setShowForm(false)} style={{ ...btnPrimary, background: 'var(--surface-2)', color: 'var(--text-color)' }}>Cancel</button>
                        </div>
                    </div>
                </form>
            )}

            {/* Runs List */}
            <div style={{ background: 'var(--surface-1)', borderRadius: '0.75rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                ) : runs.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No payroll runs yet</div>
                ) : runs.map(run => (
                    <div key={run.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <div onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                            style={{ padding: '0.75rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                                    {run.description || `Payroll #${run.id}`}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {run.pay_period_start} to {run.pay_period_end} · {run.employee_count} employee(s)
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>KES {fmt(run.total_net)}</span>
                                <span style={{
                                    padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600',
                                    background: `${statusColors[run.status]}20`, color: statusColors[run.status]
                                }}>
                                    {run.status}
                                </span>
                                {run.status === 'draft' && <button onClick={(e) => { e.stopPropagation(); handleAction(run.id, 'approve'); }} style={{ ...btnSmall, background: '#22c1e620', color: '#22c1e6' }}>Approve</button>}
                                {run.status === 'approved' && <button onClick={(e) => { e.stopPropagation(); handleAction(run.id, 'pay'); }} style={{ ...btnSmall, background: '#4ade8020', color: '#4ade80' }}>Pay</button>}
                            </div>
                        </div>
                        {expandedId === run.id && run.items && (
                            <div style={{ padding: '0 0.75rem 0.75rem' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--surface-2)' }}>
                                            {['Employee', 'Basic', 'Allowances', 'Deductions', 'Net Pay'].map(h => (
                                                <th key={h} style={thStyle}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {run.items.map((item, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={tdStyle}>{item.employee_name}</td>
                                                <td style={tdStyle}>{fmt(item.basic_salary)}</td>
                                                <td style={tdStyle}>{fmt(item.allowances)}</td>
                                                <td style={{ ...tdStyle, color: '#f87171' }}>{fmt(item.deductions)}</td>
                                                <td style={{ ...tdStyle, fontWeight: '600' }}>{fmt(item.net_pay)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.25rem' };
const inputStyle = { width: '100%', padding: '0.4rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--surface-2)', color: 'var(--text-color)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' };
const btnPrimary = { padding: '0.4rem 0.75rem', borderRadius: '0.375rem', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' };
const btnSmall = { padding: '0.2rem 0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' };
const thStyle = { padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' };
const tdStyle = { padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-color)' };

export default PayrollManager;
