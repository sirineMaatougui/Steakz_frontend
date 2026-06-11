import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import { Logo } from '../components/ui';

const STAFF_PW = 'Steakz@123';
const branchAccounts = (slug: string) => [
  { role: 'Manager', email: `manager.${slug}@steakz.co.uk`, pw: STAFF_PW },
  { role: 'Chef', email: `chef.${slug}@steakz.co.uk`, pw: STAFF_PW },
  { role: 'Cashier', email: `cashier.${slug}@steakz.co.uk`, pw: STAFF_PW },
  { role: 'Waiter', email: `waiter.${slug}@steakz.co.uk`, pw: STAFF_PW },
  { role: 'Driver', email: `driver.${slug}@steakz.co.uk`, pw: STAFF_PW },
];

const DEMO_GROUPS = [
  {
    group: 'Global',
    accounts: [
      { role: 'Admin', email: 'admin@steakz.co.uk', pw: 'Admin@12345' },
      { role: 'HQ Manager', email: 'hq@steakz.co.uk', pw: STAFF_PW },
      { role: 'Customer', email: 'alice@example.com', pw: 'Customer@123' },
    ],
  },
  { group: 'Manchester', accounts: branchAccounts('manchester') },
  { group: 'Leeds', accounts: branchAccounts('leeds') },
];

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/portal" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/portal');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-paper-2 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <Link to="/" className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600">
            <ArrowLeft size={15} /> Home
          </Link>
        </div>

        <div className="card p-7">
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Welcome back</h1>
          <p className="mt-1 text-ink-500">Sign in to your Steakz account.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Email</span>
              <input type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Password</span>
              <input type="password" required className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </label>

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-600">
            New here?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">Create an account</Link>
          </p>
        </div>

        <div className="card mt-5 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-400">Demo accounts — tap to fill</p>
          <div className="space-y-3">
            {DEMO_GROUPS.map((g) => (
              <div key={g.group}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{g.group}</p>
                <div className="flex flex-wrap gap-2">
                  {g.accounts.map((d) => (
                    <button
                      key={d.email}
                      onClick={() => { setEmail(d.email); setPassword(d.pw); }}
                      className="rounded-full border border-brand-100 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-400 hover:text-brand-600"
                    >
                      {d.role}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
