/**
 * DoctorSchedule — defines when a doctor is available on a given date.
 *
 * Admin creates / edits these records to control booking availability.
 * A slot-generation utility reads these to produce AppointmentSlot documents.
 *
 * Scenarios handled:
 *  1. Regular day   — startTime/endTime + slotDuration + capacity per slot
 *  2. Day closed    — isOpen: false  (no slots generated; existing ones blocked)
 *  3. Partial day   — just set narrower startTime/endTime
 *  4. Break period  — breakStart / breakEnd excluded from slot generation
 */

import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITimeWindow {
    start: string; // "HH:MM" 24h
    end: string;   // "HH:MM" 24h
}

export interface IDoctorSchedule extends Document {
    doctor: string;           // Doctor display name (matches doctorPreference in Appointment)
    date: string;             // "YYYY-MM-DD" — specific date override
    isOpen: boolean;          // false = entire day blocked (admin closes day)
    startTime: string;        // "08:00"
    endTime: string;          // "17:00"
    slotDuration: number;     // minutes per slot (default 30)
    capacityPerSlot: number;  // max bookings per time slot (default 1)
    breaks: ITimeWindow[];    // e.g. [{ start:"12:00", end:"13:00" }]
    note: string;             // admin note, e.g. "Doctor on leave"
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TimeWindowSchema = new Schema<ITimeWindow>(
    { start: { type: String, required: true }, end: { type: String, required: true } },
    { _id: false }
);

const DoctorScheduleSchema = new Schema<IDoctorSchedule>(
    {
        doctor: { type: String, required: true, trim: true },
        date: { type: String, required: true },           // "YYYY-MM-DD"
        isOpen: { type: Boolean, default: true },
        startTime: { type: String, default: "08:00" },
        endTime: { type: String, default: "17:00" },
        slotDuration: { type: Number, default: 30 },      // minutes
        capacityPerSlot: { type: Number, default: 1 },
        breaks: { type: [TimeWindowSchema], default: [] },
        note: { type: String, default: "" },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

// One schedule per doctor per date
DoctorScheduleSchema.index({ doctor: 1, date: 1 }, { unique: true });

const DoctorSchedule: Model<IDoctorSchedule> =
    mongoose.models.DoctorSchedule ||
    mongoose.model<IDoctorSchedule>("DoctorSchedule", DoctorScheduleSchema);

export default DoctorSchedule;
