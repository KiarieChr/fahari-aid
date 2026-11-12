import React from 'react';
import {
    Plus,
    UserPlus,
    Calendar,
    DollarSign,
    FileText,
    Mail,
    Heart,
    Users,
    ClipboardList,
    BarChart3,
    Settings,
    HelpCircle,
    Zap,
    ArrowRight
} from 'lucide-react';

/**
 * QuickActionButton - Individual action button
 */
export const QuickActionButton = ({
    icon: Icon,
    label,
    description,
    onClick,
    variant = 'default',
    badge,
    disabled = false,
    loading = false
}) => {
    const variants = {
        default: {
            bg: 'bg-dark-surface-2 hover:bg-dark-surface-2/80',
            border: 'border-dark-border hover:border-primary/30',
            icon: 'bg-primary/10 text-primary group-hover:bg-primary/20',
        },
        primary: {
            bg: 'bg-gradient-to-br from-primary to-primary-hover',
            border: 'border-transparent',
            icon: 'bg-white/20 text-white',
        },
        secondary: {
            bg: 'bg-gradient-to-br from-secondary to-purple-600',
            border: 'border-transparent',
            icon: 'bg-white/20 text-white',
        },
        success: {
            bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
            border: 'border-emerald-500/20 hover:border-emerald-500/40',
            icon: 'bg-emerald-500/20 text-emerald-400',
        },
        ghost: {
            bg: 'bg-transparent hover:bg-dark-surface-2',
            border: 'border-transparent',
            icon: 'bg-transparent text-slate-400 group-hover:text-primary',
        },
    };

    const style = variants[variant] || variants.default;

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                group relative flex flex-col items-center justify-center 
                p-4 rounded-xl border
                transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-card-hover
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${style.bg} ${style.border}
                ${variant === 'primary' || variant === 'secondary' ? 'text-white' : 'text-white'}
            `}
        >
            {/* Badge */}
            {badge && (
                <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                    {badge}
                </span>
            )}

            {/* Icon */}
            <div className={`
                p-3 rounded-xl mb-2 transition-all duration-300
                group-hover:scale-110 group-hover:shadow-glow
                ${style.icon}
            `}>
                {loading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Icon className="w-5 h-5" />
                )}
            </div>

            {/* Label */}
            <span className="text-sm font-semibold text-center leading-tight">
                {label}
            </span>

            {/* Description */}
            {description && (
                <span className="text-xs text-slate-400 mt-1 text-center line-clamp-2">
                    {description}
                </span>
            )}

            {/* Hover arrow */}
            <ArrowRight className="
                absolute bottom-2 right-2 w-4 h-4 opacity-0 
                group-hover:opacity-50 transition-all duration-300
                group-hover:translate-x-1
            " />
        </button>
    );
};

/**
 * QuickActionsGrid - Container for quick actions
 */
export const QuickActionsGrid = ({
    actions = [],
    columns = 4,
    className = ''
}) => (
    <div className={`
        grid gap-4
        grid-cols-2 sm:grid-cols-3 lg:grid-cols-${columns}
        ${className}
    `}>
        {actions.map((action, index) => (
            <QuickActionButton key={index} {...action} />
        ))}
    </div>
);

/**
 * QuickActions - Full widget with header
 */
const QuickActions = ({
    title = 'Quick Actions',
    subtitle = 'Common tasks and shortcuts',
    actions = [],
    columns = 4,
    className = ''
}) => {
    // Default actions if none provided
    const defaultActions = [
        { icon: UserPlus, label: 'Add Member', variant: 'primary' },
        { icon: Calendar, label: 'New Event', variant: 'default' },
        { icon: Heart, label: 'Record Giving', variant: 'default' },
        { icon: ClipboardList, label: 'Attendance', variant: 'default' },
        { icon: Users, label: 'Cell Groups', variant: 'default' },
        { icon: FileText, label: 'Reports', variant: 'default' },
        { icon: Mail, label: 'Send Message', variant: 'default' },
        { icon: Settings, label: 'Settings', variant: 'ghost' },
    ];

    const displayActions = actions.length > 0 ? actions : defaultActions;

    return (
        <div className={`
            bg-dark-surface border border-dark-border rounded-2xl p-5
            transition-all duration-300 hover:border-primary/20
            ${className}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <p className="text-sm text-slate-400">{subtitle}</p>
                    </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-dark-surface-2 text-slate-400 hover:text-white transition-colors">
                    <HelpCircle className="w-4 h-4" />
                </button>
            </div>

            {/* Actions Grid */}
            <QuickActionsGrid actions={displayActions} columns={columns} />
        </div>
    );
};

/**
 * FloatingActionButton - Mobile-friendly floating action
 */
export const FloatingActionButton = ({ icon: Icon = Plus, onClick, label }) => (
    <button
        onClick={onClick}
        className="
            fixed bottom-6 right-6 z-50
            p-4 rounded-full
            bg-gradient-to-br from-primary to-primary-hover
            text-white shadow-glow
            transition-all duration-300
            hover:scale-110 hover:shadow-glow
            active:scale-95
            group
        "
        title={label}
    >
        <Icon className="w-6 h-6" />
        {label && (
            <span className="
                absolute right-full mr-3 px-3 py-1.5
                rounded-lg bg-dark-surface border border-dark-border
                text-sm font-medium text-white whitespace-nowrap
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                shadow-xl
            ">
                {label}
            </span>
        )}
    </button>
);

/**
 * CommandPalette trigger button
 */
export const CommandPaletteTrigger = ({ onClick }) => (
    <button
        onClick={onClick}
        className="
            flex items-center gap-2 px-3 py-1.5
            rounded-lg bg-dark-surface-2 border border-dark-border
            text-sm text-slate-400
            hover:text-white hover:border-primary/30
            transition-all duration-200
        "
    >
        <span>⌘</span>
        <span>K</span>
    </button>
);

export default QuickActions;
