import React from 'react';
import {
    Clock,
    User,
    Calendar,
    Heart,
    MessageCircle,
    Bell,
    CheckCircle,
    XCircle,
    AlertCircle,
    Gift,
    Users,
    DollarSign,
    MoreHorizontal
} from 'lucide-react';

// Icon mapping for different activity types
const ACTIVITY_ICONS = {
    attendance: CheckCircle,
    member_join: User,
    donation: Heart,
    event: Calendar,
    message: MessageCircle,
    notification: Bell,
    warning: AlertCircle,
    error: XCircle,
    birthday: Gift,
    cell: Users,
    pledge: DollarSign,
};

// Color mapping for activity types
const ACTIVITY_COLORS = {
    attendance: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    member_join: { bg: 'bg-primary/10', text: 'text-primary' },
    donation: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
    event: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    message: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    notification: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    warning: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    error: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
    birthday: { bg: 'bg-pink-500/10', text: 'text-pink-400' },
    cell: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
    pledge: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    default: { bg: 'bg-slate-500/10', text: 'text-slate-400' },
};

/**
 * ActivityItem - Single activity item
 */
export const ActivityItem = ({
    type = 'default',
    title,
    description,
    timestamp,
    user,
    avatar,
    onClick,
    highlighted = false
}) => {
    const IconComponent = ACTIVITY_ICONS[type] || Bell;
    const colors = ACTIVITY_COLORS[type] || ACTIVITY_COLORS.default;

    const formatTime = (time) => {
        if (!time) return '';
        const date = new Date(time);
        const now = new Date();
        const diff = now - date;

        // Less than a minute
        if (diff < 60000) return 'Just now';
        // Less than an hour
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        // Less than a day
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        // Less than a week
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        // Otherwise show date
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div
            onClick={onClick}
            className={`
                flex items-start gap-3 p-3 rounded-xl
                transition-all duration-200 cursor-pointer
                hover:bg-dark-surface-2 group
                ${highlighted ? 'bg-primary/5 border border-primary/20' : ''}
            `}
        >
            {/* Icon or Avatar */}
            <div className={`
                p-2 rounded-xl flex-shrink-0
                transition-transform duration-200 group-hover:scale-110
                ${colors.bg}
            `}>
                {avatar ? (
                    <img src={avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                    <IconComponent className={`w-5 h-5 ${colors.text}`} />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                            {title}
                        </p>
                        {description && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                {description}
                            </p>
                        )}
                        {user && (
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {user}
                            </p>
                        )}
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">
                        {formatTime(timestamp)}
                    </span>
                </div>
            </div>
        </div>
    );
};

/**
 * ActivityFeed - Main feed component
 */
const ActivityFeed = ({
    title = 'Activity Feed',
    subtitle,
    activities = [],
    maxItems = 5,
    showViewAll = true,
    onViewAll,
    loading = false,
    emptyMessage = 'No recent activity',
    className = ''
}) => {
    const displayedActivities = activities.slice(0, maxItems);

    return (
        <div className={`
            bg-dark-surface border border-dark-border rounded-2xl p-5
            transition-all duration-300 hover:border-primary/20
            ${className}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
                    )}
                </div>
                <button className="p-2 rounded-lg hover:bg-dark-surface-2 text-slate-400 hover:text-white transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            {/* Activity List */}
            <div className="space-y-1">
                {loading ? (
                    // Loading skeleton
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                            <div className="w-9 h-9 rounded-xl bg-dark-surface-2" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-dark-surface-2 rounded w-3/4" />
                                <div className="h-3 bg-dark-surface-2 rounded w-1/2" />
                            </div>
                        </div>
                    ))
                ) : displayedActivities.length > 0 ? (
                    displayedActivities.map((activity, index) => (
                        <ActivityItem key={activity.id || index} {...activity} />
                    ))
                ) : (
                    <div className="py-8 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>{emptyMessage}</p>
                    </div>
                )}
            </div>

            {/* View All Button */}
            {showViewAll && activities.length > maxItems && (
                <button
                    onClick={onViewAll}
                    className="w-full mt-4 py-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors flex items-center justify-center gap-2 group"
                >
                    View all activity
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            )}
        </div>
    );
};

/**
 * CompactActivityFeed - Minimal version for sidebars
 */
export const CompactActivityFeed = ({ activities = [], maxItems = 3 }) => (
    <div className="space-y-2">
        {activities.slice(0, maxItems).map((activity, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${ACTIVITY_COLORS[activity.type]?.bg || 'bg-slate-500'}`} />
                <span className="text-slate-400 truncate flex-1">{activity.title}</span>
            </div>
        ))}
    </div>
);

export default ActivityFeed;
