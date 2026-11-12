import React, { useState, useEffect } from 'react';
import { TableMap } from './TableMap';
import { SessionView } from './SessionView';
import { KDSView } from './KDSView';
import { PinPad } from './PinPad';
import { ManagerDashboard } from './ManagerDashboard';
import { cn } from '@/lib/utils';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { 
  LayoutGrid, 
  UtensilsCrossed, 
  Settings, 
  History,
  Bell,
  ChefHat,
  BarChart3
} from 'lucide-react';

type POSViewMode = 'floor' | 'menu' | 'history' | 'session' | 'kitchen' | 'reports';

export const RestaurantPOS: React.FC = () => {
  const [viewMode, setViewMode] = useState<POSViewMode>('floor');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [pendingTable, setPendingTable] = useState<{ number: string, pin: string } | null>(null);
  const [showPinPad, setShowPinPad] = useState(false);

  // Auto-lock after 2 minutes of inactivity
  useInactivityTimeout(() => {
    if (viewMode !== 'floor') {
      setViewMode('floor');
      setSelectedTable(null);
      console.log("POS session auto-locked due to inactivity.");
    }
  }, 120000);

  const handleTableClick = (tableNumber: string, status: string, assignedPin: string) => {
    if (status === 'available') {
      setSelectedTable(tableNumber);
      setViewMode('session');
    } else {
      // Table is occupied or billed, require the specific Waiter's PIN (or Manager override)
      setPendingTable({ number: tableNumber, pin: assignedPin });
      setShowPinPad(true);
    }
  };

  const handlePinSuccess = () => {
    setSelectedTable(pendingTable?.number || null);
    setPendingTable(null);
    setShowPinPad(false);
    setViewMode('session');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'session':
        return <SessionView tableNumber={selectedTable || ''} onBack={() => setViewMode('floor')} />;
      case 'kitchen':
        return <KDSView />;
      case 'reports':
        return <ManagerDashboard />;
      case 'floor':
      default:
        return <TableMap onTableClick={handleTableClick} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 flex flex-col items-center py-8 border-r bg-card/50 backdrop-blur-md z-30">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-glow mb-12">
          <UtensilsCrossed className="w-6 h-6" />
        </div>

        <nav className="flex-1 flex flex-col gap-6">
          <NavItem 
            icon={<LayoutGrid className="w-6 h-6" />} 
            label="Floor" 
            active={viewMode === 'floor' || viewMode === 'session'} 
            onClick={() => setViewMode('floor')}
          />
          <NavItem 
            icon={<ChefHat className="w-6 h-6" />} 
            label="Kitchen" 
            active={viewMode === 'kitchen'} 
            onClick={() => setViewMode('kitchen')}
          />
          <NavItem 
            icon={<BarChart3 className="w-6 h-6" />} 
            label="Reports" 
            active={viewMode === 'reports'} 
            onClick={() => setViewMode('reports')}
          />
          <NavItem 
            icon={<History className="w-6 h-6" />} 
            label="History" 
            active={viewMode === 'history'} 
            onClick={() => setViewMode('history')}
          />
          <NavItem 
            icon={<Bell className="w-6 h-6" />} 
            label="Alerts" 
            badge={3}
          />
        </nav>

        <button className="p-3 text-muted-foreground hover:text-foreground transition-colors mt-auto">
          <Settings className="w-6 h-6" />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {renderContent()}
      </main>

      {/* Security Overlays */}
      {showPinPad && (
        <PinPad 
          title="Unlock Table"
          description={`Table ${pendingTable?.number} is locked. Enter Waiter or Manager PIN.`}
          correctPin={pendingTable?.pin || "1234"}
          onSuccess={handlePinSuccess}
          onCancel={() => setShowPinPad(false)}
        />
      )}
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, badge, onClick }) => (
  <button 
    onClick={onClick}
    className={cn(
      "group relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300",
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
      {label}
    </span>
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[2px_0_8px_rgba(var(--primary),0.5)]" />
    )}
    {badge && (
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-soft">
        {badge}
      </div>
    )}
  </button>
);
