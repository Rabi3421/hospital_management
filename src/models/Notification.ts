import mongoose, { Document, Schema } from "mongoose";

export type NotificationType =
    | "slot_reminder"      // 24h before: "Your appointment is tomorrow"
    | "slot_starting"      // at slot time: "Your appointment starts now"
    | "appointment_done"   // after close: "Your appointment summary is ready"
    | "general";

export interface INotification extends Document {
    userId?: mongoose.Types.ObjectId;   // null for guest
    email: string;                       // always set — used for email delivery
    phone?: string;                      // for WhatsApp/SMS (future)
    appointmentId: mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    emailSent: boolean;
    emailSentAt?: Date;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, default: "" },
        appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true },
        type: {
            type: String,
            enum: ["slot_reminder", "slot_starting", "appointment_done", "general"],
            default: "general",
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        emailSent: { type: Boolean, default: false },
        emailSentAt: { type: Date, default: null },
    },
    { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ appointmentId: 1, type: 1 });
NotificationSchema.index({ email: 1 });

export default (mongoose.models.Notification as mongoose.Model<INotification>) ||
    mongoose.model<INotification>("Notification", NotificationSchema);
