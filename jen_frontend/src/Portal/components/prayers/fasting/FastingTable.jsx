import React from 'react';
import DaysBadge from './DaysBadge';

const FastingTable = () => {
    // Dummy Data
    const commitments = [
        { id: '101', name: 'John Doe', email: 'john@example.com', phone: '+254 700 123 456', memberId: 'MEM-001', days: [0, 2, 4], date: 'Feb 1, 2026', time: '08:30 AM' },
        { id: '102', name: 'Jane Smith', email: 'jane@example.com', phone: '+254 711 987 654', memberId: 'MEM-045', days: [1, 3], date: 'Feb 1, 2026', time: '09:15 AM' },
        { id: '103', name: 'Michael Brown', email: 'mike@example.com', phone: '+254 722 555 123', memberId: 'MEM-120', days: [0, 1, 2, 3, 4, 5, 6], date: 'Feb 2, 2026', time: '10:00 AM' },
        { id: '104', name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+254 733 444 888', memberId: 'MEM-088', days: [5, 6], date: 'Feb 2, 2026', time: '11:45 AM' },
        { id: '105', name: 'David Lee', email: 'david@example.com', phone: '+254 799 111 222', memberId: '—', days: [2], date: 'Feb 3, 2026', time: '02:20 PM' },
    ];

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1.5rem',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            marginBottom: '2rem'
        }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-color)' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={headerStyle}>ID</th>
                            <th style={headerStyle}>Name</th>
                            <th style={headerStyle}>Email</th>
                            <th style={headerStyle}>Phone</th>
                            <th style={headerStyle}>Member ID</th>
                            <th style={headerStyle}>Days</th>
                            <th style={headerStyle}>Date Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commitments.map((item, index) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row-hover">
                                <td style={cellStyle}>{item.id}</td>
                                <td style={cellStyle}>
                                    <div style={{ fontWeight: '600', color: 'var(--text-color)' }}>{item.name}</div>
                                </td>
                                <td style={cellStyle}>{item.email}</td>
                                <td style={cellStyle}>{item.phone}</td>
                                <td style={cellStyle}>
                                    <span style={{
                                        background: item.memberId === '—' ? 'transparent' : 'rgba(34, 193, 230, 0.1)',
                                        color: item.memberId === '—' ? 'var(--text-muted)' : 'var(--primary)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        {item.memberId}
                                    </span>
                                </td>
                                <td style={cellStyle}>
                                    <DaysBadge days={item.days} />
                                </td>
                                <td style={cellStyle}>
                                    <div style={{ fontWeight: '500' }}>{item.date}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder mainly */}
            <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.875rem'
            }}>
                <div>Showing 1-5 of 20</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={paginationBtnStyle}>Previous</button>
                    <button style={{ ...paginationBtnStyle, background: 'var(--primary)', color: 'var(--btn-text)', border: 'none' }}>1</button>
                    <button style={paginationBtnStyle}>2</button>
                    <button style={paginationBtnStyle}>3</button>
                    <button style={paginationBtnStyle}>Next</button>
                </div>
            </div>

            <style>{`
                .table-row-hover:hover {
                    background: var(--surface-2);
                }
            `}</style>
        </div>
    );
};

// Styles
const headerStyle = {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const cellStyle = {
    padding: '1rem 1.5rem',
    fontSize: '0.875rem',
    color: 'var(--text-color)'
};

const paginationBtnStyle = {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.875rem'
};

export default FastingTable;
