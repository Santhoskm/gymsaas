import { TrendingUp, TrendingDown } from "lucide-react";

export function Card({ children, className = "", onClick }) {
  return (
    <div
      className={`card ${onClick ? "cursor-pointer hover:border-brand-muted transition-colors" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColor = "text-brand-red", trend, trendLabel, onClick }) {
  const isPositive = trend >= 0;
  return (
    <div className="stat-card group animate-fade-in" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-brand-surface ${iconColor.replace("text-", "border-").replace("400", "500/20")} border`}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-xs text-brand-subtle uppercase tracking-wider font-medium mb-1">{title}</p>
        <p className="font-display text-3xl font-bold text-brand-text leading-none">{value}</p>
        {subtitle && <p className="text-xs text-brand-subtle mt-1.5">{subtitle}</p>}
        {trendLabel && <p className="text-xs text-brand-subtle mt-1">{trendLabel}</p>}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-brand-card rounded-2xl mb-4">
        <Icon size={32} className="text-brand-muted" />
      </div>
      <h3 className="font-display text-xl font-bold text-brand-text mb-2">{title}</h3>
      <p className="text-sm text-brand-subtle max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}
