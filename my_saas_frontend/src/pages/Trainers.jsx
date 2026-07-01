// import { useState, useEffect, useMemo } from "react";
// import { useLocation } from "react-router-dom";
// import { UserPlus, Phone, Mail, Edit2, Trash2, Users, Search } from "lucide-react";
// import toast from "react-hot-toast";
// import { useApp } from "../hooks/useApp";
// import Modal from "../components/ui/Modal";
// import Button from "../components/ui/Button";
// import Avatar from "../components/ui/Avatar";
// import { Badge } from "../components/ui/Table";
// import { EmptyState } from "../components/ui/Card";
// import TrainerForm from "../components/trainers/TrainerForm";
// import { formatCurrency } from "../utils";

// function TrainerCard({ trainer, onEdit, onDelete }) {
//   return (
//     <div className="card p-5 hover:border-brand-muted transition-colors animate-fade-in">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <Avatar name={trainer.name} photo={trainer.photo} size="md" />
//           <div>
//             <h3 className="font-display font-bold text-brand-text">{trainer.name}</h3>
//             <span className="text-xs text-brand-orange font-medium">{trainer.specialty}</span>
//           </div>
//         </div>
//         <Badge status={trainer.status} />
//       </div>

//       <div className="space-y-2 mb-4">
//         <div className="flex items-center gap-2 text-sm text-brand-subtle">
//           <Phone size={13} /> {trainer.phone}
//         </div>
//         {trainer.email && (
//           <div className="flex items-center gap-2 text-sm text-brand-subtle">
//             <Mail size={13} /> {trainer.email}
//           </div>
//         )}
//       </div>

//       <div className="grid grid-cols-2 gap-2 p-3 bg-brand-surface rounded-xl border border-brand-border mb-4">
//         <div className="text-center">
//           <p className="font-display text-xl font-bold text-brand-text">{trainer.clients}</p>
//           <p className="text-[10px] text-brand-subtle uppercase tracking-wider">Clients</p>
//         </div>
//         <div className="text-center border-l border-brand-border">
//           <p className="font-display text-xl font-bold text-emerald-400">
//             {trainer.salary ? formatCurrency(trainer.salary) : "—"}
//           </p>
//           <p className="text-[10px] text-brand-subtle uppercase tracking-wider">Monthly</p>
//         </div>
//       </div>

//       <div className="flex gap-2">
//         <Button variant="secondary" size="sm" className="flex-1 justify-center" onClick={() => onEdit(trainer)}>
//           <Edit2 size={13} /> Edit
//         </Button>
//         <Button variant="danger" size="sm" onClick={() => onDelete(trainer.id)}>
//           <Trash2 size={13} />
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default function Trainers() {
//   const { trainers, addTrainer, updateTrainer, deleteTrainer } = useApp();
//   const location = useLocation();
//   const [search, setSearch] = useState("");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     if (params.get("action") === "add") setModalOpen(true);
//   }, [location.search]);

//   const filtered = useMemo(() =>
//     trainers.filter((t) =>
//       !search ||
//       t.name.toLowerCase().includes(search.toLowerCase()) ||
//       t.specialty.toLowerCase().includes(search.toLowerCase())
//     ), [trainers, search]
//   );

//   const handleSubmit = async (data) => {
//     setLoading(true);
//     await new Promise((r) => setTimeout(r, 400));
//     if (selected) {
//       updateTrainer(selected.id, data);
//       toast.success("Trainer updated!");
//     } else {
//       addTrainer(data);
//       toast.success("Trainer added!");
//     }
//     setLoading(false);
//     setModalOpen(false);
//     setSelected(null);
//   };

//   const handleDelete = (id) => {
//     deleteTrainer(id);
//     toast.success("Trainer removed.");
//   };

//   const openEdit = (trainer) => {
//     setSelected(trainer);
//     setModalOpen(true);
//   };

//   return (
//     <div className="space-y-5 animate-fade-in">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="section-title">Trainers</h1>
//           <p className="text-sm text-brand-subtle mt-0.5">
//             {trainers.filter((t) => t.status === "active").length} active trainers
//           </p>
//         </div>
//         <Button onClick={() => { setSelected(null); setModalOpen(true); }}>
//           <UserPlus size={15} /> Add Trainer
//         </Button>
//       </div>

//       {/* Search */}
//       <div className="card p-4">
//         <div className="relative max-w-sm">
//           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle" />
//           <input
//             type="text"
//             placeholder="Search by name or specialty..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="input-field pl-9"
//           />
//         </div>
//       </div>

//       {/* Summary stats */}
//       <div className="grid grid-cols-3 gap-3">
//         {[
//           { label: "Total Trainers", value: trainers.length },
//           { label: "Active", value: trainers.filter((t) => t.status === "active").length },
//           {
//             label: "Total Salary",
//             value: formatCurrency(trainers.filter((t) => t.status === "active").reduce((a, t) => a + (t.salary || 0), 0)),
//           },
//         ].map(({ label, value }) => (
//           <div key={label} className="card p-4 text-center">
//             <p className="font-display text-2xl font-bold text-brand-text">{value}</p>
//             <p className="text-xs text-brand-subtle mt-1">{label}</p>
//           </div>
//         ))}
//       </div>

//       {/* Cards grid */}
//       {filtered.length === 0 ? (
//         <div className="card">
//           <EmptyState
//             icon={Users}
//             title="No trainers found"
//             description="Add your first trainer to get started."
//             action={
//               <Button onClick={() => setModalOpen(true)}>
//                 <UserPlus size={15} /> Add Trainer
//               </Button>
//             }
//           />
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {filtered.map((trainer) => (
//             <TrainerCard key={trainer.id} trainer={trainer} onEdit={openEdit} onDelete={handleDelete} />
//           ))}
//         </div>
//       )}

//       <Modal
//         isOpen={modalOpen}
//         onClose={() => { setModalOpen(false); setSelected(null); }}
//         title={selected ? "Edit Trainer" : "Add Trainer"}
//         size="md"
//       >
//         <TrainerForm
//           initial={selected || {}}
//           onSubmit={handleSubmit}
//           onCancel={() => { setModalOpen(false); setSelected(null); }}
//           loading={loading}
//         />
//       </Modal>
//     </div>
//   );
// }
// src/pages/Trainers.jsx

import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  UserPlus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Users,
  Search,
  Dumbbell,
} from "lucide-react";
import { useApp } from "../hooks/useApp";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import { Badge } from "../components/ui/Table";
import { EmptyState } from "../components/ui/Card";
import TrainerForm from "../components/trainers/TrainerForm";
import { formatCurrency } from "../utils";

function TrainerCard({ trainer, onEdit, onDelete }) {
  return (
    <div className="card p-5 hover:border-brand-muted transition-colors animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={trainer.name} photo={trainer.photo} size="md" />
          <div>
            <h3 className="font-display font-bold text-brand-text">
              {trainer.name}
            </h3>
            <span className="text-xs text-brand-orange font-medium">
              {trainer.specialty}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge status={trainer.status} />
          {trainer.offers_personal_training && (
            <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px]">
              PT Trainer
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-brand-subtle">
          <Phone size={13} /> {trainer.phone}
        </div>
        {trainer.email && (
          <div className="flex items-center gap-2 text-sm text-brand-subtle">
            <Mail size={13} /> {trainer.email}
          </div>
        )}
      </div>

      <div className={`grid ${trainer.offers_personal_training ? "grid-cols-3" : "grid-cols-2"} gap-2 p-3 bg-brand-surface rounded-xl border border-brand-border mb-4`}>
        <div className="text-center">
          {/* Fixed: use client_count from backend, not the old 'clients' field */}
          <p className="font-display text-xl font-bold text-brand-text">
            {trainer.client_count ?? 0}
          </p>
          <p className="text-[10px] text-brand-subtle uppercase tracking-wider">
            Clients
          </p>
        </div>
        {trainer.offers_personal_training && (
          <div className="text-center border-l border-brand-border">
            <p className="font-display text-xl font-bold text-purple-400">
              {trainer.pt_client_count ?? 0}
            </p>
            <p className="text-[10px] text-brand-subtle uppercase tracking-wider">
              PT Clients
            </p>
          </div>
        )}
        <div className="text-center border-l border-brand-border">
          <p className="font-display text-xl font-bold text-emerald-400">
            {trainer.salary ? formatCurrency(trainer.salary) : "—"}
          </p>
          <p className="text-[10px] text-brand-subtle uppercase tracking-wider">
            Monthly
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 justify-center"
          onClick={() => onEdit(trainer)}
        >
          <Edit2 size={13} /> Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(trainer.id)}>
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
}

export default function Trainers() {
  const { trainers, addTrainer, updateTrainer, deleteTrainer } = useApp();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "add") setModalOpen(true);
  }, [location.search]);

  const filtered = useMemo(
    () =>
      trainers.filter(
        (t) =>
          !search ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.specialty?.toLowerCase().includes(search.toLowerCase())
      ),
    [trainers, search]
  );

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (selected) {
        await updateTrainer(selected.id, data);
      } else {
        await addTrainer(data);
      }
      setModalOpen(false);
      setSelected(null);
    } catch {
      // toast handled in useApp
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteTrainer(id);
  };

  const openEdit = (trainer) => {
    setSelected(trainer);
    setModalOpen(true);
  };

  const activeTrainers = trainers.filter((t) => t.status === "active");

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Trainers</h1>
          <p className="text-sm text-brand-subtle mt-0.5">
            {activeTrainers.length} active trainers
          </p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
        >
          <UserPlus size={15} /> Add Trainer
        </Button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle"
          />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Trainers", value: trainers.length },
          { label: "Active", value: activeTrainers.length },
          {
            label: "PT Trainers",
            value: trainers.filter((t) => t.offers_personal_training).length,
          },
          {
            label: "Total Salary",
            value: formatCurrency(
              activeTrainers.reduce((a, t) => a + (Number(t.salary) || 0), 0)
            ),
          },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="font-display text-2xl font-bold text-brand-text">
              {value}
            </p>
            <p className="text-xs text-brand-subtle mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No trainers found"
            description="Add your first trainer to get started."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <UserPlus size={15} /> Add Trainer
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              trainer={trainer}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Trainer" : "Add Trainer"}
        size="md"
      >
        <TrainerForm
          initial={selected || {}}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setSelected(null);
          }}
          loading={loading}
        />
      </Modal>
    </div>
  );
}