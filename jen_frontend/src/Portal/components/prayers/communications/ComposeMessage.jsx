import React, { useState } from 'react';

const ComposeMessage = () => {
    const [channel, setChannel] = useState('sms');

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1.5rem',
            border: '1px solid var(--border-color)',
            padding: '2rem',
            height: '100%'
        }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✍️</span>
                Compose Alert
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Channel Selector */}
                <div>
                    <label style={labelStyle}>Communication Channel</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        {['sms', 'email', 'whatsapp'].map(c => (
                            <button
                                key={c}
                                onClick={() => setChannel(c)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: channel === c ? '1px solid #22c1e6' : '1px solid var(--border-color)',
                                    background: channel === c ? 'rgba(34, 193, 230, 0.1)' : 'transparent',
                                    color: channel === c ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Audience */}
                <div>
                    <label style={labelStyle}>Target Audience</label>
                    <select style={inputStyle}>
                        <option value="all">All Members</option>
                        <option value="intercessors">Intercessory Team</option>
                        <option value="leaders">Cell Leaders</option>
                        <option value="youth">Youth Ministry</option>
                    </select>
                </div>

                {/* Subject (Email Only) */}
                {channel === 'email' && (
                    <div>
                        <label style={labelStyle}>Subject Line</label>
                        <input type="text" placeholder="Urgent Prayer Request..." style={inputStyle} />
                    </div>
                )}

                {/* Message Body */}
                <div>
                    <label style={labelStyle}>
                        Message Body
                        <span style={{ float: 'right', fontSize: '0.75rem', fontWeight: 'normal' }}>
                            {channel === 'sms' ? '0/160 chars' : ''}
                        </span>
                    </label>
                    <textarea
                        rows={6}
                        placeholder={channel === 'sms' ? "Type your short message here..." : "Compose your full email..."}
                        style={{ ...inputStyle, resize: 'vertical' }}
                    />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                    <button style={{
                        flex: 1,
                        padding: '1rem',
                        background: 'var(--primary)',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}>
                        <span>🚀</span> Send Now
                    </button>
                    <button style={{
                        padding: '1rem',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.75rem',
                        cursor: 'pointer'
                    }} title="Schedule for later">
                        🕒
                    </button>
                </div>
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    marginBottom: '0.5rem'
};

const inputStyle = {
    width: '100%',
    padding: '0.875rem',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    color: 'var(--text-color)',
    outline: 'none',
    fontSize: '0.95rem',
    fontFamily: 'inherit'
};

export default ComposeMessage;
