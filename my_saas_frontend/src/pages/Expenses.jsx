import { useState, useMemo } from "react";
import { Plus, Trash2, Receipt, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { useApp } from "../hooks/useApp";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { formatCurrency, formatDate } from "../utils";

const expenseTypes = ["Trainer Salary", "Equipment", "Utilities", "Maintenance", "Marketing", "Supplies", "Rent", "Other"];

const defaultForm = { type: "", description: "", amount: "", date: new Date().toISOString().split("T")[0], trainerId: "" };

function ExpenseForm({ onSubmit, onCancel, loading }) {
  const { trainers } = useApp();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.type) e.type = "Type is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Valid amount required";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, amount: Number(form.amount), trainerId: form.trainerId ? Number(form.trainerId) : null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Expense Type *" value={form.type} onChange={(e) => set("type", e.target.value)} error={errors.type}>
          <option value="">Select type</option>
          {expenseTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Input label="Amount (₹) *" placeholder="e.g. 5000" type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} error={errors.amount} />
      </div>
      <Input label="Description *" placeholder="Brief description" value={form.description} onChange={(e) => set("description", e.target.value)} error={errors.description} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Date *" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} error={errors.date} />
        {form.type === "Trainer Salary" && (
          <Select label="Trainer" value={form.trainerId} onChange={(e) => set("trainerId", e.target.value)}>
            <option value="">Select trainer</option>
            {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-brand-border">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Add Expense</Button>
      </div>
    </form>
  );
}

export default function Expenses() {
  const { expenses, addExpense, deleteExpense } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [monthFilter, setMonthFilter] = useState("2025-03");

  const filtered = useMemo(() =>
    expenses.filter((e) => !monthFilter || e.date.startsWith(monthFilter))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [expenses, monthFilter]
  );

  const summary = useMemo(() => {
    const total = filtered.reduce((a, e) => a + e.amount, 0);
    const byType = filtered.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + e.amount;
      return acc;
    }, {});
    return { total, byType };
  }, [filtered]);

  const handleAdd = async (data) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    addExpense(data);
    setLoading(false);
    setModalOpen(false);
    toast.success("Expense recorded!");
  };

  const handleDelete = (id) => {
    deleteExpense(id);
    toast.success("Expense deleted.");
  };

  const typeColors = {
    "Trainer Salary": "text-orange-400 bg-orange-500/10 border-orange-500/20",
    Equipment: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    Utilities: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    Maintenance: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    Marketing: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    Supplies: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    Rent: "text-red-400 bg-red-500/10 border-red-500/20",
    Other: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Expenses</h1>
          <p className="text-sm text-brand-subtle mt-0.5">Track and manage gym expenses</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={15} /> Add Expense
        </Button>
      </div>

      {/* Month filter & summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <label className="text-xs text-brand-subtle uppercase tracking-wider font-medium block mb-2">Filter Month</label>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <TrendingDown size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-xs text-brand-subtle uppercase tracking-wider">Total Expenses</p>
            <p className="font-display text-2xl font-bold text-red-400">{formatCurrency(summary.total)}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <DollarSign size={18} className="text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-brand-subtle uppercase tracking-wider">Salaries</p>
            <p className="font-display text-2xl font-bold text-orange-400">
              {formatCurrency(summary.byType["Trainer Salary"] || 0)}
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Receipt size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-brand-subtle uppercase tracking-wider">Other Costs</p>
            <p className="font-display text-2xl font-bold text-blue-400">
              {formatCurrency(summary.total - (summary.byType["Trainer Salary"] || 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown by type */}
      {Object.keys(summary.byType).length > 0 && (
        <div className="card p-5">
          <h3 className="font-display font-bold text-brand-text mb-4">Breakdown by Type</h3>
          <div className="space-y-3">
            {Object.entries(summary.byType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, amount]) => {
                const pct = Math.round((amount / summary.total) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`badge border ${typeColors[type] || typeColors.Other}`}>{type}</span>
                      <span className="text-sm font-medium text-brand-text">{formatCurrency(amount)} <span className="text-brand-subtle">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-brand-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-red to-brand-orange transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Expense list */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border">
          <h3 className="font-display font-bold text-brand-text">
            Expense List <span className="text-brand-subtle font-normal text-sm">({filtered.length})</span>
          </h3>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-brand-subtle text-sm">No expenses for this period.</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-border/50">
            {filtered.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between px-5 py-4 hover:bg-brand-surface/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`badge border text-xs ${typeColors[expense.type] || typeColors.Other}`}>
                    {expense.type}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-brand-text">{expense.description}</p>
                    <p className="text-xs text-brand-subtle mt-0.5">{formatDate(expense.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display font-bold text-brand-text text-lg">
                    {formatCurrency(expense.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-brand-subtle hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense" size="md">
        <ExpenseForm onSubmit={handleAdd} onCancel={() => setModalOpen(false)} loading={loading} />
      </Modal>
    </div>
  );
}
