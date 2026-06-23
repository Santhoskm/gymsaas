import { useState } from "react";
import { Menu, Bell, Search, X, LogOut } from "lucide-react";
import { useApp } from "../../hooks/useApp";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "../ui/Avatar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar({ onMenuClick }) {
  const { stats } = useApp();
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const notifications = [
    ...stats.expiringClients.map((c) => ({
      id: c.id,
      type: "warning",
      message: `${c.name}'s membership is expiring soon`,
    })),
    ...stats.expiredClients.map((c) => ({
      id: `exp-${c.id}`,
      type: "error",
      message: `${c.name}'s membership has expired`,
    })),
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Call logout API
      const response = await fetch("http://192.168.1.11:8000/api/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Logout response:", data);

      if (response.ok) {
        toast.success(data.message || "Logged out successfully!");
      } else {
        // Even if API fails, still logout locally
        console.warn("Logout API error:", data);
        toast.success("Logged out successfully!");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if API fails
      toast.success("Logged out successfully!");
    } finally {
      // Clear local storage and auth state
      logout();
      setLoggingOut(false);
      navigate("/login");
    }
  };

  return (
    <header className="h-16 bg-brand-surface border-b border-brand-border px-4 lg:px-6 flex items-center gap-4 sticky top-0 z-20">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-brand-card text-brand-subtle hover:text-brand-text transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:flex">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle" />
          <input
            type="text"
            placeholder="Search clients, trainers..."
            className="w-full bg-brand-card border border-brand-border rounded-lg pl-9 pr-4 py-2 text-sm text-brand-text placeholder-brand-subtle focus:outline-none focus:border-brand-red transition-colors"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-brand-card text-brand-subtle hover:text-brand-text transition-colors"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full animate-pulse-red" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-50 animate-slide-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
                <h3 className="font-display font-bold text-brand-text">Notifications</h3>
                <span className="badge bg-brand-red/10 text-brand-red border border-brand-red/20">
                  {notifications.length}
                </span>
                <button onClick={() => setShowNotifications(false)} className="ml-auto p-1 rounded hover:bg-brand-card">
                  <X size={14} className="text-brand-subtle" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-brand-subtle text-sm py-6">All clear!</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 border-b border-brand-border/50 last:border-0 hover:bg-brand-card/50 transition-colors">
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.type === "warning" ? "bg-amber-400" : "bg-red-400"}`} />
                        <p className="text-sm text-brand-text leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-brand-border" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 cursor-pointer hover:bg-brand-card rounded-lg px-2 py-1.5 transition-colors"
          >
            <Avatar name="Admin User" size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-brand-text leading-none">Admin</p>
              <p className="text-xs text-brand-subtle mt-0.5">Owner</p>
            </div>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-12 w-56 bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-50 animate-slide-in overflow-hidden">
                <div className="px-4 py-3 border-b border-brand-border">
                  <p className="text-sm font-medium text-brand-text">Admin User</p>
                  <p className="text-xs text-brand-subtle">admin@gymflow.com</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/profile");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-brand-text hover:bg-brand-card transition-colors flex items-center gap-2"
                  >
                    <span className="text-base">👤</span>
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/settings");
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-brand-text hover:bg-brand-card transition-colors flex items-center gap-2"
                  >
                    <span className="text-base">⚙️</span>
                    Settings
                  </button>
                  <hr className="my-2 border-brand-border" />
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loggingOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut size={16} />
                        Logout
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}