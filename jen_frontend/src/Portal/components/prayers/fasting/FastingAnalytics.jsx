import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const FastingAnalytics = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Dummy Data
    const dayDistribution = [
        { name: 'Mon', count: 12 },
        { name: 'Tue', count: 19 },
        { name: 'Wed', count: 25 }, // Most popular
        { name: 'Thu', count: 18 },
        { name: 'Fri', count: 22 },
        { name: 'Sat', count: 15 },
        { name: 'Sun', count: 10 },
    ];

    const commitmentsOverTime = [
        { date: 'Jan 25', count: 5 },
        { date: 'Jan 26', count: 8 },
        { date: 'Jan 27', count: 12 },
        { date: 'Jan 28', count: 15 },
        { date: 'Jan 29', count: 18 },
        { date: 'Jan 30', count: 19 },
        { date: 'Jan 31', count: 20 },
    ];

    const participationData = [
        { name: 'Active Participants', value: 20 },
        { name: 'Inactive', value: 5 },
    ];
    const COLORS = ['var(--primary)', '#334155'];

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1.5rem',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            marginTop: '2rem'
        }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '1.5rem',
                    borderBottom: isOpen ? '1px solid var(--border-color)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isOpen ? 'var(--surface-2)' : 'transparent'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📈</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-color)', margin: 0 }}>Analytics & Insights</h3>
                </div>
                <span style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                    color: 'var(--text-muted)'
                }}>▼</span>
            </div>

            {isOpen && (
                <div style={{ padding: '2rem' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {/* Bar Chart */}
                        <div style={{ height: '300px' }}>
                            <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>Fasting Days Distribution</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dayDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                                        cursor={{ fill: 'var(--border-color)' }}
                                    />
                                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Line Chart */}
                        <div style={{ height: '300px' }}>
                            <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>Commitments Over Time</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={commitmentsOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="var(--secondary)" strokeWidth={3} dot={{ fill: 'var(--secondary)', r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Pie Chart */}
                        <div style={{ height: '300px' }}>
                            <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>Participation Status</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={participationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {participationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                                    />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FastingAnalytics;
