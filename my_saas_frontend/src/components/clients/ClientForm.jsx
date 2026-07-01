// src/components/clients/ClientForm.jsx

import { useState, useEffect } from "react";
import { Input, Select } from "../ui/Input";
import Button from "../ui/Button";
import { useApp } from "../../hooks/useApp";

const defaultForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  dateOfBirth: "",
  joinDate: new Date().toISOString().split("T")[0],
  expiryDate: "",
  trainerId: "",
  personalTraining: false,
  paymentMethod: "cash",
  totalAmount: "",
  amountPaid: "",
  note: "",
};

// Add N months to a date string (YYYY-MM-DD) and return YYYY-MM-DD
function addMonths(dateStr, months) {
  if (!dateStr || !months) return "";
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().split("T")[0];
}

/**
 * ClientForm — used for Add, Edit, Renew, and Upgrade actions.
 *
 * Props:
 *   initial      – existing client data for edit / renew / upgrade mode
 *   onSubmit     – called with the form payload
 *   onCancel     – called on cancel
 *   loading      – shows spinner on submit button
 *   mode         – 'add' | 'edit' | 'renew' | 'upgrade'
 */
export default function ClientForm({
  initial = {},
  onSubmit,
  onCancel,
  loading,
  mode = "add",
}) {
  const { trainers, programs } = useApp();

  // selectedPrograms = { [programId]: packageId | null }
  const initSelectedPrograms = () => {
    const map = {};
    if (initial.program_package || initial.programPackageId) {
      const pkgId = Number(initial.program_package || initial.programPackageId);
      for (const prog of programs) {
        if (prog.packages?.some((pk) => pk.id === pkgId)) {
          map[prog.id] = pkgId;
          break;
        }
      }
    }
    return map;
  };

  const [form, setForm] = useState({
    ...defaultForm,
    ...initial,
    joinDate: initial.join_date ?? initial.joinDate ?? defaultForm.joinDate,
    expiryDate: initial.expiry_date ?? initial.expiryDate ?? "",
    dateOfBirth: initial.date_of_birth ?? initial.dateOfBirth ?? "",
    trainerId: initial.trainer
      ? String(initial.trainer)
      : initial.trainerId
        ? String(initial.trainerId)
        : "",
    personalTraining: initial.personal_training ?? initial.personalTraining ?? false,
    paymentMethod: initial.payment_method ?? initial.paymentMethod ?? "cash",
    totalAmount: "",
    amountPaid: "",
    note: "",
  });

  const [selectedPrograms, setSelectedPrograms] = useState(initSelectedPrograms);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  // ── Auto-calculate expiry date when a package is selected ─────────────────
  // 'add'             → expiryDate = joinDate + duration_months (brand new client)
  // 'renew'/'upgrade' → expiryDate = max(current expiry, today) + duration_months
  //                     (extends the existing membership forward, never resets
  //                     it back to "today + duration" or "joinDate + duration")
  // 'edit'            → never auto-fill
  useEffect(() => {
    if (mode === "edit") return; // never auto-fill in edit mode

    // Find the selected package across all programs
    let selectedPkg = null;
    for (const prog of programs) {
      for (const [progId, pkgId] of Object.entries(selectedPrograms)) {
        if (prog.id === Number(progId) && pkgId) {
          selectedPkg = prog.packages?.find((pk) => pk.id === pkgId) ?? null;
          if (selectedPkg) break;
        }
      }
      if (selectedPkg) break;
    }

    if (!selectedPkg) return;

    let baseDate = form.joinDate;
    if (mode === "renew" || mode === "upgrade") {
      const todayStr = new Date().toISOString().split("T")[0];
      const currentExpiry = initial.expiry_date ?? initial.expiryDate ?? "";
      // Extend from whichever is later: the client's current expiry, or today
      // (covers an already-expired client renewing — don't extend from a past date).
      baseDate = currentExpiry && currentExpiry > todayStr ? currentExpiry : todayStr;
    }

    const newExpiry = addMonths(baseDate, selectedPkg.duration_months);
    if (newExpiry && newExpiry !== form.expiryDate) {
      setForm((prev) => ({ ...prev, expiryDate: newExpiry }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPrograms, form.joinDate]);


  // When trainer changes, deselect PT programs (and the manual PT toggle)
  // if the newly-assigned trainer can't offer PT.
  useEffect(() => {
    if (!form.trainerId) {
      set("personalTraining", false);
      return;
    }
    const trainer = trainers.find((t) => t.id === Number(form.trainerId));
    if (!trainer?.offers_personal_training) {
      setSelectedPrograms((prev) => {
        const next = { ...prev };
        for (const prog of programs) {
          if (prog.program_type === "personal_training" && next[prog.id]) {
            delete next[prog.id];
          }
        }
        return next;
      });
      setForm((prev) => ({ ...prev, personalTraining: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.trainerId]);

  const selectedTrainer = trainers.find((t) => t.id === Number(form.trainerId));
  const trainerOffersPT = selectedTrainer?.offers_personal_training === true;

  const visiblePrograms = programs.filter((p) => {
    if (!p.is_active) return false;
    if (p.program_type === "personal_training") return trainerOffersPT;
    return true;
  });

  // Toggle program checkbox
  const toggleProgram = (prog) => {
    setSelectedPrograms((prev) => {
      const next = { ...prev };
      if (next[prog.id] !== undefined) {
        delete next[prog.id];
      } else {
        const firstPkg = prog.packages?.find((pk) => pk.is_active);
        next[prog.id] = firstPkg?.id ?? null;
      }
      return next;
    });
  };

  // Get the primary programPackageId for the payload
  const getPrimaryPackageId = () => {
    // PT program takes priority
    for (const prog of programs) {
      if (prog.program_type === "personal_training" && selectedPrograms[prog.id]) {
        return selectedPrograms[prog.id];
      }
    }
    const ids = Object.values(selectedPrograms).filter(Boolean);
    return ids[0] ?? null;
  };

  // Find selected package info to show duration hint
  const getSelectedPackageInfo = () => {
    for (const prog of programs) {
      for (const [progId, pkgId] of Object.entries(selectedPrograms)) {
        if (prog.id === Number(progId) && pkgId) {
          const pkg = prog.packages?.find((pk) => pk.id === pkgId);
          if (pkg) return pkg;
        }
      }
    }
    return null;
  };

  const hasPTSelected = programs.some(
    (p) => p.program_type === "personal_training" && selectedPrograms[p.id]
  );

  // Keep the manual PT toggle in sync when a PT program is checked directly
  // from the program list — picking a PT package implies PT is enabled.
  useEffect(() => {
    if (hasPTSelected && !form.personalTraining) {
      setForm((prev) => ({ ...prev, personalTraining: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPTSelected]);

  const selectedPackageInfo = getSelectedPackageInfo();

  // Suggest the package price as a starting point for Total Amount, but only
  // while the field is still empty — once staff types their own figure it's
  // never overwritten automatically. This lets the pending amount be set
  // manually (e.g. discounts, custom quotes) instead of always being forced
  // to package price.
  useEffect(() => {
    if (mode === "edit") return;
    if (selectedPackageInfo && !form.totalAmount) {
      setForm((prev) => ({ ...prev, totalAmount: String(selectedPackageInfo.price) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackageInfo?.id]);

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

    const primaryPkgId = getPrimaryPackageId();

    onSubmit({
      ...form,
      programPackageId: primaryPkgId,
      selectedPrograms,
      trainerId: form.trainerId ? Number(form.trainerId) : null,
      personalTraining: form.personalTraining || hasPTSelected,
    });
  };

  const isRenew = mode === "renew";
  const isUpgrade = mode === "upgrade";
  const isEdit = mode === "edit";

  const submitLabel =
    isRenew ? "Renew Membership" :
      isUpgrade ? "Confirm Upgrade" :
        isEdit ? "Save Changes" :
          "Add Client";

  const bannerConfig = isRenew
    ? { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", emoji: "♻️", label: "Renewing membership for" }
    : isUpgrade
      ? { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", emoji: "⬆️", label: "Upgrading package for" }
      : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode banner */}
      {bannerConfig && (
        <div className={`flex items-center gap-2 px-4 py-2.5 ${bannerConfig.bg} border rounded-xl ${bannerConfig.text} text-sm font-medium`}>
          {bannerConfig.emoji} {bannerConfig.label} <span className="font-bold">{initial.name}</span>
          {initial.expiryDate && (
            <span className="text-xs opacity-75 ml-auto">
              Current expiry: {initial.expiry_date ?? initial.expiryDate}
            </span>
          )}
        </div>
      )}

      {/* Name & Phone — hidden on renew/upgrade */}
      {!isRenew && !isUpgrade && (
        <>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
          </div>
        </>
      )}

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!isRenew && !isUpgrade && (
          <Input
            label="Join Date *"
            type="date"
            value={form.joinDate}
            onChange={(e) => set("joinDate", e.target.value)}
            error={errors.joinDate}
          />
        )}
        <div>
          <Input
            label={isRenew || isUpgrade ? "New Expiry Date *" : "Expiry Date *"}
            type="date"
            value={form.expiryDate}
            onChange={(e) => set("expiryDate", e.target.value)}
            error={errors.expiryDate}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={isRenew || isUpgrade}
          />
          {/* Show duration hint when a package is selected */}
          {selectedPackageInfo && form.expiryDate && (
            <p className="text-xs text-emerald-400 mt-1">
              📅 {selectedPackageInfo.duration_months}-month {selectedPackageInfo.name} — expires {form.expiryDate}
            </p>
          )}
        </div>
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
            .map((t) => {
              const ptCount = t.pt_client_count;
              const hasCount = typeof ptCount === "number";
              return (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.offers_personal_training
                    ? ` 🏋️${hasCount ? ` (${ptCount} PT client${ptCount === 1 ? "" : "s"})` : ""}`
                    : ""}
                </option>
              );
            })}
        </Select>
        {form.trainerId && !trainerOffersPT && (
          <p className="text-xs text-brand-subtle mt-1">
            This trainer does not offer personal training — PT programs are hidden.
          </p>
        )}
      </div>

      {/* Personal Training toggle — only enabled when the assigned trainer
          is PT-eligible. Turning this on flags the client as a PT client,
          which is what the Trainers page's PT client count is based on. */}
      <div>
        <button
          type="button"
          disabled={!trainerOffersPT}
          onClick={() => set("personalTraining", !form.personalTraining)}
          title={
            !form.trainerId
              ? "Assign a trainer first"
              : !trainerOffersPT
                ? "This trainer does not offer personal training"
                : undefined
          }
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${!trainerOffersPT
              ? "bg-brand-card border-brand-border opacity-50 cursor-not-allowed"
              : form.personalTraining
                ? "bg-purple-500/10 border-purple-500/30"
                : "bg-brand-card border-brand-border hover:border-purple-500/30"
            }`}
        >
          <span
            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${form.personalTraining && trainerOffersPT
                ? "bg-purple-500 border-purple-500"
                : "border-brand-border"
              }`}
          >
            {form.personalTraining && trainerOffersPT && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
          </span>
          <span className="text-lg leading-none">🏋️</span>
          <span className="flex-1">
            <span className="text-sm font-medium text-brand-text block">
              Personal Training
            </span>
            <span className="text-xs text-brand-subtle">
              {!form.trainerId
                ? "Assign a trainer to enable"
                : !trainerOffersPT
                  ? "Selected trainer isn't PT-eligible"
                  : "Enroll this client for personal training with this trainer"}
            </span>
          </span>
        </button>
      </div>

      {/* Program checkbox selection */}
      <div>
        <p className="text-sm font-medium text-brand-text mb-2">Programs</p>
        {visiblePrograms.length === 0 ? (
          <p className="text-xs text-brand-subtle">No active programs available.</p>
        ) : (
          <div className="space-y-2">
            {visiblePrograms.map((prog) => {
              const isChecked = selectedPrograms[prog.id] !== undefined;
              const isPT = prog.program_type === "personal_training";
              const activePkgs = prog.packages?.filter((pk) => pk.is_active) ?? [];

              return (
                <div
                  key={prog.id}
                  className={`rounded-xl border transition-colors ${isChecked
                    ? isPT
                      ? "bg-purple-500/10 border-purple-500/30"
                      : "bg-brand-red/5 border-brand-red/30"
                    : "bg-brand-card border-brand-border"
                    }`}
                >
                  {/* Program checkbox row */}
                  <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleProgram(prog)}
                      className="w-4 h-4 rounded accent-brand-red"
                    />
                    <span className="text-lg leading-none">{prog.icon || "🏃"}</span>
                    <span className="text-sm font-medium text-brand-text flex-1">{prog.name}</span>
                    {isPT && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Personal Training
                      </span>
                    )}
                  </label>

                  {/* Package sub-select — shown when program is checked */}
                  {isChecked && activePkgs.length > 0 && (
                    <div className="px-4 pb-3">
                      <Select
                        label="Select Package"
                        value={selectedPrograms[prog.id] ?? ""}
                        onChange={(e) =>
                          setSelectedPrograms((prev) => ({
                            ...prev,
                            [prog.id]: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                      >
                        <option value="">Choose a package</option>
                        {activePkgs.map((pk) => (
                          <option key={pk.id} value={pk.id}>
                            {pk.name} — {pk.duration_months} month{pk.duration_months > 1 ? "s" : ""} — ₹{pk.price}
                          </option>
                        ))}
                      </Select>

                      {/* Show selected package price as amount hint */}
                      {selectedPrograms[prog.id] && (() => {
                        const pkg = activePkgs.find((pk) => pk.id === selectedPrograms[prog.id]);
                        return pkg ? (
                          <p className="text-xs text-brand-subtle mt-1">
                            Package price: <span className="text-emerald-400 font-medium">₹{pkg.price}</span>
                            {" "}· {pkg.duration_months} month{pkg.duration_months > 1 ? "s" : ""}
                          </p>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {hasPTSelected && (
          <p className="text-xs text-purple-400 mt-2">
            🏋️ Personal Training automatically enabled — PT program selected.
          </p>
        )}
      </div>

      {/* Amount — shown on add / renew / upgrade */}
      {(isRenew || isUpgrade || mode === "add") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Total Amount (₹)"
              type="number"
              placeholder={
                selectedPackageInfo ? `e.g. ${selectedPackageInfo.price}` : "e.g. 2499"
              }
              value={form.totalAmount}
              onChange={(e) => set("totalAmount", e.target.value)}
            />
            {/* Hint: fill from package price, but staff can override it manually */}
            {selectedPackageInfo && form.totalAmount !== String(selectedPackageInfo.price) && (
              <button
                type="button"
                className="text-xs text-brand-red mt-1 hover:underline"
                onClick={() => set("totalAmount", String(selectedPackageInfo.price))}
              >
                Use package price ₹{selectedPackageInfo.price}
              </button>
            )}
          </div>
          <Input
            label="Amount Paid Now (₹)"
            type="number"
            placeholder="e.g. 1000"
            value={form.amountPaid}
            onChange={(e) => set("amountPaid", e.target.value)}
          />
        </div>
      )}

      {/* Manually-set pending — comes from Total Amount you type, not an
          auto-lock to the package price, so discounts / custom quotes work. */}
      {(isRenew || isUpgrade || mode === "add") && form.totalAmount && (() => {
        const total = Number(form.totalAmount) || 0;
        const paid = Number(form.amountPaid) || 0;
        const pending = Math.max(total - paid, 0);
        return pending > 0 ? (
          <p className="text-xs text-amber-400 -mt-2 font-medium">
            ⚠️ Pending balance to be recorded: ₹{pending}
          </p>
        ) : (
          <p className="text-xs text-emerald-400 -mt-2 font-medium">
            ✓ Fully paid — no pending balance
          </p>
        );
      })()}

      {(isRenew || isUpgrade || mode === "add") && (
        <Select
          label="Payment Method"
          value={form.paymentMethod}
          onChange={(e) => set("paymentMethod", e.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
        </Select>
      )}

      {(isRenew || isUpgrade) && (
        <Input
          label="Note (optional)"
          placeholder="e.g. Upgraded from 1 month to 3 months"
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
        />
      )}

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