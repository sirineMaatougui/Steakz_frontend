import { useState } from 'react';
import { ChefHat, CreditCard, Bike, UtensilsCrossed, Check, Clock } from 'lucide-react';
import { api, apiError } from '../../lib/api';
import { useApi } from '../../lib/useApi';
import { GBP } from '../../lib/data';
import { Panel, Loading, ErrorNote, PageHeader, StatusBadge, EmptyState } from '../../components/ui';
import { OrderBuilder, type CartLine } from '../../components/OrderBuilder';
import type { MenuItem, Order, Delivery } from '../../lib/types';

function OrderTicket({ order, children }: { order: Order; children?: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-lg font-bold text-ink-900">#{order.id}</span>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-0.5 text-xs text-ink-500">{order.type.replace('_', ' ')} · {order.customer?.name ?? order.waiter?.name ?? 'Walk-in'}</p>
      <ul className="mt-3 space-y-1 border-t border-brand-50 pt-3 text-sm text-ink-700">
        {order.items.map((it) => (
          <li key={it.id} className="flex justify-between">
            <span>{it.quantity}× {it.name}</span>
            <span className="text-ink-400">{GBP.format(it.unitPrice * it.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-display font-semibold">{GBP.format(order.total)}</span>
        {children}
      </div>
    </div>
  );
}

function useAction() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function run(fn: () => Promise<unknown>, reload: () => Promise<void>) {
    setBusy(true);
    setErr('');
    try { await fn(); await reload(); }
    catch (e) { setErr(apiError(e)); }
    finally { setBusy(false); }
  }
  return { busy, err, run };
}

export function WaiterHome() {
  const menu = useApi<MenuItem[]>('/waiter/menu');
  const orders = useApi<Order[]>('/waiter/orders');
  const [type, setType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const { busy, err, run } = useAction();

  async function place(lines: CartLine[]) {
    await run(() => api.post('/waiter/orders', { type, items: lines }), async () => { await orders.reload(); });
  }

  if (menu.loading) return <Loading />;
  return (
    <div>
      <PageHeader title="Take an order" subtitle="Build a ticket and send it to the kitchen" />
      {err && <div className="mb-4"><ErrorNote message={err} /></div>}
      <div className="mb-4 flex gap-2">
        {(['DINE_IN', 'TAKEAWAY'] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={`rounded-full px-4 py-2 text-sm font-semibold ${type === t ? 'bg-brand-500 text-white' : 'bg-brand-50 text-ink-700'}`}>
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>
      <OrderBuilder menu={menu.data ?? []} submitting={busy} onSubmit={place} cta="Send to kitchen" />

      <div className="mt-8">
        <Panel title="Active floor orders">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(orders.data ?? []).slice(0, 9).map((o) => (
              <OrderTicket key={o.id} order={o}>
                {o.status === 'READY' && (
                  <button onClick={() => run(() => api.patch(`/waiter/orders/${o.id}/serve`), orders.reload)} className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                    Mark served
                  </button>
                )}
              </OrderTicket>
            ))}
          </div>
          {(orders.data ?? []).length === 0 && <EmptyState icon={UtensilsCrossed} title="No active orders" />}
        </Panel>
      </div>
    </div>
  );
}

export function KitchenHome() {
  const orders = useApi<Order[]>('/kitchen/orders');
  const { busy, err, run } = useAction();
  if (orders.loading) return <Loading />;
  if (orders.error) return <ErrorNote message={orders.error} />;
  const list = orders.data ?? [];

  return (
    <div>
      <PageHeader title="Kitchen Pass" subtitle="Tickets to prepare for your branch" />
      {err && <div className="mb-4"><ErrorNote message={err} /></div>}
      {list.length === 0 ? (
        <EmptyState icon={ChefHat} title="All caught up!" hint="No tickets in the queue right now." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((o) => (
            <OrderTicket key={o.id} order={o}>
              <div className="flex gap-2">
                {o.status === 'PENDING' && (
                  <button disabled={busy} onClick={() => run(() => api.patch(`/kitchen/orders/${o.id}/status`, { status: 'PREPARING' }), orders.reload)} className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                    <Clock size={13} /> Start
                  </button>
                )}
                {o.status === 'PREPARING' && (
                  <button disabled={busy} onClick={() => run(() => api.patch(`/kitchen/orders/${o.id}/status`, { status: 'READY' }), orders.reload)} className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                    <Check size={13} /> Ready
                  </button>
                )}
              </div>
            </OrderTicket>
          ))}
        </div>
      )}
    </div>
  );
}

export function CashierHome() {
  const orders = useApi<Order[]>('/cashier/orders');
  const { busy, err, run } = useAction();
  if (orders.loading) return <Loading />;
  if (orders.error) return <ErrorNote message={orders.error} />;
  const list = orders.data ?? [];

  function pay(id: number, method: 'CASH' | 'CARD') {
    return run(() => api.post(`/cashier/orders/${id}/payment`, { method }), orders.reload);
  }

  return (
    <div>
      <PageHeader title="The Till" subtitle="Take payment for completed orders" />
      {err && <div className="mb-4"><ErrorNote message={err} /></div>}
      {list.length === 0 ? (
        <EmptyState icon={CreditCard} title="Nothing to charge" hint="No unpaid orders right now." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((o) => (
            <OrderTicket key={o.id} order={o}>
              <div className="flex gap-2">
                <button disabled={busy} onClick={() => pay(o.id, 'CASH')} className="rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">Cash</button>
                <button disabled={busy} onClick={() => pay(o.id, 'CARD')} className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">Card</button>
              </div>
            </OrderTicket>
          ))}
        </div>
      )}
    </div>
  );
}

export function DeliveryHome() {
  const deliveries = useApi<Delivery[]>('/delivery/deliveries');
  const { busy, err, run } = useAction();
  if (deliveries.loading) return <Loading />;
  if (deliveries.error) return <ErrorNote message={deliveries.error} />;
  const list = deliveries.data ?? [];

  function setStatus(id: number, status: 'OUT_FOR_DELIVERY' | 'DELIVERED') {
    return run(() => api.patch(`/delivery/deliveries/${id}/status`, { status }), deliveries.reload);
  }

  return (
    <div>
      <PageHeader title="My Deliveries" subtitle="Your assigned runs" />
      {err && <div className="mb-4"><ErrorNote message={err} /></div>}
      {list.length === 0 ? (
        <EmptyState icon={Bike} title="No deliveries" hint="Nothing assigned to you right now." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((d) => (
            <div key={d.id} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">Order #{d.order?.id}</span>
                <StatusBadge status={d.status} />
              </div>
              <p className="mt-1 text-sm text-ink-600">{d.address}</p>
              <p className="mt-0.5 text-xs text-ink-500">{GBP.format(d.order?.total ?? 0)}</p>
              <div className="mt-3 flex gap-2">
                {d.status === 'ASSIGNED' && (
                  <button disabled={busy} onClick={() => setStatus(d.id, 'OUT_FOR_DELIVERY')} className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">Out for delivery</button>
                )}
                {d.status === 'OUT_FOR_DELIVERY' && (
                  <button disabled={busy} onClick={() => setStatus(d.id, 'DELIVERED')} className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">Mark delivered</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
