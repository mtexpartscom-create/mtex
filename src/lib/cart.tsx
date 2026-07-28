import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CartItem, Part } from '@/lib/types';

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  add: (part: Part) => void;
  remove: (partId: string) => void;
  setQty: (partId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function add(part: Part) {
    setItems((prev) => {
      const existing = prev.find((i) => i.part.id === part.id);
      if (existing) {
        return prev.map((i) => (i.part.id === part.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { part, quantity: 1 }];
    });
  }

  function remove(partId: string) {
    setItems((prev) => prev.filter((i) => i.part.id !== partId));
  }

  function setQty(partId: string, qty: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.part.id === partId ? { ...i, quantity: Math.max(0, qty) } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function clear() {
    setItems([]);
  }

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * Number(i.part.price), 0);

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, setQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}