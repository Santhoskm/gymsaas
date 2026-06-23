import { useState } from "react";
import { Plus, Edit2, Trash2, Dumbbell } from "lucide-react";
import toast from "react-hot-toast";
import { useApp } from "../hooks/useApp";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { EmptyState } from "../components/ui/Card";
import { formatCurrency } from "../utils";

const defaultForm = { name: "", duration: "", gymFee: "", trainerFee: "", description: "", icon: "🏋️" };
const iconOptions = ["🏋️", "🥊", "🧘", "🔥", "💪", "🤸", "🏃", "⚡", "🎯", "🥋", "💃", "🏆"];

function ActivityForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.duration.trim()) e.duration = "Duration is required";
    if (!form.gymFee || Number(form.gymFee) < 0) e.gymFee = "Valid gym fee required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, gymFee: Number(form.gymFee), trainerFee: Number(form.trainerFee) || 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Icon selector */}
      <div>
        <label className="text-xs font-medium text-brand-subtle uppercase tracking-wider block mb-2">Activity Icon</label>
        <div className="flex flex-wrap gap-2">
          {iconOptions.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => set("icon", icon)}
              className={`w-10 h-10 text-xl rounded-xl border transition-colors ${
                form.icon === icon
                  ? "border-brand-red bg-brand-red/10"
                  : "border-brand-border hover:border-brand-muted bg-brand-surface"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Activity Name *" placeholder="e.g. Boxing Program" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
        <Input label="Duration *" placeholder="e.g. 3 months, 6 weeks" value={form.duration} onChange={(e) => set("duration", e.target.value)} error={errors.duration} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Gym Fee (₹) *" placeholder="e.g. 3500" type="number" value={form.gymFee} onChange={(e) => set("gymFee", e.target.value)} error={errors.gymFee} />
        <Input label="Trainer Fee (₹)" placeholder="e.g. 2000 (optional)" type="number" value={form.trainerFee} onChange={(e) => set("trainerFee", e.target.value)} />
      </div>
      <Textarea label="Description" placeholder="Describe what this activity includes..." value={form.description} onChange={(e) => set("description", e.target.value)} />
      <div className="flex justify-end gap-3 pt-2 border-t border-brand-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial.id ? "Save Changes" : "Add Activity"}</Button>
      </div>
    </form>
  );
}

function ActivityCard({ activity, onEdit, onDelete }) {
  const total = activity.gymFee + activity.trainerFee;
  return (
    <div className="card p-5 hover:border-brand-muted transition-all duration-200 group animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-red/20 to-brand-orange/20 border border-brand-red/30 rounded-2xl flex items-center justify-center text-2xl">
            {activity.icon}
          </div>
          <div>
            <h3 className="font-display font-bold text-brand-text text-base leading-tight">{activity.name}</h3>
            <p className="text-xs text-brand-orange font-medium mt-0.5">{activity.duration}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(activity)} className="p-1.5 rounded-lg hover:bg-brand-card text-brand-subtle hover:text-brand-text transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(activity.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-brand-subtle hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {activity.description && (
        <p className="text-xs text-brand-subtle leading-relaxed mb-4 line-clamp-2">{activity.description}</p>
      )}

      <div className="grid grid-cols-3 gap-2 p-3 bg-brand-surface rounded-xl border border-brand-border">
        <div className="text-center">
          <p className="font-display font-bold text-brand-text text-sm">{formatCurrency(activity.gymFee)}</p>
          <p className="text-[10px] text-brand-subtle mt-0.5">Gym Fee</p>
        </div>
        <div className="text-center border-x border-brand-border">
          <p className="font-display font-bold text-brand-text text-sm">
            {activity.trainerFee ? formatCurrency(activity.trainerFee) : "—"}
          </p>
          <p className="text-[10px] text-brand-subtle mt-0.5">Trainer</p>
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-emerald-400 text-sm">{formatCurrency(total)}</p>
          <p className="text-[10px] text-brand-subtle mt-0.5">Total</p>
        </div>
      </div>
    </div>
  );
}

export default function Activities() {
  const { activities, addActivity, updateActivity, deleteActivity } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    if (selected) {
      updateActivity(selected.id, data);
      toast.success("Activity updated!");
    } else {
      addActivity(data);
      toast.success("Activity added!");
    }
    setLoading(false);
    setModalOpen(false);
    setSelected(null);
  };

  const handleDelete = (id) => {
    deleteActivity(id);
    toast.success("Activity removed.");
  };

  const openEdit = (activity) => {
    setSelected(activity);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Activities</h1>
          <p className="text-sm text-brand-subtle mt-0.5">{activities.length} programs & packages</p>
        </div>
        <Button onClick={() => { setSelected(null); setModalOpen(true); }}>
          <Plus size={15} /> Add Activity
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Programs", value: activities.length },
          { label: "Avg Gym Fee", value: formatCurrency(activities.reduce((a, c) => a + c.gymFee, 0) / (activities.length || 1)) },
          { label: "With Trainer", value: activities.filter((a) => a.trainerFee > 0).length },
          { label: "Highest Fee", value: formatCurrency(Math.max(...activities.map((a) => a.gymFee + a.trainerFee), 0)) },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="font-display text-xl font-bold text-brand-text">{value}</p>
            <p className="text-xs text-brand-subtle mt-1">{label}</p>
          </div>
        ))}
      </div>

      {activities.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Dumbbell}
            title="No activities yet"
            description="Add gym programs, packages and special activities."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus size={15} /> Add First Activity
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); }}
        title={selected ? "Edit Activity" : "Add Activity"}
        size="md"
      >
        <ActivityForm
          initial={selected || {}}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setSelected(null); }}
          loading={loading}
        />
      </Modal>
    </div>
  );
}
