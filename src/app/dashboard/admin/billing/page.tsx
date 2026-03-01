"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { adminNavItems } from "../navItems";

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentStatus = "paid" | "partial" | "pending";
type PaymentMode = "cash" | "upi" | "card" | "insurance" | "";

interface BillItem {
  id: string;
  treatmentName: string;
  toothNumber: string;
  quantity: number;
  unitCost: number;
}

interface Bill {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientId: string;
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

// ─── Seed data ─────────────────────────────────────────────────────────────
const MOCK_BILLS: Bill[] = [
  {
    id: "b1",
    invoiceNumber: "INV-2026-001",
    patientName: "Avnish Kumar",
    patientId: "p1",
    patientPhone: "+91 9876543210",
    visitDate: "2026-02-27",
    doctor: "Dr. Sarah Johnson",
    items: [
      { id: "i1", treatmentName: "Composite Filling", toothNumber: "#14", quantity: 1, unitCost: 1500 },
      { id: "i2", treatmentName: "Consultation", toothNumber: "—", quantity: 1, unitCost: 300 },
    ],
    subtotal: 1800,
    discount: 180,
    total: 1620,
    amountPaid: 1620,
    paymentStatus: "paid",
    paymentMode: "upi",
    notes: "Payment received via PhonePe.",
    createdAt: "2026-02-27",
  },
  {
    id: "b2",
    invoiceNumber: "INV-2026-002",
    patientName: "Priya Sharma",
    patientId: "p2",
    patientPhone: "+91 9123456789",
    visitDate: "2026-02-01",
    doctor: "Dr. Michael Chen",
    items: [
      { id: "i3", treatmentName: "Root Canal Treatment", toothNumber: "#26", quantity: 1, unitCost: 8500 },
      { id: "i4", treatmentName: "Ceramic Crown", toothNumber: "#26", quantity: 1, unitCost: 6000 },
      { id: "i5", treatmentName: "OPG X-Ray", toothNumber: "Full Mouth", quantity: 1, unitCost: 700 },
    ],
    subtotal: 15200,
    discount: 700,
    total: 14500,
    amountPaid: 10000,
    paymentStatus: "partial",
    paymentMode: "card",
    notes: "Balance ₹4500 to be paid at next visit.",
    createdAt: "2026-02-01",
  },
  {
    id: "b3",
    invoiceNumber: "INV-2026-003",
    patientName: "Rahul Mehta",
    patientId: "p3",
    patientPhone: "+91 9988776655",
    visitDate: "2026-02-10",
    doctor: "Dr. Anika Patel",
    items: [
      { id: "i6", treatmentName: "Orthodontic Braces (Advance)", toothNumber: "Full Arch", quantity: 1, unitCost: 35000 },
    ],
    subtotal: 35000,
    discount: 2000,
    total: 33000,
    amountPaid: 0,
    paymentStatus: "pending",
    paymentMode: "",
    notes: "Patient requested invoice for insurance reimbursement.",
    createdAt: "2026-02-10",
  },
  {
    id: "b4",
    invoiceNumber: "INV-2026-004",
    patientName: "Sneha Reddy",
    patientId: "p4",
    patientPhone: "+91 9765432100",
    visitDate: "2026-03-01",
    doctor: "Dr. Sarah Johnson",
    items: [
      { id: "i7", treatmentName: "Tooth Extraction (Wisdom)", toothNumber: "#28", quantity: 1, unitCost: 1200 },
      { id: "i8", treatmentName: "Antibiotic Pack", toothNumber: "—", quantity: 1, unitCost: 250 },
      { id: "i9", treatmentName: "Consultation", toothNumber: "—", quantity: 1, unitCost: 300 },
    ],
    subtotal: 1750,
    discount: 0,
    total: 1750,
    amountPaid: 1750,
    paymentStatus: "paid",
    paymentMode: "cash",
    notes: "",
    createdAt: "2026-03-01",
  },
  {
    id: "b5",
    invoiceNumber: "INV-2026-005",
    patientName: "Kiran Das",
    patientId: "p5",
    patientPhone: "+91 8877665544",
    visitDate: "2026-03-08",
    doctor: "Dr. Anika Patel",
    items: [
      { id: "i10", treatmentName: "LED Teeth Whitening", toothNumber: "Front 12", quantity: 1, unitCost: 4500 },
    ],
    subtotal: 4500,
    discount: 500,
    total: 4000,
    amountPaid: 2000,
    paymentStatus: "partial",
    paymentMode: "upi",
    notes: "Balance ₹2000 due on follow-up.",
    createdAt: "2026-03-08",
  },
];

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
  patientPhone: "",
  visitDate: new Date().toISOString().slice(0, 10),
  doctor: "",
  discount: "0",
  paymentStatus: "pending" as PaymentStatus,
  paymentMode: "" as PaymentMode,
  amountPaid: "0",
  notes: "",
  items: [{ id: "new1", treatmentName: "", toothNumber: "", quantity: "1", unitCost: "" }] as {
    id: string;
    treatmentName: string;
    toothNumber: string;
    quantity: string;
    unitCost: string;
  }[],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>(MOCK_BILLS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [selected, setSelected] = useState<Bill | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = bills.filter((b) => {
    const matchSearch =
      b.patientName.toLowerCase().includes(search.toLowerCase()) ||
      b.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.doctor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBilled = bills.reduce((s, b) => s + b.total, 0);
  const totalCollected = bills.reduce((s, b) => s + b.amountPaid, 0);
  const totalPending = totalBilled - totalCollected;
  const stats = {
    paid: bills.filter((b) => b.paymentStatus === "paid").length,
    partial: bills.filter((b) => b.paymentStatus === "partial").length,
    pending: bills.filter((b) => b.paymentStatus === "pending").length,
  };

  // Compute form subtotal/total
  const formSubtotal = form.items.reduce(
    (s, i) => s + Number(i.quantity || 0) * Number(i.unitCost || 0),
    0
  );
  const formTotal = Math.max(0, formSubtotal - Number(form.discount || 0));

  const addFormItem = () => {
    setForm((p) => ({
      ...p,
      items: [...p.items, { id: `new${Date.now()}`, treatmentName: "", toothNumber: "", quantity: "1", unitCost: "" }],
    }));
  };

  const removeFormItem = (id: string) => {
    setForm((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) }));
  };

  const updateFormItem = (id: string, field: string, val: string) => {
    setForm((p) => ({
      ...p,
      items: p.items.map((i) => (i.id === id ? { ...i, [field]: val } : i)),
    }));
  };

  const handleGenerate = () => {
    if (!form.patientName || form.items.some((i) => !i.treatmentName)) return;
    const newBill: Bill = {
      id: `b${Date.now()}`,
      invoiceNumber: `INV-2026-${String(bills.length + 1).padStart(3, "0")}`,
      patientName: form.patientName,
      patientId: `p${Date.now()}`,
      patientPhone: form.patientPhone,
      visitDate: form.visitDate,
      doctor: form.doctor,
      items: form.items.map((i, idx) => ({
        id: `i${Date.now()}_${idx}`,
        treatmentName: i.treatmentName,
        toothNumber: i.toothNumber || "—",
        quantity: Number(i.quantity) || 1,
        unitCost: Number(i.unitCost) || 0,
      })),
      subtotal: formSubtotal,
      discount: Number(form.discount) || 0,
      total: formTotal,
      amountPaid: Number(form.amountPaid) || 0,
      paymentStatus: form.paymentStatus,
      paymentMode: form.paymentMode,
      notes: form.notes,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setBills((prev) => [newBill, ...prev]);
    setForm(EMPTY_FORM);
    setShowAdd(false);
  };

  const updatePaymentStatus = (id: string, status: PaymentStatus) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, paymentStatus: status } : b)));
    if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, paymentStatus: status } : prev));
  };

  const FILTER_TABS: { key: PaymentStatus | "all"; label: string }[] = [
    { key: "all", label: `All (${bills.length})` },
    { key: "paid", label: `Paid (${stats.paid})` },
    { key: "partial", label: `Partial (${stats.partial})` },
    { key: "pending", label: `Pending (${stats.pending})` },
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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Billed", value: `₹${totalBilled.toLocaleString()}`, color: "text-navy" },
            { label: "Collected", value: `₹${totalCollected.toLocaleString()}`, color: "text-green-600" },
            { label: "Pending / Due", value: `₹${totalPending.toLocaleString()}`, color: "text-red-500" },
            { label: "Total Invoices", value: bills.length, color: "text-navy" },
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
          {filtered.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-navy/40 text-sm">No bills found.</div>
          ) : (
            filtered.map((b) => (
              <div key={b.id} className="glass-card rounded-2xl p-4">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-navy/40 text-sm py-10">No bills found.</td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-navy/[0.015] transition-colors">
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
                      <button onClick={() => setSelected(b)} className="text-xs text-gold font-medium hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                  {selected.items.map((item) => (
                    <tr key={item.id}>
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
                    onClick={() => updatePaymentStatus(selected.id, s)}
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
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <input type="text" value={item.treatmentName} onChange={(e) => updateFormItem(item.id, "treatmentName", e.target.value)} className="col-span-5 form-input py-2 text-xs" placeholder="Treatment" />
                  <input type="text" value={item.toothNumber} onChange={(e) => updateFormItem(item.id, "toothNumber", e.target.value)} className="col-span-2 form-input py-2 text-xs" placeholder="#" />
                  <input type="number" value={item.quantity} onChange={(e) => updateFormItem(item.id, "quantity", e.target.value)} className="col-span-2 form-input py-2 text-xs text-center" min={1} />
                  <input type="number" value={item.unitCost} onChange={(e) => updateFormItem(item.id, "unitCost", e.target.value)} className="col-span-2 form-input py-2 text-xs text-right" placeholder="0" />
                  <button onClick={() => removeFormItem(item.id)} disabled={form.items.length === 1} className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-20 text-center">
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
                disabled={!form.patientName || form.items.some((i) => !i.treatmentName)}
                className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50"
              >
                Generate Invoice
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
