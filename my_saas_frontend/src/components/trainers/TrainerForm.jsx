// import { useState } from "react";
// import { Input, Select } from "../ui/Input";
// import Button from "../ui/Button";

// const defaultForm = {
//   name: "", phone: "", email: "", specialty: "",
//   salary: "", status: "active", photo: null,
// };

// const specialties = [
//   "Strength & Conditioning", "Yoga & Flexibility", "Boxing & MMA",
//   "Cardio & Zumba", "Powerlifting", "CrossFit", "Swimming",
//   "Nutrition & Diet", "Rehabilitation", "Other",
// ];

// export default function TrainerForm({ initial = {}, onSubmit, onCancel, loading }) {
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
//     if (!form.specialty) e.specialty = "Specialty is required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validate()) return;
//     onSubmit({ ...form, salary: form.salary ? Number(form.salary) : 0 });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Input label="Full Name *" placeholder="Trainer name" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
//         <Input label="Phone *" placeholder="10-digit number" value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Input label="Email" placeholder="trainer@gym.com" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
//         <Input label="Monthly Salary (₹)" placeholder="e.g. 25000" type="number" value={form.salary} onChange={(e) => set("salary", e.target.value)} />
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Select label="Specialty *" value={form.specialty} onChange={(e) => set("specialty", e.target.value)} error={errors.specialty}>
//           <option value="">Select specialty</option>
//           {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
//         </Select>
//         <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//         </Select>
//       </div>
//       <div className="flex justify-end gap-3 pt-2 border-t border-brand-border">
//         <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
//         <Button type="submit" loading={loading}>
//           {initial.id ? "Save Changes" : "Add Trainer"}
//         </Button>
//       </div>
//     </form>
//   );
// }
// src/components/trainers/TrainerForm.jsx

import { useState } from "react";
import { Input, Select, Toggle } from "../ui/Input";
import Button from "../ui/Button";

const defaultForm = {
  name: "",
  phone: "",
  email: "",
  specialty: "",
  salary: "",
  status: "active",
  offers_personal_training: false,
  photo: null,
};

const specialties = [
  "Strength & Conditioning",
  "Yoga & Flexibility",
  "Boxing & MMA",
  "Cardio & Zumba",
  "Powerlifting",
  "CrossFit",
  "Swimming",
  "Nutrition & Diet",
  "Rehabilitation",
  "Other",
];

export default function TrainerForm({
  initial = {},
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({ ...defaultForm, ...initial });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.specialty) e.specialty = "Specialty is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, salary: form.salary ? Number(form.salary) : 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          placeholder="Trainer name"
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

      {/* Email & Salary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email"
          placeholder="trainer@gym.com"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <Input
          label="Monthly Salary (₹)"
          placeholder="e.g. 25000"
          type="number"
          value={form.salary}
          onChange={(e) => set("salary", e.target.value)}
        />
      </div>

      {/* Specialty & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Specialty *"
          value={form.specialty}
          onChange={(e) => set("specialty", e.target.value)}
          error={errors.specialty}
        >
          <option value="">Select specialty</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select
          label="Status"
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      {/* Personal Training toggle */}
      <div className="py-1">
        <Toggle
          label="Offers Personal Training"
          checked={form.offers_personal_training}
          onChange={(v) => set("offers_personal_training", v)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-brand-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initial.id ? "Save Changes" : "Add Trainer"}
        </Button>
      </div>
    </form>
  );
}