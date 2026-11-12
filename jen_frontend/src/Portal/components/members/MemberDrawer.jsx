import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const MemberDrawer = ({ member, onClose, onDownloadPdf, downloadingId }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [profileData, setProfileData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    useEffect(() => {
        if (!member?.id) return;
        const fetchProfile = async () => {
            setLoadingProfile(true);
            try {
                const res = await api.get(`members/${member.id}/profile/`);
                if (res?.id) {
                    setProfileData(res);
                }
            } catch (err) {
                console.warn('Could not fetch deep profile from Django, using row data:', err);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, [member?.id]);

    if (!member) return null;

    const displayName = profileData?.name || member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'James Kimani';
    const email = profileData?.email || member.email || 'james.k@jesuse.org';
    const phone = profileData?.phone_no || member.phone_number || member.phone || '+254 712 345 678';
    const cellName = profileData?.cell_name || member.cell_name || member.cell_group?.name || 'Grace Fellowship Cell';
    const ministryRole = profileData?.department || member.ministry_role || member.role || 'Cell Overseer';
    const memberSince = profileData?.joined_on_formatted || (member.created_at ? new Date(member.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '14 Jan 2022');
    const givingYtd = member.giving_ytd ? `KES ${Number(member.giving_ytd).toLocaleString()}` : 'KES 48,000';
    const healthRate = profileData?.attendance?.attendance_rate 
        ? `${profileData.attendance.attendance_rate}% (${profileData.attendance.status_label})`
        : (member.attendance_health || '96% (Excellent)');

    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // Real attendance history from Django or default 12-week pattern
    const attendanceHistory = profileData?.recent_attendance?.length > 0
        ? profileData.recent_attendance.map(a => Boolean(a.attended))
        : [true, true, true, true, true, true, true, false, true, true, true, true];

    const attendedRatio = profileData?.attendance
        ? `${profileData.attendance.attended_count}/${profileData.attendance.total_meetings}`
        : '11/12';

    return (
        <div className="stitch-member-drawer-backdrop" onClick={onClose}>
            <div className="stitch-member-drawer" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="drawer-header">
                    <div className="drawer-user-lead">
                        <div className="drawer-avatar">
                            {profileData?.photo || member.avatar_url ? (
                                <img src={profileData?.photo || member.avatar_url} alt={displayName} />
                            ) : (
                                <span>{displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                            )}
                            <span className="online-dot"></span>
                        </div>
                        <div className="drawer-user-meta">
                            <h3 className="drawer-user-name">{displayName}</h3>
                            <span className="drawer-user-sub">{ministryRole}</span>
                            <span className="drawer-user-cell">{cellName}</span>
                        </div>
                    </div>
                    <button className="drawer-close-btn" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                {/* Quick Contact Buttons */}
                <div className="drawer-actions-row">
                    <a href={`tel:${phone}`} className="contact-act-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span>Call</span>
                    </a>
                    <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" className="contact-act-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        <span>WhatsApp</span>
                    </a>
                    <button className="contact-act-btn" onClick={() => alert(`Starting follow-up note for ${displayName}`)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 11l3 3L22 4"></path>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        <span>Follow-up</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="drawer-tabs">
                    <button
                        className={`drawer-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Details
                    </button>
                    <button
                        className={`drawer-tab-btn ${activeTab === 'journey' ? 'active' : ''}`}
                        onClick={() => setActiveTab('journey')}
                    >
                        Ministry Journey
                    </button>
                    <button
                        className={`drawer-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        Notes (3)
                    </button>
                </div>

                {/* Tab Content */}
                <div className="drawer-body">
                    {activeTab === 'details' ? (
                        <>
                            {/* Key Fields Grid */}
                            <div className="drawer-fields-grid">
                                <div className="drawer-field">
                                    <span className="field-lbl">Email Address</span>
                                    <span className="field-val email">{email}</span>
                                </div>
                                <div className="drawer-field">
                                    <span className="field-lbl">Phone</span>
                                    <span className="field-val">{phone}</span>
                                </div>
                                <div className="drawer-field">
                                    <span className="field-lbl">Member Since</span>
                                    <span className="field-val">{memberSince}</span>
                                </div>
                                <div className="drawer-field">
                                    <span className="field-lbl">Giving (YTD)</span>
                                    <span className="field-val highlight">{givingYtd}</span>
                                </div>
                                <div className="drawer-field full-width">
                                    <span className="field-lbl">Attendance Health</span>
                                    <span className="field-val health">{healthRate}</span>
                                </div>
                            </div>

                            {/* Service Attendance Last 12 Weeks */}
                            <div className="drawer-section">
                                <div className="section-head">
                                    <span className="section-lbl">SERVICE ATTENDANCE (LAST 12 WKS)</span>
                                    <span className="attendance-ratio">{attendedRatio}</span>
                                </div>
                                <div className="attendance-pills-row">
                                    {attendanceHistory.slice(0, 12).map((attended, idx) => (
                                        <div
                                            key={idx}
                                            className={`att-pill ${attended ? 'attended' : 'missed'}`}
                                            title={`Week ${idx + 1}: ${attended ? 'Attended' : 'Missed'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Recent Follow-up Log */}
                            <div className="drawer-section">
                                <div className="section-head">
                                    <span className="section-lbl">RECENT FOLLOW-UP LOG</span>
                                    <button className="log-note-btn" onClick={() => alert('New follow-up log form opening...')}>
                                        + Log Note
                                    </button>
                                </div>
                                <div className="followup-note-card">
                                    <div className="note-card-header">
                                        <h5 className="note-title">Home Cell Meeting Hosted</h5>
                                        <span className="note-date">May 15</span>
                                    </div>
                                    <p className="note-text">
                                        "Grace cell had 18 visitors during Wednesday fellowship. Discussed walking in spiritual authority."
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'journey' ? (
                        <div className="journey-timeline">
                            <div className="timeline-item">
                                <span className="timeline-dot"></span>
                                <div className="timeline-content">
                                    <strong>Appointed Cell Overseer</strong>
                                    <p>{cellName} • Active Leader</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <span className="timeline-dot"></span>
                                <div className="timeline-content">
                                    <strong>Department Membership</strong>
                                    <p>{ministryRole}</p>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <span className="timeline-dot"></span>
                                <div className="timeline-content">
                                    <strong>Joined Network</strong>
                                    <p>First recorded attendance • {memberSince}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="notes-list">
                            <div className="followup-note-card">
                                <div className="note-card-header">
                                    <h5 className="note-title">Quarterly Partner Check-in</h5>
                                    <span className="note-date">Apr 02</span>
                                </div>
                                <p className="note-text">Renewed partnership pledge for Kingdom Building project.</p>
                            </div>
                            <div className="followup-note-card">
                                <div className="note-card-header">
                                    <h5 className="note-title">Evangelism Outreach Lead</h5>
                                    <span className="note-date">Mar 18</span>
                                </div>
                                <p className="note-text">Led team of soul winners, coordinated follow-ups with discipleship mentors.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="drawer-footer">
                    <button
                        className="full-file-btn"
                        onClick={() => onDownloadPdf && onDownloadPdf(member.id)}
                        disabled={downloadingId === member.id}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="12" y2="18"></line>
                            <line x1="15" y1="15" x2="12" y2="18"></line>
                        </svg>
                        <span>{downloadingId === member.id ? 'Generating PDF...' : 'Full Member File'}</span>
                    </button>

                    <div className="cell-leadership-card">
                        <div className="leadership-info">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <div>
                                <span className="leadership-title">{cellName} Leadership</span>
                                <span className="leadership-sub">Covers Nairobi Zone & Fellowship</span>
                            </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </div>
                </div>
            </div>

            <style>{`
                .stitch-member-drawer-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(2px);
                    z-index: 1200;
                    display: flex;
                    justify-content: flex-end;
                }

                .stitch-member-drawer {
                    width: 380px;
                    max-width: 90vw;
                    height: 100vh;
                    background: #ffffff;
                    box-shadow: -4px 0 25px rgba(0, 0, 0, 0.15);
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    animation: slideDrawer 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .portal-wrapper.dark-mode .stitch-member-drawer {
                    background: #141024;
                    color: #ffffff;
                }
                @keyframes slideDrawer {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                .drawer-header {
                    padding: 1.25rem 1.25rem 1rem 1.25rem;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    border-bottom: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .drawer-header {
                    border-bottom-color: rgba(255, 255, 255, 0.08);
                }

                .drawer-user-lead {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                }
                .drawer-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: #2563eb;
                    color: #ffffff;
                    font-size: 1.1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    flex-shrink: 0;
                    overflow: hidden;
                }
                .online-dot {
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #10b981;
                    border: 2px solid #ffffff;
                }

                .drawer-user-meta {
                    display: flex;
                    flex-direction: column;
                }
                .drawer-user-name {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                }
                .portal-wrapper.dark-mode .drawer-user-name {
                    color: #ffffff;
                }
                .drawer-user-sub {
                    font-size: 0.74rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .drawer-user-sub {
                    color: #94a3b8;
                }
                .drawer-user-cell {
                    font-size: 0.72rem;
                    color: #2563eb;
                    font-weight: 600;
                }
                .portal-wrapper.dark-mode .drawer-user-cell {
                    color: #22c1e6;
                }

                .drawer-close-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 0.25rem;
                }

                /* Actions Row */
                .drawer-actions-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                    padding: 0.85rem 1.25rem;
                }
                .contact-act-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    padding: 0.55rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.55rem;
                    color: #334155;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .portal-wrapper.dark-mode .contact-act-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #f1f5f9;
                }
                .contact-act-btn:hover {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #bfdbfe;
                }

                /* Tabs */
                .drawer-tabs {
                    display: flex;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 0 1.25rem;
                }
                .portal-wrapper.dark-mode .drawer-tabs {
                    border-bottom-color: rgba(255, 255, 255, 0.08);
                }
                .drawer-tab-btn {
                    padding: 0.65rem 0.85rem;
                    border: none;
                    background: transparent;
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: #64748b;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.15s;
                }
                .drawer-tab-btn.active {
                    color: #2563eb;
                    font-weight: 700;
                    border-bottom-color: #2563eb;
                }
                .portal-wrapper.dark-mode .drawer-tab-btn.active {
                    color: #22c1e6;
                    border-bottom-color: #22c1e6;
                }

                /* Body */
                .drawer-body {
                    flex: 1;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    overflow-y: auto;
                }

                .drawer-fields-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.85rem;
                }
                .drawer-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .drawer-field.full-width {
                    grid-column: span 2;
                }
                .field-lbl {
                    font-size: 0.66rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                }
                .field-val {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .field-val {
                    color: #ffffff;
                }
                .field-val.email {
                    color: #2563eb;
                    word-break: break-all;
                }
                .field-val.highlight {
                    color: #2563eb;
                    font-size: 0.95rem;
                }
                .portal-wrapper.dark-mode .field-val.highlight {
                    color: #22c1e6;
                }
                .field-val.health {
                    color: #10b981;
                }

                .drawer-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .section-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .section-lbl {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #64748b;
                    letter-spacing: 0.06em;
                }
                .portal-wrapper.dark-mode .section-lbl {
                    color: #94a3b8;
                }
                .attendance-ratio {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #10b981;
                }
                .log-note-btn {
                    background: transparent;
                    border: none;
                    color: #2563eb;
                    font-size: 0.72rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .attendance-pills-row {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 0.35rem;
                }
                .att-pill {
                    height: 18px;
                    border-radius: 4px;
                }
                .att-pill.attended {
                    background: #22c1e6;
                }
                .att-pill.missed {
                    background: #f87171;
                }

                .followup-note-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.65rem;
                    padding: 0.75rem;
                }
                .portal-wrapper.dark-mode .followup-note-card {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.08);
                }
                .note-card-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.25rem;
                }
                .note-title {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                }
                .portal-wrapper.dark-mode .note-title {
                    color: #ffffff;
                }
                .note-date {
                    font-size: 0.68rem;
                    color: #94a3b8;
                }
                .note-text {
                    font-size: 0.74rem;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.4;
                    font-style: italic;
                }
                .portal-wrapper.dark-mode .note-text {
                    color: #cbd5e1;
                }

                .journey-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding-left: 0.5rem;
                }
                .timeline-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    position: relative;
                }
                .timeline-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #2563eb;
                    margin-top: 5px;
                    flex-shrink: 0;
                }
                .timeline-content strong {
                    font-size: 0.8rem;
                    color: #0f172a;
                    display: block;
                }
                .portal-wrapper.dark-mode .timeline-content strong {
                    color: #ffffff;
                }
                .timeline-content p {
                    margin: 0;
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .timeline-content p {
                    color: #94a3b8;
                }

                /* Footer */
                .drawer-footer {
                    padding: 1.25rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .portal-wrapper.dark-mode .drawer-footer {
                    border-top-color: rgba(255, 255, 255, 0.08);
                }

                .full-file-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.45rem;
                    width: 100%;
                    padding: 0.65rem 1rem;
                    border-radius: 0.65rem;
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .full-file-btn:hover {
                    background: #1d4ed8;
                }
                .full-file-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .cell-leadership-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.65rem 0.85rem;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.65rem;
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .cell-leadership-card {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.08);
                    color: #94a3b8;
                }
                .leadership-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .leadership-title {
                    font-weight: 700;
                    color: #0f172a;
                    display: block;
                }
                .portal-wrapper.dark-mode .leadership-title {
                    color: #ffffff;
                }
                .leadership-sub {
                    font-size: 0.66rem;
                }
            `}</style>
        </div>
    );
};

export default MemberDrawer;
