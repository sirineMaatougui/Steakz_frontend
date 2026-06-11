import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NAV, ROLE_META } from '../lib/data';
import { Logo } from './ui';

export function PortalLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const items = NAV[user.role];

  return (
    <div className="min-h-screen bg-paper">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-brand-500 text-white' : 'text-ink-600 hover:bg-brand-50 hover:text-brand-600'
                    }`
                  }
                >
                  <it.icon size={16} /> {it.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ink-900">{user.name}</p>
              <p className="text-xs text-ink-500">{ROLE_META[user.role].label}</p>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="grid h-9 w-9 place-items-center rounded-full border border-brand-100 text-ink-500 hover:border-brand-400 hover:text-brand-600"
            >
              <LogOut size={16} />
            </button>
            <button onClick={() => setOpen((o) => !o)} className="grid h-9 w-9 place-items-center rounded-full border border-brand-100 text-ink-600 md:hidden">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <nav className="border-t border-brand-100 bg-white px-4 py-3 md:hidden">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    isActive ? 'bg-brand-500 text-white' : 'text-ink-700'
                  }`
                }
              >
                <it.icon size={16} /> {it.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
