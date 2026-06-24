// src/components/clients/ClientDetail.jsx

import {
  Phone, Mail, MapPin, Calendar, Edit2, Trash2,
  MessageCircle, RefreshCw,
} from "lucide-react";
import Avatar from "../ui/Avatar";
import { Badge } from "../ui/Table";
import Button from "../ui/Button";
import { useApp } from "../../hooks/useApp";
import { formatCurrency, formatDate, getTrainerName, daysUntilExpiry } from "../../utils";

/**
 * ClientDetail
 *
 * Props:
 *   client   – the client object from state
 *   onEdit   – opens edit form
 *   onDelete – deletes client
 *   onRenew  – opens renew modal (only shown for expiring/expired)
 */
export default function ClientDetail({ client, onEdit, onDelete, onRenew }) {
  const { trainers, programs } = useApp();

  const days = daysUntilExpiry(client.expiryDate ?? client.expiry_date);

  // Resolve program name from program_package data
  const programName =
    client.program_name ??
    (() => {
      const pkgId = client.programPackageId ?? client.program_package;
      if (!pkgId) return null;
      for (const prog of programs) {
        if (prog.packages?.some((pk) => pk.id === Number(pkgId))) {
          return prog.name;
        }
      }
      return null;
    })();

  const trainerName =
    client.trainer_name ??
    getTrainerName(client.trainerId ?? client.trainer, trainers) ??
    "None";

  const isExpiringSoon =
    client.status === "expiring" || client.status === "expired";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile header */}
      <div className="flex items-start gap-4 p-4 bg-brand-surface rounded-xl border border-brand-border">
        <Avatar name={client.name} size="lg" photo={client.photo} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-xl font-bold text-brand-text">
              {client.name}
            </h3>
            <Badge status={client.status} />
            {client.personalTraining && (
              <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">
                PT
              </span>
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
          {
            label: "Joined",
            value: formatDate(client.joinDate ?? client.join_date),
            icon: Calendar,
          },
          {
            label: "Expires",
            value: formatDate(client.expiryDate ?? client.expiry_date),
            icon: Calendar,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-brand-surface rounded-xl border border-brand-border p-3"
          >
            <p className="text-[10px] text-brand-subtle uppercase tracking-wider font-medium">
              {label}
            </p>
            <p className="text-sm font-medium text-brand-text mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Expiry / renewal alert */}
      {isExpiringSoon && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border ${client.status === "expired"
              ? "bg-red-500/5 border-red-500/30"
              : "bg-amber-500/5 border-amber-500/30"
            }`}
        >
          <div>
            <p
              className={`text-sm font-semibold ${client.status === "expired" ? "text-red-400" : "text-amber-400"
                }`}
            >
              {client.status === "expired"
                ? "Membership Expired"
                : `Expires in ${days} day${days !== 1 ? "s" : ""}`}
            </p>
            <p className="text-xs text-brand-subtle mt-0.5">
              Renew or send a reminder
            </p>
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

      {/* Payment history */}
      <div>
        <h4 className="font-display font-bold text-brand-text mb-3 text-base">
          Payment History
        </h4>
        {!client.payments || client.payments.length === 0 ? (
          <p className="text-sm text-brand-subtle text-center py-4">
            No payments recorded
          </p>
        ) : (
          <div className="space-y-2">
            {client.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between px-4 py-3 bg-brand-surface border border-brand-border rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-brand-text">
                    {payment.note || payment.method}
                  </p>
                  <p className="text-xs text-brand-subtle mt-0.5">
                    {formatDate(payment.date)} · {payment.method}
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
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(client.id)}
        >
          <Trash2 size={13} /> Delete
        </Button>

        <div className="flex gap-2">
          {/* Renew button — only shown for expiring/expired clients */}
          {isExpiringSoon && onRenew && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => onRenew(client)}
            >
              <RefreshCw size={13} /> Renew Membership
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
