import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL as API_URL } from '../../services/api';

const MeetingAttendance = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();

    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [isNewMember, setIsNewMember] = useState(false);
    const [defaultPassword, setDefaultPassword] = useState('');
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [formData, setFormData] = useState({
        contact: ''
    });
    const [registerData, setRegisterData] = useState({
        first_name: '',
        last_name: '',
        phone_no: '',
        email: '',
        gender: ''
    });
    const [countdown, setCountdown] = useState(null);
    const [redirectCountdown, setRedirectCountdown] = useState(null);
    // Countdown logic
    useEffect(() => {
        if (!meeting || !meeting.start_time) return;
        const start = new Date(meeting.start_time.replace(/-/g, '/')).getTime();
        const updateCountdown = () => {
            const now = Date.now();
            const diff = start - now;
            if (diff > 0) {
                const hours = Math.floor(diff / 1000 / 60 / 60);
                const mins = Math.floor((diff / 1000 / 60) % 60);
                const secs = Math.floor((diff / 1000) % 60);
                setCountdown(`${hours}h ${mins}m ${secs}s`);
            } else {
                setCountdown(null);
            }
        };
        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [meeting]);

    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const response = await fetch(`${API_URL}/get_meeting_details.php?id=${meetingId}`);
                const data = await response.json();
                if (data.success) {
                    setMeeting(data.data);
                } else {
                    setError(data.message || 'Meeting not found');
                }
            } catch (err) {
                setError('Failed to load meeting details');
            } finally {
                setLoading(false);
            }
        };
        if (meetingId) fetchMeeting();
    }, [meetingId]);

    const handleChange = (e) => {
        setFormData({ contact: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/mark_meeting_attendance.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact: formData.contact, meeting_id: meetingId })
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMsg(data.message);
                startRedirectCountdown();
                setSubmitted(true);
            } else if (data.not_found) {
                // Member not found — redirect to registration form
                setShowRegisterForm(true);
                setRegisterData(prev => ({
                    ...prev,
                    phone_no: formData.contact.match(/^\d/) ? formData.contact : '',
                    email: formData.contact.includes('@') ? formData.contact : ''
                }));
                setError('We could not find your record. Please register below to continue.');
            } else {
                setError(data.message || 'Failed to mark attendance');
            }
        } catch (err) {
            setError('Failed to submit attendance. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const startRedirectCountdown = () => {
         const total = 3;
        setRedirectCountdown(total);
        let remaining = total;
        const timer = setInterval(() => {
            remaining--;
            setRedirectCountdown(remaining);
            if (remaining <= 0) {
                clearInterval(timer);
                // Redirect to meeting link if available, otherwise home
                if (meeting?.meeting_link) {
                    window.location.href = meeting.meeting_link;
                } else {
                    navigate('/');
                }
            }
        }, 1000);
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/mark_meeting_attendance.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meeting_id: meetingId,
                    register_new: true,
                    ...registerData
                })
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMsg(data.message);
                setIsNewMember(!!data.is_new_member);
                setDefaultPassword(data.default_password || '');
                startRedirectCountdown();
                setSubmitted(true);
            } else {
                setError(data.error || data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Failed to register. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff3c1' }}>Loading...</div>;
    }

    if (error && !meeting) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff3c1' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: '#120D20' }}>{error}</h2>
                    <button onClick={() => navigate('/meetings')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#22c1e6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Back to Meetings</button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff3c1' }}>
                <div style={{ background: '#1A1625', padding: '3rem 2rem', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ color: '#eff3c1', marginBottom: '1rem' }}>
                        {isNewMember ? 'Welcome!' : 'Attendance Marked!'}
                    </h2>
                    <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                        {successMsg}
                    </p>
                    {isNewMember && defaultPassword && (
                        <div style={{
                            background: 'rgba(34, 193, 230, 0.1)',
                            border: '1px solid rgba(34, 193, 230, 0.3)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginTop: '1rem',
                            textAlign: 'left'
                        }}>
                            <p style={{ color: '#22c1e6', fontWeight: '600', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                                🔑 Your Account Details
                            </p>
                            <p style={{ color: '#94a3b8', margin: '0.25rem 0', fontSize: '0.85rem' }}>
                                A portal account has been created for you.
                            </p>
                            <p style={{ color: '#eff3c1', margin: '0.25rem 0', fontSize: '0.85rem' }}>
                                Default Password: <strong style={{ color: '#22c1e6', letterSpacing: '1px' }}>{defaultPassword}</strong>
                            </p>
                            <p style={{ color: '#f59e0b', margin: '0.5rem 0 0', fontSize: '0.75rem' }}>
                                ⚠️ Please change your password after first login.
                            </p>
                        </div>
                    )}
                    {redirectCountdown !== null && (
                        <p style={{ color: '#94a3b8', marginTop: '1.5rem', fontSize: '0.85rem' }}>
                            {meeting?.meeting_link
                                ? `Redirecting to meeting in ${redirectCountdown}s...`
                                : `Redirecting in ${redirectCountdown}s...`}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Determine meeting status
    let meetingStatus = 'upcoming';
    if (meeting && meeting.end_time && meeting.start_time) {
        const now = Date.now();
        const start = new Date(meeting.start_time.replace(/-/g, '/')).getTime();
        const end = new Date(meeting.end_time.replace(/-/g, '/')).getTime();
        if (end < now) meetingStatus = 'past';
        else if (start <= now && end >= now) meetingStatus = 'live';
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#eff3c1' }}>
            <div style={{ flex: 1, padding: '4rem 1rem' }}>
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
                        <h1 style={{ color: '#eff3c1', margin: 0, fontSize: '1.8rem' }}>{meeting.title}</h1>
                        <p style={{ color: 'var(--primary)', fontWeight: '600', marginTop: '0.5rem' }}>Meeting Attendance</p>
                        <div style={{ color: '#94a3b8', marginTop: '1rem', display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <span>
                                📅 {meeting.end_date && meeting.end_date !== meeting.date ? (
                                    `${meeting.date} - ${meeting.end_date}`
                                ) : (
                                    meeting.date
                                )} at {meeting.time}
                            </span>
                            <span>📍 {meeting.location || 'Location TBD'}</span>
                        </div>
                        {meetingStatus === 'upcoming' && countdown && (
                            <div style={{ color: '#22c1e6', marginTop: 12, fontWeight: 600 }}>
                                Meeting starts in: {countdown}
                            </div>
                        )}
                        {meetingStatus === 'live' && (
                            <div style={{ color: '#22c1e6', marginTop: 12, fontWeight: 600 }}>
                                <b>Meeting is LIVE!</b>
                            </div>
                        )}
                        {meetingStatus === 'past' && (
                            <div style={{ color: '#ef4444', marginTop: 12, fontWeight: 600 }}>
                                <b>This event is past. You can still mark attendance below.</b>
                            </div>
                        )}
                    </div>
                    {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    {!showRegisterForm ? (
                        <>
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.4rem', fontSize: '0.95rem' }}>Phone Number or Email Address</label>
                                    <input
                                        type="text"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter phone or email"
                                        style={inputStyle}
                                    />
                                </div>
                                <button type="submit" style={btnStyle} disabled={submitting || !formData.contact}>
                                    {meetingStatus === 'past' ? 'Mark Attendance Anyway' : (submitting ? 'Submitting...' : 'Mark Attendance')}
                                </button>
                            </form>
                            <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>First time here?</p>
                                <button
                                    onClick={() => setShowRegisterForm(true)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(34, 193, 230, 0.4)',
                                        color: '#22c1e6',
                                        padding: '0.6rem 1.5rem',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    Register as New Member
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <button onClick={() => { setShowRegisterForm(false); setError(null); }}
                                    style={{ background: 'transparent', border: 'none', color: '#22c1e6', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}>
                                    ←
                                </button>
                                <h3 style={{ color: '#eff3c1', margin: 0, fontSize: '1.1rem' }}>New Member Registration</h3>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                Fill in your details to register and mark attendance. A portal account will be created for you automatically.
                            </p>
                            <form onSubmit={handleRegisterSubmit} style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={labelStyle}>First Name *</label>
                                        <input type="text" value={registerData.first_name}
                                            onChange={(e) => setRegisterData(p => ({ ...p, first_name: e.target.value }))}
                                            placeholder="First name" required style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Last Name</label>
                                        <input type="text" value={registerData.last_name}
                                            onChange={(e) => setRegisterData(p => ({ ...p, last_name: e.target.value }))}
                                            placeholder="Last name" style={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone Number *</label>
                                    <input type="tel" value={registerData.phone_no}
                                        onChange={(e) => setRegisterData(p => ({ ...p, phone_no: e.target.value }))}
                                        placeholder="e.g. 0712345678" required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    <input type="email" value={registerData.email}
                                        onChange={(e) => setRegisterData(p => ({ ...p, email: e.target.value }))}
                                        placeholder="email@example.com" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Gender</label>
                                    <select value={registerData.gender}
                                        onChange={(e) => setRegisterData(p => ({ ...p, gender: e.target.value }))}
                                        style={inputStyle}>
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <button type="submit" style={btnStyle}
                                    disabled={submitting || !registerData.first_name || !registerData.phone_no}>
                                    {submitting ? 'Registering...' : 'Register & Mark Attendance'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    background: '#120D20',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    color: '#eff3c1',
    fontSize: '0.95rem',
    outline: 'none'
};

const labelStyle = {
    display: 'block',
    color: '#94a3b8',
    marginBottom: '0.4rem',
    fontSize: '0.85rem'
};

const btnStyle = {
    marginTop: '0.5rem',
    padding: '1rem',
    background: '#22c1e6',
    color: '#120D20',
    border: 'none',
    borderRadius: '0.6rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
};

export default MeetingAttendance;
