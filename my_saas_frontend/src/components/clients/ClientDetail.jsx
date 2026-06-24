// src/components/clients/ClientDetail.jsx

import { Phone, Mail, MapPin, Calendar, Edit2, Trash2, MessageCircle } from "lucide-react";
import Avatar from "../ui/Avatar";
import { Badge } from "../ui/Table";
import Button from "../ui/Button";
import { formatCurrency, formatDate, daysUntilExpiry } from "../../utils";

export default function ClientDetail({ client, onEdit, onDelete }) {
  const days = daysUntilExpiry(client.expiryDate);

  const paymentMethodBadge = client.paymentMethod === "upi"
    ? { label: "📱 UPI", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" }
    : { label: "💵 Cash", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile header */}
      <div className="flex items-start gap-4 p-4 bg-brand-surface rounded-xl border border-brand-border">
        <Avatar name={client.name} size="lg" photo={client.photo} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-xl font-bold text-brand-text">{client.name}</h3>
            <Badge status={client.status} />
            {client.personalTraining && (
              <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">PT</span>
            )}
            {/* Payment Method badge */}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${paymentMethodBadge.cls}`}>
              {paymentMethodBadge.label}
            </span>
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
          { label: "Program", value: client.program_name || client.package_name || "—" },
          { label: "Package", value: client.program_package_name || "—" },
          { label: "Trainer", value: client.trainer_name || "None" },
          { label: "Payment", value: client.paymentMethod === "upi" ? "UPI" : "Cash" },
          { label: "Joined", value: formatDate(client.joinDate) },
          { label: "Expires", value: formatDate(client.expiryDate) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-brand-surface rounded-xl border border-brand-border p-3">
            <p className="text-[10px] text-brand-subtle uppercase tracking-wider font-medium">{label}</p>
            <p className="text-sm font-medium text-brand-text mt-1 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Expiry alert */}
      {(client.status === "expiring" || client.status === "expired") && (
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
            <p className="text-xs text-brand-subtle mt-0.5">Send a reminder to renew</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-green-400 text-xs font-medium transition-colors">
              <MessageCircle size={12} /> WhatsApp
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-medium transition-colors">
              <Phone size={12} /> Call
            </button>
          </div>
        </div>
      )}

      {/* Payment history */}
      <div>
        <h4 className="font-display font-bold text-brand-text mb-3 text-base">Payment History</h4>
        {!client.payments?.length ? (
          <p className="text-sm text-brand-subtle text-center py-4">No payments recorded</p>
        ) : (
          <div className="space-y-2">
            {client.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-4 py-3 bg-brand-surface border border-brand-border rounded-xl">
                <div>
                  <p className="text-sm font-medium text-brand-text">{payment.note || "Payment"}</p>
                  <p className="text-xs text-brand-subtle mt-0.5">
                    {formatDate(payment.date)} ·{" "}
                    <span className={payment.method === "upi" ? "text-blue-400" : "text-emerald-400"}>
                      {payment.method === "upi" ? "📱 UPI" : "💵 Cash"}
                    </span>
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
      <div className="flex justify-between pt-2 border-t border-brand-border">
        <Button variant="danger" size="sm" onClick={() => onDelete(client.id)}>
          <Trash2 size={13} /> Delete
        </Button>
        <Button size="sm" onClick={() => onEdit(client)}>
          <Edit2 size={13} /> Edit Client
        </Button>
      </div>
    </div>
  );
}