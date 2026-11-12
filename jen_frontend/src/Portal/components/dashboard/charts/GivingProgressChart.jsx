import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';

const GivingProgressChart = () => {
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setLoading(true);
                const response = await api.get('/get_my_pledges.php');
                if (response.success) {
                    setProgressData(response.data.quarterly_progress || []);
                }
            } catch (err) {
                console.error('Error fetching giving progress:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    // Max height for bars
    const maxVal = Math.max(...progressData.map(d => Math.max(d.fulfilled, d.pledged)), 1000);

    if (loading) {
        return (
            <div style={{ background: 'var(--surface-1)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border-color)', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            height: '100%'
        }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Giving & Pledges Progress
            </h3>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--primary)' }}></span> Fulfilled
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--border-color)' }}></span> Target Pledged
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingBottom: '1rem' }}>
                {progressData.map((item, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100%', width: '100%', justifyContent: 'center' }}>
                            {/* Pledged Bar (Background/Ghost) */}
                            <div style={{
                                width: '12px',
                                height: `${(item.pledged / maxVal) * 100}%`,
                                background: 'var(--border-color)',
                                borderRadius: '2px 2px 0 0'
                            }}></div>
                            {/* Fulfilled Bar */}
                            <div style={{
                                width: '20px',
                                height: `${(item.fulfilled / maxVal) * 100}%`,
                                background: 'var(--primary)',
                                borderRadius: '4px 4px 0 0',
                                boxShadow: '0 0 10px rgba(34, 193, 230, 0.2)'
                            }}></div>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GivingProgressChart;
