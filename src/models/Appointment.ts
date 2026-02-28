import mongoose, { Document, Model, Schema } from "mongoose";

export type AppointmentStatus =
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed";

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
    /** Reference to the AppointmentSlot this booking occupies */
    slotId?: mongoose.Types.ObjectId;
    /** Queue number assigned at booking time (e.g. #3 for this time slot) */
    queueNumber?: number;

    // Status — defaults to "confirmed" (auto-confirmed on slot booking)
    status: AppointmentStatus;

    // Linking logic
    /** Set when a registered user books (optional at booking time) */
    userId?: mongoose.Types.ObjectId;
    /** Token stored in localStorage for guest → user claim flow */
    guestToken: string;
    /** True once claimed via /api/appointments/claim */
    claimed: boolean;

    createdAt: Date;
    updatedAt: Date;
}

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
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "confirmed",
        },
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
