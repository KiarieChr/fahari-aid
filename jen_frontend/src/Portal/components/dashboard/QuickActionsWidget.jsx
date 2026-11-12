import React, { useState } from 'react';

const QuickActionItem = ({ icon, label, onClick, primary = false }) => (
    <button
        onClick={onClick}
        style={{
            background: primary ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
            border: primary ? 'none' : '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%',
            color: primary ? 'var(--bg-color)' : 'var(--text-color)'
        }}
    >
        <div style={{ fontSize: '1.5rem' }}>{icon}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: '600', textAlign: 'center', lineHeight: '1.2' }}>{label}</div>
    </button>
);

const CellMembersModal = ({ onClose }) => {
    const members = [
        { id: 1, name: 'Alice Johnson', role: 'Leader', status: 'Active' },
        { id: 2, name: 'Bob Smith', role: 'Member', status: 'Active' },
        { id: 3, name: 'Charlie Brown', role: 'Member', status: 'Inactive' },
        { id: 4, name: 'Diana Prince', role: 'Member', status: 'Active' },
        { id: 5, name: 'Evan Wright', role: 'Assistant', status: 'Active' },
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(18, 13, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        }}>
            <div style={{
                background: 'var(--surface-1)',
                borderRadius: '1.5rem',
                border: '1px solid var(--border-color)',
                width: '90%',
                maxWidth: '500px',
                padding: '2rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-color)', margin: 0, fontSize: '1.25rem' }}>View Cell Members</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {members.map(member => (
                        <div key={member.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '36px', height: '36px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: 'var(--bg-color)'
                                }}>
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-color)', fontWeight: '600' }}>{member.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{member.role}</div>
                                </div>
                            </div>
                            <span style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                background: member.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: member.status === 'Active' ? '#4ade80' : '#f87171'
                            }}>
                                {member.status}
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button onClick={onClose} style={{
                        background: 'var(--primary)',
                        color: 'var(--bg-color)',
                        border: 'none',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const LatestMeetingsModal = ({ onClose }) => {
    const meetings = [
        { id: 1, date: 'Feb 10, 2026', type: 'Prayer Meeting', attendance: 12, status: 'Completed' },
        { id: 2, date: 'Feb 03, 2026', type: 'Bible Study', attendance: 15, status: 'Completed' },
        { id: 3, date: 'Jan 27, 2026', type: 'Fellowship', attendance: 14, status: 'Completed' },
        { id: 4, date: 'Jan 20, 2026', type: 'Prayer Meeting', attendance: 11, status: 'Completed' },
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(18, 13, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        }}>
            <div style={{
                background: 'var(--surface-1)',
                borderRadius: '1.5rem',
                border: '1px solid var(--border-color)',
                width: '90%',
                maxWidth: '500px',
                padding: '2rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-color)', margin: 0, fontSize: '1.25rem' }}>Latest Meetings</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {meetings.map(meeting => (
                        <div key={meeting.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div>
                                <div style={{ color: 'var(--text-color)', fontWeight: '600' }}>{meeting.type}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{meeting.date}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>{meeting.attendance}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Attendees</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button onClick={onClose} style={{
                        background: 'var(--primary)',
                        color: 'var(--bg-color)',
                        border: 'none',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreateMeetingModal = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(18, 13, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        }}>
            <div style={{
                background: 'var(--surface-1)',
                borderRadius: '1.5rem',
                border: '1px solid var(--border-color)',
                width: '90%',
                maxWidth: '500px',
                padding: '2rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-color)', margin: 0, fontSize: '1.25rem' }}>Create New Meeting</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onClose(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Meeting Title</label>
                        <input type="text" placeholder="e.g. Weekly Prayer" style={{
                            width: '93%',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-color)',
                            outline: 'none'
                        }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Date</label>
                            <input type="date" style={{
                                width: '85%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-color)',
                                outline: 'none'
                            }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Time</label>
                            <input type="time" style={{
                                width: '85%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-color)',
                                outline: 'none'
                            }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Type</label>
                        <select style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-color)',
                            outline: 'none'
                        }}>
                            <option>Prayer Meeting</option>
                            <option>Bible Study</option>
                            <option>Fellowship</option>
                            <option>Leadership Meeting</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Location / Link</label>
                        <input type="text" placeholder="Zoom Link or Physical Address" style={{
                            width: '93%',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-color)',
                            outline: 'none'
                        }} />
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Cancel
                        </button>
                        <button type="submit" style={{
                            background: 'var(--primary)',
                            color: 'var(--bg-color)',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Create Meeting
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CreateEventModal = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(18, 13, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        }}>
            <div style={{
                background: 'var(--surface-1)',
                borderRadius: '1.5rem',
                border: '1px solid var(--border-color)',
                width: '90%',
                maxWidth: '500px',
                padding: '2rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-color)', margin: 0, fontSize: '1.25rem' }}>Create New Event</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onClose(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Event Title</label>
                        <input type="text" placeholder="e.g. Community Outreach" style={{
                            width: '93%',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-color)',
                            outline: 'none'
                        }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Date</label>
                            <input type="date" style={{
                                width: '85%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-color)',
                                outline: 'none'
                            }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Time</label>
                            <input type="time" style={{
                                width: '85%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-color)',
                                outline: 'none'
                            }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Location</label>
                        <input type="text" placeholder="Location" style={{
                            width: '93%',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-color)',
                            outline: 'none'
                        }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Description</label>
                        <textarea placeholder="Event details..." style={{
                            width: '93%',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-color)',
                            outline: 'none',
                            minHeight: '80px',
                            fontFamily: 'inherit'
                        }} />
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Cancel
                        </button>
                        <button type="submit" style={{
                            background: 'var(--primary)',
                            color: 'var(--bg-color)',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RecordGivingModal = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(18, 13, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        }}>
            <div style={{
                background: 'var(--surface-1)',
                borderRadius: '1.5rem',
                border: '1px solid var(--border-color)',
                width: '90%',
                maxWidth: '500px',
                padding: '2rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-color)', margin: 0, fontSize: '1.25rem' }}>Record Giving</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onClose(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Donor Name</label>
                        <input type="text" placeholder="Search member..." style={{
                            width: '93%',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-color)',
                            outline: 'none'
                        }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Amount</label>
                            <input type="number" placeholder="0.00" style={{
                                width: '85%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-color)',
                                outline: 'none'
                            }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Date</label>
                            <input type="date" style={{
                                width: '85%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-color)',
                                outline: 'none'
                            }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Type</label>
                            <select style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-color)',
                                outline: 'none'
                            }}>
                                <option>Tithes</option>
                                <option>Offering</option>
                                <option>Thanksgiving</option>
                                <option>Project Support</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Method</label>
                            <select style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-color)',
                                outline: 'none'
                            }}>
                                <option>M-Pesa</option>
                                <option>Cash</option>
                                <option>Bank Transfer</option>
                                <option>Check</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Reference / Notes</label>
                        <input type="text" placeholder="Transaction ID or notes" style={{
                            width: '93%',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-color)',
                            outline: 'none'
                        }} />
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Cancel
                        </button>
                        <button type="submit" style={{
                            background: 'var(--primary)',
                            color: 'var(--bg-color)',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Record Contribution
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const QuickActionsWidget = () => {
    const [showMembers, setShowMembers] = useState(false);
    const [showMeetings, setShowMeetings] = useState(false);
    const [showCreateMeeting, setShowCreateMeeting] = useState(false);
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [showRecordGiving, setShowRecordGiving] = useState(false);

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            height: '100%'
        }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                📌 Quick Actions
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '1rem'
            }}>
                <QuickActionItem icon="👥" label="View Cell Members" onClick={() => setShowMembers(true)} />
                <QuickActionItem icon="📅" label="Latest Meetings" onClick={() => setShowMeetings(true)} />
                <QuickActionItem icon="🔗" label="Copy Meeting Link" primary={true} />
                <QuickActionItem icon="➕" label="Create Meeting" onClick={() => setShowCreateMeeting(true)} />
                <QuickActionItem icon="🎉" label="Create Event" onClick={() => setShowCreateEvent(true)} />
                <QuickActionItem icon="💰" label="Record Giving" onClick={() => setShowRecordGiving(true)} />
            </div>

            {showMembers && <CellMembersModal onClose={() => setShowMembers(false)} />}
            {showMeetings && <LatestMeetingsModal onClose={() => setShowMeetings(false)} />}
            {showCreateMeeting && <CreateMeetingModal onClose={() => setShowCreateMeeting(false)} />}
            {showCreateEvent && <CreateEventModal onClose={() => setShowCreateEvent(false)} />}
            {showRecordGiving && <RecordGivingModal onClose={() => setShowRecordGiving(false)} />}
        </div>
    );
};

export default QuickActionsWidget;
