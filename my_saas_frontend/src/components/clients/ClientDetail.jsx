// import { useState } from "react";
// import { Phone, Mail, MapPin, Calendar, Edit2, Trash2, MessageCircle, CheckCircle } from "lucide-react";
// import Avatar from "../ui/Avatar";
// import { Badge } from "../ui/Table";
// import Button from "../ui/Button";
// import { formatCurrency, formatDate, getPackageName, getTrainerName, daysUntilExpiry } from "../../utils";

// export default function ClientDetail({ client, onEdit, onDelete }) {
//   const days = daysUntilExpiry(client.expiryDate);

//   return (
//     <div className="space-y-5 animate-fade-in">
//       {/* Profile header */}
//       <div className="flex items-start gap-4 p-4 bg-brand-surface rounded-xl border border-brand-border">
//         <Avatar name={client.name} size="lg" photo={client.photo} />
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2 flex-wrap">
//             <h3 className="font-display text-xl font-bold text-brand-text">{client.name}</h3>
//             <Badge status={client.status} />
//             {client.personalTraining && (
//               <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">PT</span>
//             )}
//           </div>
//           <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-4 mt-2">
//             <span className="flex items-center gap-1.5 text-sm text-brand-subtle">
//               <Phone size={13} /> {client.phone}
//             </span>
//             {client.email && (
//               <span className="flex items-center gap-1.5 text-sm text-brand-subtle">
//                 <Mail size={13} /> {client.email}
//               </span>
//             )}
//           </div>
//           {client.address && (
//             <span className="flex items-center gap-1.5 text-sm text-brand-subtle mt-1">
//               <MapPin size={13} /> {client.address}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Membership details */}
//       <div className="grid grid-cols-2 gap-3">
//         {[
//           { label: "Package", value: getPackageName(client.packageId, packages), icon: CheckCircle },
//           { label: "Trainer", value: getTrainerName(client.trainerId, trainers) || "None", icon: null },
//           { label: "Joined", value: formatDate(client.joinDate), icon: Calendar },
//           { label: "Expires", value: formatDate(client.expiryDate), icon: Calendar },
//         ].map(({ label, value }) => (
//           <div key={label} className="bg-brand-surface rounded-xl border border-brand-border p-3">
//             <p className="text-[10px] text-brand-subtle uppercase tracking-wider font-medium">{label}</p>
//             <p className="text-sm font-medium text-brand-text mt-1">{value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Expiry alert */}
//       {(client.status === "expiring" || client.status === "expired") && (
//         <div className={`flex items-center justify-between p-4 rounded-xl border ${client.status === "expired"
//           ? "bg-red-500/5 border-red-500/30"
//           : "bg-amber-500/5 border-amber-500/30"
//           }`}>
//           <div>
//             <p className={`text-sm font-semibold ${client.status === "expired" ? "text-red-400" : "text-amber-400"}`}>
//               {client.status === "expired" ? "Membership Expired" : `Expires in ${days} day${days !== 1 ? "s" : ""}`}
//             </p>
//             <p className="text-xs text-brand-subtle mt-0.5">Send a reminder to renew</p>
//           </div>
//           <div className="flex gap-2">
//             <button className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-green-400 text-xs font-medium transition-colors">
//               <MessageCircle size={12} /> WhatsApp
//             </button>
//             <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-medium transition-colors">
//               <Phone size={12} /> Call
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Payment history */}
//       <div>
//         <h4 className="font-display font-bold text-brand-text mb-3 text-base">Payment History</h4>
//         {client.payments?.length === 0 ? (
//           <p className="text-sm text-brand-subtle text-center py-4">No payments recorded</p>
//         ) : (
//           <div className="space-y-2">
//             {client.payments?.map((payment) => (
//               <div key={payment.id} className="flex items-center justify-between px-4 py-3 bg-brand-surface border border-brand-border rounded-xl">
//                 <div>
//                   <p className="text-sm font-medium text-brand-text">{payment.note}</p>
//                   <p className="text-xs text-brand-subtle mt-0.5">{formatDate(payment.date)} · {payment.method}</p>
//                 </div>
//                 <span className="font-display font-bold text-emerald-400 text-base">
//                   {formatCurrency(payment.amount)}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Actions */}
//       <div className="flex justify-between pt-2 border-t border-brand-border">
//         <Button variant="danger" size="sm" onClick={() => onDelete(client.id)}>
//           <Trash2 size={13} /> Delete
//         </Button>
//         <Button size="sm" onClick={() => onEdit(client)}>
//           <Edit2 size={13} /> Edit Client
//         </Button>
//       </div>
//     </div>
//   );
// }


// src/components/clients/ClientForm.jsx

import { useState } from "react";
import { Input, Select, Toggle } from "../ui/Input";
import Button from "../ui/Button";
import { useApp } from "../../hooks/useApp";

const defaultForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  joinDate: new Date().toISOString().split("T")[0],
  expiryDate: "",
  packageId: "",
  programPackageId: "",
  trainerId: "",
  personalTraining: false,
  photo: null,
};

export default function ClientForm({
  initial = {},
  onSubmit,
  onCancel,
  loading,
}) {
  const { trainers, packages, programs } = useApp();

  // Find which program the initial program_package belongs to (for edit mode)
  const initialProgramId = (() => {
    if (!initial.programPackageId) return "";
    const prog = programs.find((p) =>
      p.packages?.some((pk) => pk.id === initial.programPackageId)
    );
    return prog ? String(prog.id) : "";
  })();

  const [form, setForm] = useState({
    ...defaultForm,
    ...initial,
    // normalize fields coming from the backend (edit mode)
    packageId: initial.packageId ? String(initial.packageId) : "",
    programPackageId: initial.programPackageId
      ? String(initial.programPackageId)
      : "",
    trainerId: initial.trainerId ? String(initial.trainerId) : "",
  });
  const [selectedProgramId, setSelectedProgramId] = useState(initialProgramId);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  // Packages under the currently selected program
  const programPackages = selectedProgramId
    ? programs.find((p) => p.id === Number(selectedProgramId))?.packages || []
    : [];

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.joinDate) e.joinDate = "Join date is required";
    if (!form.expiryDate) e.expiryDate = "Expiry date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      packageId: form.packageId ? Number(form.packageId) : null,
      programPackageId: form.programPackageId
        ? Number(form.programPackageId)
        : null,
      trainerId: form.trainerId ? Number(form.trainerId) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          placeholder="Enter client name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={errors.name}
        />
        <Input
          label="Phone *"
          placeholder="10-digit number"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          error={errors.phone}
        />
      </div>

      {/* Email & Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email"
          placeholder="email@example.com"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <Input
          label="Address"
          placeholder="City, Area"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Join Date *"
          type="date"
          value={form.joinDate}
          onChange={(e) => set("joinDate", e.target.value)}
          error={errors.joinDate}
        />
        <Input
          label="Expiry Date *"
          type="date"
          value={form.expiryDate}
          onChange={(e) => set("expiryDate", e.target.value)}
          error={errors.expiryDate}
        />
      </div>

      {/* Membership Package & Trainer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Membership Package"
          value={form.packageId}
          onChange={(e) => set("packageId", e.target.value)}
          error={errors.packageId}
        >
          <option value="">No package</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — ₹{p.price}
            </option>
          ))}
        </Select>

        <Select
          label="Trainer"
          value={form.trainerId}
          onChange={(e) => set("trainerId", e.target.value)}
        >
          <option value="">No trainer assigned</option>
          {trainers
            .filter((t) => t.status === "active")
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </Select>
      </div>

      {/* Program & Program Package */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Program"
          value={selectedProgramId}
          onChange={(e) => {
            setSelectedProgramId(e.target.value);
            set("programPackageId", ""); // reset package when program changes
          }}
        >
          <option value="">No program</option>
          {programs
            .filter((p) => p.is_active)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon ? `${p.icon} ` : ""}
                {p.name}
              </option>
            ))}
        </Select>

        <Select
          label="Program Package"
          value={form.programPackageId}
          onChange={(e) => set("programPackageId", e.target.value)}
          disabled={!selectedProgramId || programPackages.length === 0}
        >
          <option value="">
            {!selectedProgramId
              ? "Select a program first"
              : programPackages.length === 0
                ? "No packages available"
                : "Select package"}
          </option>
          {programPackages.map((pp) => (
            <option key={pp.id} value={pp.id}>
              {pp.name} — {pp.duration_months}mo — ₹{pp.price}
            </option>
          ))}
        </Select>
      </div>

      {/* Personal Training toggle */}
      <div className="py-1">
        <Toggle
          label="Personal Training"
          checked={form.personalTraining}
          onChange={(v) => set("personalTraining", v)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-brand-border mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initial.id ? "Save Changes" : "Add Client"}
        </Button>
      </div>
    </form>
  );
}