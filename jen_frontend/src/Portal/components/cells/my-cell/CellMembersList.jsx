import React, { useState } from 'react';

const CellMembersList = ({ members: apiMembers = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const members = apiMembers.map(m => ({
        id: m.id,
        name: `${m.first_name} ${m.last_name}`,
        role: 'Member',
        phone: m.phone_no
    }));

    const filtered = members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-color)', fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🧑‍🤝‍🧑 Fellow Members <span style={{ background: 'var(--border-color)', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem' }}>{members.length}</span>
                </h3>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.4rem 0.8rem 0.4rem 2rem',
                            background: 'var(--bg-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '2rem',
                            color: 'var(--text-color)',
                            fontSize: '0.8rem',
                            width: '120px',
                            outline: 'none'
                        }}
                    />
                    <span style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', opacity: 0.5 }}>🔍</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', overflowY: 'auto' }}>
                {filtered.map(member => (
                    <div key={member.id} style={{
                        background: 'var(--surface-2)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        transition: 'transform 0.2s',
                        cursor: 'default',
                        border: '1px solid transparent'
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-color)',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem'
                        }}>
                            {member.name.charAt(0)}
                        </div>
                        <div style={{ color: 'var(--text-color)', fontSize: '0.85rem', fontWeight: '500' }}>{member.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{member.role}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CellMembersList;
