import React from 'react';

const SermonsFilter = ({ filter, setFilter, searchTerm, setSearchTerm }) => {
    return (
        <div className="container" style={{ padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', maxWidth: '400px', flex: 1 }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search sermons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(0,0,0,0.1)',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '0.95rem',
                        color: '#334155'
                    }}
                />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: '#64748b', marginRight: '0.5rem' }}>FILTER:</span>
                {['All', 'Video', 'Audio'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type.toLowerCase())}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '9999px',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            border: filter === type.toLowerCase() ? 'none' : '1px solid #0f172a',
                            background: filter === type.toLowerCase() ? '#22c1e6' : 'transparent',
                            color: filter === type.toLowerCase() ? 'white' : '#0f172a',
                            transition: 'all 0.2s'
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SermonsFilter;
