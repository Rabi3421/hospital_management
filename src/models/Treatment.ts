import mongoose, { Document, Model, Schema } from "mongoose";

export type TreatmentStatus = "planned" | "ongoing" | "completed";

export interface ITreatment extends Document {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    treatmentName: string;
    toothNumbers: string;
    date: string;                   // "YYYY-MM-DD"
    doctor: string;                 // doctor name (denormalized)
    doctorId?: mongoose.Types.ObjectId;
    cost: number;
    status: TreatmentStatus;
    notes: string;
    followUpDate?: string;          // "YYYY-MM-DD"
    createdAt: Date;
    updatedAt: Date;
}

const TreatmentSchema = new Schema<ITreatment>(
    {
        patientName: { type: String, required: true, trim: true },
        patientEmail: { type: String, default: "", trim: true, lowercase: true },
        patientPhone: { type: String, default: "" },
        treatmentName: { type: String, required: true, trim: true },
        toothNumbers: { type: String, default: "" },
        date: { type: String, required: true },
        doctor: { type: String, default: "" },
        doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", default: null },
        cost: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["planned", "ongoing", "completed"],
            default: "planned",
        },
        notes: { type: String, default: "" },
        followUpDate: { type: String, default: "" },
    },
    { timestamps: true }
);

TreatmentSchema.index({ patientEmail: 1 });
TreatmentSchema.index({ status: 1 });
TreatmentSchema.index({ date: -1 });

const Treatment: Model<ITreatment> =
    mongoose.models.Treatment ||
    mongoose.model<ITreatment>("Treatment", TreatmentSchema);

export default Treatment;
