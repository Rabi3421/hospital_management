import mongoose, { Document, Model, Schema } from "mongoose";

export type PaymentStatus = "paid" | "partial" | "pending";
export type PaymentMode = "cash" | "upi" | "card" | "insurance" | "";

export interface IBillItem {
    treatmentName: string;
    toothNumber: string;
    quantity: number;
    unitCost: number;
}

export interface IBill extends Document {
    invoiceNumber: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    visitDate: string;          // "YYYY-MM-DD"
    doctor: string;             // denormalized
    doctorId?: mongoose.Types.ObjectId;
    items: IBillItem[];
    subtotal: number;
    discount: number;
    total: number;
    amountPaid: number;
    paymentStatus: PaymentStatus;
    paymentMode: PaymentMode;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

const BillItemSchema = new Schema<IBillItem>(
    {
        treatmentName: { type: String, required: true },
        toothNumber: { type: String, default: "—" },
        quantity: { type: Number, default: 1 },
        unitCost: { type: Number, default: 0 },
    },
    { _id: false }
);

const BillSchema = new Schema<IBill>(
    {
        invoiceNumber: { type: String, required: true, unique: true },
        patientName: { type: String, required: true, trim: true },
        patientEmail: { type: String, default: "", trim: true, lowercase: true },
        patientPhone: { type: String, default: "" },
        visitDate: { type: String, required: true },
        doctor: { type: String, default: "" },
        doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", default: null },
        items: { type: [BillItemSchema], default: [] },
        subtotal: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        amountPaid: { type: Number, default: 0 },
        paymentStatus: {
            type: String,
            enum: ["paid", "partial", "pending"],
            default: "pending",
        },
        paymentMode: {
            type: String,
            enum: ["cash", "upi", "card", "insurance", ""],
            default: "",
        },
        notes: { type: String, default: "" },
    },
    { timestamps: true }
);

BillSchema.index({ patientEmail: 1 });
BillSchema.index({ paymentStatus: 1 });
BillSchema.index({ visitDate: -1 });

const Bill: Model<IBill> =
    mongoose.models.Bill ||
    mongoose.model<IBill>("Bill", BillSchema);

export default Bill;
