import { useState } from "react";
import { Plus, Edit2, Trash2, Dumbbell, Package, ChevronDown, ChevronUp, Tag, Star, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { useApp } from "../hooks/useApp";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { Input, Textarea, Select } from "../components/ui/Input";
import { EmptyState } from "../components/ui/Card";
import { formatCurrency } from "../utils";

// ── Program type config ───────────────────────────────────────────────────────
const PROGRAM_TYPES = [
  { value: "regular_membership", label: "Regular Membership", icon: "🏋️", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { value: "offer", label: "Offer / Special", icon: "🎁", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { value: "other", label: "Other Activity", icon: "⚡", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
];

const iconOptions = ["🏋️", "🥊", "🧘", "🔥", "💪", "🤸", "🏃", "⚡", "🎯", "🥋", "💃", "🏆", "🎁", "🌟", "🏊", "🚴"];

const defaultProgramForm = { name: "", program_type: "regular_membership", description: "", icon: "🏋️" };
const defaultPackageForm = { name: "", duration_months: "", price: "" };

// ── Program Form (Add / Edit program) ────────────────────────────────────────
function ProgramForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...defaultProgramForm, ...initial });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Program name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Program Type selector */}
      <div>
        <label className="text-xs font-medium text-brand-subtle uppercase tracking-wider block mb-2">Program Type *</label>
        <div className="grid grid-cols-3 gap-2">
          {PROGRAM_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => set("program_type", t.value)}
              className={`p-3 rounded-xl border text-center transition-all ${form.program_type === t.value
                  ? `border-brand-red bg-brand-red/10`
                  : "border-brand-border hover:border-brand-muted bg-brand-surface"
                }`}
            >
              <div className="text-xl mb-1">{t.icon}</div>
              <p className="text-[11px] font-medium text-brand-text leading-tight">{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Icon selector */}
      <div>
        <label className="text-xs font-medium text-brand-subtle uppercase tracking-wider block mb-2">Icon</label>
        <div className="flex flex-wrap gap-2">
          {iconOptions.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => set("icon", icon)}
              className={`w-9 h-9 text-lg rounded-xl border transition-colors ${form.icon === icon
                  ? "border-brand-red bg-brand-red/10"
                  : "border-brand-border hover:border-brand-muted bg-brand-surface"
                }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Program Name *"
        placeholder={
          form.program_type === "offer" ? "e.g. Summer Special, New Year Offer" :
            form.program_type === "regular_membership" ? "e.g. General Fitness, Weight Loss" :
              "e.g. Zumba, CrossFit, Yoga"
        }
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        error={errors.name}
      />

      <Textarea
        label="Description"
        placeholder="What does this program include?"
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-2 border-t border-brand-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial.id ? "Save Changes" : "Add Program"}</Button>
      </div>
    </form>
  );
}

// ── Package Form (Add package inside a program) ───────────────────────────────
function PackageForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(defaultPackageForm);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Package name is required";
    if (!form.duration_months || Number(form.duration_months) < 1) e.duration_months = "Duration must be at least 1 month";
    if (!form.price || Number(form.price) < 0) e.price = "Valid price required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, duration_months: Number(form.duration_months), price: Number(form.price) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Package Name *"
        placeholder="e.g. Monthly, Quarterly, Half-Yearly"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        error={errors.name}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Duration (months) *"
          type="number"
          placeholder="e.g. 1, 3, 6, 12"
          value={form.duration_months}
          onChange={(e) => set("duration_months", e.target.value)}
          error={errors.duration_months}
        />
        <Input
          label="Price (₹) *"
          type="number"
          placeholder="e.g. 2500"
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          error={errors.price}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-brand-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Add Package</Button>
      </div>
    </form>
  );
}

// ── Program Card ──────────────────────────────────────────────────────────────
function ProgramCard({ program, onEdit, onDelete, onAddPackage, onDeletePackage }) {
  const [expanded, setExpanded] = useState(true);
  const [addingPkg, setAddingPkg] = useState(false);
  const [pkgLoading, setPkgLoading] = useState(false);

  const typeConfig = PROGRAM_TYPES.find((t) => t.value === program.program_type) || PROGRAM_TYPES[0];

  const handleAddPackage = async (data) => {
    setPkgLoading(true);
    await onAddPackage(program.id, data);
    setPkgLoading(false);
    setAddingPkg(false);
  };

  return (
    <div className="card p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-brand-red/20 to-brand-orange/20 border border-brand-red/30 rounded-2xl flex items-center justify-center text-xl">
            {program.icon || typeConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-brand-text text-base leading-tight">{program.name}</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeConfig.bg} ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
            </div>
            {program.description && (
              <p className="text-xs text-brand-subtle mt-0.5 line-clamp-1">{program.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-brand-card text-brand-subtle hover:text-brand-text transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => onEdit(program)}
            className="p-1.5 rounded-lg hover:bg-brand-card text-brand-subtle hover:text-brand-text transition-colors"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(program.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-brand-subtle hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Packages */}
      {expanded && (
        <div className="mt-3 space-y-2">
          {program.packages?.length === 0 && !addingPkg && (
            <p className="text-xs text-brand-subtle text-center py-3 border border-dashed border-brand-border rounded-xl">
              No packages yet — add one below
            </p>
          )}

          {program.packages?.map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between px-3 py-2.5 bg-brand-surface rounded-xl border border-brand-border group">
              <div>
                <p className="text-sm font-semibold text-brand-text">{pkg.name}</p>
                <p className="text-xs text-brand-subtle">{pkg.duration_months} month{pkg.duration_months > 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-emerald-400 text-sm">{formatCurrency(pkg.price)}</span>
                <button
                  onClick={() => onDeletePackage(program.id, pkg.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-brand-subtle hover:text-red-400 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {addingPkg ? (
            <div className="mt-2 p-3 bg-brand-surface rounded-xl border border-brand-border">
              <p className="text-xs font-semibold text-brand-text mb-3">New Package</p>
              <PackageForm
                onSubmit={handleAddPackage}
                onCancel={() => setAddingPkg(false)}
                loading={pkgLoading}
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingPkg(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-brand-red hover:text-brand-orange border border-dashed border-brand-red/30 hover:border-brand-orange/30 rounded-xl transition-colors"
            >
              <Plus size={13} /> Add Package
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Activities Page ──────────────────────────────────────────────────────
export default function Activities() {
  const {
    programs,
    addProgram,
    updateProgram,
    deleteProgram,
    addProgramPackage,
    deleteProgramPackage,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (selected) {
        await updateProgram(selected.id, data);
        toast.success("Program updated!");
      } else {
        await addProgram(data);
        toast.success("Program added!");
      }
    } finally {
      setLoading(false);
      setModalOpen(false);
      setSelected(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this program and all its packages?")) return;
    await deleteProgram(id);
  };

  const openEdit = (program) => {
    setSelected(program);
    setModalOpen(true);
  };

  const filteredPrograms = filterType === "all"
    ? programs
    : programs.filter((p) => p.program_type === filterType);

  // Summary stats
  const totalPackages = programs.reduce((acc, p) => acc + (p.packages?.length || 0), 0);
  const lowestPrice = Math.min(...programs.flatMap((p) => p.packages?.map((pk) => Number(pk.price)) || []), Infinity);
  const highestPrice = Math.max(...programs.flatMap((p) => p.packages?.map((pk) => Number(pk.price)) || []), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Programs & Activities</h1>
          <p className="text-sm text-brand-subtle mt-0.5">
            {programs.length} programs · {totalPackages} packages
          </p>
        </div>
        <Button onClick={() => { setSelected(null); setModalOpen(true); }}>
          <Plus size={15} /> Add Program
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Programs", value: programs.length },
          { label: "Total Packages", value: totalPackages },
          { label: "Lowest Price", value: isFinite(lowestPrice) ? formatCurrency(lowestPrice) : "—" },
          { label: "Highest Price", value: highestPrice > 0 ? formatCurrency(highestPrice) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="font-display text-xl font-bold text-brand-text">{value}</p>
            <p className="text-xs text-brand-subtle mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: "all", label: "All" }, ...PROGRAM_TYPES.map((t) => ({ value: t.value, label: t.label }))].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterType(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${filterType === tab.value
                ? "bg-brand-red text-white border-brand-red"
                : "bg-brand-surface text-brand-subtle border-brand-border hover:border-brand-muted"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Programs grid */}
      {filteredPrograms.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Dumbbell}
            title={filterType === "all" ? "No programs yet" : `No ${PROGRAM_TYPES.find(t => t.value === filterType)?.label} programs`}
            description="Add programs like Regular Membership, Offers or other activities. Each program can have multiple pricing packages."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus size={15} /> Add First Program
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onEdit={openEdit}
              onDelete={handleDelete}
              onAddPackage={addProgramPackage}
              onDeletePackage={deleteProgramPackage}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Program Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); }}
        title={selected ? "Edit Program" : "Add Program"}
        size="md"
      >
        <ProgramForm
          initial={selected || {}}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setSelected(null); }}
          loading={loading}
        />
      </Modal>
    </div>
  );
}