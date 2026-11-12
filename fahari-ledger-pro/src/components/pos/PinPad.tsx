import React, { useState, useEffect } from 'react';
import { X, Delete, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinPadProps {
  title: string;
  description?: string;
  onSuccess: () => void;
  onCancel: () => void;
  correctPin?: string; // For mock validation
}

export const PinPad: React.FC<PinPadProps> = ({ 
  title, 
  description, 
  onSuccess, 
  onCancel,
  correctPin = "1234" // Default mock PIN
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 6) {
      setError(false);
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === correctPin.length) {
      setIsVerifying(true);
      setTimeout(() => {
        if (pin === correctPin) {
          onSuccess();
        } else {
          setError(true);
          setPin('');
          setIsVerifying(false);
        }
      }, 600);
    }
  }, [pin, correctPin, onSuccess]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm mx-4 flex flex-col items-center space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
          {description && <p className="text-sm text-muted-foreground font-medium">{description}</p>}
        </div>

        {/* PIN Display */}
        <div className="flex gap-4">
          {[...Array(correctPin.length)].map((_, i) => (
            <div 
              key={i}
              className={cn(
                "w-12 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-200",
                error ? "border-destructive bg-destructive/5 animate-shake" : 
                pin.length > i ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-muted/30"
              )}
            >
              {pin.length > i ? (
                <div className="w-3 h-3 bg-primary rounded-full animate-in zoom-in" />
              ) : null}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive font-bold text-sm animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4" />
            Invalid PIN. Please try again.
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              disabled={isVerifying}
              onClick={() => handleNumberClick(num.toString())}
              className="h-20 rounded-3xl bg-card border shadow-soft font-black text-2xl hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <button 
            onClick={onCancel}
            className="h-20 rounded-3xl bg-destructive/10 text-destructive font-black text-xs uppercase hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            Cancel
          </button>
          <button
            disabled={isVerifying}
            onClick={() => handleNumberClick('0')}
            className="h-20 rounded-3xl bg-card border shadow-soft font-black text-2xl hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-20 rounded-3xl bg-muted flex items-center justify-center hover:bg-muted-foreground hover:text-muted transition-all"
          >
            <Delete className="w-8 h-8" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-black tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          Secure Access Protocol Active
        </div>
      </div>
    </div>
  );
};
