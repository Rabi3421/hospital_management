import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import type { Role } from "@/types/auth";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    avatar?: string;
    role: Role;
    isActive: boolean;
    // Profile fields
    phone?: string;
    dob?: string;
    gender?: string;
    address?: string;
    emergencyContact?: string;
    bloodType?: string;
    allergies?: string;
    currentMedications?: string;
    medicalConditions?: string;
    insuranceProvider?: string;
    insuranceId?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },
        password: {
            type: String,
            required: false,
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Never return password in queries
        },
        googleId: { type: String, default: null, index: true },
        avatar: { type: String, default: "" },
        role: {
            type: String,
            enum: ["user", "admin", "super_admin"],
            default: "user",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Profile fields
        phone: { type: String, default: "" },
        dob: { type: String, default: "" },
        gender: { type: String, default: "" },
        address: { type: String, default: "" },
        emergencyContact: { type: String, default: "" },
        bloodType: { type: String, default: "" },
        allergies: { type: String, default: "" },
        currentMedications: { type: String, default: "" },
        medicalConditions: { type: String, default: "" },
        insuranceProvider: { type: String, default: "" },
        insuranceId: { type: String, default: "" },
    },
    { timestamps: true }
);

// ─── Hash password before saving ─────────────────────────
UserSchema.pre("save", async function () {
    if (!this.password || !this.isModified("password")) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance method ─────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, this.password);
};

// Prevent model overwrite on hot reload
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
