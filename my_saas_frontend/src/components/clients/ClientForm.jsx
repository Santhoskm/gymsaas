// src/components/clients/ClientForm.jsx

import { useState, useEffect } from "react";
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
  // programPackageId replaces the old packageId — only program_package is used now
  programPackageId: "",
  trainerId: "",
  personalTraining: false,
  photo: null,
};

/**
 * ClientForm
 *
 * Props:
 *   initial      – existing client data for edit / renew mode
 *   onSubmit     – called with the form payload
 *   onCancel     – called on cancel
 *   loading      – shows spinner on submit button
 *   isRenewal    – when true, shows "Renew Membership" UI instead of "Save Changes"
 */
export default function ClientForm({
  initial = {},
  onSubmit,
  onCancel,
  loading,
  isRenewal = false,
}) {
  const { trainers, programs } = useApp();

  // ── Derive which program owns the pre-selected package (edit / renew mode) ──
  const initialProgramId = (() => {
    if (!initial.programPackageId) return "";
    const prog = programs.find((p) =>
      p.packages?.some((pk) => pk.id === Number(initial.programPackageId))
    );
    return prog ? String(prog.id) : "";
  })();

  const [form, setForm] = useState({
    ...defaultForm,
    ...initial,
    // Normalize snake_case fields that come back from the backend
    joinDate: initial.join_date ?? initial.joinDate ?? defaultForm.joinDate,
    expiryDate: initial.expiry_date ?? initial.expiryDate ?? "",
    programPackageId: initial.program_package
      ? String(initial.program_package)
      : initial.programPackageId
        ? String(initial.programPackageId)
        : "",
    trainerId: initial.trainer
      ? String(initial.trainer)
      : initial.trainerId
        ? String(initial.trainerId)
        : "",
    personalTraining:
      initial.personal_training ?? initial.personalTraining ?? false,
  });

  const [selectedProgramId, setSelectedProgramId] = useState(initialProgramId);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  // ── When trainer changes, remove PT program selection if trainer can't offer PT ──
  useEffect(() => {
    if (!form.trainerId) return;
    const trainer = trainers.find((t) => t.id === Number(form.trainerId));
    if (!trainer?.offers_personal_training) {
      // Deselect if currently selected program is a PT program
      const currentProg = programs.find((p) => p.id === Number(selectedProgramId));
      if (currentProg?.program_type === "personal_training") {
        setSelectedProgramId("");
        set("programPackageId", "");
        if (form.personalTraining) set("personalTraining", false);
      }
    }
  }, [form.trainerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter programs: hide PT programs unless the selected trainer offers PT ──
  const selectedTrainer = trainers.find((t) => t.id === Number(form.trainerId));
  const trainerOffersPT = selectedTrainer?.offers_personal_training === true;

  const visiblePrograms = programs.filter((p) => {
    if (!p.is_active) return false;
    if (p.program_type === "personal_training") return trainerOffersPT;
    return true;
  });

  // ── Packages under the currently selected program ──────────────────────────
  const programPackages = selectedProgramId
    ? programs.find((p) => p.id === Number(selectedProgramId))?.packages?.filter(
      (pk) => pk.is_active
    ) ?? []
    : [];

  // ── Validation ─────────────────────────────────────────────────────────────
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
      programPackageId: form.programPackageId ? Number(form.programPackageId) : null,
      trainerId: form.trainerId ? Number(form.trainerId) : null,
    });
  };

  // ── Renewal label ──────────────────────────────────────────────────────────
  const submitLabel = isRenewal
    ? "Renew Membership"
    : initial.id
      ? "Save Changes"
      : "Add Client";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Renewal banner */}
      {isRenewal && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm font-medium">
          ♻️ Renewing membership for <span className="font-bold">{initial.name}</span>
          {initial.expiryDate && (
            <span className="text-xs text-amber-300 ml-auto">
              Previous expiry: {initial.expiryDate}
            </span>
          )}
        </div>
      )}

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

      {/* Dates — auto-focus expiry on renewal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Join Date *"
          type="date"
          value={form.joinDate}
          onChange={(e) => set("joinDate", e.target.value)}
          error={errors.joinDate}
        />
        <Input
          label={isRenewal ? "New Expiry Date *" : "Expiry Date *"}
          type="date"
          value={form.expiryDate}
          onChange={(e) => set("expiryDate", e.target.value)}
          error={errors.expiryDate}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={isRenewal}
        />
      </div>

      {/* Trainer */}
      <div>
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
                {t.offers_personal_training ? " 🏋️" : ""}
              </option>
            ))}
        </Select>
        {form.trainerId && !trainerOffersPT && (
          <p className="text-xs text-brand-subtle mt-1">
            This trainer does not offer personal training — PT programs are hidden.
          </p>
        )}
      </div>

      {/* Program selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Program"
          value={selectedProgramId}
          onChange={(e) => {
            setSelectedProgramId(e.target.value);
            set("programPackageId", ""); // reset package when program changes
            // Auto-toggle PT flag when PT program selected
            const prog = programs.find((p) => p.id === Number(e.target.value));
            if (prog?.program_type === "personal_training") {
              set("personalTraining", true);
            }
          }}
        >
          <option value="">No program</option>
          {visiblePrograms.map((p) => (
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

      {/* Personal Training toggle — read-only when PT program is selected */}
      <div className="py-1">
        <Toggle
          label="Personal Training"
          checked={form.personalTraining}
          onChange={(v) => set("personalTraining", v)}
          disabled={
            (() => {
              const prog = programs.find((p) => p.id === Number(selectedProgramId));
              return prog?.program_type === "personal_training";
            })()
          }
        />
        {(() => {
          const prog = programs.find((p) => p.id === Number(selectedProgramId));
          return prog?.program_type === "personal_training" ? (
            <p className="text-xs text-purple-400 mt-1">
              Automatically enabled — client is enrolled in a PT program.
            </p>
          ) : null;
        })()}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-brand-border mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
