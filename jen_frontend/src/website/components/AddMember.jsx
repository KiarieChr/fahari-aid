import React, { useState } from 'react';
import { API_BASE_URL as API_URL } from '../../services/api';

{/*
 Add the member form for the login page
    
*/}

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    background: '#120D20',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    color: '#eff3c1',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
};

const labelStyle = {
    display: 'block',
    color: '#94a3b8',
    marginBottom: '0.4rem',
    fontSize: '0.95rem'
};

const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    paddingRight: '2rem'
};

export default function AddMember({ meetingId }) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_no: '',
        residence: '',
        invited_by: '',
        marital_status: '',
        emp_status: '',
        dob: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setResult(null);

        try {
            const payload = { ...formData };
            if (meetingId) payload.meeting_id = meetingId;

            const response = await fetch(`${API_URL}/add_member.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                setResult(data);
                if (data.redirect) {
                    setTimeout(() => {
                        window.location.href = data.redirect;
                    }, 2000);
                }
            } else {
                setError(data.message || 'Failed to add member');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (result) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff3c1' }}>
                <div style={{ background: '#1A1625', padding: '3rem 2rem', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ color: '#eff3c1', marginBottom: '1rem' }}>{result.title}</h2>
                    <p style={{ color: '#94a3b8' }}>{result.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#eff3c1' }}>
            <div style={{ flex: 1, padding: '2rem 1rem' }}>
                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    background: '#1A1625',
                    padding: '2.5rem',
                    borderRadius: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                        <h1 style={{ color: '#eff3c1', margin: 0, fontSize: '1.8rem' }}>
                            {meetingId ? 'Register & Join Meeting' : 'New Member Registration'}
                        </h1>
                        <p style={{ color: '#22c1e6', fontWeight: '600', marginTop: '0.5rem' }}>
                            {meetingId ? 'Fill in your details to join the meeting' : 'Fill in the details below'}
                        </p>
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>First Name *</label>
                                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="John" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Last Name *</label>
                                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Doe" style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Email Address *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle}>Phone Number *</label>
                            <input type="tel" name="phone_no" value={formData.phone_no} onChange={handleChange} required placeholder="0712345678" style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle}>Residence *</label>
                            <input type="text" name="residence" value={formData.residence} onChange={handleChange} required placeholder="Nairobi" style={inputStyle} />
                        </div>

                        <div>
                            <label style={labelStyle}>Invited By *</label>
                            <input type="text" name="invited_by" value={formData.invited_by} onChange={handleChange} required placeholder="e.g. Pastor James" style={inputStyle} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Marital Status *</label>
                                <select name="marital_status" value={formData.marital_status} onChange={handleChange} required style={selectStyle}>
                                    <option value="">Select...</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Employment Status *</label>
                                <select name="emp_status" value={formData.emp_status} onChange={handleChange} required style={selectStyle}>
                                    <option value="">Select...</option>
                                    <option value="Employed">Employed</option>
                                    <option value="Self-employed">Self-employed</option>
                                    <option value="Student">Student</option>
                                    <option value="Unemployed">Unemployed</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Date of Birth *</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required style={inputStyle} />
                        </div>

                        <button type="submit" disabled={submitting} style={{
                            marginTop: '0.5rem',
                            padding: '1rem',
                            background: '#22c1e6',
                            color: '#120D20',
                            border: 'none',
                            borderRadius: '0.6rem',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1
                        }}>
                            {submitting ? 'Submitting...' : (meetingId ? 'Register & Join Meeting' : 'Register Member')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
