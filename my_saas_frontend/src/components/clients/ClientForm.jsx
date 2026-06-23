import { useState } from "react";
import { Input, Select, Toggle } from "../ui/Input";
import Button from "../ui/Button";
import { packages } from "../../data";
import { useApp } from "../../hooks/useApp";

const defaultForm = {
  name: "", phone: "", email: "", address: "",
  joinDate: new Date().toISOString().split("T")[0],
  expiryDate: "", packageId: "", trainerId: "",
  personalTraining: false, photo: null,
};

export default function ClientForm({ initial = {}, onSubmit, onCancel, loading }) {
  const { trainers } = useApp();
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
    if (!form.joinDate) e.joinDate = "Join date is required";
    if (!form.expiryDate) e.expiryDate = "Expiry date is required";
    if (!form.packageId) e.packageId = "Package is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      packageId: Number(form.packageId),
      trainerId: form.trainerId ? Number(form.trainerId) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name *" placeholder="Enter client name" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
        <Input label="Phone *" placeholder="10-digit number" value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Email" placeholder="email@example.com" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <Input label="Address" placeholder="City, Area" value={form.address} onChange={(e) => set("address", e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Join Date *" type="date" value={form.joinDate} onChange={(e) => set("joinDate", e.target.value)} error={errors.joinDate} />
        <Input label="Expiry Date *" type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} error={errors.expiryDate} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Package *" value={form.packageId} onChange={(e) => set("packageId", e.target.value)} error={errors.packageId}>
          <option value="">Select package</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>
          ))}
        </Select>
        <Select label="Trainer" value={form.trainerId} onChange={(e) => set("trainerId", e.target.value)}>
          <option value="">No trainer assigned</option>
          {trainers.filter((t) => t.status === "active").map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
      </div>
      <div className="py-1">
        <Toggle label="Personal Training" checked={form.personalTraining} onChange={(v) => set("personalTraining", v)} />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-brand-border mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {initial.id ? "Save Changes" : "Add Client"}
        </Button>
      </div>
    </form>
  );
}
