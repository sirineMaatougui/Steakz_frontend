import { useMemo, useState } from 'react';
import { Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';
import { GBP, dishImage } from '../lib/data';
import { EmptyState } from './ui';
import type { MenuItem } from '../lib/types';

export interface CartLine {
  menuItemId: number;
  quantity: number;
}

interface Props {
  menu: MenuItem[];
  submitting: boolean;
  onSubmit: (lines: CartLine[]) => void | Promise<void>;
  cta?: string;
}

/** Menu grid + a running cart. Used by waiters and customers. */
export function OrderBuilder({ menu, submitting, onSubmit, cta = 'Place order' }: Props) {
  const [cart, setCart] = useState<Record<number, number>>({});
  const available = menu.filter((m) => m.available);

  const lines = useMemo(
    () => Object.entries(cart).filter(([, q]) => q > 0).map(([id, q]) => ({ menuItemId: Number(id), quantity: q })),
    [cart],
  );
  const total = useMemo(
    () => lines.reduce((sum, l) => sum + (menu.find((m) => m.id === l.menuItemId)?.price ?? 0) * l.quantity, 0),
    [lines, menu],
  );

  const add = (id: number) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const sub = (id: number) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) - 1) }));

  if (available.length === 0) return <EmptyState icon={ShoppingCart} title="Menu is empty" hint="Nothing available right now." />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Menu grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {available.map((m) => (
          <div key={m.id} className="card overflow-hidden">
            <img src={dishImage(m.image)} alt={m.name} className="h-36 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display font-semibold text-ink-900">{m.name}</p>
                <span className="font-bold text-brand-600">{GBP.format(m.price)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-ink-500">{m.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-400">{m.category}</span>
                {cart[m.id] ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => sub(m.id)} className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-600"><Minus size={14} /></button>
                    <span className="w-5 text-center font-bold">{cart[m.id]}</span>
                    <button onClick={() => add(m.id)} className="grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-white"><Plus size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => add(m.id)} className="btn btn-primary px-3 py-1.5 text-sm"><Plus size={14} /> Add</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink-900">
            <ShoppingCart size={18} className="text-brand-500" /> Your order
          </h3>
          {lines.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-500">Add items to get started.</p>
          ) : (
            <div className="space-y-2">
              {lines.map((l) => {
                const m = menu.find((x) => x.id === l.menuItemId)!;
                return (
                  <div key={l.menuItemId} className="flex justify-between text-sm">
                    <span className="text-ink-700">{l.quantity}× {m.name}</span>
                    <span className="font-medium text-ink-900">{GBP.format(m.price * l.quantity)}</span>
                  </div>
                );
              })}
              <div className="mt-3 flex justify-between border-t border-brand-100 pt-3 font-display text-lg font-bold">
                <span>Total</span>
                <span className="text-brand-600">{GBP.format(total)}</span>
              </div>
            </div>
          )}
          <button
            disabled={lines.length === 0 || submitting}
            onClick={() => onSubmit(lines)}
            className="btn btn-primary mt-4 w-full py-3 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {submitting ? 'Placing…' : cta}
          </button>
        </div>
      </aside>
    </div>
  );
}
