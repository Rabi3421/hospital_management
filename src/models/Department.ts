import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDepartment extends Document {
    name: string;
    description: string;
    head: string;         // doctor name
    doctorCount: number;
    isActive: boolean;
    icon: string;         // emoji or icon key
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
    {
        name: { type: String, required: true, trim: true, unique: true },
        description: { type: String, default: "" },
        head: { type: String, default: "" },
        doctorCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        icon: { type: String, default: "🏥" },
    },
    { timestamps: true }
);

const Department: Model<IDepartment> =
    mongoose.models.Department ||
    mongoose.model<IDepartment>("Department", DepartmentSchema);

export default Department;
