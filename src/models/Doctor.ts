import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDoctor extends Document {
    name: string;
    specialty: string;
    email: string;
    phone: string;
    department: string;      // department name (denormalized for speed)
    qualification: string;   // e.g. "BDS, MDS"
    experience: number;      // years
    bio: string;
    avatar: string;          // emoji or URL
    isActive: boolean;
    availableDays: string[]; // ["Mon","Tue","Wed","Thu","Fri"]
    createdAt: Date;
    updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
    {
        name: { type: String, required: true, trim: true },
        specialty: { type: String, default: "" },
        email: { type: String, default: "", trim: true, lowercase: true },
        phone: { type: String, default: "" },
        department: { type: String, default: "" },
        qualification: { type: String, default: "" },
        experience: { type: Number, default: 0 },
        bio: { type: String, default: "" },
        avatar: { type: String, default: "👨‍⚕️" },
        isActive: { type: Boolean, default: true },
        availableDays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    },
    { timestamps: true }
);

const Doctor: Model<IDoctor> =
    mongoose.models.Doctor ||
    mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default Doctor;
