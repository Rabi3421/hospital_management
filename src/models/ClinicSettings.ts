import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClinicSettings extends Document {
    clinicName: string;
    tagline: string;
    phone: string;
    emergencyPhone: string;
    email: string;
    website: string;
    address: string;
    city: string;
    openTime: string;
    closeTime: string;
    workDays: string;
    updatedBy?: string;
    updatedAt?: Date;
}

const ClinicSettingsSchema = new Schema<IClinicSettings>(
    {
        clinicName:     { type: String, default: "DentalCare Clinic" },
        tagline:        { type: String, default: "Your smile, our priority." },
        phone:          { type: String, default: "+1 (555) 234-5678" },
        emergencyPhone: { type: String, default: "+1 (555) 234-5678" },
        email:          { type: String, default: "info@dentalcare.com" },
        website:        { type: String, default: "https://dentalcare.com" },
        address:        { type: String, default: "123 Dental Street, Medicity, CA 90210" },
        city:           { type: String, default: "New York, NY 10017" },
        openTime:       { type: String, default: "08:00" },
        closeTime:      { type: String, default: "18:00" },
        workDays:       { type: String, default: "Monday – Saturday" },
        updatedBy:      { type: String },
    },
    { timestamps: true }
);

const ClinicSettings: Model<IClinicSettings> =
    mongoose.models.ClinicSettings ||
    mongoose.model<IClinicSettings>("ClinicSettings", ClinicSettingsSchema);

export default ClinicSettings;
