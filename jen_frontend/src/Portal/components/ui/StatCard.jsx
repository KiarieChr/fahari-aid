import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatCard - A premium stat card component for dashboards
 * @param {string} label - The stat label
 * @param {string|number} value - The main value to display
 * @param {string} subtext - Optional subtext/description
 * @param {React.ReactNode} icon - Lucide React icon component
 * @param {boolean} loading - Loading state
 * @param {number} trend - Percentage change (+/-)
 * @param {string} trendLabel - Label for the trend (e.g., "vs last month")
 * @param {string} variant - Color variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'
 */
const StatCard = ({
    label,
    value,
    subtext,
    icon: Icon,
    loading = false,
    trend,
    trendLabel = 'vs last month',
    variant = 'default',
    className = ''
}) => {
    const getTrendIcon = () => {
        if (trend === undefined || trend === null) return null;
        if (trend > 0) return <TrendingUp className="w-4 h-4" />;
        if (trend < 0) return <TrendingDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (trend === undefined || trend === null) return '';
        if (trend > 0) return 'text-emerald-400';
        if (trend < 0) return 'text-rose-400';
        return 'text-slate-400';
    };

    const variantStyles = {
        default: 'bg-dark-surface border-dark-border',
        primary: 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20',
        success: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
        warning: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20',
        danger: 'bg-gradient-to-br from-rose-500/20 to-rose-500/5 border-rose-500/20',
    };

    const iconBgStyles = {
        default: 'bg-dark-surface-2 text-primary',
        primary: 'bg-primary/20 text-primary',
        success: 'bg-emerald-500/20 text-emerald-400',
        warning: 'bg-amber-500/20 text-amber-400',
        danger: 'bg-rose-500/20 text-rose-400',
    };

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl border p-5
                transition-all duration-300 ease-out
                hover:shadow-card-hover hover:scale-[1.02] hover:border-primary/30
                group cursor-default
                ${variantStyles[variant]}
                ${className}
            `}
        >
            {/* Gradient glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
                {/* Header with icon */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            {label}
                        </p>
                        <div className="text-3xl font-bold text-white">
                            {loading ? (
                                <div className="h-9 w-24 bg-dark-surface-2 rounded animate-pulse" />
                            ) : (
                                <span className="transition-all duration-300 group-hover:text-primary">
                                    {value}
                                </span>
                            )}
                        </div>
                    </div>

                    {Icon && (
                        <div className={`
                            p-3 rounded-xl transition-all duration-300
                            group-hover:scale-110 group-hover:shadow-glow
                            ${iconBgStyles[variant]}
                        `}>
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                </div>

                {/* Footer with trend and subtext */}
                <div className="flex items-center justify-between">
                    {subtext && (
                        <p className="text-sm text-slate-400">
                            {subtext}
                        </p>
                    )}

                    {trend !== undefined && trend !== null && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
                            {getTrendIcon()}
                            <span>{Math.abs(trend)}%</span>
                            <span className="text-slate-500 text-xs ml-1">{trendLabel}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle border glow animation */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border border-primary/20" />
        </div>
    );
};

/**
 * StatsRow - Container for a row of stat cards
 */
export const StatsRow = ({ children, className = '' }) => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${className}`}>
        {children}
    </div>
);

/**
 * MiniStatCard - Compact version for sidebars
 */
export const MiniStatCard = ({ label, value, icon: Icon, trend }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface border border-dark-border hover:border-primary/30 transition-all duration-200">
        {Icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon className="w-4 h-4" />
            </div>
        )}
        <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 truncate">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
        </div>
        {trend !== undefined && (
            <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
            </span>
        )}
    </div>
);

export default StatCard;
