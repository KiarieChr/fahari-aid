import React, { useState } from 'react';
import { Search, Utensils, Coffee, Beer, IceCream, Pizza } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

interface MenuGridProps {
  onAddItem: (product: Product) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: <Utensils className="w-4 h-4" /> },
  { id: 'mains', name: 'Mains', icon: <Pizza className="w-4 h-4" /> },
  { id: 'drinks', name: 'Drinks', icon: <Beer className="w-4 h-4" /> },
  { id: 'coffee', name: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: 'desserts', name: 'Desserts', icon: <IceCream className="w-4 h-4" /> },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Wagyu Burger', price: 1800, category: 'mains' },
  { id: 'p2', name: 'Truffle Fries', price: 650, category: 'mains' },
  { id: 'p3', name: 'Margherita Pizza', price: 1500, category: 'mains' },
  { id: 'p4', name: 'Heineken Draft', price: 450, category: 'drinks' },
  { id: 'p5', name: 'Cappuccino', price: 350, category: 'coffee' },
  { id: 'p6', name: 'Chocolate Fondant', price: 850, category: 'desserts' },
  { id: 'p7', name: 'Greek Salad', price: 950, category: 'mains' },
  { id: 'p8', name: 'Old Fashioned', price: 1200, category: 'drinks' },
];

export const MenuGrid: React.FC<MenuGridProps> = ({ onAddItem }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    (activeCategory === 'all' || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Category Bar */}
      <div className="p-4 border-b bg-card">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                activeCategory === cat.id 
                  ? "bg-primary text-primary-foreground shadow-glow" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input 
            type="text" 
            placeholder="Search menu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-soft"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => onAddItem(product)}
              className="group flex flex-col items-start p-4 bg-card border-2 border-transparent rounded-3xl hover:border-primary/50 hover:shadow-elevated transition-all text-left"
            >
              <div className="w-full aspect-square bg-muted rounded-2xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Utensils className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <h4 className="font-bold text-sm leading-tight mb-1">{product.name}</h4>
              <p className="text-primary font-black">Ksh {product.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
