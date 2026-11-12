import React, { useState, useEffect, useRef } from 'react';
import { KDSTicketCard, KDSTicket } from './KDSTicketCard';
import { ChefHat, Beer, Filter, Clock, LayoutGrid, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';

const mockTickets: KDSTicket[] = [
  {
    id: '1',
    ticketNumber: '104',
    tableNumber: '12',
    station: 'kitchen',
    status: 'preparing',
    createdAt: new Date(Date.now() - 12 * 60000),
    items: [
      { id: 'i1', name: 'Grilled Salmon', quantity: 2, notes: 'No lemon butter on one', isReady: true },
      { id: 'i2', name: 'Asparagus Spears', quantity: 1, isReady: false },
    ]
  },
  {
    id: '2',
    ticketNumber: '105',
    tableNumber: '4',
    station: 'bar',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60000),
    items: [
      { id: 'i3', name: 'Espresso Martini', quantity: 3, notes: 'Extra foam', isReady: false },
      { id: 'i4', name: 'Chardonnay (Glass)', quantity: 1, isReady: false },
    ]
  },
  {
    id: '3',
    ticketNumber: '106',
    tableNumber: '7',
    station: 'kitchen',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60000),
    items: [
      { id: 'i5', name: 'Club Sandwich', quantity: 4, notes: 'Wheat bread', isReady: false },
      { id: 'i6', name: 'Sweet Potato Fries', quantity: 2, isReady: false },
    ]
  },
  {
    id: '4',
    ticketNumber: '102',
    tableNumber: '1',
    station: 'kitchen',
    status: 'preparing',
    createdAt: new Date(Date.now() - 25 * 60000),
    items: [
      { id: 'i7', name: 'Wagyu Burger', quantity: 2, notes: 'Well done', isReady: false },
    ]
  }
];

export const KDSView: React.FC = () => {
  const [tickets, setTickets] = useState<KDSTicket[]>(mockTickets);
  const [activeStation, setActiveStation] = useState<'all' | 'kitchen' | 'bar'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const { playNewOrderSound } = useNotifications();
  const prevTicketCount = useRef(tickets.length);

  // Sound notification effect
  useEffect(() => {
    if (tickets.length > prevTicketCount.current) {
      if (soundEnabled) {
        playNewOrderSound();
      }
    }
    prevTicketCount.current = tickets.length;
  }, [tickets.length, soundEnabled, playNewOrderSound]);

  // Simulation: Add a new ticket after 10 seconds for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      const newTicket: KDSTicket = {
        id: 'new-1',
        ticketNumber: '107',
        tableNumber: '15',
        station: 'kitchen',
        status: 'pending',
        createdAt: new Date(),
        items: [{ id: 'i-new', name: 'Special Pizza', quantity: 1, isReady: false }]
      };
      setTickets(prev => [...prev, newTicket]);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleStatusChange = (id: string, newStatus: KDSTicket['status']) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleItemToggle = (ticketId: string, itemId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          items: t.items.map(item => item.id === itemId ? { ...item, isReady: !item.isReady } : item)
        };
      }
      return t;
    }));
  };

  const filteredTickets = tickets.filter(t => 
    (activeStation === 'all' || t.station === activeStation) && 
    t.status !== 'ready' // In a real KDS, we'd probably hide ready tickets after a short delay
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      {/* KDS Header */}
      <header className="h-20 bg-card border-b px-8 flex items-center justify-between shadow-soft z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-glow">
              <ChefHat className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Kitchen Display</h1>
          </div>
          
          <div className="h-8 w-px bg-border mx-2" />
          
          <div className="flex bg-muted rounded-2xl p-1 gap-1">
            <StationButton 
              active={activeStation === 'all'} 
              onClick={() => setActiveStation('all')}
              icon={<LayoutGrid className="w-4 h-4" />}
              label="All"
            />
            <StationButton 
              active={activeStation === 'kitchen'} 
              onClick={() => setActiveStation('kitchen')}
              icon={<ChefHat className="w-4 h-4" />}
              label="Kitchen"
            />
            <StationButton 
              active={activeStation === 'bar'} 
              onClick={() => setActiveStation('bar')}
              icon={<Beer className="w-4 h-4" />}
              label="Bar"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold">{filteredTickets.length} Active Tickets</span>
            <span className="text-xs text-muted-foreground">Updated just now</span>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "p-3 rounded-xl transition-all",
              soundEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button className="p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Tickets Grid */}
      <main className="flex-1 overflow-x-auto p-8">
        <div className="flex gap-6 h-full min-w-max pb-4">
          {filteredTickets.map(ticket => (
            <div key={ticket.id} className="w-80 h-full shrink-0">
              <KDSTicketCard 
                ticket={ticket}
                onStatusChange={handleStatusChange}
                onItemToggle={handleItemToggle}
              />
            </div>
          ))}

          {filteredTickets.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground opacity-30">
              <ChefHat className="w-24 h-24 mb-4" />
              <p className="text-2xl font-bold italic tracking-widest uppercase">All clear, Chef!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface StationButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const StationButton: React.FC<StationButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-bold transition-all duration-300",
      active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
    )}
  >
    {icon}
    {label}
  </button>
);
