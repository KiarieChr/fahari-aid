import React from 'react';
import { TableCard, TableStatus } from './TableCard';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';

interface Table {
  id: string;
  number: string;
  status: TableStatus;
  capacity: number;
  assignedPin?: string;
  session?: {
    startTime: Date;
    totalAmount: number;
    waiterName: string;
  };
}

const mockTables: Table[] = [
  { id: '1', number: '1', status: 'occupied', capacity: 2, assignedPin: '1111', session: { startTime: new Date(Date.now() - 45 * 60000), totalAmount: 2450, waiterName: 'John Doe' } },
  { id: '2', number: '2', status: 'available', capacity: 4 },
  { id: '3', number: '3', status: 'billed', capacity: 4, assignedPin: '2222', session: { startTime: new Date(Date.now() - 120 * 60000), totalAmount: 15200, waiterName: 'Jane Smith' } },
  { id: '4', number: '4', status: 'available', capacity: 6 },
  { id: '5', number: '5', status: 'occupied', capacity: 2, assignedPin: '1111', session: { startTime: new Date(Date.now() - 15 * 60000), totalAmount: 1200, waiterName: 'John Doe' } },
  { id: '6', number: '6', status: 'available', capacity: 4 },
  { id: '7', number: '7', status: 'available', capacity: 8 },
  { id: '8', number: '8', status: 'occupied', capacity: 4, assignedPin: '3333', session: { startTime: new Date(Date.now() - 30 * 60000), totalAmount: 4800, waiterName: 'Mike Ross' } },
  { id: '9', number: '10', status: 'available', capacity: 2 },
  { id: '10', number: '11', status: 'available', capacity: 4 },
  { id: '11', number: '12', status: 'available', capacity: 4 },
  { id: '12', number: '14', status: 'available', capacity: 6 },
];

interface TableMapProps {
  onTableClick: (tableNumber: string, status: string, assignedPin: string) => void;
}

export const TableMap: React.FC<TableMapProps> = ({ onTableClick }) => {
  return (
    <div className="p-6 space-y-6 bg-background/50 min-h-screen">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Main Dining Floor</h1>
          <p className="text-muted-foreground mt-1">12 Tables • 3 Occupied • 1 Billed</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input 
              type="text" 
              placeholder="Search table..." 
              className="pl-10 pr-4 py-2 bg-card border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all w-64"
            />
          </div>
          <button className="p-2 bg-card border rounded-xl hover:bg-muted transition-colors">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="h-10 w-px bg-border mx-2" />
          <div className="flex bg-card border rounded-xl p-1">
            <button className="p-1.5 bg-muted rounded-lg">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <List className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {mockTables.map((table) => (
          <TableCard
            key={table.id}
            id={table.id}
            tableNumber={table.number}
            status={table.status}
            capacity={table.capacity}
            activeSession={table.session}
            onClick={() => onTableClick(table.number, table.status, table.assignedPin || '1234')}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-md border border-border/50 px-6 py-3 rounded-2xl shadow-elevated flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Use</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billed</span>
        </div>
      </div>
    </div>
  );
};
