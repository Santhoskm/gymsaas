// import { useState } from "react";
// import { Input, Select, Toggle } from "../ui/Input";
// import Button from "../ui/Button";
// const { trainers, packages } = useApp();
// import { useApp } from "../../hooks/useApp";

// const defaultForm = {
//   name: "", phone: "", email: "", address: "",
//   joinDate: new Date().toISOString().split("T")[0],
//   expiryDate: "", packageId: "", trainerId: "",
//   personalTraining: false, photo: null,
// };

// export default function ClientForm({ initial = {}, onSubmit, onCancel, loading }) {
//   const { trainers } = useApp();
//   const [form, setForm] = useState({ ...defaultForm, ...initial });
//   const [errors, setErrors] = useState({});

//   const set = (key, val) => {
//     setForm((p) => ({ ...p, [key]: val }));
//     if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
//   };

//   const validate = () => {
//     const e = {};
//     if (!form.name.trim()) e.name = "Name is required";
//     if (!form.phone.trim()) e.phone = "Phone is required";
//     if (!form.joinDate) e.joinDate = "Join date is required";
//     if (!form.expiryDate) e.expiryDate = "Expiry date is required";
//     if (!form.packageId) e.packageId = "Package is required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validate()) return;
//     onSubmit({
//       ...form,
//       packageId: Number(form.packageId),
//       trainerId: form.trainerId ? Number(form.trainerId) : null,
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Input label="Full Name *" placeholder="Enter client name" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
//         <Input label="Phone *" placeholder="10-digit number" value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Input label="Email" placeholder="email@example.com" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
//         <Input label="Address" placeholder="City, Area" value={form.address} onChange={(e) => set("address", e.target.value)} />
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Input label="Join Date *" type="date" value={form.joinDate} onChange={(e) => set("joinDate", e.target.value)} error={errors.joinDate} />
//         <Input label="Expiry Date *" type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} error={errors.expiryDate} />
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Select label="Package *" value={form.packageId} onChange={(e) => set("packageId", e.target.value)} error={errors.packageId}>
//           <option value="">Select package</option>
//           {packages.map((p) => (
//             <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>
//           ))}
//         </Select>
//         <Select label="Trainer" value={form.trainerId} onChange={(e) => set("trainerId", e.target.value)}>
//           <option value="">No trainer assigned</option>
//           {trainers.filter((t) => t.status === "active").map((t) => (
//             <option key={t.id} value={t.id}>{t.name}</option>
//           ))}
//         </Select>
//       </div>
//       <div className="py-1">
//         <Toggle label="Personal Training" checked={form.personalTraining} onChange={(v) => set("personalTraining", v)} />
//       </div>
//       <div className="flex justify-end gap-3 pt-2 border-t border-brand-border mt-2">
//         <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
//         <Button type="submit" loading={loading}>
//           {initial.id ? "Save Changes" : "Add Client"}
//         </Button>
//       </div>
//     </form>
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