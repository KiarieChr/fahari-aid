import React, { useState, useEffect, useRef } from 'react';

const UnassignedMembersList = ({ members: apiMembers = [], locations: apiLocations = [], selectedMembers, toggleSelection, onSearch, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const debounceRef = useRef(null);

    const members = apiMembers.map(m => ({
        id: m.id,
        name: `${m.first_name} ${m.last_name}`,
        gender: m.gender || '',
        location: m.location || '—',
    }));

    const filteredMembers = members.filter(m =>
        (filter === 'All' || m.location === filter) &&
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const locationFilters = ['All', ...apiLocations.slice(0, 5)];

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (onSearch) onSearch(searchTerm, filter === 'All' ? '' : filter);
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [searchTerm]);

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
        }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    Unassigned Members
                    <span style={{ background: '#f59e0b', color: 'var(--bg-color)', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem' }}>{filteredMembers.length}</span>
                </h3>

                <input
                    type="text"
                    placeholder="Search name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'var(--bg-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-color)',
                        marginBottom: '0.75rem',
                        fontSize: '0.9rem'
                    }}
                />

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {locationFilters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                background: filter === f ? 'rgba(34, 193, 230, 0.2)' : 'var(--border-color)',
                                color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                                border: 'none',
                                borderRadius: '0.25rem',
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {filteredMembers.map(member => (
                    <div
                        key={member.id}
                        onClick={() => toggleSelection(member.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            background: selectedMembers.includes(member.id) ? 'rgba(34, 193, 230, 0.1)' : 'transparent',
                            borderRadius: '0.5rem',
                            border: selectedMembers.includes(member.id) ? '1px solid #22c1e6' : '1px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: '2px solid #64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: selectedMembers.includes(member.id) ? 'var(--primary)' : 'transparent',
                            borderColor: selectedMembers.includes(member.id) ? 'var(--primary)' : 'var(--text-muted)'
                        }}>
                            {selectedMembers.includes(member.id) && <span style={{ color: 'var(--bg-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>✓</span>}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--text-color)', fontSize: '0.9rem', fontWeight: '500' }}>{member.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {member.location}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UnassignedMembersList;
