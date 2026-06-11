import { Building2, Users, PoundSterling, ClipboardList, TrendingUp, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../lib/useApi';
import { GBP } from '../../lib/data';
import { StatCard, Panel, Loading, ErrorNote, PageHeader, StatusBadge, BarList } from '../../components/ui';
import type { ChainReport, BranchReport, Order, User } from '../../lib/types';

function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <Panel title="Recent orders">
      {orders.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-500">No orders yet.</p>
      ) : (
        <div className="divide-y divide-brand-50">
          {orders.slice(0, 6).map((o) => (
            <div key={o.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="font-medium text-ink-800">#{o.id} · {o.branch?.name ?? '—'}</p>
                <p className="text-xs text-ink-500">{o.items.length} item{o.items.length !== 1 ? 's' : ''} · {o.type.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-semibold text-ink-900">{GBP.format(o.total)}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function AdminHome() {
  const { user } = useAuth();
  const chain = useApi<ChainReport>('/hq/reports/chain');
  const users = useApi<User[]>('/admin/users');
  const orders = useApi<Order[]>('/hq/orders');

  if (chain.loading) return <Loading />;
  if (chain.error) return <ErrorNote message={chain.error} />;
  const c = chain.data!;

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.name.split(' ')[0]}`} subtitle="Chain-wide control centre" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Branches" value={c.branchCount} />
        <StatCard icon={Users} label="Users" value={users.data?.length ?? '—'} />
        <StatCard icon={PoundSterling} label="Chain Revenue" value={GBP.format(c.totals.revenue)} />
        <StatCard icon={ClipboardList} label="Total Orders" value={c.totals.orders} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Revenue by branch">
          <BarList data={c.perBranch.map((b) => ({ label: b.branch, value: b.revenue, sub: GBP.format(b.revenue) }))} />
        </Panel>
        <RecentOrders orders={orders.data ?? []} />
      </div>
    </div>
  );
}

export function HQHome() {
  const chain = useApi<ChainReport>('/hq/reports/chain');
  const orders = useApi<Order[]>('/hq/orders');

  if (chain.loading) return <Loading />;
  if (chain.error) return <ErrorNote message={chain.error} />;
  const c = chain.data!;

  return (
    <div>
      <PageHeader title="Chain Analytics" subtitle="Performance across every Steakz branch" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={PoundSterling} label="Total Revenue" value={GBP.format(c.totals.revenue)} />
        <StatCard icon={ClipboardList} label="Total Orders" value={c.totals.orders} />
        <StatCard icon={TrendingUp} label="Avg / Branch" value={GBP.format(c.totals.revenue / Math.max(1, c.branchCount))} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Revenue by branch">
          <BarList data={c.perBranch.map((b) => ({ label: b.branch, value: b.revenue, sub: GBP.format(b.revenue) }))} />
        </Panel>
        <Panel title="Orders by branch">
          <BarList data={c.perBranch.map((b) => ({ label: b.branch, value: b.orders, sub: `${b.orders} orders` }))} />
        </Panel>
      </div>
      <div className="mt-6">
        <RecentOrders orders={orders.data ?? []} />
      </div>
    </div>
  );
}

export function BranchHome() {
  const { user } = useAuth();
  const report = useApi<BranchReport>('/branch/report');
  const orders = useApi<Order[]>('/branch/orders');

  if (report.loading) return <Loading />;
  if (report.error) return <ErrorNote message={report.error} />;
  const r = report.data!;
  const active = (orders.data ?? []).filter((o) => ['PENDING', 'PREPARING', 'READY'].includes(o.status)).length;

  return (
    <div>
      <PageHeader title="Branch Dashboard" subtitle={`${user?.name} · live performance`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Total Orders" value={r.totalOrders} />
        <StatCard icon={PoundSterling} label="Revenue" value={GBP.format(r.totalRevenue)} />
        <StatCard icon={TrendingUp} label="Active Now" value={active} />
        <StatCard icon={Star} label="Top Seller" value={r.topItems[0]?.name ?? '—'} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Top sellers">
          <BarList data={r.topItems.map((t) => ({ label: t.name, value: t.quantity, sub: `${t.quantity} sold` }))} />
        </Panel>
        <Panel title="Orders by status">
          <BarList data={r.ordersByStatus.map((s) => ({ label: s.status.replace(/_/g, ' '), value: s.count }))} />
        </Panel>
      </div>
      <div className="mt-6">
        <RecentOrders orders={orders.data ?? []} />
      </div>
    </div>
  );
}
