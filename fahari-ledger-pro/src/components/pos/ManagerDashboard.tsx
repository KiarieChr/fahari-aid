import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SALES_DATA = [
  { name: 'Mon', sales: 45000 },
  { name: 'Tue', sales: 52000 },
  { name: 'Wed', sales: 48000 },
  { name: 'Thu', sales: 61000 },
  { name: 'Fri', sales: 85000 },
  { name: 'Sat', sales: 98000 },
  { name: 'Sun', sales: 76000 },
];

const CATEGORY_DATA = [
  { name: 'Mains', value: 45, color: 'oklch(0.32 0.17 265)' },
  { name: 'Drinks', value: 30, color: 'oklch(0.78 0.14 80)' },
  { name: 'Desserts', value: 15, color: 'oklch(0.62 0.16 155)' },
  { name: 'Coffee', value: 10, color: 'oklch(0.75 0.15 65)' },
];

const LOW_STOCK = [
  { name: 'Wagyu Beef Paties', stock: 12, min: 20 },
  { name: 'Heineken Keg', stock: 2, min: 5 },
  { name: 'Avocado', stock: 5, min: 15 },
];

export const ManagerDashboard: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-muted/10 min-h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Business Intelligence</h1>
          <p className="text-muted-foreground font-medium">Real-time revenue and inventory analytics</p>
        </div>
        <div className="flex bg-card border rounded-2xl p-1 shadow-soft">
          <button className="px-6 py-2 bg-muted rounded-xl text-xs font-bold">Daily</button>
          <button className="px-6 py-2 hover:bg-muted rounded-xl text-xs font-bold text-muted-foreground transition-colors">Weekly</button>
          <button className="px-6 py-2 hover:bg-muted rounded-xl text-xs font-bold text-muted-foreground transition-colors">Monthly</button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="Ksh 465,200" 
          change="+12.5%" 
          positive 
          icon={<DollarSign className="w-6 h-6" />} 
        />
        <StatCard 
          title="Active Tables" 
          value="8 / 12" 
          change="Busy" 
          positive 
          icon={<Users className="w-6 h-6" />} 
        />
        <StatCard 
          title="Stock Alerts" 
          value="3 Items" 
          change="Action Req" 
          positive={false} 
          icon={<Package className="w-6 h-6" />} 
        />
        <StatCard 
          title="Avg. Ticket" 
          value="Ksh 4,250" 
          change="+5.2%" 
          positive 
          icon={<TrendingUp className="w-6 h-6" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card border rounded-3xl p-8 shadow-soft space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Revenue Trend</h3>
            <div className="flex items-center gap-2 text-success text-sm font-bold">
              <ArrowUpRight className="w-4 h-4" />
              15% vs Last Week
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SALES_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.01 260)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'oklch(0.5 0.03 260)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'oklch(0.5 0.03 260)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'oklch(1 0 0)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="oklch(0.32 0.17 265)" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: 'oklch(0.32 0.17 265)', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card border rounded-3xl p-8 shadow-soft space-y-6">
          <h3 className="text-xl font-bold">Sales by Category</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {CATEGORY_DATA.map((cat, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-muted-foreground">{cat.name}</span>
                </div>
                <span className="font-bold">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Alerts & Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border rounded-3xl p-8 shadow-soft space-y-6">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-xl font-bold text-foreground">Critical Stock Alerts</h3>
          </div>
          <div className="space-y-4">
            {LOW_STOCK.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                <div className="space-y-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Min. Required: {item.min} units</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-destructive">{item.stock}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-destructive/60">Current Stock</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 border-2 border-dashed rounded-2xl text-sm font-bold text-muted-foreground hover:bg-muted/50 transition-all">
            Manage Inventory
          </button>
        </div>

        <div className="bg-card border rounded-3xl p-8 shadow-soft space-y-6">
          <h3 className="text-xl font-bold">Top Performing Items</h3>
          <div className="space-y-2">
            {[
              { name: 'Wagyu Burger', orders: 145, revenue: 261000 },
              { name: 'Craft Beer', orders: 212, revenue: 95400 },
              { name: 'Cappuccino', orders: 89, revenue: 31150 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 rounded-2xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.orders} orders this week</p>
                  </div>
                </div>
                <p className="font-black text-lg">Ksh {item.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, positive, icon }) => (
  <div className="bg-card border rounded-3xl p-6 shadow-soft space-y-4">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-muted rounded-2xl text-muted-foreground">
        {icon}
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
        positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      )}>
        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </div>
    </div>
    <div>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  </div>
);
