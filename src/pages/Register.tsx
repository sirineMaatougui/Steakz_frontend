import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import { Logo } from '../components/ui';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      await register(email, password, name);
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
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Create your account</h1>
          <p className="mt-1 text-ink-500">Join Steakz and start ordering in minutes.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Full name</span>
              <input required className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Email</span>
              <input type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Password</span>
              <input type="password" required className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </label>

            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
