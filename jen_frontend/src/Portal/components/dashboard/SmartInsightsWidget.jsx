import React, { useState, useEffect, useContext } from 'react';
import DashboardCard from './DashboardCard';
import { ThemeContext } from '../../../context/ThemeContext';
import api from '../../../services/api';

const SmartInsightsWidget = () => {
    const { theme } = useContext(ThemeContext);
    const isLight = theme === 'light';
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const [attRes, pledgeRes] = await Promise.all([
                    api.get('/get_my_attendance.php'),
                    api.get('/get_my_pledges.php')
                ]);

                const newInsights = [];

                if (attRes.success) {
                    const stats = attRes.data.my_attendance;
                    if (stats.percentage >= 80) {
                        newInsights.push({ text: `Great job! Your attendance is at ${Math.round(stats.percentage)}% this month 👏`, type: 'success' });
                    } else if (stats.percentage < 50 && stats.total_meetings > 0) {
                        newInsights.push({ text: 'Try to join more sessions to improve your participation score 📈', type: 'warning' });
                    }
                }

                if (pledgeRes.success) {
                    const summary = pledgeRes.data.summary;
                    const percentage = summary.total_pledged > 0 ? Math.round((summary.ytd_giving / summary.total_pledged) * 100) : 0;
                    
                    if (percentage >= 70) {
                        newInsights.push({ text: `You are ${percentage}% toward fulfilling your seasonal pledge 🙌`, type: 'success' });
                    } else if (summary.total_pledged > 0) {
                        newInsights.push({ text: `Keep going! You've fulfilled ${percentage}% of your current pledge goals.`, type: 'neutral' });
                    }
                }

                // Default if empty
                if (newInsights.length === 0) {
                    newInsights.push({ text: 'Stay faithful in your attendance and stewardship for personalized insights.', type: 'neutral' });
                }

                setInsights(newInsights);
            } catch (err) {
                console.error('Error generating insights:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, []);

    // Theme colors
    const colors = {
        text: isLight ? '#1e293b' : '#ffffff',
        textMuted: isLight ? '#64748b' : 'rgba(255,255,255,0.5)'
    };

    const getInsightBorder = (type) => {
        switch (type) {
            case 'success': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'error': return '#ef4444';
            default: return isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)';
        }
    };

    return (
        <DashboardCard title="Smart Insights" icon="✨">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading ? (
                    <div style={{ color: colors.textMuted, fontSize: '0.85rem' }}>Analyzing data...</div>
                ) : insights.map((insight, i) => (
                    <div
                        key={i}
                        style={{
                            paddingLeft: '1rem',
                            borderLeft: `3px solid ${getInsightBorder(insight.type)}`,
                            fontSize: '0.9rem',
                            color: insight.type === 'neutral' ? colors.textMuted : colors.text,
                            lineHeight: '1.5',
                            padding: '0.5rem 0 0.5rem 1rem'
                        }}
                    >
                        {insight.text}
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
};

export default SmartInsightsWidget;
