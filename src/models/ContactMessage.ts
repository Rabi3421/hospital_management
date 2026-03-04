import mongoose, { Document, Model, Schema } from "mongoose";

export type ContactMessageStatus = "new" | "in_review" | "resolved" | "closed";

export interface IContactMessage extends Document {
    fullName: string;
    phone?: string;
    email: string;
    subject: string;
    message: string;
    consent: boolean;

    // Admin management
    status: ContactMessageStatus;
    adminNote?: string;         // internal note left by admin
    resolvedBy?: string;        // admin name who resolved
    resolvedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
    {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, default: "" },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        consent: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["new", "in_review", "resolved", "closed"],
            default: "new",
        },
        adminNote: { type: String, default: "" },
        resolvedBy: { type: String, default: "" },
        resolvedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

ContactMessageSchema.index({ email: 1 });
ContactMessageSchema.index({ status: 1 });

const ContactMessage: Model<IContactMessage> =
    mongoose.models.ContactMessage ||
    mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

export default ContactMessage;
