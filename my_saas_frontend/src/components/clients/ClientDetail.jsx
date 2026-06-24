// src/components/clients/ClientDetail.jsx

import {
  Phone, Mail, MapPin, Calendar, Edit2, Trash2,
  MessageCircle, RefreshCw, ArrowUpCircle, History,
} from "lucide-react";
import { useState } from "react";
import Avatar from "../ui/Avatar";
import { Badge } from "../ui/Table";
import Button from "../ui/Button";
import { useApp } from "../../hooks/useApp";
import { formatCurrency, formatDate, getTrainerName, daysUntilExpiry } from "../../utils";

function ActionBadge({ action }) {
  const config = {
    new: { label: "New Enrollment", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    renewal: { label: "Renewal", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    upgrade: { label: "Upgrade", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  };
  const c = config[action] ?? config.new;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.cls}`}>
      {c.label}
    </span>
  );
}

export default function ClientDetail({ client, onEdit, onDelete, onRenew, onUpgrade }) {
  const { trainers, programs } = useApp();
  const [showHistory, setShowHistory] = useState(false);

  const days = daysUntilExpiry(client.expiryDate ?? client.expiry_date);

  const programName =
    client.program_name ??
    (() => {
      const pkgId = client.programPackageId ?? client.program_package;
      if (!pkgId) return null;
      for (const prog of programs) {
        if (prog.packages?.some((pk) => pk.id === Number(pkgId))) return prog.name;
      }
      return null;
    })();

  const trainerName =
    client.trainer_name ??
    getTrainerName(client.trainerId ?? client.trainer, trainers) ??
    "None";

  const isExpiringSoon = client.status === "expiring" || client.status === "expired";
  const membershipHistory = client.membership_history ?? [];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile header */}
      <div className="flex items-start gap-4 p-4 bg-brand-surface rounded-xl border border-brand-border">
        <Avatar name={client.name} size="lg" photo={client.photo} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-xl font-bold text-brand-text">{client.name}</h3>
            <Badge status={client.status} />
            {(client.personalTraining || client.personal_training) && (
              <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">PT</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-sm text-brand-subtle">
              <Phone size={13} /> {client.phone}
            </span>
            {client.email && (
              <span className="flex items-center gap-1.5 text-sm text-brand-subtle">
                <Mail size={13} /> {client.email}
              </span>
            )}
          </div>
          {client.address && (
            <span className="flex items-center gap-1.5 text-sm text-brand-subtle mt-1">
              <MapPin size={13} /> {client.address}
            </span>
          )}
        </div>
      </div>

      {/* Membership details */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Program", value: programName || "—" },
          { label: "Trainer", value: trainerName },
          { label: "Joined", value: formatDate(client.joinDate ?? client.join_date), icon: Calendar },
          { label: "Expires", value: formatDate(client.expiryDate ?? client.expiry_date), icon: Calendar },
        ].map(({ label, value }) => (
          <div key={label} className="bg-brand-surface rounded-xl border border-brand-border p-3">
            <p className="text-[10px] text-brand-subtle uppercase tracking-wider font-medium">{label}</p>
            <p className="text-sm font-medium text-brand-text mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Expiry / renewal alert */}
      {isExpiringSoon && (
        <div className={`flex items-center justify-between p-4 rounded-xl border ${client.status === "expired"
            ? "bg-red-500/5 border-red-500/30"
            : "bg-amber-500/5 border-amber-500/30"
          }`}>
          <div>
            <p className={`text-sm font-semibold ${client.status === "expired" ? "text-red-400" : "text-amber-400"}`}>
              {client.status === "expired"
                ? "Membership Expired"
                : `Expires in ${days} day${days !== 1 ? "s" : ""}`}
            </p>
            <p className="text-xs text-brand-subtle mt-0.5">Renew or send a reminder</p>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://wa.me/91${client.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-green-400 text-xs font-medium transition-colors"
            >
              <MessageCircle size={12} /> WhatsApp
            </a>
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-medium transition-colors"
            >
              <Phone size={12} /> Call
            </a>
          </div>
        </div>
      )}

      {/* ── Membership History ──────────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 font-display font-bold text-brand-text mb-3 text-base hover:text-brand-red transition-colors w-full"
        >
          <History size={16} />
          Membership History
          <span className="ml-1 text-xs font-normal text-brand-subtle bg-brand-card px-2 py-0.5 rounded-full">
            {membershipHistory.length}
          </span>
          <span className="ml-auto text-xs text-brand-subtle font-normal">
            {showHistory ? "Hide ▲" : "Show ▼"}
          </span>
        </button>

        {showHistory && (
          <div className="space-y-2">
            {membershipHistory.length === 0 ? (
              <p className="text-sm text-brand-subtle text-center py-4">No history recorded yet.</p>
            ) : (
              membershipHistory.map((h, idx) => (
                <div
                  key={h.id}
                  className="flex items-start gap-3 px-4 py-3 bg-brand-surface border border-brand-border rounded-xl"
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? "bg-brand-red" : "bg-brand-border"}`} />
                    {idx < membershipHistory.length - 1 && (
                      <div className="w-px flex-1 bg-brand-border mt-1 min-h-[1.5rem]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <ActionBadge action={h.action} />
                      {h.program_name && (
                        <span className="text-xs text-brand-subtle">{h.program_name}</span>
                      )}
                      {h.program_package_name && (
                        <span className="text-xs font-medium text-brand-text">
                          · {h.program_package_name}
                          {h.package_duration ? ` (${h.package_duration}mo)` : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-brand-subtle flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(h.join_date)} → {formatDate(h.expiry_date)}
                      </span>
                      {h.amount_paid && (
                        <span className="text-emerald-400 font-semibold">
                          {formatCurrency(h.amount_paid)} ({h.payment_method?.toUpperCase()})
                        </span>
                      )}
                    </div>
                    {h.note && (
                      <p className="text-xs text-brand-subtle italic mt-1">{h.note}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-brand-subtle shrink-0">
                    {new Date(h.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div>
        <h4 className="font-display font-bold text-brand-text mb-3 text-base">Payment History</h4>
        {!client.payments || client.payments.length === 0 ? (
          <p className="text-sm text-brand-subtle text-center py-4">No payments recorded</p>
        ) : (
          <div className="space-y-2">
            {client.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between px-4 py-3 bg-brand-surface border border-brand-border rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-brand-text">{payment.note || payment.method}</p>
                  <p className="text-xs text-brand-subtle mt-0.5">
                    {formatDate(payment.date)} · {payment.method?.toUpperCase()}
                  </p>
                </div>
                <span className="font-display font-bold text-emerald-400 text-base">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-brand-border gap-2 flex-wrap">
        <Button variant="danger" size="sm" onClick={() => onDelete(client.id)}>
          <Trash2 size={13} /> Delete
        </Button>

        <div className="flex gap-2 flex-wrap">
          {/* Upgrade — always available (mid-cycle package change) */}
          {onUpgrade && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUpgrade(client)}
            >
              <ArrowUpCircle size={13} /> Upgrade Package
            </Button>
          )}
          {/* Renew — for expiring/expired */}
          {isExpiringSoon && onRenew && (
            <Button variant="warning" size="sm" onClick={() => onRenew(client)}>
              <RefreshCw size={13} /> Renew
            </Button>
          )}
          <Button size="sm" onClick={() => onEdit(client)}>
            <Edit2 size={13} /> Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
