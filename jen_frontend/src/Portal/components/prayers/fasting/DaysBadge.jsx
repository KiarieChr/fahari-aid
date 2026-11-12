import React from 'react';

const DaysBadge = ({ days = [] }) => {
    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
            {weekDays.map((day, index) => {
                // Determine if this day is active.
                // Assuming 'days' prop is an array of indices (0-6) or similar identifier.
                // For this mock, let's assume 'days' contains the specific day letters that are active,
                // or we pass a boolean array. Let's start with a simple index check or inclusion.
                // In a real app, mapping 'M' to Monday might be tricky with duplicates (T, S).
                // Let's assume input 'days' is array of day indexes: 0=Mon, 6=Sun

                const isActive = days.includes(index);

                return (
                    <div
                        key={index}
                        title={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            background: isActive ? '#22c55e' : 'var(--border-color)',
                            color: isActive ? 'white' : 'var(--text-muted)',
                            border: isActive ? 'none' : '1px solid var(--border-color)',
                        }}
                    >
                        {day}
                    </div>
                );
            })}
        </div>
    );
};

export default DaysBadge;
