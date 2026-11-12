import React from 'react';

const EventsTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'dashboard', label: 'Events Dashboard' },
        { id: 'attendance', label: 'Event Attendance' },
        { id: 'mobilisation', label: 'Events Mobilisation' },
        { id: 'statistics', label: 'Events Statistics' },
        { id: 'all', label: 'All Events' }
    ];

    return (
        <div style={{
            display: 'flex',
            gap: '0.25rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            overflowX: 'auto',
            paddingBottom: '0'
        }}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                        padding: '0.75rem 1.25rem',
                        background: activeTab === tab.id
                            ? 'var(--surface-1)'
                            : 'transparent',
                        border: activeTab === tab.id
                            ? '1px solid var(--border-color)'
                            : '1px solid transparent',
                        borderBottom: activeTab === tab.id
                            ? '1px solid var(--surface-1)'
                            : '1px solid transparent',
                        borderRadius: '0.5rem 0.5rem 0 0',
                        marginBottom: '-1px',
                        color: activeTab === tab.id
                            ? 'var(--primary)'
                            : 'var(--text-muted)',
                        fontSize: '0.9rem',
                        fontWeight: activeTab === tab.id ? '600' : '500',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default EventsTabs;
