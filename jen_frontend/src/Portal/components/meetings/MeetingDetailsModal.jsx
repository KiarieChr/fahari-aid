import React, { useState, useEffect, useContext } from 'react';
import { getMeetingMinutes, saveMeetingMinutes, downloadMeetingMinutesPdf } from '../../../services/meetingsApi';
import { ThemeContext } from '../../../context/ThemeContext';
import './MeetingDetailsModal.css';

const MeetingDetailsModal = ({ meeting, onClose }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [copied, setCopied] = useState(false);
    const [minutes, setMinutes] = useState('');
    const [personnelName, setPersonnelName] = useState('');
    const [loadingMinutes, setLoadingMinutes] = useState(false);
    const [savingMinutes, setSavingMinutes] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [isEditingMinutes, setIsEditingMinutes] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        if (!meeting?.id) return;
        const fetchMinutes = async () => {
            setLoadingMinutes(true);
            try {
                const res = await getMeetingMinutes(meeting.id);
                if (res.success && res.data) {
                    setMinutes(res.data.minutes || '');
                    setPersonnelName(res.data.personnel_name || '');
                }
            } catch (err) {
                console.error('Failed to load meeting minutes:', err);
            } finally {
                setLoadingMinutes(false);
            }
        };
        fetchMinutes();
    }, [meeting?.id]);

    if (!meeting) return null;
    const attendanceUrl = `${window.location.origin}/meetings/${meeting.id}/attend`;

    const handleSaveMinutes = async () => {
        setSavingMinutes(true);
        setStatusMsg('');
        try {
            await saveMeetingMinutes(meeting.id, minutes);
            setIsEditingMinutes(false);
            setStatusMsg('Minutes saved successfully!');
            setTimeout(() => setStatusMsg(''), 3000);
        } catch (err) {
            console.error('Failed to save minutes:', err);
            setStatusMsg('Failed to save minutes.');
        } finally {
            setSavingMinutes(false);
        }
    };

    const handleDownloadPdf = async () => {
        setDownloadingPdf(true);
        try {
            await downloadMeetingMinutesPdf(meeting.id);
        } catch (err) {
            console.error('Failed to download minutes PDF:', err);
            alert('Failed to generate minutes PDF report.');
        } finally {
            setDownloadingPdf(false);
        }
    };

    return (
        <div className={`custom-modal-overlay ${isDark ? 'dark-theme' : 'light-theme'}`}>
            <div className={`custom-modal-content ${isDark ? 'dark-theme' : ''}`} style={{ maxWidth: '680px', width: '92%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                        <h2 style={{ margin: 0, color: isDark ? '#38bdf8' : '#0284c7' }}>{meeting.title}</h2>
                        <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                            {meeting.category} • <span style={{ color: meeting.status === 'Completed' ? '#16a34a' : '#22c1e6' }}>● {meeting.status}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
                    >
                        ×
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    background: isDark ? '#0d0a1a' : '#f8fafc',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`
                }}>
                    <div><b>Date:</b> {meeting.date} ({meeting.time} - {meeting.end_time || '—'})</div>
                    <div><b>Facilitator:</b> {meeting.facilitator}</div>
                    <div><b>Attendance:</b> {meeting.attendee_count || 0} checked in</div>
                    {meeting.meeting_link && (
                        <div>
                            <b>Meeting Link:</b> <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>Join Online</a>
                        </div>
                    )}
                </div>

                <div style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <b>Attendance Link:</b>
                    <input
                        readOnly
                        value={attendanceUrl}
                        style={{
                            flex: 1,
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                            background: isDark ? '#0d0a1a' : '#ffffff',
                            color: isDark ? '#cbd5e1' : '#475569',
                            fontSize: '0.8rem'
                        }}
                    />
                    <button
                        type="button"
                        style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.8rem'
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(attendanceUrl);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                        }}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                {/* Minutes Section */}
                <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`, paddingTop: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Meeting Minutes</h4>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                disabled={downloadingPdf}
                                style={{
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: '6px',
                                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                                    color: isDark ? '#cbd5e1' : '#475569',
                                    cursor: 'pointer',
                                    fontSize: '0.78rem',
                                    fontWeight: '500'
                                }}
                            >
                                {downloadingPdf ? 'Exporting PDF...' : '📄 Download PDF Dossier'}
                            </button>
                            {!isEditingMinutes ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditingMinutes(true)}
                                    style={{
                                        padding: '0.3rem 0.65rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%)',
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        fontSize: '0.78rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    {minutes ? 'Edit Minutes' : '+ Add Minutes'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSaveMinutes}
                                    disabled={savingMinutes}
                                    style={{
                                        padding: '0.3rem 0.65rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: '#16a34a',
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        fontSize: '0.78rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    {savingMinutes ? 'Saving...' : 'Save Minutes'}
                                </button>
                            )}
                        </div>
                    </div>

                    {statusMsg && (
                        <div style={{ fontSize: '0.78rem', color: '#16a34a', marginBottom: '0.5rem' }}>{statusMsg}</div>
                    )}

                    {loadingMinutes ? (
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading minutes...</div>
                    ) : isEditingMinutes ? (
                        <textarea
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            placeholder="Type meeting minutes, deliberations, and resolutions..."
                            rows={6}
                            style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '6px',
                                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                                background: isDark ? '#0d0a1a' : '#ffffff',
                                color: isDark ? '#f8fafc' : '#0f172a',
                                fontSize: '0.85rem',
                                resize: 'vertical',
                                outline: 'none'
                            }}
                        />
                    ) : (
                        <div style={{
                            background: isDark ? '#0d0a1a' : '#f8fafc',
                            padding: '0.75rem 1rem',
                            borderRadius: '6px',
                            minHeight: '80px',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
                            fontSize: '0.85rem',
                            whiteSpace: 'pre-wrap',
                            color: minutes ? (isDark ? '#f8fafc' : '#0f172a') : '#94a3b8'
                        }}>
                            {minutes || 'No minutes recorded for this gathering yet. Click "+ Add Minutes" to enter notes.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MeetingDetailsModal;
