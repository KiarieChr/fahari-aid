import React from 'react';

const FastingFilters = () => {
    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            border: '1px solid var(--border-color)'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>Filter by Day</label>
                <select style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-color)',
                    minWidth: '200px',
                    outline: 'none',
                    cursor: 'pointer'
                }}>
                    <option value="all">All Days</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>Filter by Date</label>
                <input
                    type="date"
                    style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-color)',
                        minWidth: '200px',
                        outline: 'none',
                        colorScheme: 'dark'
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginLeft: 'auto' }}>
                <button style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--primary)',
                    color: 'var(--text-color)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    height: '42px' // Match input height roughly
                }}>
                    Apply Filters
                </button>
                <button style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '42px'
                }}>
                    Reset
                </button>
            </div>
        </div>
    );
};

export default FastingFilters;
