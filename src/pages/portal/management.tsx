import { useState } from 'react';
import { Plus, Trash2, UserPlus, Building2, Power, Bike, X } from 'lucide-react';
import { api, apiError } from '../../lib/api';
import { useApi } from '../../lib/useApi';
import { useAuth } from '../../context/AuthContext';
import { GBP, ROLE_META, dishImage } from '../../lib/data';
import { Panel, Loading, ErrorNote, PageHeader, StatusBadge, EmptyState } from '../../components/ui';
import type { Branch, MenuItem, Order, User, Role } from '../../lib/types';

const STAFF_ROLES: Role[] = ['BRANCH_MANAGER', 'CHEF', 'CASHIER', 'WAITER', 'DELIVERY'];
const ALL_ROLES: Role[] = ['ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER', 'CHEF', 'CASHIER', 'WAITER', 'CUSTOMER', 'DELIVERY'];
const BRANCH_ROLES: Role[] = ['BRANCH_MANAGER', 'CHEF', 'CASHIER', 'WAITER', 'DELIVERY'];

function FormError({ msg }: { msg: string }) {
  return msg ? <div className="mb-3"><ErrorNote message={msg} /></div> : null;
}

function AddButton({ open, onClick, label }: { open: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="btn btn-primary px-5 py-2.5 text-sm">
      {open ? '×' : <UserPlus size={16} />} {open ? 'Close' : label}
    </button>
  );
}

// ── Admin: Users ──────────────────────────────────────────────────────────
export function AdminUsers() {
  const users = useApi<User[]>('/admin/users');
  const branches = useApi<Branch[]>('/admin/branches');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'WAITER' as Role, branchId: '' });
  const [err, setErr] = useState('');
  const needsBranch = BRANCH_ROLES.includes(form.role);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/admin/users', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        branchId: needsBranch && form.branchId ? Number(form.branchId) : null,
      });
      setForm({ name: '', email: '', password: '', role: 'WAITER', branchId: '' });
      setOpen(false);
      await users.reload();
    } catch (e2) {
      setErr(apiError(e2));
    }
  }
  async function del(id: number) {
    try { await api.delete(`/admin/users/${id}`); await users.reload(); }
    catch (e2) { setErr(apiError(e2)); }
  }

  if (users.loading) return <Loading />;
  return (
    <div>
      <PageHeader title="User Management" subtitle="Every account across the chain" action={<AddButton open={open} onClick={() => setOpen((o) => !o)} label="New user" />} />
      <FormError msg={err} />
      {open && (
        <Panel className="mb-6">
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input required placeholder="Full name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" placeholder="Email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required type="password" placeholder="Password (min 6)" className="field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
            </select>
            {needsBranch && (
              <select required className="field" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                <option value="">Select branch…</option>
                {(branches.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <button className="btn btn-primary py-3">Create user</button>
          </form>
        </Panel>
      )}
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-ink-500">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Branch</th>
                <th className="pb-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {(users.data ?? []).map((u) => (
                <tr key={u.id}>
                  <td className="py-2.5 font-medium text-ink-800">{u.name}</td>
                  <td className="py-2.5 text-ink-600">{u.email}</td>
                  <td className="py-2.5"><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{ROLE_META[u.role].label}</span></td>
                  <td className="py-2.5 text-ink-600">{u.branchId ? `#${u.branchId}` : '—'}</td>
                  <td className="py-2.5 text-right">
                    <button onClick={() => del(u.id)} className="text-ink-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

// ── Admin / HQ: Branches ────────────────────────────────────────────────────
export function Branches() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN';
  const branches = useApi<Branch[]>(canEdit ? '/admin/branches' : '/hq/branches');
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState('');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/admin/branches', form);
      setForm({ name: '', address: '', phone: '' });
      setOpen(false);
      await branches.reload();
    } catch (e2) { setErr(apiError(e2)); }
  }

  if (branches.loading) return <Loading />;
  return (
    <div>
      <PageHeader title="Branches" subtitle="Steakz locations" action={canEdit ? <button onClick={() => setOpen((o) => !o)} className="btn btn-primary px-5 py-2.5 text-sm"><Plus size={16} /> {open ? 'Close' : 'New branch'}</button> : undefined} />
      <FormError msg={err} />
      {open && canEdit && (
        <Panel className="mb-6">
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-3">
            <input required placeholder="Name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="Address" className="field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input required placeholder="Phone" className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <button className="btn btn-primary py-3 sm:col-span-3">Create branch</button>
          </form>
        </Panel>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(branches.data ?? []).map((b) => (
          <div key={b.id} className="card p-5">
            <Building2 className="text-brand-500" />
            <p className="mt-2 font-display text-xl font-bold text-ink-900">{b.name}</p>
            <p className="text-sm text-ink-500">{b.address}</p>
            <p className="text-sm text-ink-500">{b.phone}</p>
            {b._count && (
              <div className="mt-3 flex gap-4 border-t border-brand-50 pt-3 text-xs text-ink-500">
                <span>{b._count.users} staff</span>
                <span>{b._count.menuItems} menu</span>
                <span>{b._count.orders} orders</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Branch manager: Menu ────────────────────────────────────────────────────
export function BranchMenu() {
  const menu = useApi<MenuItem[]>('/branch/menu');
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Steaks' });
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState('');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/branch/menu', { ...form, price: Number(form.price) });
      setForm({ name: '', description: '', price: '', category: 'Steaks' });
      setOpen(false);
      await menu.reload();
    } catch (e2) { setErr(apiError(e2)); }
  }
  async function toggle(m: MenuItem) { await api.patch(`/branch/menu/${m.id}`, { available: !m.available }); await menu.reload(); }
  async function del(id: number) {
    try { await api.delete(`/branch/menu/${id}`); await menu.reload(); }
    catch (e2) { setErr(apiError(e2)); }
  }

  if (menu.loading) return <Loading />;
  return (
    <div>
      <PageHeader title="Branch Menu" subtitle="Manage what your branch serves" action={<button onClick={() => setOpen((o) => !o)} className="btn btn-primary px-5 py-2.5 text-sm"><Plus size={16} /> {open ? 'Close' : 'Add item'}</button>} />
      <FormError msg={err} />
      {open && (
        <Panel className="mb-6">
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input required placeholder="Name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="Description" className="field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input required type="number" step="0.01" placeholder="Price" className="field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input required placeholder="Category" className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <button className="btn btn-primary py-3 sm:col-span-2 lg:col-span-4">Add to menu</button>
          </form>
        </Panel>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(menu.data ?? []).map((m) => (
          <div key={m.id} className={`card overflow-hidden ${!m.available ? 'opacity-60' : ''}`}>
            <img src={dishImage(m.image)} alt={m.name} className="h-32 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold text-ink-900">{m.name}</p>
                <span className="font-semibold text-brand-600">{GBP.format(m.price)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-ink-500">{m.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => toggle(m)} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${m.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  <Power size={13} /> {m.available ? 'Available' : 'Hidden'}
                </button>
                <button onClick={() => del(m.id)} className="ml-auto text-ink-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Branch manager: Staff ───────────────────────────────────────────────────
export function BranchStaff() {
  const staff = useApi<User[]>('/branch/staff');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'WAITER' as Role });
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState('');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/branch/staff', form);
      setForm({ name: '', email: '', password: '', role: 'WAITER' });
      setOpen(false);
      await staff.reload();
    } catch (e2) { setErr(apiError(e2)); }
  }

  if (staff.loading) return <Loading />;
  return (
    <div>
      <PageHeader title="Branch Staff" subtitle="Your team" action={<AddButton open={open} onClick={() => setOpen((o) => !o)} label="Add staff" />} />
      <FormError msg={err} />
      {open && (
        <Panel className="mb-6">
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input required placeholder="Full name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" placeholder="Email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required type="password" placeholder="Password (min 6)" className="field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              {STAFF_ROLES.map((r) => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
            </select>
            <button className="btn btn-primary py-3 sm:col-span-2 lg:col-span-4">Add staff member</button>
          </form>
        </Panel>
      )}
      <Panel>
        <div className="divide-y divide-brand-50">
          {(staff.data ?? []).map((u) => (
            <div key={u.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-ink-800">{u.name}</p>
                <p className="text-xs text-ink-500">{u.email}</p>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{ROLE_META[u.role].label}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ── Orders list (branch manager / waiter / HQ) ──────────────────────────────
const FINAL_STATUSES = ['PAID', 'DELIVERED', 'CANCELLED'];

export function OrdersPage() {
  const { user } = useAuth();
  const isManager = user?.role === 'BRANCH_MANAGER';
  const url = user?.role === 'WAITER' ? '/waiter/orders' : user?.role === 'HQ_MANAGER' ? '/hq/orders' : '/branch/orders';
  const orders = useApi<Order[]>(url);
  const staff = useApi<User[]>(isManager ? '/branch/staff' : null);
  const drivers = (staff.data ?? []).filter((u) => u.role === 'DELIVERY');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [err, setErr] = useState('');

  async function run(orderId: number, fn: () => Promise<unknown>) {
    setBusyId(orderId);
    setErr('');
    try {
      await fn();
      await orders.reload();
    } catch (e) {
      setErr(apiError(e));
    } finally {
      setBusyId(null);
    }
  }
  const assign = (orderId: number, driverId: number) => run(orderId, () => api.patch(`/branch/orders/${orderId}/assign`, { driverId }));
  const cancel = (orderId: number) => run(orderId, () => api.patch(`/branch/orders/${orderId}/cancel`));

  if (orders.loading) return <Loading />;
  if (orders.error) return <ErrorNote message={orders.error} />;
  const list = orders.data ?? [];

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${list.length} order${list.length !== 1 ? 's' : ''}`} />
      {err && <div className="mb-4"><ErrorNote message={err} /></div>}
      {list.length === 0 ? (
        <EmptyState icon={Building2} title="No orders yet" />
      ) : (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-left text-ink-500">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Branch</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Items</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                  {isManager && <th className="pb-2 text-right font-medium">Manage</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {list.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2.5 font-medium text-ink-800">{o.id}</td>
                    <td className="py-2.5 text-ink-600">{o.branch?.name}</td>
                    <td className="py-2.5 text-ink-600">{o.type.replace('_', ' ')}</td>
                    <td className="py-2.5 text-ink-600">{o.items.length}</td>
                    <td className="py-2.5"><StatusBadge status={o.status} /></td>
                    <td className="py-2.5 text-right font-semibold">{GBP.format(o.total)}</td>
                    {isManager && (
                      <td className="py-2.5">
                        <div className="flex items-center justify-end gap-2">
                          {o.type === 'DELIVERY' && o.delivery && (
                            <div className="flex items-center gap-1.5">
                              <Bike size={13} className="text-ink-400" />
                              <select
                                disabled={busyId === o.id || ['DELIVERED', 'CANCELLED'].includes(o.status)}
                                value={o.delivery.driver?.id ?? ''}
                                onChange={(e) => e.target.value && assign(o.id, Number(e.target.value))}
                                title="Assign or change the driver"
                                className="rounded-lg border border-ink-300 bg-white px-2 py-1 text-xs text-ink-700 disabled:opacity-60"
                              >
                                <option value="">Assign driver…</option>
                                {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                              </select>
                            </div>
                          )}
                          {!FINAL_STATUSES.includes(o.status) && (
                            <button
                              onClick={() => cancel(o.id)}
                              disabled={busyId === o.id}
                              className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                            >
                              <X size={12} /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
