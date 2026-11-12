// UI Components Index
// Modern SaaS-style reusable components for the ministry dashboard

// Core Stats
export { default as StatCard, StatsRow, MiniStatCard } from './StatCard';

// Charts
export {
    ChartCard,
    CustomTooltip,
    AreaChartWidget,
    LineChartWidget,
    BarChartWidget,
    DonutChartWidget,
    SparklineChart,
    ProgressChart
} from './DashboardCharts';

// Activity
export { default as ActivityFeed, ActivityItem, CompactActivityFeed } from './ActivityFeed';

// Quick Actions
export {
    default as QuickActions,
    QuickActionButton,
    QuickActionsGrid,
    FloatingActionButton,
    CommandPaletteTrigger
} from './QuickActions';

// Events
export {
    default as EventWidget,
    EventItem,
    CompactEventWidget,
    FeaturedEvent
} from './EventWidget';
