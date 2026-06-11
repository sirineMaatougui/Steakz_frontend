import {
  LayoutDashboard,
  Users,
  Building2,
  UtensilsCrossed,
  ClipboardList,
  ChefHat,
  CreditCard,
  Bike,
  ShoppingBag,
  BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Role } from './types';

export const ASSET = {
  logo: '/assets/logo.png',
  hero: '/assets/hero.jpg',
} as const;

const DISH_IMG: Record<string, string> = {
  'ribeye.jpg': '/assets/dishes/ribeye.jpg',
  'filet-mignon.jpg': '/assets/dishes/filet-mignon.jpg',
  'burger.jpg': '/assets/dishes/burger.jpg',
  'prawns.jpg': '/assets/dishes/prawns.jpg',
  'truffle-fries.jpg': '/assets/dishes/truffle-fries.jpg',
  'lava-cake.jpg': '/assets/dishes/lava-cake.jpg',
};

/** Resolve a MenuItem.image filename to a public URL, with a friendly fallback. */
export function dishImage(image: string | null | undefined): string {
  if (!image) return ASSET.hero;
  return DISH_IMG[image] ?? `/assets/dishes/${image}`;
}

/** A branch gets a hero-ish photo for its card. */
export function branchPhoto(name: string): string {
  if (name === 'Manchester') return '/assets/dishes/burger.jpg';
  if (name === 'Leeds') return '/assets/dishes/ribeye.jpg';
  return ASSET.hero;
}

export const GBP = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

export const ROLE_META: Record<Role, { label: string }> = {
  ADMIN: { label: 'Administrator' },
  HQ_MANAGER: { label: 'HQ Manager' },
  BRANCH_MANAGER: { label: 'Branch Manager' },
  CHEF: { label: 'Head Chef' },
  CASHIER: { label: 'Cashier' },
  WAITER: { label: 'Waiter' },
  DELIVERY: { label: 'Delivery Driver' },
  CUSTOMER: { label: 'Guest' },
};

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV: Record<Role, NavItem[]> = {
  ADMIN: [
    { to: '/portal', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/portal/users', label: 'Users', icon: Users },
    { to: '/portal/branches', label: 'Branches', icon: Building2 },
  ],
  HQ_MANAGER: [
    { to: '/portal', label: 'Analytics', icon: BarChart3, end: true },
    { to: '/portal/branches', label: 'Branches', icon: Building2 },
  ],
  BRANCH_MANAGER: [
    { to: '/portal', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/portal/orders', label: 'Orders', icon: ClipboardList },
    { to: '/portal/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/portal/staff', label: 'Staff', icon: Users },
  ],
  WAITER: [
    { to: '/portal', label: 'New Order', icon: UtensilsCrossed, end: true },
    { to: '/portal/orders', label: 'Floor Orders', icon: ClipboardList },
  ],
  CHEF: [{ to: '/portal', label: 'Kitchen', icon: ChefHat, end: true }],
  CASHIER: [{ to: '/portal', label: 'Till', icon: CreditCard, end: true }],
  DELIVERY: [{ to: '/portal', label: 'Deliveries', icon: Bike, end: true }],
  CUSTOMER: [
    { to: '/portal', label: 'Order Food', icon: ShoppingBag, end: true },
    { to: '/portal/my-orders', label: 'My Orders', icon: ClipboardList },
  ],
};
