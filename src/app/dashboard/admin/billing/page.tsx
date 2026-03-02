"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentStatus = "paid" | "partial" | "pending";
type PaymentMode = "cash" | "upi" | "card" | "insurance" | "";

interface BillItem {
  treatmentName: string;
  toothNumber: string;
  quantity: number;
  unitCost: number;
}

interface Bill {
  _id: string;
  invoiceNumber: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  visitDate: string;
  doctor: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  notes: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const STATUS_META: Record<PaymentStatus, { label: string; style: string }> = {
  paid: { label: "Paid", style: "bg-green-100 text-green-700" },
  partial: { label: "Partial", style: "bg-yellow-100 text-yellow-700" },
  pending: { label: "Pending", style: "bg-red-100 text-red-600" },
};

const MODE_ICON: Record<string, string> = {
  cash: "💵",
  upi: "📱",
  card: "💳",
  insurance: "🏥",
  "": "—",
};

const initials = (n: string) =>
  n.split(" ").map((x) => x[0]).join("").toUpperCase().slice(0, 2);

const EMPTY_FORM = {
  patientName: "",
  patientEmail: "",
  patientPhone: "",
  visitDate: new Date().toISOString().slice(0, 10),
  doctor: "",
  discount: "0",
  paymentStatus: "pending" as PaymentStatus,
  paymentMode: "" as PaymentMode,
  amountPaid: "0",
  notes: "",
  items: [{ key: "new1", treatmentName: "", toothNumber: "", quantity: "1", unitCost: "" }] as {
    key: string;
    treatmentName: string;
    toothNumber: string;
    quantity: string;
    unitCost: string;
  }[],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BillingPage() {
  const { accessToken } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const LIMIT = 20;

  const [selected, setSelected] = useState<Bill | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [revenue, setRevenue] = useState({ totalRevenue: 0, totalPaid: 0, totalPending: 0 });
  const [counts, setCounts] = useState({ all: 0, paid: 0, partial: 0, pending: 0 });

  const headers = useCallback(() => ({
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }), [accessToken]);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        paymentStatus: statusFilter === "all" ? "" : statusFilter,
        page: String(page),
        limit: String(LIMIT),
      });
      const res = await fetch(`/api/admin/billing?${params}`, { headers: headers(), credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setBills(json.data.bills);
        setTotal(json.data.total);
        setPages(json.data.pages);
        if (json.data.revenue) setRevenue(json.data.revenue);
      }
    } finally { setLoading(false); }
  }, [headers, debouncedSearch, statusFilter, page]);

  const fetchCounts = useCallback(async () => {
    try {
      const [all, paid, partial, pending] = await Promise.all([
        fetch("/api/admin/billing?limit=1", { headers: headers(), credentials: "include" }).then((r) => r.json()),
        fetch("/api/admin/billing?paymentStatus=paid&limit=1", { headers: headers(), credentials: "include" }).then((r) => r.json()),
        fetch("/api/admin/billing?paymentStatus=partial&limit=1", { headers: headers(), credentials: "include" }).then((r) => r.json()),
        fetch("/api/admin/billing?paymentStatus=pending&limit=1", { headers: headers(), credentials: "include" }).then((r) => r.json()),
      ]);
      setCounts({
        all: all.data?.total ?? 0,
        paid: paid.data?.total ?? 0,
        partial: partial.data?.total ?? 0,
        pending: pending.data?.total ?? 0,
      });
    } catch { /* silent */ }
  }, [headers]);

  useEffect(() => { fetchBills(); }, [fetchBills]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  // Compute form subtotal/total
  const formSubtotal = form.items.reduce(
    (s, i) => s + Number(i.quantity || 0) * Number(i.unitCost || 0),
    0
  );
  const formTotal = Math.max(0, formSubtotal - Number(form.discount || 0));

  const addFormItem = () => {
    setForm((p) => ({
      ...p,
      items: [...p.items, { key: `new${Date.now()}`, treatmentName: "", toothNumber: "", quantity: "1", unitCost: "" }],
    }));
  };

  const removeFormItem = (key: string) => {
    setForm((p) => ({ ...p, items: p.items.filter((i) => i.key !== key) }));
  };

  const updateFormItem = (key: string, field: string, val: string) => {
    setForm((p) => ({
      ...p,
      items: p.items.map((i) => (i.key === key ? { ...i, [field]: val } : i)),
    }));
  };

  const handleGenerate = async () => {
    if (!form.patientName || form.items.some((i) => !i.treatmentName)) return;
    setSaving(true);
    try {
      const payload = {
        patientName: form.patientName,
        patientEmail: form.patientEmail,
        patientPhone: form.patientPhone,
        visitDate: form.visitDate,
        doctor: form.doctor,
        discount: Number(form.discount) || 0,
        amountPaid: Number(form.amountPaid) || 0,
        paymentMode: form.paymentMode,
        notes: form.notes,
        items: form.items.map((i) => ({
          treatmentName: i.treatmentName,
          toothNumber: i.toothNumber || "—",
          quantity: Number(i.quantity) || 1,
          unitCost: Number(i.unitCost) || 0,
        })),
      };
      const res = await fetch("/api/admin/billing", {
        method: "POST",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "ok", msg: `Invoice ${json.data.invoiceNumber} generated.` });
        setForm(EMPTY_FORM);
        setShowAdd(false);
        fetchBills();
        fetchCounts();
      } else {
        setFeedback({ type: "err", msg: json.error ?? "Failed to generate invoice." });
      }
    } finally { setSaving(false); setTimeout(() => setFeedback(null), 4000); }
  };

  const updatePaymentStatus = async (bill: Bill, status: PaymentStatus) => {
    try {
      const res = await fetch(`/api/admin/billing/${bill._id}`, {
        method: "PATCH",
        headers: headers(),
        credentials: "include",
        body: JSON.stringify({ paymentStatus: status }),
      });
      const json = await res.json();
      if (json.success) {
        fetchBills();
        fetchCounts();
        if (selected?._id === bill._id) setSelected(json.data);
      }
    } catch { /* silent */ }
  };

  const handleDelete = async (bill: Bill) => {
    if (!confirm(`Delete invoice ${bill.invoiceNumber}?`)) return;
    try {
      await fetch(`/api/admin/billing/${bill._id}`, { method: "DELETE", headers: headers(), credentials: "include" });
      setSelected(null);
      fetchBills();
      fetchCounts();
    } catch { /* silent */ }
  };

  const FILTER_TABS: { key: PaymentStatus | "all"; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "paid", label: `Paid (${counts.paid})` },
    { key: "partial", label: `Partial (${counts.partial})` },
    { key: "pending", label: `Pending (${counts.pending})` },
  ];

  return (
    <div className="flex w-full">
      <DashboardSidebar navItems={adminNavItems} title="DentalCare" subtitle="Admin Panel" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">
              Billing & Payments
            </h1>
            <p className="text-navy/50 text-sm mt-1">
              Generate invoices, track collections and payment status.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-gold text-sm px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Generate Bill
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
            feedback.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Billed", value: `₹${revenue.totalRevenue.toLocaleString()}`, color: "text-navy" },
            { label: "Collected", value: `₹${revenue.totalPaid.toLocaleString()}`, color: "text-green-600" },
            { label: "Pending / Due", value: `₹${revenue.totalPending.toLocaleString()}`, color: "text-red-500" },
            { label: "Total Invoices", value: counts.all, color: "text-navy" },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card rounded-2xl p-4 text-center">
              <p className={`text-lg sm:text-xl font-fraunces font-bold ${color}`}>{value}</p>
              <p className="text-navy/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-navy/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search patient, invoice number or doctor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-navy placeholder:text-navy/30"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-navy/30 hover:text-navy">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  statusFilter === key ? "bg-navy text-white" : "bg-navy/5 text-navy/60 hover:bg-navy/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="glass-card rounded-2xl p-10 text-center text-navy/40 text-sm">Loading bills…</div>
          ) : bills.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-navy/40 text-sm">No bills found.</div>
          ) : (
            bills.map((b) => (
              <div key={b._id} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-navy text-sm">{b.patientName}</p>
                    <p className="text-navy/40 text-xs">{b.invoiceNumber} · {fmtDate(b.visitDate)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${STATUS_META[b.paymentStatus].style}`}>
                    {STATUS_META[b.paymentStatus].label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-navy/40">Total</p>
                    <p className="font-semibold text-navy">₹{b.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-navy/40">Paid</p>
                    <p className="font-semibold text-green-600">₹{b.amountPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-navy/40">Due</p>
                    <p className="font-semibold text-red-500">₹{(b.total - b.amountPaid).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-navy/40 text-xs">{MODE_ICON[b.paymentMode]} {b.paymentMode || "Not specified"}</p>
                  <button onClick={() => setSelected(b)} className="text-xs text-gold font-medium hover:underline">
                    View Invoice →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/8">
                <th className="text-left text-xs font-semibold text-navy/50 px-5 py-4">Invoice</th>
                <th className="text-left text-xs font-semibold text-navy/50 px-4 py-4">Patient</th>
                <th className="text-left text-xs font-semibold text-navy/50 px-4 py-4">Doctor</th>
                <th className="text-left text-xs font-semibold text-navy/50 px-4 py-4">Date</th>
                <th className="text-right text-xs font-semibold text-navy/50 px-4 py-4">Total</th>
                <th className="text-right text-xs font-semibold text-navy/50 px-4 py-4">Paid</th>
                <th className="text-right text-xs font-semibold text-navy/50 px-4 py-4">Balance</th>
                <th className="text-center text-xs font-semibold text-navy/50 px-4 py-4">Status</th>
                <th className="text-right text-xs font-semibold text-navy/50 px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center text-navy/40 text-sm py-10">Loading…</td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-navy/40 text-sm py-10">No bills found.</td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b._id} className="hover:bg-navy/[0.015] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-navy text-xs">{b.invoiceNumber}</p>
                      <p className="text-navy/40 text-xs">{fmtDate(b.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gold/15 flex items-center justify-center flex-shrink-0">
                          <span className="font-fraunces text-[9px] font-bold text-gold">{initials(b.patientName)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-navy">{b.patientName}</p>
                          <p className="text-navy/40 text-xs">{b.patientPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-navy/70">{b.doctor}</td>
                    <td className="px-4 py-4 text-navy/60">{fmtDate(b.visitDate)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-navy">₹{b.total.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-green-600 font-medium">₹{b.amountPaid.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={b.total - b.amountPaid > 0 ? "text-red-500 font-medium" : "text-navy/30"}>
                        ₹{(b.total - b.amountPaid).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_META[b.paymentStatus].style}`}>
                        {STATUS_META[b.paymentStatus].label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setSelected(b)} className="text-xs text-gold font-medium hover:underline mr-3">
                        View
                      </button>
                      <button onClick={() => handleDelete(b)} className="text-xs text-red-400 font-medium hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-navy/40">Showing {bills.length} of {total} invoices</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-navy/15 text-navy disabled:opacity-40 hover:bg-navy/5 transition-colors"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-xs text-navy/60">{page} / {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 text-xs rounded-lg border border-navy/15 text-navy disabled:opacity-40 hover:bg-navy/5 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Invoice Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Invoice header */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-fraunces text-xl font-bold text-navy">{selected.invoiceNumber}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_META[selected.paymentStatus].style}`}>
                  {STATUS_META[selected.paymentStatus].label}
                </span>
              </div>
              <p className="text-navy/40 text-xs">{selected.patientName} · {fmtDate(selected.visitDate)} · {selected.doctor}</p>
            </div>

            {/* Treatment line items */}
            <div className="bg-navy/[0.03] rounded-xl overflow-hidden mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-navy/10">
                    <th className="text-left text-navy/40 font-semibold px-3 py-2">Treatment</th>
                    <th className="text-center text-navy/40 font-semibold px-2 py-2">Tooth</th>
                    <th className="text-center text-navy/40 font-semibold px-2 py-2">Qty</th>
                    <th className="text-right text-navy/40 font-semibold px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {selected.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-navy font-medium">{item.treatmentName}</td>
                      <td className="px-2 py-2 text-center text-navy/60">{item.toothNumber}</td>
                      <td className="px-2 py-2 text-center text-navy/60">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-navy font-semibold">₹{(item.quantity * item.unitCost).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-navy/50">Subtotal</span>
                <span className="text-navy">₹{selected.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy/50">Discount</span>
                <span className="text-green-600">-₹{selected.discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-navy/10 pt-2">
                <span className="text-navy">Total</span>
                <span className="text-navy">₹{selected.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy/50">Amount Paid</span>
                <span className="text-green-600 font-medium">₹{selected.amountPaid.toLocaleString()}</span>
              </div>
              {selected.total - selected.amountPaid > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-500 font-medium">Balance Due</span>
                  <span className="text-red-500 font-bold">₹{(selected.total - selected.amountPaid).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Payment mode */}
            <div className="flex items-center gap-2 bg-navy/[0.03] rounded-xl p-3 mb-5">
              <span className="text-lg">{MODE_ICON[selected.paymentMode]}</span>
              <span className="text-navy text-sm capitalize">{selected.paymentMode || "Payment mode not specified"}</span>
            </div>

            {/* Update payment status */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-2">Update Payment Status</p>
              <div className="flex gap-2">
                {(["paid", "partial", "pending"] as PaymentStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => updatePaymentStatus(selected, s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-colors border ${
                      selected.paymentStatus === s
                        ? `${STATUS_META[s].style} border-transparent`
                        : "border-navy/10 text-navy/50 hover:bg-navy/5"
                    }`}
                  >
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </div>

            {selected.notes && (
              <div className="bg-navy/[0.03] rounded-xl p-3">
                <p className="text-navy/40 text-xs mb-1">Notes</p>
                <p className="text-navy text-sm">{selected.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Generate Bill Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="font-fraunces text-xl font-bold text-navy mb-5">Generate New Bill</h2>

            {/* Patient & Visit Info */}
            <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Patient & Visit</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <BF label="Patient Name *">
                <input type="text" value={form.patientName} onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="Full name" />
              </BF>
              <BF label="Patient Phone">
                <input type="tel" value={form.patientPhone} onChange={(e) => setForm((p) => ({ ...p, patientPhone: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="+91 XXXXXXXXXX" />
              </BF>
              <BF label="Visit Date">
                <input type="date" value={form.visitDate} onChange={(e) => setForm((p) => ({ ...p, visitDate: e.target.value }))} className="form-input py-2.5 text-sm" />
              </BF>
              <BF label="Doctor">
                <input type="text" value={form.doctor} onChange={(e) => setForm((p) => ({ ...p, doctor: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="Doctor name" />
              </BF>
            </div>

            {/* Treatment Items */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider">Treatment Items</p>
              <button onClick={addFormItem} className="text-xs text-gold font-medium hover:underline">+ Add Row</button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-12 gap-2 text-xs text-navy/40 font-semibold uppercase tracking-wider px-1">
                <div className="col-span-5">Treatment</div>
                <div className="col-span-2">Tooth</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">₹/unit</div>
                <div className="col-span-1" />
              </div>
              {form.items.map((item) => (
                <div key={item.key} className="grid grid-cols-12 gap-2 items-center">
                  <input type="text" value={item.treatmentName} onChange={(e) => updateFormItem(item.key, "treatmentName", e.target.value)} className="col-span-5 form-input py-2 text-xs" placeholder="Treatment" />
                  <input type="text" value={item.toothNumber} onChange={(e) => updateFormItem(item.key, "toothNumber", e.target.value)} className="col-span-2 form-input py-2 text-xs" placeholder="#" />
                  <input type="number" value={item.quantity} onChange={(e) => updateFormItem(item.key, "quantity", e.target.value)} className="col-span-2 form-input py-2 text-xs text-center" min={1} />
                  <input type="number" value={item.unitCost} onChange={(e) => updateFormItem(item.key, "unitCost", e.target.value)} className="col-span-2 form-input py-2 text-xs text-right" placeholder="0" />
                  <button onClick={() => removeFormItem(item.key)} disabled={form.items.length === 1} className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-20 text-center">
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-navy/[0.03] rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-navy/50">Subtotal</span><span className="text-navy font-medium">₹{formSubtotal.toLocaleString()}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-navy/50">Discount (₹)</span>
                <input type="number" value={form.discount} onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))} className="w-24 form-input py-1.5 text-xs text-right" placeholder="0" />
              </div>
              <div className="flex justify-between font-bold border-t border-navy/10 pt-2">
                <span className="text-navy">Total</span>
                <span className="text-navy">₹{formTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment */}
            <p className="text-xs font-semibold text-navy/50 uppercase tracking-wider mb-3">Payment</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <BF label="Amount Paid (₹)">
                <input type="number" value={form.amountPaid} onChange={(e) => setForm((p) => ({ ...p, amountPaid: e.target.value }))} className="form-input py-2.5 text-sm" placeholder="0" />
              </BF>
              <BF label="Payment Mode">
                <select value={form.paymentMode} onChange={(e) => setForm((p) => ({ ...p, paymentMode: e.target.value as PaymentMode }))} className="form-input py-2.5 text-sm">
                  <option value="">Select…</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="insurance">Insurance</option>
                </select>
              </BF>
              <BF label="Payment Status">
                <select value={form.paymentStatus} onChange={(e) => setForm((p) => ({ ...p, paymentStatus: e.target.value as PaymentStatus }))} className="form-input py-2.5 text-sm">
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </BF>
            </div>

            <BF label="Notes">
              <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2} className="w-full p-3 rounded-xl border border-navy/15 bg-white text-navy text-sm placeholder:text-navy/30 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 resize-none" placeholder="Additional notes…" />
            </BF>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleGenerate}
                disabled={saving || !form.patientName || form.items.some((i) => !i.treatmentName)}
                className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Generating…" : "Generate Invoice"}
              </button>
              <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl border border-navy/15 text-navy text-sm hover:bg-navy/5 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-navy/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
