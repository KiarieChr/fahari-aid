import React, { useState } from 'react';
import { X, Users, ListFilter, Plus, Minus, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitBillModalProps {
  total: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  onClose: () => void;
  onConfirm: (splits: any) => void;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({ total, items, onClose, onConfirm }) => {
  const [splitMode, setSplitMode] = useState<'equal' | 'item'>('equal');
  const [personCount, setPersonCount] = useState(2);

  const amountPerPerson = total / personCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-card border rounded-3xl w-full max-w-2xl shadow-elevated overflow-hidden mx-4">
        <div className="p-6 border-b flex justify-between items-center bg-muted/30">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Split Billing</h2>
            <p className="text-xs text-muted-foreground font-medium">Choose how you want to split Ksh {total.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-muted/30 p-1 mx-8 mt-6 rounded-2xl">
          <button
            onClick={() => setSplitMode('equal')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
              splitMode === 'equal' ? "bg-card shadow-soft text-primary" : "text-muted-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            Split Equally
          </button>
          <button
            onClick={() => setSplitMode('item')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
              splitMode === 'item' ? "bg-card shadow-soft text-primary" : "text-muted-foreground"
            )}
          >
            <ListFilter className="w-4 h-4" />
            Split by Item
          </button>
        </div>

        <div className="p-8 min-h-[300px]">
          {splitMode === 'equal' ? (
            <div className="space-y-12 animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center gap-6">
                <span className="text-sm font-black uppercase text-muted-foreground">Number of People</span>
                <div className="flex items-center gap-8">
                  <button 
                    onClick={() => setPersonCount(Math.max(2, personCount - 1))}
                    className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <Minus className="w-8 h-8" />
                  </button>
                  <span className="text-7xl font-black">{personCount}</span>
                  <button 
                    onClick={() => setPersonCount(personCount + 1)}
                    className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <Plus className="w-8 h-8" />
                  </button>
                </div>
              </div>

              <div className="bg-primary/5 border-2 border-primary/10 rounded-3xl p-8 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase text-primary/60 tracking-widest">Each Person Pays</p>
                  <p className="text-3xl font-black text-primary">Ksh {amountPerPerson.toLocaleString()}</p>
                </div>
                <Receipt className="w-12 h-12 text-primary/20" />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <p className="text-center text-muted-foreground text-sm italic py-12">
                "Split by Item" UI allows dragging items to individual guest tabs.<br/>
                (Coming soon in the next update)
              </p>
              <div className="opacity-20 pointer-events-none space-y-2">
                {items.slice(0, 3).map(item => (
                  <div key={item.id} className="p-4 border rounded-2xl flex justify-between bg-muted/50">
                    <span className="font-bold">{item.name}</span>
                    <span className="font-bold">Ksh {item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-muted/30 border-t flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-card border rounded-2xl font-bold hover:bg-muted transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm({ mode: splitMode, count: personCount })}
            className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Confirm Split
          </button>
        </div>
      </div>
    </div>
  );
};
