// src/pages/Dashboard.jsx

import { useNavigate } from "react-router-dom";
import {
  DollarSign, Users, UserPlus, Dumbbell, AlertTriangle,
  Plus, Activity, MessageCircle, Phone,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useApp } from "../hooks/useApp";
import { StatCard } from "../components/ui/Card";
import { formatCurrency, formatDate } from "../utils";
import Button from "../components/ui/Button";

// ── Tooltips ──────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-3 shadow-xl text-xs">
      <p className="font-bold text-brand-text mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

const ClientTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-3 shadow-xl text-xs">
      <p className="font-bold text-brand-text mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  // dashboardData comes from the real API via useApp → dashboardAPI.getStats()
  const { stats, dashboardData } = useApp();
  const navigate = useNavigate();

  // Derive chart data from API response; fall back to [] while loading
  const revenueChartData = dashboardData?.revenue_chart ?? [];
  const clientGrowthData = dashboardData?.client_growth ?? [];
  const activityFeedData = dashboardData?.activity_feed ?? [];

  // Use API stats when available, fall back to computed stats from client list
  const apiStats = dashboardData?.stats;
  const monthlyRevenue = apiStats?.monthly_revenue ?? stats.monthlyRevenue;
  const totalClients = apiStats?.total_clients ?? stats.totalClients;
  const activeClients = apiStats?.active_clients ?? stats.activeClients;
  const newThisMonth = apiStats?.new_this_month ?? stats.newClientsThisMonth;
  const ptClients = apiStats?.pt_clients ?? stats.ptClients;

  // Expiring clients come from the API expiring_clients list (richer data)
  // but fall back to the locally computed list if API not loaded yet
  const expiringClients =
    dashboardData?.expiring_clients ?? stats.expiringClients ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-brand-text tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-brand-subtle mt-0.5">
            Welcome back, Admin — here's what's happening today.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => navigate("/clients?action=add")}>
            <UserPlus size={14} /> Add Client
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate("/trainers?action=add")}>
            <Plus size={14} /> Add Trainer
          </Button>
          <Button size="sm" onClick={() => navigate("/activities?action=add")}>
            <Plus size={14} /> Add Activity
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
          icon={DollarSign}
          iconColor="text-emerald-400"
          trendLabel="this month"
          onClick={() => navigate("/expenses")}
        />
        <StatCard
          title="Total Clients"
          value={totalClients}
          icon={Users}
          iconColor="text-blue-400"
          trendLabel={`${activeClients} active`}
          onClick={() => navigate("/clients")}
        />
        <StatCard
          title="New Clients"
          value={newThisMonth}
          icon={UserPlus}
          iconColor="text-brand-orange"
          trendLabel="this month"
          onClick={() => navigate("/clients")}
        />
        <StatCard
          title="PT Clients"
          value={ptClients}
          icon={Dumbbell}
          iconColor="text-purple-400"
          trendLabel="personal training"
          onClick={() => navigate("/clients")}
        />
        <StatCard
          title="Expiring Soon"
          value={expiringClients.length}
          icon={AlertTriangle}
          iconColor="text-amber-400"
          trendLabel="within 7 days"
          onClick={() => navigate("/clients?filter=expiring")}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart — real data from dashboardData.revenue_chart */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg font-bold text-brand-text">Revenue vs Expenses</h2>
              <p className="text-xs text-brand-subtle mt-0.5">Last 6 months overview</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8001D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E8001D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5500" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF5500" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#888" }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#E8001D" strokeWidth={2} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#FF5500" strokeWidth={2} fill="url(#colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Client Growth — real data from dashboardData.client_growth */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg font-bold text-brand-text">Client Growth</h2>
              <p className="text-xs text-brand-subtle mt-0.5">New members per month</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clientGrowthData} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ClientTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#888" }} />
              <Bar dataKey="new" name="New Clients" fill="#E8001D" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Activity Feed — real data from dashboardData.activity_feed */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-brand-red" />
            <h2 className="font-display text-lg font-bold text-brand-text">Recent Activity</h2>
          </div>
          <div className="space-y-1">
            {activityFeedData.length === 0 ? (
              <p className="text-sm text-brand-subtle text-center py-8">No recent activity yet.</p>
            ) : (
              activityFeedData.map((item, idx) => (
                <div
                  key={`${item.type}-${idx}`}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-brand-surface transition-colors"
                >
                  <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brand-text leading-snug">{item.message}</p>
                    <p className="text-xs text-brand-subtle mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiring memberships — real data from dashboardData.expiring_clients */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="font-display text-lg font-bold text-brand-text">Expiring Soon</h2>
          </div>
          {expiringClients.length === 0 ? (
            <p className="text-sm text-brand-subtle text-center py-8">No expiring memberships 🎉</p>
          ) : (
            <div className="space-y-3">
              {expiringClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-text">{client.name}</p>
                    <p className="text-xs text-brand-subtle mt-0.5">{client.phone}</p>
                    <p className="text-xs text-amber-400 mt-0.5">
                      Expires {formatDate(client.expiry_date ?? client.expiryDate)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <a
                      href={`https://wa.me/91${client.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-green-400 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </a>
                    <a
                      href={`tel:${client.phone}`}
                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 transition-colors"
                      title="Call"
                    >
                      <Phone size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
