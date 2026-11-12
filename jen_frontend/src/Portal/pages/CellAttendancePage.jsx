import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const CellAttendancePage = () => {
    const [cells, setCells] = useState([]);
    const [selectedCell, setSelectedCell] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [members, setMembers] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [recorded, setRecorded] = useState(false);

    useEffect(() => {
        const fetchCells = async () => {
            try {
                const res = await api.get('get_cells.php');
                if (res.success) setCells(res.data.cells);
            } catch (err) { console.error(err); }
        };
        fetchCells();
    }, []);

    const fetchAttendance = useCallback(async () => {
        if (!selectedCell) return;
        try {
            setLoading(true);
            const res = await api.get('cell_attendance.php', { params: { cell_id: selectedCell, date } });
            if (res.success) {
                setMembers(res.data.members.map(m => ({
                    ...m,
                    present: m.present !== null ? !!m.present : true
                })));
                setHistory(res.data.history);
                setRecorded(res.data.recorded);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [selectedCell, date]);

    useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

    const toggleMember = (id) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, present: !m.present } : m));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.post('cell_attendance.php', {
                cell_id: parseInt(selectedCell),
                date,
                attendees: members.map(m => ({ member_id: m.id, present: m.present ? 1 : 0 }))
            });
            if (res.success) {
                setRecorded(true);
                fetchAttendance();
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save attendance');
        } finally { setSaving(false); }
    };

    const presentCount = members.filter(m => m.present).length;
    const absentCount = members.filter(m => !m.present).length;

    const inputStyle = {
        padding: '0.6rem 0.75rem',
        background: 'var(--bg-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        color: 'var(--text-color)',
        fontSize: '0.9rem'
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Cell Attendance</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Record and track cell meeting attendance.</p>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'end' }}>
                <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Cell Group</label>
                    <select value={selectedCell} onChange={(e) => setSelectedCell(e.target.value)} style={{ ...inputStyle, minWidth: '200px' }}>
                        <option value="">Select a cell...</option>
                        {cells.map(c => <option key={c.id} value={c.id}>{c.name || c.code} ({c.member_count} members)</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Meeting Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
                </div>
                {selectedCell && members.length > 0 && (
                    <button onClick={handleSave} disabled={saving}
                        style={{
                            padding: '0.6rem 1.5rem', background: saving ? 'var(--text-muted)' : 'var(--primary)',
                            color: 'var(--bg-color)', border: 'none', borderRadius: '0.5rem',
                            fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer'
                        }}>
                        {saving ? 'Saving...' : recorded ? 'Update Attendance' : 'Save Attendance'}
                    </button>
                )}
            </div>

            {!selectedCell && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <p>Select a cell group to record attendance</p>
                </div>
            )}

            {selectedCell && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
                    {/* Members List */}
                    <div style={{ background: 'var(--surface-1)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1rem' }}>Members</h3>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                                <span style={{ color: '#4ade80' }}>✅ {presentCount} Present</span>
                                <span style={{ color: '#ef4444' }}>❌ {absentCount} Absent</span>
                            </div>
                        </div>
                        <div style={{ padding: '0.5rem' }}>
                            {loading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                            ) : members.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No members in this cell</div>
                            ) : members.map(member => (
                                <div key={member.id} onClick={() => toggleMember(member.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
                                        marginBottom: '0.25rem', borderRadius: '0.5rem', cursor: 'pointer',
                                        background: member.present ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                        border: `1px solid ${member.present ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                        transition: 'all 0.2s'
                                    }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        background: member.present ? '#4ade80' : '#ef4444',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 'bold', fontSize: '0.9rem'
                                    }}>
                                        {member.present ? '✓' : '✗'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: 'var(--text-color)', fontWeight: '500' }}>{member.first_name} {member.last_name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{member.phone_no || ''}</div>
                                    </div>
                                    <span style={{ color: member.present ? '#4ade80' : '#ef4444', fontSize: '0.8rem', fontWeight: '600' }}>
                                        {member.present ? 'Present' : 'Absent'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* History Sidebar */}
                    <div style={{ background: 'var(--surface-1)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1rem' }}>📊 Attendance History</h3>
                        {history.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No history yet</p>
                        ) : history.map((h, i) => {
                            const pct = h.total > 0 ? Math.round((h.present_count / h.total) * 100) : 0;
                            return (
                                <div key={i} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{h.meeting_date}</span>
                                        <span style={{ color: 'var(--text-color)', fontSize: '0.8rem', fontWeight: '600' }}>{h.present_count}/{h.total}</span>
                                    </div>
                                    <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: pct > 70 ? '#4ade80' : pct > 40 ? '#f59e0b' : '#ef4444' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CellAttendancePage;
