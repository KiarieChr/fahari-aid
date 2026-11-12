import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import { MoreHorizontal, TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';

// Brand colors
const COLORS = {
    primary: '#22c1e6',
    secondary: '#a855f7',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    slate: '#64748b',
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.info];

/**
 * ChartCard - Container wrapper for charts with header and actions
 */
export const ChartCard = ({
    title,
    subtitle,
    icon: Icon,
    children,
    actions,
    onExpand,
    className = '',
    headerRight,
    loading = false
}) => (
    <div className={`
        bg-dark-surface border border-dark-border rounded-2xl p-5
        transition-all duration-300 hover:border-primary/20
        ${className}
    `}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {headerRight}
                {onExpand && (
                    <button
                        onClick={onExpand}
                        className="p-2 rounded-lg hover:bg-dark-surface-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                )}
                {actions && (
                    <button className="p-2 rounded-lg hover:bg-dark-surface-2 text-slate-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>

        {/* Chart Content */}
        {loading ? (
            <div className="h-64 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        ) : (
            <div className="relative">
                {children}
            </div>
        )}
    </div>
);

/**
 * Custom Tooltip with premium styling
 */
export const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-dark-surface-2 border border-dark-border rounded-xl p-3 shadow-xl">
            <p className="text-sm font-medium text-white mb-2">{label}</p>
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-400">{entry.name}:</span>
                    <span className="font-semibold text-white">
                        {formatter ? formatter(entry.value) : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

/**
 * AreaChartWidget - Smooth area chart for trends
 */
export const AreaChartWidget = ({
    data,
    dataKey = 'value',
    xAxisKey = 'name',
    title,
    subtitle,
    icon,
    color = COLORS.primary,
    gradient = true,
    height = 250,
    showGrid = false,
    formatter
}) => (
    <ChartCard title={title} subtitle={subtitle} icon={icon} actions>
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />}
                <defs>
                    <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey={xAxisKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip formatter={formatter} />} />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    fill={gradient ? `url(#gradient-${dataKey})` : color}
                    fillOpacity={gradient ? 1 : 0.1}
                />
            </AreaChart>
        </ResponsiveContainer>
    </ChartCard>
);

/**
 * LineChartWidget - Multi-line chart for comparisons
 */
export const LineChartWidget = ({
    data,
    lines = [],
    xAxisKey = 'name',
    title,
    subtitle,
    icon,
    height = 250,
    showLegend = true,
    formatter
}) => (
    <ChartCard title={title} subtitle={subtitle} icon={icon} actions>
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                    dataKey={xAxisKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip formatter={formatter} />} />
                {showLegend && (
                    <Legend
                        wrapperStyle={{ paddingTop: 20 }}
                        formatter={(value) => <span className="text-slate-400 text-sm">{value}</span>}
                    />
                )}
                {lines.map((line, index) => (
                    <Line
                        key={line.dataKey}
                        type="monotone"
                        dataKey={line.dataKey}
                        name={line.name || line.dataKey}
                        stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 2, fill: '#1A1625' }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    </ChartCard>
);

/**
 * BarChartWidget - Bar chart for categorical data
 */
export const BarChartWidget = ({
    data,
    bars = [],
    xAxisKey = 'name',
    title,
    subtitle,
    icon,
    height = 250,
    showLegend = false,
    stacked = false,
    horizontal = false,
    formatter
}) => (
    <ChartCard title={title} subtitle={subtitle} icon={icon} actions>
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                layout={horizontal ? 'vertical' : 'horizontal'}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                    type={horizontal ? 'number' : 'category'}
                    dataKey={horizontal ? undefined : xAxisKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                    type={horizontal ? 'category' : 'number'}
                    dataKey={horizontal ? xAxisKey : undefined}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip formatter={formatter} />} />
                {showLegend && <Legend />}
                {bars.map((bar, index) => (
                    <Bar
                        key={bar.dataKey}
                        dataKey={bar.dataKey}
                        name={bar.name || bar.dataKey}
                        fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                        stackId={stacked ? 'stack' : undefined}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    </ChartCard>
);

/**
 * DonutChartWidget - Donut/Pie chart with center label
 */
export const DonutChartWidget = ({
    data,
    dataKey = 'value',
    nameKey = 'name',
    title,
    subtitle,
    icon,
    height = 250,
    innerRadius = 60,
    outerRadius = 80,
    centerLabel,
    centerValue
}) => (
    <ChartCard title={title} subtitle={subtitle} icon={icon} actions>
        <div className="relative">
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={2}
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                                className="transition-all duration-300 hover:opacity-80"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            {(centerLabel || centerValue) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {centerValue && (
                        <span className="text-2xl font-bold text-white">{centerValue}</span>
                    )}
                    {centerLabel && (
                        <span className="text-sm text-slate-400">{centerLabel}</span>
                    )}
                </div>
            )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
            {data.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color || CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-slate-400">{entry[nameKey]}</span>
                </div>
            ))}
        </div>
    </ChartCard>
);

/**
 * SparklineChart - Mini inline chart
 */
export const SparklineChart = ({ data, dataKey = 'value', color = COLORS.primary, width = 100, height = 30 }) => (
    <ResponsiveContainer width={width} height={height}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
                <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#spark-${dataKey})`}
            />
        </AreaChart>
    </ResponsiveContainer>
);

/**
 * ProgressChart - Circular progress indicator
 */
export const ProgressChart = ({ value, max = 100, size = 120, strokeWidth = 8, color = COLORS.primary, label }) => {
    const percentage = (value / max) * 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{Math.round(percentage)}%</span>
                {label && <span className="text-xs text-slate-400">{label}</span>}
            </div>
        </div>
    );
};

export default {
    ChartCard,
    AreaChartWidget,
    LineChartWidget,
    BarChartWidget,
    DonutChartWidget,
    SparklineChart,
    ProgressChart,
    CustomTooltip,
    COLORS,
    CHART_COLORS
};
