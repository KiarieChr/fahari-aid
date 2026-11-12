import React from 'react';
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    ChevronRight,
    Sparkles,
    Video,
    Music,
    BookOpen,
    Heart,
    MoreHorizontal
} from 'lucide-react';

// Event type configurations
const EVENT_TYPES = {
    conference: {
        icon: Users,
        color: 'primary',
        bgClass: 'bg-primary/10',
        textClass: 'text-primary',
        borderClass: 'border-primary/30',
    },
    service: {
        icon: Music,
        color: 'purple',
        bgClass: 'bg-purple-500/10',
        textClass: 'text-purple-400',
        borderClass: 'border-purple-500/30',
    },
    concert: {
        icon: Music,
        color: 'amber',
        bgClass: 'bg-amber-500/10',
        textClass: 'text-amber-400',
        borderClass: 'border-amber-500/30',
    },
    workshop: {
        icon: BookOpen,
        color: 'teal',
        bgClass: 'bg-teal-500/10',
        textClass: 'text-teal-400',
        borderClass: 'border-teal-500/30',
    },
    outreach: {
        icon: Heart,
        color: 'rose',
        bgClass: 'bg-rose-500/10',
        textClass: 'text-rose-400',
        borderClass: 'border-rose-500/30',
    },
    prayer: {
        icon: Sparkles,
        color: 'indigo',
        bgClass: 'bg-indigo-500/10',
        textClass: 'text-indigo-400',
        borderClass: 'border-indigo-500/30',
    },
    training: {
        icon: BookOpen,
        color: 'amber',
        bgClass: 'bg-amber-500/10',
        textClass: 'text-amber-400',
        borderClass: 'border-amber-500/30',
    },
    general: {
        icon: Calendar,
        color: 'slate',
        bgClass: 'bg-slate-500/10',
        textClass: 'text-slate-400',
        borderClass: 'border-slate-500/30',
    },
    default: {
        icon: Calendar,
        color: 'slate',
        bgClass: 'bg-slate-500/10',
        textClass: 'text-slate-400',
        borderClass: 'border-slate-500/30',
    }
};

/**
 * EventItem - Single event item with premium styling
 */
export const EventItem = ({
    title,
    date,
    time,
    location,
    type = 'default',
    attendees,
    isLive = false,
    onClick
}) => {
    const config = EVENT_TYPES[type] || EVENT_TYPES.default;
    const IconComponent = config.icon;

    return (
        <div
            onClick={onClick}
            className={`
                group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer
                bg-dark-surface-2/50 hover:bg-dark-surface-2
                border-dark-border hover:${config.borderClass}
                hover:shadow-lg hover:scale-[1.02]
            `}
        >
            {/* Live indicator */}
            {isLive && (
                <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    LIVE
                </div>
            )}

            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
                    p-3 rounded-xl transition-all duration-300
                    ${config.bgClass}
                    group-hover:scale-110
                `}>
                    <IconComponent className={`w-5 h-5 ${config.textClass}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold mb-1 truncate group-hover:text-primary transition-colors">
                        {title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {date}
                        </span>
                        {time && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {time}
                            </span>
                        )}
                        {location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {location}
                            </span>
                        )}
                    </div>

                    {attendees !== undefined && (
                        <div className="mt-2 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs text-slate-500">{attendees} attending</span>
                        </div>
                    )}
                </div>

                {/* Type badge */}
                <span className={`
                    px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                    ${config.bgClass} ${config.textClass}
                `}>
                    {type}
                </span>
            </div>

            {/* Hover arrow */}
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </div>
    );
};

/**
 * EventWidget - Main events widget component
 */
const EventWidget = ({
    title = 'Upcoming Events',
    events = [],
    maxItems = 4,
    showViewAll = true,
    onViewAll,
    onEventClick,
    loading = false,
    emptyMessage = 'No upcoming events',
    className = ''
}) => {
    const displayedEvents = events.slice(0, maxItems);

    return (
        <div className={`
            bg-dark-surface border border-dark-border rounded-2xl p-5
            transition-all duration-300 hover:border-primary/20
            ${className}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <p className="text-xs text-slate-400">{events.length} upcoming</p>
                    </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-dark-surface-2 text-slate-400 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Events List */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 rounded-xl bg-dark-surface-2 animate-pulse" />
                    ))}
                </div>
            ) : displayedEvents.length > 0 ? (
                <div className="space-y-3">
                    {displayedEvents.map((event, index) => (
                        <EventItem
                            key={index}
                            {...event}
                            onClick={() => onEventClick?.(event)}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center">
                    <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">{emptyMessage}</p>
                </div>
            )}

            {/* View All Button */}
            {showViewAll && events.length > maxItems && (
                <button
                    onClick={onViewAll}
                    className="
                        w-full mt-4 py-3 rounded-xl border border-dark-border
                        text-primary font-semibold text-sm
                        transition-all duration-300
                        hover:bg-primary/10 hover:border-primary/30
                        flex items-center justify-center gap-2 group
                    "
                >
                    View All Events
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
            )}
        </div>
    );
};

/**
 * CompactEventWidget - Smaller version for sidebars
 */
export const CompactEventWidget = ({ events = [], maxItems = 3, onViewAll }) => {
    const displayedEvents = events.slice(0, maxItems);

    return (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Events
                </h4>
                <span className="text-xs text-slate-500">{events.length} upcoming</span>
            </div>
            <div className="space-y-2">
                {displayedEvents.map((event, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-surface-2 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate group-hover:text-primary transition-colors">{event.title}</p>
                            <p className="text-xs text-slate-500">{event.date}</p>
                        </div>
                    </div>
                ))}
            </div>
            {events.length > maxItems && (
                <button
                    onClick={onViewAll}
                    className="w-full mt-3 py-2 text-xs text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors"
                >
                    View All →
                </button>
            )}
        </div>
    );
};

/**
 * FeaturedEvent - Large hero-style event card
 */
export const FeaturedEvent = ({
    title,
    description,
    date,
    time,
    location,
    image,
    type = 'service',
    onRegister,
    onLearnMore
}) => {
    const config = EVENT_TYPES[type] || EVENT_TYPES.default;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-surface to-dark-surface-2 border border-dark-border group">
            {/* Background Image */}
            {image && (
                <div className="absolute inset-0 opacity-20">
                    <img src={image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent" />
                </div>
            )}

            {/* Content */}
            <div className="relative p-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${config.bgClass} ${config.textClass}`}>
                        Featured
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${config.bgClass} ${config.textClass}`}>
                        {type}
                    </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>

                {description && (
                    <p className="text-slate-400 mb-4 line-clamp-2">{description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {date}
                    </span>
                    {time && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {time}
                        </span>
                    )}
                    {location && (
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {location}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onRegister}
                        className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/25"
                    >
                        Register Now
                    </button>
                    <button
                        onClick={onLearnMore}
                        className="px-6 py-2.5 rounded-xl border border-dark-border text-white font-semibold hover:bg-dark-surface-2 transition-colors"
                    >
                        Learn More
                    </button>
                </div>
            </div>

            {/* Decorative */}
            <Sparkles className="absolute top-6 right-6 w-8 h-8 text-primary/30" />
        </div>
    );
};

export default EventWidget;
