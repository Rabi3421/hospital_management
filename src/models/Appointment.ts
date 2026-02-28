import mongoose, { Document, Model, Schema } from "mongoose";

export type AppointmentStatus =
    | "pending"
    | "confirmed"
    | "in_progress"   // slot time has started — patient is being seen
    | "cancelled"
    | "completed";

export interface IPrescription {
    title: string;          // e.g. "Prescription – Mar 1 2026"
    fileUrl: string;        // uploaded file URL (or base64 data URL for simplicity)
    fileType: string;       // "image/jpeg" | "application/pdf" etc.
    uploadedAt: Date;
    uploadedBy: string;     // admin/doctor name
}

export interface IVitals {
    bloodPressure?: string;
    temperature?: string;
    weight?: string;
    notes?: string;
}

export interface ICompletionDetails {
    diagnosis?: string;
    treatment?: string;
    followUpDate?: string;        // "YYYY-MM-DD"
    followUpNotes?: string;
    closedAt?: Date;
    closedBy?: string;
}

export interface IAppointment extends Document {
    // Guest identity
    firstName: string;
    lastName: string;
    phone: string;
    email: string;

    // Appointment details
    service: string;
    doctorPreference: string;
    preferredDate: string;
    preferredTime: string;
    isNewPatient: boolean;
    insuranceProvider?: string;
    notes?: string;

    // Slot-based booking
    slotId?: mongoose.Types.ObjectId;
    queueNumber?: number;

    // Status
    status: AppointmentStatus;

    // Medical data (filled by doctor/admin)
    vitals?: IVitals;
    prescriptions: IPrescription[];
    completionDetails?: ICompletionDetails;

    // Notification tracking
    notifiedAt?: Date;        // when the "slot starting soon" notification was sent
    reminderSentAt?: Date;    // when the 24h-before reminder was sent

    // Linking logic
    userId?: mongoose.Types.ObjectId;
    guestToken: string;
    claimed: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const PrescriptionSchema = new Schema<IPrescription>(
    {
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, default: "image/jpeg" },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: String, default: "" },
    },
    { _id: true }
);

const VitalsSchema = new Schema<IVitals>(
    {
        bloodPressure: { type: String, default: "" },
        temperature: { type: String, default: "" },
        weight: { type: String, default: "" },
        notes: { type: String, default: "" },
    },
    { _id: false }
);

const CompletionSchema = new Schema<ICompletionDetails>(
    {
        diagnosis: { type: String, default: "" },
        treatment: { type: String, default: "" },
        followUpDate: { type: String, default: "" },
        followUpNotes: { type: String, default: "" },
        closedAt: { type: Date },
        closedBy: { type: String, default: "" },
    },
    { _id: false }
);

const AppointmentSchema = new Schema<IAppointment>(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },
        service: { type: String, required: true },
        doctorPreference: { type: String, default: "No Preference" },
        preferredDate: { type: String, required: true },
        preferredTime: { type: String, required: true },
        isNewPatient: { type: Boolean, default: true },
        insuranceProvider: { type: String, default: "" },
        notes: { type: String, default: "" },
        slotId: { type: Schema.Types.ObjectId, ref: "AppointmentSlot", default: null },
        queueNumber: { type: Number, default: null },
        status: {
            type: String,
            enum: ["pending", "confirmed", "in_progress", "cancelled", "completed"],
            default: "confirmed",
        },
        // Medical data
        vitals: { type: VitalsSchema, default: null },
        prescriptions: { type: [PrescriptionSchema], default: [] },
        completionDetails: { type: CompletionSchema, default: null },
        // Notification tracking
        notifiedAt: { type: Date, default: null },
        reminderSentAt: { type: Date, default: null },
        // Linking
        userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
        guestToken: { type: String, required: true, index: true },
        claimed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index for fast lookup by email (used in claim flow)
AppointmentSchema.index({ email: 1 });
AppointmentSchema.index({ userId: 1 });

const Appointment: Model<IAppointment> =
    mongoose.models.Appointment ||
    mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
