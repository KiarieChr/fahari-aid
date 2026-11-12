import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutModalProps {
  total: number;
  onClose: () => void;
  onConfirm: (method: string) => void;
}

const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash', icon: <Banknote className="w-6 h-6" /> },
  { id: 'mpesa', name: 'M-Pesa', icon: <Smartphone className="w-6 h-6" /> },
  { id: 'card', name: 'Card', icon: <CreditCard className="w-6 h-6" /> },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ total, onClose, onConfirm }) => {
  const [method, setMethod] = useState('cash');
  const [tendered, setTendered] = useState(total.toString());
  const [isSuccess, setIsSuccess] = useState(false);

  const change = Math.max(0, parseFloat(tendered || '0') - total);

  const handleFinish = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onConfirm(method);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in">
        <div className="bg-card border rounded-3xl p-12 flex flex-col items-center text-center space-y-6 shadow-glow max-w-sm w-full mx-4">
          <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic tracking-tight">PAYMENT SUCCESS</h2>
            <p className="text-muted-foreground">Session closed and inventory updated.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-card border rounded-3xl w-full max-w-lg shadow-elevated overflow-hidden mx-4">
        <div className="p-6 border-b flex justify-between items-center bg-muted/30">
          <h2 className="text-xl font-black uppercase tracking-tight">Checkout Table</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Total Display */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Total Amount Due</p>
            <h1 className="text-5xl font-black text-primary">Ksh {total.toLocaleString()}</h1>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-4">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                  method === m.id ? "border-primary bg-primary/5 shadow-soft" : "border-transparent bg-muted/50 hover:bg-muted"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  method === m.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                )}>
                  {m.icon}
                </div>
                <span className="font-bold text-xs uppercase">{m.name}</span>
              </button>
            ))}
          </div>

          {/* Amount Tendered */}
          {method === 'cash' && (
            <div className="space-y-4 animate-in slide-in-from-top-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">Amount Tendered</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Ksh</span>
                  <input
                    type="number"
                    value={tendered}
                    onChange={(e) => setTendered(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-muted/50 border-2 border-transparent focus:border-primary rounded-2xl text-2xl font-black outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-success/5 border border-success/20 rounded-2xl">
                <span className="font-bold text-success">Change to Return</span>
                <span className="text-xl font-black text-success">Ksh {change.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-muted/30 border-t">
          <button
            onClick={handleFinish}
            disabled={parseFloat(tendered) < total}
            className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg uppercase tracking-widest shadow-glow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all"
          >
            Confirm & Finalize
          </button>
        </div>
      </div>
    </div>
  );
};
