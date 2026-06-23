// export const getPackageName = (packageId, packages = []) =>
//   packages.find((p) => p.id === packageId)?.name || '—';

// export const getTrainerName = (trainerId, trainers = []) =>
//   trainers.find((t) => t.id === trainerId)?.name || '—';

// export const formatCurrency = (amount) =>
//   new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

// export const formatDate = (dateStr) => {
//   if (!dateStr) return "—";
//   return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// };

// export const daysUntilExpiry = (expiryDate) => {
//   const today = new Date();
//   const expiry = new Date(expiryDate);
//   const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
//   return diff;
// };

// export const getMembershipStatus = (expiryDate) => {
//   const days = daysUntilExpiry(expiryDate);
//   if (days < 0) return "expired";
//   if (days <= 7) return "expiring";
//   return "active";
// };


// export const statusColors = {
//   active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
//   expiring: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
//   expired: "bg-red-500/10 text-red-400 border border-red-500/20",
//   inactive: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
// };

// export const initials = (name) =>
//   name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

// export const avatarColor = (name) => {
//   const colors = [
//     "from-red-500 to-orange-500",
//     "from-orange-500 to-amber-500",
//     "from-purple-500 to-pink-500",
//     "from-blue-500 to-cyan-500",
//     "from-emerald-500 to-teal-500",
//   ];
//   const idx = name.charCodeAt(0) % colors.length;
//   return colors[idx];
// };
// src/utils/index.js

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const daysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

export const getMembershipStatus = (expiryDate) => {
  const days = daysUntilExpiry(expiryDate);
  if (days < 0) return "expired";
  if (days <= 7) return "expiring";
  return "active";
};

// Pass the live arrays from useApp() — no more hardcoded imports
export const getPackageName = (packageId, packages = []) =>
  packages.find((p) => p.id === packageId)?.name || "—";

export const getTrainerName = (trainerId, trainers = []) =>
  trainers.find((t) => t.id === trainerId)?.name || "—";

export const statusColors = {
  active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  expiring: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  expired: "bg-red-500/10 text-red-400 border border-red-500/20",
  inactive: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
};

export const initials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const avatarColor = (name) => {
  const colors = [
    "from-red-500 to-orange-500",
    "from-orange-500 to-amber-500",
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
  ];
  return colors[name.charCodeAt(0) % colors.length];
};