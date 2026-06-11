import { Link } from 'react-router-dom';
import { Flame, Clock, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GBP, ASSET } from '../lib/data';
import { Logo } from '../components/ui';

const DISHES = [
  { name: 'Ribeye Steak', price: 24.5, img: '/assets/dishes/ribeye.jpg', tag: 'Steaks' },
  { name: 'Filet Mignon', price: 28, img: '/assets/dishes/filet-mignon.jpg', tag: 'Steaks' },
  { name: 'Steakz Burger', price: 13.5, img: '/assets/dishes/burger.jpg', tag: 'Burgers' },
  { name: 'Garlic Prawns', price: 11, img: '/assets/dishes/prawns.jpg', tag: 'Starters' },
  { name: 'Truffle Fries', price: 6.5, img: '/assets/dishes/truffle-fries.jpg', tag: 'Sides' },
  { name: 'Chocolate Lava Cake', price: 7, img: '/assets/dishes/lava-cake.jpg', tag: 'Dessert' },
];

const BENEFITS = [
  { icon: Flame, title: 'Flame-grilled fresh', text: 'Every cut cooked to order over an open flame, never frozen.' },
  { icon: Clock, title: 'Ready in minutes', text: 'Order online for collection or delivery from your nearest branch.' },
  { icon: MapPin, title: 'Two UK branches', text: 'Now serving Manchester and Leeds, with more on the way.' },
];

export default function Landing() {
  const { user } = useAuth();
  const orderTo = user ? '/portal' : '/register';

  return (
    <div className="bg-paper">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-ghost px-4 py-2 text-sm">Sign in</Link>
            <Link to={orderTo} className="btn btn-primary px-4 py-2 text-sm"><ShoppingBag size={15} /> Order now</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div className="fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-600">
            <Flame size={15} /> Fresh · Flame-grilled · Fast
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
            Steak nights, <span className="text-brand-500">made simple.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-600">
            Order your favourite flame-grilled steaks, burgers and sides online — ready for collection
            or delivered straight to your door.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={orderTo} className="btn btn-primary px-6 py-3"><ShoppingBag size={18} /> {user ? 'Go to portal' : 'Start your order'}</Link>
            <a href="#menu" className="btn btn-ghost px-6 py-3">View the menu <ArrowRight size={16} /></a>
          </div>
        </div>
        <div className="fade-up overflow-hidden rounded-3xl border border-brand-100 shadow-xl shadow-brand-500/10">
          <img src={ASSET.hero} alt="Steakz food" className="h-full w-full object-cover" />
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <b.icon size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{b.title}</h3>
              <p className="mt-1 text-sm text-ink-600">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu preview */}
      <section id="menu" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-extrabold text-ink-900">Our favourites</h2>
          <p className="mt-2 text-ink-600">A taste of what's waiting on the Steakz menu.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DISHES.map((d) => (
            <div key={d.name} className="card overflow-hidden">
              <img src={d.img} alt={d.name} className="h-48 w-full object-cover" />
              <div className="flex items-center justify-between p-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">{d.tag}</span>
                  <p className="font-display text-lg font-bold text-ink-900">{d.name}</p>
                </div>
                <span className="font-display text-lg font-bold text-brand-600">{GBP.format(d.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-brand-500 px-8 py-12 text-center text-white">
          <h2 className="font-display text-3xl font-extrabold">Hungry yet?</h2>
          <p className="mx-auto mt-2 max-w-md text-white/90">
            Create a free account and order from Steakz Manchester or Leeds in just a few taps.
          </p>
          <Link to={orderTo} className="btn mt-6 bg-white px-7 py-3 text-brand-600 hover:bg-brand-50">
            <ShoppingBag size={18} /> {user ? 'Go to portal' : 'Order online'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-ink-500 sm:flex-row sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} Steakz UK · Manchester & Leeds</p>
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">Staff & member sign in</Link>
        </div>
      </footer>
    </div>
  );
}
