import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  ...props
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-red-400 font-body font-medium text-sm px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2",
  };
  const sizes = {
    sm: "!px-3 !py-1.5 !text-xs",
    md: "",
    lg: "!px-6 !py-3 !text-base",
  };

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
