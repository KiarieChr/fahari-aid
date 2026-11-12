import React, { useState } from 'react';
import api from '../../../services/api';

const MeetingAttendanceForm = ({ meetingId, onSuccess, onError }) => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!phone || phone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post(`meetings/${meetingId}/attendance/`, {
                phone_no: phone
            });
            if (response.id || response.success) {
                setSuccess('Attendance marked successfully!');
                if (response.redirect) {
                    setTimeout(() => {
                        window.location.href = response.redirect;
                    }, 1500);
                }
                if (onSuccess) onSuccess(response);
            } else {
                setError(response.message || response.error || 'Could not mark attendance');
                if (onError) onError(response);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to mark attendance. Check phone number.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto', background: 'var(--surface-1)', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: 16 }}>Mark Attendance</h2>
            <div style={{ marginBottom: 18 }}>
                <label htmlFor="phone" style={{ fontWeight: 500, color: 'var(--text-color)' }}>Phone Number</label>
                <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 0712xxxxxx"
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid var(--border-color)', marginTop: 6 }}
                    required
                />
            </div>
            {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}
            {success && <div style={{ color: '#22c55e', marginBottom: 12 }}>{success}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', borderRadius: 8, background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Marking...' : 'Mark Attendance'}
            </button>
        </form>
    );
};

export default MeetingAttendanceForm;
