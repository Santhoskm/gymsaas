// import { useState, useEffect, useMemo } from "react";
// import { useLocation } from "react-router-dom";
// import { UserPlus, Search, Filter, Users } from "lucide-react";
// import toast from "react-hot-toast";
// import { useApp } from "../hooks/useApp";
// import Modal from "../components/ui/Modal";
// import Button from "../components/ui/Button";
// import Avatar from "../components/ui/Avatar";
// import { Table, Badge } from "../components/ui/Table";
// import { EmptyState } from "../components/ui/Card";
// import ClientForm from "../components/clients/ClientForm";
// import ClientDetail from "../components/clients/ClientDetail";
// import { formatDate, getPackageName, getTrainerName } from "../utils";

// export default function Clients() {
//   const { clients, packages, trainers, addClient, updateClient, deleteClient } = useApp();
//   const location = useLocation();
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [detailOpen, setDetailOpen] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Auto-open add modal from query param
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     if (params.get("action") === "add") setModalOpen(true);
//     const f = params.get("filter");
//     if (f) setFilter(f);
//   }, [location.search]);

//   const filtered = useMemo(() => {
//     return clients.filter((c) => {
//       const matchesSearch =
//         !search ||
//         c.name.toLowerCase().includes(search.toLowerCase()) ||
//         c.phone.includes(search) ||
//         c.email?.toLowerCase().includes(search.toLowerCase());
//       const matchesFilter =
//         filter === "all" ||
//         c.status === filter ||
//         (filter === "pt" && c.personalTraining);
//       return matchesSearch && matchesFilter;
//     });
//   }, [clients, search, filter]);

//   const handleAdd = async (data) => {
//     setLoading(true);
//     try {
//       await addClient(data);
//       setModalOpen(false);
//     } catch {
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = async (data) => {
//     setLoading(true);
//     await new Promise((r) => setTimeout(r, 400));
//     updateClient(selected.id, data);
//     setLoading(false);
//     setDetailOpen(false);
//     setEditMode(false);
//     setSelected(null);
//     toast.success("Client updated successfully!");
//   };

//   const handleDelete = (id) => {
//     deleteClient(id);
//     setDetailOpen(false);
//     setSelected(null);
//     toast.success("Client removed.");
//   };

//   const openDetail = (client) => {
//     setSelected(client);
//     setEditMode(false);
//     setDetailOpen(true);
//   };

//   const columns = [
//     {
//       key: "name",
//       label: "Client",
//       render: (_, row) => (
//         <div className="flex items-center gap-3">
//           <Avatar name={row.name} photo={row.photo} size="sm" />
//           <div>
//             <p className="font-medium text-brand-text text-sm">{row.name}</p>
//             <p className="text-xs text-brand-subtle">{row.phone}</p>
//           </div>
//         </div>
//       ),
//     },
//     { key: 'package', render: (v) => getPackageName(v, packages) },
//     { key: 'trainer', render: (v) => getTrainerName(v, trainers) || '—' },
//     {
//       key: "expiryDate",
//       label: "Expiry",
//       render: (v) => <span className="text-sm text-brand-text font-mono">{formatDate(v)}</span>,
//     },
//     {
//       key: "personalTraining",
//       label: "PT",
//       render: (v) =>
//         v ? (
//           <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">Yes</span>
//         ) : (
//           <span className="text-brand-muted text-xs">—</span>
//         ),
//     },
//     {
//       key: "status",
//       label: "Status",
//       render: (v) => <Badge status={v} />,
//     },
//   ];

//   const filterOptions = [
//     { value: "all", label: "All" },
//     { value: "active", label: "Active" },
//     { value: "expiring", label: "Expiring" },
//     { value: "expired", label: "Expired" },
//     { value: "pt", label: "PT Only" },
//   ];

//   return (
//     <div className="space-y-5 animate-fade-in">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="section-title">Clients</h1>
//           <p className="text-sm text-brand-subtle mt-0.5">{clients.length} total members</p>
//         </div>
//         <Button onClick={() => { setSelected(null); setModalOpen(true); }}>
//           <UserPlus size={15} /> Add Client
//         </Button>
//       </div>

//       {/* Filters */}
//       <div className="card p-4">
//         <div className="flex flex-col sm:flex-row gap-3">
//           <div className="relative flex-1">
//             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle" />
//             <input
//               type="text"
//               placeholder="Search by name, phone or email..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="input-field pl-9"
//             />
//           </div>
//           <div className="flex items-center gap-2 shrink-0">
//             <Filter size={14} className="text-brand-subtle" />
//             <div className="flex gap-1 flex-wrap">
//               {filterOptions.map((opt) => (
//                 <button
//                   key={opt.value}
//                   onClick={() => setFilter(opt.value)}
//                   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === opt.value
//                     ? "bg-brand-red text-white"
//                     : "bg-brand-surface border border-brand-border text-brand-subtle hover:text-brand-text"
//                     }`}
//                 >
//                   {opt.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="card overflow-hidden">
//         {filtered.length === 0 ? (
//           <EmptyState
//             icon={Users}
//             title="No clients found"
//             description="Try adjusting your search or filter, or add a new client."
//             action={
//               <Button onClick={() => setModalOpen(true)}>
//                 <UserPlus size={15} /> Add First Client
//               </Button>
//             }
//           />
//         ) : (
//           <Table columns={columns} data={filtered} onRowClick={openDetail} />
//         )}
//       </div>

//       {/* Add Client Modal */}
//       <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Client" size="lg">
//         <ClientForm
//           onSubmit={handleAdd}
//           onCancel={() => setModalOpen(false)}
//           loading={loading}
//         />
//       </Modal>

//       {/* Detail / Edit Modal */}
//       <Modal
//         isOpen={detailOpen}
//         onClose={() => { setDetailOpen(false); setEditMode(false); setSelected(null); }}
//         title={editMode ? "Edit Client" : "Client Profile"}
//         size="lg"
//       >
//         {selected && !editMode && (
//           <ClientDetail
//             client={selected}
//             onEdit={() => setEditMode(true)}
//             onDelete={handleDelete}
//           />
//         )}
//         {selected && editMode && (
//           <ClientForm
//             initial={selected}
//             onSubmit={handleEdit}
//             onCancel={() => setEditMode(false)}
//             loading={loading}
//           />
//         )}
//       </Modal>
//     </div>
//   );
// }


// src/pages/Clients.jsx

import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { UserPlus, Search, Filter, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useApp } from "../hooks/useApp";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import { Table, Badge } from "../components/ui/Table";
import { EmptyState } from "../components/ui/Card";
import ClientForm from "../components/clients/ClientForm";
import ClientDetail from "../components/clients/ClientDetail";
import { formatDate, getPackageName, getTrainerName } from "../utils";

export default function Clients() {
  const {
    clients,
    packages,
    trainers,
    addClient,
    updateClient,
    deleteClient,
  } = useApp();

  const location = useLocation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "add") setModalOpen(true);
    const f = params.get("filter");
    if (f) setFilter(f);
  }, [location.search]);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.email?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        c.status === filter ||
        (filter === "pt" && c.personalTraining);
      return matchesSearch && matchesFilter;
    });
  }, [clients, search, filter]);

  const handleAdd = async (data) => {
    setLoading(true);
    try {
      await addClient(data); // useApp handles toast on success/error
      setModalOpen(false);
    } catch {
      // error toast already shown in useApp
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data) => {
    setLoading(true);
    try {
      await updateClient(selected.id, data);
      setDetailOpen(false);
      setEditMode(false);
      setSelected(null);
    } catch {
      // error toast already shown in useApp
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteClient(id);
    setDetailOpen(false);
    setSelected(null);
  };

  const openDetail = (client) => {
    setSelected(client);
    setEditMode(false);
    setDetailOpen(true);
  };

  const columns = [
    {
      key: "name",
      label: "Client",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} photo={row.photo} size="sm" />
          <div>
            <p className="font-medium text-brand-text text-sm">{row.name}</p>
            <p className="text-xs text-brand-subtle">{row.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "packageId",
      label: "Package",
      render: (v) => (
        <span className="text-sm text-brand-subtle">
          {getPackageName(v, packages)}
        </span>
      ),
    },
    {
      key: "trainerId",
      label: "Trainer",
      render: (v) => (
        <span className="text-sm text-brand-subtle">
          {getTrainerName(v, trainers) || "—"}
        </span>
      ),
    },
    {
      key: "expiryDate",
      label: "Expiry",
      render: (v) => (
        <span className="text-sm text-brand-text font-mono">
          {formatDate(v)}
        </span>
      ),
    },
    {
      key: "personalTraining",
      label: "PT",
      render: (v) =>
        v ? (
          <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Yes
          </span>
        ) : (
          <span className="text-brand-muted text-xs">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <Badge status={v} />,
    },
  ];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "expiring", label: "Expiring" },
    { value: "expired", label: "Expired" },
    { value: "pt", label: "PT Only" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Clients</h1>
          <p className="text-sm text-brand-subtle mt-0.5">
            {clients.length} total members
          </p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
        >
          <UserPlus size={15} /> Add Client
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle"
            />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={14} className="text-brand-subtle" />
            <div className="flex gap-1 flex-wrap">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === opt.value
                      ? "bg-brand-red text-white"
                      : "bg-brand-surface border border-brand-border text-brand-subtle hover:text-brand-text"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No clients found"
            description="Try adjusting your search or filter, or add a new client."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <UserPlus size={15} /> Add First Client
              </Button>
            }
          />
        ) : (
          <Table columns={columns} data={filtered} onRowClick={openDetail} />
        )}
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Client"
        size="lg"
      >
        <ClientForm
          onSubmit={handleAdd}
          onCancel={() => setModalOpen(false)}
          loading={loading}
        />
      </Modal>

      {/* Detail / Edit Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setEditMode(false);
          setSelected(null);
        }}
        title={editMode ? "Edit Client" : "Client Profile"}
        size="lg"
      >
        {selected && !editMode && (
          <ClientDetail
            client={selected}
            onEdit={() => setEditMode(true)}
            onDelete={handleDelete}
          />
        )}
        {selected && editMode && (
          <ClientForm
            initial={selected}
            onSubmit={handleEdit}
            onCancel={() => setEditMode(false)}
            loading={loading}
          />
        )}
      </Modal>
    </div>
  );
}