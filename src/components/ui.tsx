import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ASSET } from '../lib/data';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="/" className="flex items-center gap-2">
      <img src={ASSET.logo} alt="Steakz" className="h-9 w-9 rounded-lg object-cover" />
      <span className={`font-display text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink-900'}`}>
        Steakz
      </span>
    </a>
  );
}

export function Loading() {
  return (
    <div className="grid place-items-center py-20 text-brand-500">
      <Loader2 className="animate-spin" size={28} />
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {message}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function Panel({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`card p-5 ${className}`}>
      {title && <h3 className="mb-4 font-display text-lg font-bold text-ink-900">{title}</h3>}
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-ink-500">{label}</p>
        <p className="font-display text-2xl font-bold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PREPARING: 'bg-blue-100 text-blue-700',
  READY: 'bg-violet-100 text-violet-700',
  SERVED: 'bg-teal-100 text-teal-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  ASSIGNED: 'bg-amber-100 text-amber-700',
  CANCELLED: 'bg-slate-200 text-slate-600',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="card grid place-items-center gap-2 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon size={26} />
      </div>
      <p className="font-display text-lg font-bold text-ink-900">{title}</p>
      {hint && <p className="text-sm text-ink-500">{hint}</p>}
    </div>
  );
}

/** Simple horizontal bar list — our lightweight stand-in for a chart. */
export function BarList({ data }: { data: { label: string; value: number; sub?: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <p className="py-6 text-center text-sm text-ink-500">No data yet.</p>;
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-ink-700">{d.label}</span>
            <span className="text-ink-500">{d.sub ?? d.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-brand-50">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
