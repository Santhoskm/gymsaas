import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCheck, Receipt, Dumbbell, X, Zap
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/trainers", label: "Trainers", icon: UserCheck },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/activities", label: "Activities", icon: Dumbbell },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-brand-surface border-r border-brand-border z-40 flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <div>
              <span className="font-display text-xl font-black text-brand-text tracking-tight">GYM</span>
              <span className="font-display text-xl font-black text-brand-red tracking-tight">FLOW</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-brand-card text-brand-subtle">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-brand-muted font-semibold uppercase tracking-widest px-4 mb-3">
            Main Menu
          </p>
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={`sidebar-link ${active ? "active" : ""}`}
              >
                <Icon size={17} />
                <span>{label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-red" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-brand-border">
          <div className="bg-gradient-to-r from-brand-red/10 to-brand-orange/10 border border-brand-red/20 rounded-xl p-4">
            <p className="text-xs font-bold text-brand-text mb-1">GymFlow Pro</p>
            <p className="text-[11px] text-brand-subtle leading-relaxed">
              Manage your gym like a pro with advanced analytics
            </p>
            <div className="mt-3 w-full bg-brand-muted rounded-full h-1">
              <div className="w-3/4 h-1 rounded-full bg-gradient-to-r from-brand-red to-brand-orange" />
            </div>
            <p className="text-[10px] text-brand-subtle mt-1">75% storage used</p>
          </div>
        </div>
      </aside>
    </>
  );
}
