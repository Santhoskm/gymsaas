// src/pages/Clients.jsx

import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { UserPlus, Search, Filter, Users, RefreshCw } from "lucide-react";
import { useApp } from "../hooks/useApp";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import { Table, Badge } from "../components/ui/Table";
import { EmptyState } from "../components/ui/Card";
import ClientForm from "../components/clients/ClientForm";
import ClientDetail from "../components/clients/ClientDetail";
import { formatDate, getTrainerName } from "../utils";

export default function Clients() {
  const { clients, trainers, addClient, updateClient, deleteClient } = useApp();

  const location = useLocation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [renewMode, setRenewMode] = useState(false);   // ← NEW
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-open add modal or apply filter from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "add") setModalOpen(true);
    const f = params.get("filter");
    if (f) setFilter(f);
  }, [location.search]);

  // ── Filtered client list ────────────────────────────────────────────────────
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

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAdd = async (data) => {
    setLoading(true);
    try {
      await addClient(data);
      setModalOpen(false);
    } catch {
      // error toast shown inside useApp
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
      // error toast shown inside useApp
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleRenew — same as handleEdit but also refreshes dashboard.
   * The backend will call client.update_status() after saving the new expiry_date,
   * which automatically flips expired → active.
   */
  const handleRenew = async (data) => {
    setLoading(true);
    try {
      await updateClient(selected.id, data);
      setModalOpen(false);
      setRenewMode(false);
      setSelected(null);
    } catch {
      // error toast shown inside useApp
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
    setRenewMode(false);
    setDetailOpen(true);
  };

  /**
   * openRenewModal — opens the Add/Edit modal pre-filled with the client's
   * existing data. The expiry date is pre-set to +1 month from today so the
   * staff member only needs to confirm (or change) it.
   */
  const openRenewModal = (client, e) => {
    e?.stopPropagation(); // don't also open the detail modal
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const newExpiry = nextMonth.toISOString().split("T")[0];

    setSelected({ ...client, expiryDate: newExpiry });
    setRenewMode(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setRenewMode(false);
    setSelected(null);
  };

  // ── Table columns ───────────────────────────────────────────────────────────
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
        <span className="text-sm text-brand-text font-mono">{formatDate(v)}</span>
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
    {
      // Renew button — only visible for expiring / expired clients
      key: "id",
      label: "",
      render: (_, row) =>
        row.status === "expiring" || row.status === "expired" ? (
          <Button
            size="xs"
            variant="warning"
            onClick={(e) => openRenewModal(row, e)}
            className="whitespace-nowrap"
          >
            <RefreshCw size={12} /> Renew
          </Button>
        ) : null,
    },
  ];

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "expiring", label: "Expiring" },
    { value: "expired", label: "Expired" },
    { value: "pt", label: "PT Only" },
  ];

  // ── Derive modal title ──────────────────────────────────────────────────────
  const modalTitle = renewMode
    ? "Renew Membership"
    : "Add New Client";

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
            setRenewMode(false);
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

      {/* Add / Renew Client Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalTitle}
        size="lg"
      >
        <ClientForm
          initial={selected ?? {}}
          onSubmit={renewMode ? handleRenew : handleAdd}
          onCancel={closeModal}
          loading={loading}
          isRenewal={renewMode}
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
            onRenew={(client) => {
              setDetailOpen(false);
              openRenewModal(client);
            }}
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
