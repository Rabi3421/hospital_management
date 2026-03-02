"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { userNavItems } from "../navItems";

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
}

// ─── Mock bills for the logged-in user ───────────────────────────────────────
const MOCK_BILLS: Bill[] = [
  {
    id: "b1",
    invoiceNumber: "INV-2026-001",
    visitDate: "2026-02-27",
    doctor: "Dr. Sarah Johnson",
    items: [
      { id: "i1", treatmentName: "Composite Filling", toothNumber: "#14", quantity: 1, unitCost: 1500 },
      { id: "i2", treatmentName: "Consultation Fee", toothNumber: "—", quantity: 1, unitCost: 300 },
    ],
    subtotal: 1800,
    discount: 180,
    total: 1620,
    amountPaid: 1620,
    paymentStatus: "paid",
    paymentMode: "upi",
    notes: "Payment received via PhonePe.",
  },
  {
    id: "b2",
    invoiceNumber: "INV-2026-002",
    visitDate: "2026-03-05",
    doctor: "Dr. Sarah Johnson",
    items: [
      { id: "i3", treatmentName: "Ultrasonic Scaling", toothNumber: "Full Mouth", quantity: 1, unitCost: 800 },
    ],
    subtotal: 800,
    discount: 0,
    total: 800,
    amountPaid: 400,
    paymentStatus: "partial",
    paymentMode: "cash",
    notes: "Balance ₹400 to be paid at next visit.",
  },
  {
    id: "b3",
    invoiceNumber: "INV-2026-003",
    visitDate: "2026-03-15",
    doctor: "Dr. Michael Chen",
    items: [
      { id: "i4", treatmentName: "OPG X-Ray", toothNumber: "Full Mouth", quantity: 1, unitCost: 700 },
      { id: "i5", treatmentName: "Consultation Fee", toothNumber: "—", quantity: 1, unitCost: 300 },
    ],
    subtotal: 1000,
    discount: 0,
    total: 1000,
    amountPaid: 0,
    paymentStatus: "pending",
    paymentMode: "",
    notes: "Follow-up visit invoice.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const STATUS_META: Record<PaymentStatus, { label: string; style: string; dot: string }> = {
  paid: { label: "Paid", style: "bg-green-100 text-green-700", dot: "bg-green-500" },
  partial: { label: "Partially Paid", style: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  pending: { label: "Payment Pending", style: "bg-red-100 text-red-600", dot: "bg-red-500" },
};

const MODE_LABEL: Record<string, string> = {
  cash: "💵 Cash",
  upi: "📱 UPI",
  card: "💳 Card",
  insurance: "🏥 Insurance",
  "": "—",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyBillsPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Bill | null>(null);
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");

  const filteredBills =
    filter === "all" ? MOCK_BILLS : MOCK_BILLS.filter((b) => b.paymentStatus === filter);

  const totalBilled = MOCK_BILLS.reduce((s, b) => s + b.total, 0);
  const totalPaid = MOCK_BILLS.reduce((s, b) => s + b.amountPaid, 0);
  const totalDue = totalBilled - totalPaid;

  const FILTER_TABS: { key: PaymentStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "paid", label: "Paid" },
    { key: "partial", label: "Partial" },
    { key: "pending", label: "Pending" },
  ];

  return (
    <div className="flex w-full">
      <DashboardSidebar navItems={userNavItems} title="DentalCare" subtitle="Patient Portal" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-x-hidden">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-navy">
            My Bills
          </h1>
          <p className="text-navy/50 text-sm mt-1">
            View all your treatment invoices and payment history.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-navy/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-fraunces font-bold text-navy">₹{totalBilled.toLocaleString()}</p>
              <p className="text-navy/50 text-xs mt-0.5">Total Billed</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-fraunces font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
              <p className="text-navy/50 text-xs mt-0.5">Total Paid</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className={`text-2xl font-fraunces font-bold ${totalDue > 0 ? "text-red-500" : "text-navy"}`}>
                ₹{totalDue.toLocaleString()}
              </p>
              <p className="text-navy/50 text-xs mt-0.5">Balance Due</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                filter === key ? "bg-navy text-white" : "glass-card text-navy/60 hover:text-navy"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bill Cards */}
        {filteredBills.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-navy font-semibold">No bills found</p>
            <p className="text-navy/40 text-sm mt-1">Your invoices will appear here after treatment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBills.map((b) => (
              <div key={b.id} className="glass-card rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-fraunces font-bold text-navy">{b.invoiceNumber}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_META[b.paymentStatus].style}`}>
                        {STATUS_META[b.paymentStatus].label}
                      </span>
                    </div>
                    <p className="text-navy/40 text-xs">{b.doctor} · {fmtDate(b.visitDate)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-fraunces font-bold text-navy">₹{b.total.toLocaleString()}</p>
                    {b.total - b.amountPaid > 0 && (
                      <p className="text-red-500 text-xs font-medium">
                        ₹{(b.total - b.amountPaid).toLocaleString()} due
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar for payment */}
                {b.total > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-navy/40 mb-1">
                      <span>₹{b.amountPaid.toLocaleString()} paid</span>
                      <span>{Math.round((b.amountPaid / b.total) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-navy/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (b.amountPaid / b.total) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Treatment summary */}
                <div className="bg-navy/[0.03] rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-navy/40 uppercase tracking-wider mb-2">
                    Treatments ({b.items.length})
                  </p>
                  <div className="space-y-1">
                    {b.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="text-navy/70">
                          {item.treatmentName}
                          {item.toothNumber && item.toothNumber !== "—" && (
                            <span className="text-navy/30 ml-1">({item.toothNumber})</span>
                          )}
                        </span>
                        <span className="text-navy font-medium">₹{(item.quantity * item.unitCost).toLocaleString()}</span>
                      </div>
                    ))}
                    {b.discount > 0 && (
                      <div className="flex justify-between text-xs border-t border-navy/5 pt-1 mt-1">
                        <span className="text-green-600">Discount</span>
                        <span className="text-green-600">-₹{b.discount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-navy/40">{MODE_LABEL[b.paymentMode]}</span>
                    {b.notes && (
                      <span className="text-xs text-navy/30">· {b.notes}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelected(b)}
                    className="text-xs text-gold font-medium hover:underline"
                  >
                    View Full Invoice →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Invoice Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-navy/10 text-navy/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Invoice header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="font-fraunces text-xl font-bold text-navy">{selected.invoiceNumber}</h2>
              <p className="text-navy/40 text-xs mt-1">{selected.doctor} · {fmtDate(selected.visitDate)}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${STATUS_META[selected.paymentStatus].style}`}>
                {STATUS_META[selected.paymentStatus].label}
              </span>
            </div>

            {/* Line items */}
            <div className="bg-navy/[0.03] rounded-xl overflow-hidden mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-navy/10">
                    <th className="text-left text-navy/40 font-semibold px-3 py-2">Treatment</th>
                    <th className="text-center text-navy/40 font-semibold px-2 py-2">Tooth</th>
                    <th className="text-right text-navy/40 font-semibold px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {selected.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-navy font-medium">{item.treatmentName}</td>
                      <td className="px-2 py-2 text-center text-navy/60">{item.toothNumber}</td>
                      <td className="px-3 py-2 text-right text-navy font-semibold">₹{(item.quantity * item.unitCost).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-5 text-sm">
              <div className="flex justify-between"><span className="text-navy/50">Subtotal</span><span>₹{selected.subtotal.toLocaleString()}</span></div>
              {selected.discount > 0 && (
                <div className="flex justify-between"><span className="text-green-600">Discount</span><span className="text-green-600">-₹{selected.discount.toLocaleString()}</span></div>
              )}
              <div className="flex justify-between font-bold border-t border-navy/10 pt-2 text-navy">
                <span>Total</span><span>₹{selected.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600 font-medium">Paid</span>
                <span className="text-green-600 font-medium">₹{selected.amountPaid.toLocaleString()}</span>
              </div>
              {selected.total - selected.amountPaid > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-500 font-bold">Balance Due</span>
                  <span className="text-red-500 font-bold">₹{(selected.total - selected.amountPaid).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Payment info */}
            {selected.paymentMode && (
              <div className="flex items-center gap-2 bg-navy/[0.03] rounded-xl p-3 mb-4">
                <span className="text-navy text-sm">{MODE_LABEL[selected.paymentMode]}</span>
              </div>
            )}

            {selected.notes && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                <p className="text-navy/50 text-xs mb-1">Note from clinic</p>
                <p className="text-navy text-sm">{selected.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
