import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const PledgesWidget = () => {
    const [pledgesData, setPledgesData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPledges = async () => {
            try {
                setLoading(true);
                const response = await api.get('/get_my_pledges.php');
                if (response.success) {
                    setPledgesData(response.data);
                }
            } catch (err) {
                console.error('Error fetching pledges:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPledges();
    }, []);

    if (loading) {
        return (
            <div style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border-color)',
                borderRadius: '1rem',
                padding: '1.5rem',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
            </div>
        );
    }

    const summary = pledgesData?.summary || { total_pledges: 0, active_pledges: 0, total_pledged: 0, ytd_giving: 0 };
    const pledges = pledgesData?.pledges || [];
    const currency = 'KES';

    // Calculate progress if we have pledges
    const totalPledged = summary.total_pledged || 0;
    const ytdGiving = summary.ytd_giving || 0;
    const percentage = totalPledged > 0 ? Math.min(Math.round((ytdGiving / totalPledged) * 100), 100) : 0;
    const balance = Math.max(totalPledged - ytdGiving, 0);

    if (pledges.length === 0) {
        return (
            <div style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border-color)',
                borderRadius: '1rem',
                padding: '1.5rem',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤝</div>
                <div style={{ color: 'var(--text-color)', fontWeight: '600', marginBottom: '0.5rem' }}>No Pledges Yet</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                    You haven't made any pledges yet.
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-color)',
            borderRadius: '1rem',
            padding: '1.5rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                🤝 My Partnership
            </h3>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: '700' }}>{summary.active_pledges}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Active Pledges</div>
                </div>
                <div style={{ background: 'rgba(34, 193, 230, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: '700' }}>{currency} {ytdGiving.toLocaleString()}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>YTD Giving</div>
                </div>
            </div>

            {/* Progress Bar */}
            {totalPledged > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Pledged Progress</div>
                        <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.25rem' }}>{percentage}%</div>
                    </div>

                    <div style={{
                        height: '12px',
                        background: 'var(--border-color)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #22c1e6, #eff3c1)',
                            borderRadius: '6px'
                        }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <div>Fulfilled: <span style={{ color: 'var(--text-color)' }}>{currency} {ytdGiving.toLocaleString()}</span></div>
                        <div>Pledged: {currency} {totalPledged.toLocaleString()}</div>
                    </div>
                </div>
            )}

            {/* Recent Pledges List */}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    My Pledges
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                    {pledges.slice(0, 5).map((pledge, i) => (
                        <div key={i} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '0.5rem'
                        }}>
                            <div>
                                <div style={{ color: 'var(--text-color)', fontSize: '0.85rem', fontWeight: '500' }}>{pledge.title}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{pledge.frequency || 'One-time'}</div>
                            </div>
                            <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                                {currency} {parseFloat(pledge.amount).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {balance > 0 && (
                <div style={{
                    background: 'rgba(34, 193, 230, 0.1)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginTop: '1rem'
                }}>
                    <div style={{ fontSize: '1.5rem' }}>✨</div>
                    <div>
                        <div style={{ color: 'var(--text-color)', fontSize: '0.9rem', fontWeight: '600' }}>
                            {percentage >= 70 ? 'Almost there!' : 'Keep going!'}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {currency} {balance.toLocaleString()} remaining. Thank you for your faithfulness.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PledgesWidget;
