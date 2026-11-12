import React from 'react';
import { cn } from '@/lib/utils';

interface BillItem {
  name: string;
  quantity: number;
  price: number;
}

interface BillTemplateProps {
  businessName?: string;
  address?: string;
  phone?: string;
  tableNumber: string;
  waiterName: string;
  items: BillItem[];
  subtotal: number;
  tax?: number;
  total: number;
  billNumber: string;
}

export const BillTemplate = React.forwardRef<HTMLDivElement, BillTemplateProps>((props, ref) => {
  const {
    businessName = "FAHARI NEXUS RESTAURANT",
    address = "123 Business Avenue, Nairobi",
    phone = "+254 700 000 000",
    tableNumber,
    waiterName,
    items,
    subtotal,
    tax = 0,
    total,
    billNumber
  } = props;

  return (
    <div 
      ref={ref}
      className="w-[80mm] p-4 bg-white text-black font-mono text-sm leading-tight"
      style={{ margin: '0 auto' }}
    >
      {/* Header */}
      <div className="text-center space-y-1 mb-4">
        <h1 className="font-black text-lg uppercase">{businessName}</h1>
        <p className="text-[10px]">{address}</p>
        <p className="text-[10px]">Tel: {phone}</p>
      </div>

      <div className="border-t border-b border-black border-dashed py-2 mb-4 space-y-1">
        <div className="flex justify-between">
          <span>Bill #:</span>
          <span className="font-bold">{billNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Table:</span>
          <span className="font-bold">{tableNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Waiter:</span>
          <span>{waiterName}</span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between font-bold border-b border-black pb-1">
          <span className="w-1/2">Item</span>
          <span className="w-1/4 text-center">Qty</span>
          <span className="w-1/4 text-right">Price</span>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start">
            <span className="w-1/2 leading-none">{item.name}</span>
            <span className="w-1/4 text-center">{item.quantity}</span>
            <span className="w-1/4 text-right">{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-black border-dashed pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{subtotal.toLocaleString()}</span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between">
            <span>Tax (16%):</span>
            <span>{tax.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-black mt-2 pt-2 border-t border-black">
          <span>TOTAL:</span>
          <span>Ksh {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 space-y-2 pt-4 border-t border-black border-dashed">
        <p className="text-[10px] italic">Thank you for dining with us!</p>
        <div className="flex justify-center">
          <div className="w-32 h-1 bg-black/10 rounded-full" />
        </div>
        <p className="text-[8px] text-gray-500 uppercase">Powered by Fahari Nexus ERP</p>
      </div>
    </div>
  );
});

BillTemplate.displayName = 'BillTemplate';
