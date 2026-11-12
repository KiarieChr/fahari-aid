import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../../../context/ThemeContext';

const MembersInvitedPanel = () => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [invitePhone, setInvitePhone] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState(false);

    // Initial Community Contacts / Invited Souls
    const [invitedMembers, setInvitedMembers] = useState([
        { id: 1, name: 'Alice Cooper', contact: 'alice.c@gmail.com', phone: '+254 712 345 678', status: 'Active Member', date: 'Jan 15, 2026', cell: 'Bethel Cell' },
        { id: 2, name: 'Bob Marley', contact: 'bob.marley@outlook.com', phone: '+254 722 890 123', status: 'In Cell Group', date: 'Feb 01, 2026', cell: 'Shiloh Cell' },
        { id: 3, name: 'Charlie Puth', contact: 'charlie.p@gmail.com', phone: '+254 733 456 789', status: 'Pending Follow-Up', date: 'Dec 10, 2025', cell: 'Unassigned' }
    ]);

    const handleInviteSubmit = (e) => {
        e.preventDefault();
        if (!inviteName) return;
        const newRecord = {
            id: Date.now(),
            name: inviteName,
            contact: inviteEmail || 'Not provided',
            phone: invitePhone || 'Not provided',
            status: 'Pending Follow-Up',
            date: new Date().toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' }),
            cell: 'Unassigned'
        };
        setInvitedMembers([newRecord, ...invitedMembers]);
        setInviteSuccess(true);
        setTimeout(() => {
            setInviteName('');
            setInviteEmail('');
            setInvitePhone('');
            setInviteSuccess(false);
            setIsInviteModalOpen(false);
        }, 1000);
    };

    return (
        <div style={{
            background: isDark ? '#1a1625' : '#ffffff',
            borderRadius: '1.25rem',
            padding: '2rem',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(15,23,42,0.04)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.75rem',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                paddingBottom: '1.25rem'
            }}>
                <div>
                    <h2 style={{
                        margin: '0 0 0.25rem 0',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '1.25rem',
                        fontWeight: '800'
                    }}>
                        Members I Introduced & Soul Winning Log
                    </h2>
                    <p style={{
                        margin: 0,
                        color: isDark ? '#94a3b8' : '#64748b',
                        fontSize: '0.85rem'
                    }}>
                        Track visitors and new believers you have connected to Jesus Enthroned Network
                    </p>
                </div>

                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        background: 'linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '9999px',
                        padding: '0.55rem 1.15rem',
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)'
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Introduce New Believer</span>
                </button>
            </div>

            {/* Quick Metrics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.75rem'
            }}>
                <div style={{
                    padding: '1.15rem',
                    borderRadius: '1rem',
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`
                }}>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Total Introduced
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0ea5e9' }}>
                        {invitedMembers.length} <span style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '500' }}>souls</span>
                    </div>
                </div>

                <div style={{
                    padding: '1.15rem',
                    borderRadius: '1rem',
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`
                }}>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Active in Cells
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#22c55e' }}>
                        {invitedMembers.filter(m => m.status.includes('Active') || m.status.includes('Cell')).length} <span style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '500' }}>fellowshipping</span>
                    </div>
                </div>

                <div style={{
                    padding: '1.15rem',
                    borderRadius: '1rem',
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`
                }}>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Pending Follow-Up
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f59e0b' }}>
                        {invitedMembers.filter(m => m.status.includes('Pending')).length} <span style={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '500' }}>in assimilation</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div style={{ display: 'grid', gap: '0.85rem' }}>
                {invitedMembers.map((member) => (
                    <div
                        key={member.id}
                        style={{
                            background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                            borderRadius: '0.85rem',
                            padding: '1.15rem 1.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '1rem',
                                flexShrink: 0
                            }}>
                                {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '0.95rem',
                                    fontWeight: '700',
                                    color: isDark ? '#ffffff' : '#0f172a',
                                    marginBottom: '0.2rem'
                                }}>
                                    {member.name}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: isDark ? '#94a3b8' : '#64748b',
                                    display: 'flex',
                                    gap: '0.85rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <span>✉️ {member.contact}</span>
                                    <span>📞 {member.phone}</span>
                                    <span>🏘️ {member.cell}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                                fontSize: '0.75rem',
                                color: isDark ? '#94a3b8' : '#64748b'
                            }}>
                                Introduced {member.date}
                            </span>
                            <span style={{
                                background: member.status.includes('Active')
                                    ? (isDark ? 'rgba(34,197,94,0.15)' : '#ecfdf5')
                                    : (isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb'),
                                color: member.status.includes('Active') ? '#22c55e' : '#f59e0b',
                                border: `1px solid ${member.status.includes('Active') ? (isDark ? 'rgba(34,197,94,0.3)' : '#a7f3d0') : (isDark ? 'rgba(245,158,11,0.3)' : '#fde68a')}`,
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                            }}>
                                {member.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isInviteModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.45)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1100,
                    padding: '1rem'
                }} onClick={() => setIsInviteModalOpen(false)}>
                    <div style={{
                        background: isDark ? '#151128' : '#ffffff',
                        padding: '2rem',
                        borderRadius: '1.25rem',
                        width: '100%',
                        maxWidth: '480px',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, color: isDark ? '#ffffff' : '#0f172a', fontSize: '1.15rem', fontWeight: '800' }}>
                                Introduce a New Believer / Visitor
                            </h3>
                            <button
                                onClick={() => setIsInviteModalOpen(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: isDark ? '#94a3b8' : '#64748b',
                                    fontSize: '1.25rem',
                                    cursor: 'pointer'
                                }}
                            >×</button>
                        </div>

                        {inviteSuccess && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                background: isDark ? 'rgba(34,197,94,0.15)' : '#ecfdf5',
                                color: '#22c55e',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem',
                                fontSize: '0.85rem'
                            }}>
                                ✓ Member introduced successfully!
                            </div>
                        )}

                        <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={inviteName}
                                    onChange={e => setInviteName(e.target.value)}
                                    placeholder="e.g. John Kamau"
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        background: isDark ? '#0d0a1a' : '#f8fafc',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                        borderRadius: '0.5rem',
                                        color: isDark ? '#f8fafc' : '#0f172a',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={invitePhone}
                                    onChange={e => setInvitePhone(e.target.value)}
                                    placeholder="e.g. 0712 345 678"
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        background: isDark ? '#0d0a1a' : '#f8fafc',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                        borderRadius: '0.5rem',
                                        color: isDark ? '#f8fafc' : '#0f172a',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    placeholder="e.g. john@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 0.85rem',
                                        background: isDark ? '#0d0a1a' : '#f8fafc',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                        borderRadius: '0.5rem',
                                        color: isDark ? '#f8fafc' : '#0f172a',
                                        fontSize: '0.85rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                                        borderRadius: '9999px',
                                        color: isDark ? '#94a3b8' : '#64748b',
                                        fontSize: '0.8125rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.6rem 1.35rem',
                                        background: 'linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%)',
                                        border: 'none',
                                        borderRadius: '9999px',
                                        color: '#ffffff',
                                        fontSize: '0.8125rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)'
                                    }}
                                >
                                    Save Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersInvitedPanel;
