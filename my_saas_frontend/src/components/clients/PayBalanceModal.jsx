// src/components/clients/PayBalanceModal.jsx

import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Select } from "../ui/Input";
import { formatCurrency } from "../../utils";

/**
 * PayBalanceModal — lets staff clear (fully or partially) a client's
 * outstanding balance_due by recording a new Payment against it.
 *
 * Props:
 *   isOpen, onClose
 *   client   – client object (needs .id, .name, .balanceDue)
 *   onSubmit – async (clientId, { amount, method, note }) => void
 */
export default function PayBalanceModal({ isOpen, onClose, client, onSubmit }) {
    const balance = Number(client?.balanceDue ?? client?.balance_due ?? 0);

    const [amount, setAmount] = useState(balance > 0 ? String(balance) : "");
    const [method, setMethod] = useState("cash");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            setError("Enter a valid amount");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await onSubmit(client.id, { amount: numAmount, method, note });
            setAmount("");
            setNote("");
            onClose();
        } catch {
            /* toast shown by useApp */
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pay Balance" size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <span className="text-sm text-amber-400 font-medium">Outstanding balance</span>
                    <span className="font-display font-bold text-amber-400 text-lg">
                        {formatCurrency(balance)}
                    </span>
                </div>

                <div>
                    <Input
                        label="Amount to Pay (₹)"
                        type="number"
                        step="0.01"
                        placeholder={`up to ${balance}`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        error={error}
                    />
                    {balance > 0 && amount !== String(balance) && (
                        <button
                            type="button"
                            className="text-xs text-brand-red mt-1 hover:underline"
                            onClick={() => setAmount(String(balance))}
                        >
                            Pay full balance (₹{balance})
                        </button>
                    )}
                </div>

                <Select label="Payment Method" value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                </Select>

                <Input
                    label="Note (optional)"
                    placeholder="e.g. Cleared pending dues"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                <div className="flex justify-end gap-3 pt-2 border-t border-brand-border">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading}>
                        Record Payment
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
