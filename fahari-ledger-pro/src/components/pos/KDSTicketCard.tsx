import React from 'react';
import { Clock, CheckCircle2, AlertCircle, ChefHat, Beer } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KDSTicketItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  isReady: boolean;
}

export interface KDSTicket {
  id: string;
  ticketNumber: string;
  tableNumber: string;
  station: 'kitchen' | 'bar';
  items: KDSTicketItem[];
  createdAt: Date;
  status: 'pending' | 'preparing' | 'ready';
}

interface KDSTicketCardProps {
  ticket: KDSTicket;
  onStatusChange: (id: string, newStatus: KDSTicket['status']) => void;
  onItemToggle: (ticketId: string, itemId: string) => void;
}

export const KDSTicketCard: React.FC<KDSTicketCardProps> = ({
  ticket,
  onStatusChange,
  onItemToggle
}) => {
  const elapsedMinutes = Math.floor((new Date().getTime() - ticket.createdAt.getTime()) / 60000);
  
  const getUrgencyColor = () => {
    if (elapsedMinutes > 20) return 'text-destructive border-destructive/30 bg-destructive/5';
    if (elapsedMinutes > 10) return 'text-warning border-warning/30 bg-warning/5';
    return 'text-success border-success/30 bg-success/5';
  };

  const getStatusAction = () => {
    if (ticket.status === 'pending') return { label: 'Start Cooking', status: 'preparing' as const };
    if (ticket.status === 'preparing') return { label: 'Mark Ready', status: 'ready' as const };
    return null;
  };

  const action = getStatusAction();

  return (
    <div className={cn(
      "flex flex-col h-full border-2 rounded-3xl overflow-hidden transition-all duration-300",
      ticket.status === 'ready' ? "opacity-60 grayscale-[0.5]" : "shadow-elevated hover:shadow-glow",
      ticket.status === 'preparing' ? "border-primary/50" : "border-border"
    )}>
      {/* Header */}
      <div className={cn(
        "px-5 py-4 border-b flex justify-between items-start bg-card/50",
        ticket.status === 'preparing' && "bg-primary/5"
      )}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl">#{ticket.ticketNumber}</span>
            <div className={cn(
              "px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter",
              ticket.station === 'kitchen' ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
            )}>
              {ticket.station}
            </div>
          </div>
          <p className="text-sm font-bold text-muted-foreground mt-1">Table {ticket.tableNumber}</p>
        </div>
        
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold",
          getUrgencyColor()
        )}>
          <Clock className="w-3.5 h-3.5" />
          {elapsedMinutes}m
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {ticket.items.map((item) => (
          <div 
            key={item.id}
            onClick={() => onItemToggle(ticket.id, item.id)}
            className="group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                item.isReady ? "bg-primary border-primary" : "border-muted-foreground/30 group-hover:border-primary/50"
              )}>
                {item.isReady && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "font-bold text-lg leading-tight transition-all",
                  item.isReady && "text-muted-foreground line-through opacity-50"
                )}>
                  {item.quantity}× {item.name}
                </p>
                {item.notes && (
                  <div className="mt-1 flex items-start gap-1.5 text-xs text-destructive font-medium bg-destructive/5 p-2 rounded-lg border border-destructive/10">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {item.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Actions */}
      <div className="p-4 bg-card/80 border-t mt-auto">
        {action ? (
          <button 
            onClick={() => onStatusChange(ticket.id, action.status)}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all",
              action.status === 'preparing' 
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                : "bg-primary text-primary-foreground shadow-glow hover:scale-[1.02]"
            )}
          >
            {action.label}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-4 text-success font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            READY FOR PICKUP
          </div>
        )}
      </div>
    </div>
  );
};
