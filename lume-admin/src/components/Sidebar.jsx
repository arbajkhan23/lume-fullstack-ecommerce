import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Heart,
  Tag,
  Percent,
  Image,
  MessageSquare,
  X,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/customers', label: 'Customers', icon: Users },

  // Wishlist
  { to: '/wishlist', label: 'Wishlist', icon: Heart },

  { to: '/coupons', label: 'Coupons', icon: Tag },
  { to: '/deals', label: 'Deals', icon: Percent },
  { to: '/banners', label: 'Banners', icon: Image },
  { to: '/contacts', label: 'Messages', icon: MessageSquare },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-surface border-r border-border z-50
        transform transition-transform duration-300 flex flex-col
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-border">
          <span className="font-display text-xl tracking-wide">
            LUM<span className="text-accent">É</span>
            <span className="text-muted text-xs font-sans ml-2 align-middle">
              ADMIN
            </span>
          </span>

          <button
            className="lg:hidden text-muted"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted hover:text-white hover:bg-surface2'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-border text-xs text-muted">
          LUMÉ Studio &copy; {new Date().getFullYear()}
        </div>
      </aside>
    </>
  );
}