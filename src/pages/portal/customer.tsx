import { useEffect, useState } from 'react';
import { MapPin, Phone, ShoppingBag, ClipboardList, Check, X, Clock, Store, Bike } from 'lucide-react';
import { api, apiError } from '../../lib/api';
import { useApi } from '../../lib/useApi';
import { useAuth } from '../../context/AuthContext';
import { GBP, branchPhoto } from '../../lib/data';
import { Panel, Loading, ErrorNote, PageHeader, StatusBadge, EmptyState } from '../../components/ui';
import { OrderBuilder, type CartLine } from '../../components/OrderBuilder';
import type { Branch, MenuItem, Order } from '../../lib/types';

const SAVED_KEY = 'steakz_sirine_checkout';
interface SavedDetails { name: string; phone: string; address: string; }

export function CustomerHome() {
  const { user } = useAuth();
  const branches = useApi<Branch[]>('/customer/branches');
  const [branch, setBranch] = useState<Branch | null>(null);
  const menu = useApi<MenuItem[]>(branch ? `/customer/branches/${branch.id}/menu` : null);

  const [type, setType] = useState<'TAKEAWAY' | 'DELIVERY'>('TAKEAWAY');
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [save, setSave] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) {
        const d = JSON.parse(raw) as SavedDetails;
        if (d.name) setName(d.name);
        if (d.phone) setPhone(d.phone);
        if (d.address) setAddress(d.address);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setDone(''), 5000);
    return () => window.clearTimeout(timer);
  }, [done]);

  async function place(lines: CartLine[]) {
    if (!branch) return;
    if (type === 'DELIVERY' && !address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }
    setBusy(true);
    setError('');
    setDone('');
    try {
      if (save) localStorage.setItem(SAVED_KEY, JSON.stringify({ name, phone, address } satisfies SavedDetails));
      const body: Record<string, unknown> = { branchId: branch.id, type, items: lines };
      if (type === 'DELIVERY') {
        const parts = [name, phone, address, notes ? `Note: ${notes}` : ''].filter(Boolean);
        body.deliveryAddress = parts.join(' · ');
      }
      const res = await api.post<{ data: Order }>('/customer/orders', body);
      setDone(`Order #${res.data.data.id} placed — ${GBP.format(res.data.data.total)}. Thank you!`);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  }

  if (branches.loading) return <Loading />;

  if (!branch) {
    return (
      <div>
        <PageHeader title="Order Food" subtitle="Pick the branch you'd like to order from" />
        <div className="grid gap-6 sm:grid-cols-2">
          {(branches.data ?? []).map((b) => (
            <button key={b.id} onClick={() => setBranch(b)} className="card group overflow-hidden p-0 text-left transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-40 overflow-hidden">
                <img src={branchPhoto(b.name)} alt={b.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
                <h3 className="absolute bottom-3 left-5 font-display text-2xl font-bold text-white">{b.name}</h3>
              </div>
              <div className="space-y-2 p-5">
                <p className="flex items-center gap-2 text-sm text-ink-600"><MapPin size={15} className="text-brand-500" /> {b.address}</p>
                <p className="flex items-center gap-2 text-sm text-ink-600"><Phone size={15} className="text-brand-500" /> {b.phone}</p>
                <span className="btn btn-primary mt-2 px-4 py-2 text-sm"><ShoppingBag size={15} /> Order from {b.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Order Food" subtitle={`From Steakz ${branch.name}`} />

      <div className="card mb-6 flex flex-col gap-4 overflow-hidden p-0 sm:flex-row">
        <img src={branchPhoto(branch.name)} alt={branch.name} className="h-40 w-full object-cover sm:h-auto sm:w-56" />
        <div className="flex flex-1 flex-col justify-center gap-1.5 p-5">
          <h3 className="font-display text-2xl font-bold text-ink-900">Steakz {branch.name}</h3>
          <p className="flex items-center gap-2 text-sm text-ink-600"><MapPin size={15} className="text-brand-500" /> {branch.address}</p>
          <p className="flex items-center gap-2 text-sm text-ink-600"><Phone size={15} className="text-brand-500" /> {branch.phone}</p>
          <p className="flex items-center gap-2 text-sm text-ink-600"><Clock size={15} className="text-brand-500" /> Mon–Sun · 12pm–11pm</p>
          <button onClick={() => setBranch(null)} className="mt-1 w-fit text-sm font-semibold text-brand-600 hover:underline">← Change branch</button>
        </div>
      </div>

      {error && <div className="mb-4"><ErrorNote message={error} /></div>}
      {done && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{done}</div>}
      {done && (
        <div className="fixed inset-x-0 top-1/2 z-50 flex justify-center px-4">
          <div className="relative w-full max-w-2xl -translate-y-1/2 rounded-3xl border border-emerald-200 bg-emerald-50/95 px-6 py-4 text-center text-sm font-semibold text-emerald-700 shadow-xl backdrop-blur-sm">
            <button onClick={() => setDone('')} className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition hover:bg-emerald-200 focus:outline-none">
              <X size={14} />
            </button>
            {done}
          </div>
        </div>
      )}

      <Panel title="Your details" className="mb-6">
        <div className="mb-4 flex gap-2">
          {([['TAKEAWAY', Store], ['DELIVERY', Bike]] as const).map(([t, Icon]) => (
            <button key={t} onClick={() => setType(t)} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${type === t ? 'bg-brand-500 text-white' : 'bg-brand-50 text-ink-700'}`}>
              <Icon size={15} /> {t === 'TAKEAWAY' ? 'Collection' : 'Delivery'}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Name</span>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-700">Phone</span>
            <input className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact number" />
          </label>
          {type === 'DELIVERY' && (
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-ink-700">Delivery address</span>
              <input className="field" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, postcode" />
            </label>
          )}
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-ink-700">Notes (optional)</span>
            <input className="field" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, cooking preference, etc." />
          </label>
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-ink-600">
          <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="accent-brand-500" />
          Save my details for next time
        </label>
      </Panel>

      {menu.loading ? <Loading /> : <OrderBuilder menu={menu.data ?? []} submitting={busy} onSubmit={place} cta={`Place ${type === 'DELIVERY' ? 'delivery' : 'collection'} order`} />}
    </div>
  );
}

export function CustomerOrders() {
  const orders = useApi<Order[]>('/customer/orders');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function cancel(id: number) {
    setBusyId(id);
    setError('');
    try { await api.patch(`/customer/orders/${id}/cancel`); await orders.reload(); }
    catch (e) { setError(apiError(e)); }
    finally { setBusyId(null); }
  }

  if (orders.loading) return <Loading />;
  if (orders.error) return <ErrorNote message={orders.error} />;
  const list = orders.data ?? [];

  return (
    <div>
      <PageHeader title="My Orders" subtitle="Your order history" />
      {error && <div className="mb-4"><ErrorNote message={error} /></div>}
      {list.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders yet" hint="Place your first Steakz order!" />
      ) : (
        <div className="space-y-3">
          {list.map((o) => (
            <Panel key={o.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold text-ink-900">Order #{o.id}</p>
                  <p className="text-sm text-ink-500">{o.branch?.name} · {o.type.replace('_', ' ')} · {new Date(o.createdAt).toLocaleDateString('en-GB')}</p>
                  <p className="mt-1 text-sm text-ink-600">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold">{GBP.format(o.total)}</p>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <StatusBadge status={o.status} />
                    {o.status === 'PENDING' && (
                      <button onClick={() => cancel(o.id)} disabled={busyId === o.id} className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                        <X size={12} /> {busyId === o.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                    {(o.status === 'DELIVERED' || o.status === 'PAID') && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={12} /> Complete</span>
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
