import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CellAnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('cell_analytics.php');
                if (res.success) setData(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading analytics...</div>;
    if (!data) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Failed to load analytics.</div>;

    const { overview, size_distribution, category_distribution, top_cells, attendance_trends, followup_stats, needs_attention } = data;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Cell Analytics</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Overview of cell health, membership distribution, and trends.</p>

            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <MetricCard icon="👥" label="Total Members" value={overview.total_members} />
                <MetricCard icon="✅" label="Assigned" value={overview.assigned_members} sub={`${overview.assignment_rate}%`} color="#4ade80" />
                <MetricCard icon="⚠️" label="Unassigned" value={overview.unassigned_members} color="#f59e0b" />
                <MetricCard icon="🏠" label="Active Cells" value={overview.active_cells} sub={`of ${overview.total_cells}`} />
                <MetricCard icon="📊" label="Avg / Cell" value={overview.avg_members_per_cell} />
            </div>

            {/* Two column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Size Distribution */}
                <Card title="Cell Size Distribution">
                    {size_distribution.map(d => {
                        const maxCount = Math.max(...size_distribution.map(s => parseInt(s.cell_count)));
                        const pct = maxCount > 0 ? (parseInt(d.cell_count) / maxCount) * 100 : 0;
                        return (
                            <div key={d.size_range} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                <span style={{ width: '50px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{d.size_range}</span>
                                <div style={{ flex: 1, background: 'var(--bg-color)', borderRadius: '0.25rem', height: '24px', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '0.25rem', transition: 'width 0.5s', minWidth: pct > 0 ? '20px' : 0 }} />
                                </div>
                                <span style={{ width: '30px', fontWeight: '600', color: 'var(--text-color)', fontSize: '0.85rem' }}>{d.cell_count}</span>
                            </div>
                        );
                    })}
                    {size_distribution.length === 0 && <Empty />}
                </Card>

                {/* Category Distribution */}
                <Card title="Cell Categories">
                    {category_distribution.map(c => (
                        <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ color: 'var(--text-color)' }}>{c.category}</span>
                            <span style={{ background: 'rgba(34, 193, 230, 0.15)', color: 'var(--primary)', padding: '0.15rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '600' }}>{c.count}</span>
                        </div>
                    ))}
                    {category_distribution.length === 0 && <Empty />}
                </Card>
            </div>

            {/* Attendance Trends */}
            <Card title="Weekly Attendance Trends" style={{ marginBottom: '2rem' }}>
                {attendance_trends.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '180px', paddingTop: '1rem' }}>
                        {attendance_trends.map(t => {
                            const rate = parseFloat(t.attendance_rate) || 0;
                            return (
                                <div key={t.week_start} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rate}%</span>
                                    <div style={{ width: '100%', maxWidth: '40px', background: 'var(--bg-color)', borderRadius: '0.25rem', height: '120px', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{
                                            position: 'absolute', bottom: 0, width: '100%',
                                            height: `${rate}%`,
                                            background: rate > 70 ? '#4ade80' : rate > 40 ? '#f59e0b' : '#ef4444',
                                            borderRadius: '0.25rem', transition: 'height 0.5s'
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t.week_start.slice(5)}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : <Empty text="No attendance data yet" />}
            </Card>

            {/* Bottom row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Top Cells */}
                <Card title="Top Cells by Size">
                    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {top_cells.map((c, i) => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: i < 3 ? 'var(--primary)' : 'var(--border-color)', color: i < 3 ? 'var(--bg-color)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', flexShrink: 0 }}>{i + 1}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'var(--text-color)', fontWeight: '600', fontSize: '0.85rem' }}>{c.name || c.code}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.leader_name}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', color: 'var(--text-color)' }}>{c.member_count}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ {c.capacity}</div>
                                </div>
                            </div>
                        ))}
                        {top_cells.length === 0 && <Empty />}
                    </div>
                </Card>

                {/* Needs Attention */}
                <Card title="⚠️ Cells Needing Attention">
                    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {needs_attention.map(c => (
                            <div key={c.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ color: 'var(--text-color)', fontWeight: '600', fontSize: '0.85rem' }}>{c.name || c.code}</span>
                                    <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>
                                        {parseInt(c.member_count) < 3 ? 'Low Members' : 'Inactive'}
                                    </span>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    {c.member_count} members • Leader: {c.leader_name || 'None'}
                                    {c.last_attendance ? ` • Last active: ${c.last_attendance}` : ' • No attendance recorded'}
                                </div>
                            </div>
                        ))}
                        {needs_attention.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#4ade80' }}>✅ All cells are healthy!</div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Follow-up Summary */}
            {followup_stats && (
                <Card title="Follow-Up Summary">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <MiniStat label="Total" value={followup_stats.total ?? 0} />
                        <MiniStat label="Pending" value={followup_stats.pending ?? 0} color="#f59e0b" />
                        <MiniStat label="Completed" value={followup_stats.completed ?? 0} color="#4ade80" />
                        <MiniStat label="No Response" value={followup_stats.no_response ?? 0} color="#ef4444" />
                    </div>
                </Card>
            )}
        </div>
    );
};

const MetricCard = ({ icon, label, value, sub, color }) => (
    <div style={{ background: 'var(--surface-1)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{label}</span>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: color || 'var(--text-color)', lineHeight: 1 }}>
            {value}{sub && <span style={{ fontSize: '0.9rem', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>{sub}</span>}
        </div>
    </div>
);

const Card = ({ title, children, style = {} }) => (
    <div style={{ background: 'var(--surface-1)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border-color)', ...style }}>
        <h3 style={{ color: 'var(--text-color)', fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', margin: '0 0 1rem' }}>{title}</h3>
        {children}
    </div>
);

const MiniStat = ({ label, value, color }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: color || 'var(--text-color)' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
);

const Empty = ({ text = 'No data available' }) => (
    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{text}</div>
);

export default CellAnalyticsPage;
