/**
 * AppointmentSlot — one bookable time block.
 *
 * Generated from DoctorSchedule by the slot-generation utility.
 * Each slot has a capacity; once bookedCount >= capacity it becomes "full".
 * nextQueueNumber increments per booking to assign a visible queue number.
 */

import mongoose, { Document, Model, Schema } from "mongoose";

export type SlotStatus = "open" | "full" | "blocked";

export interface IAppointmentSlot extends Document {
    doctor: string;           // matches DoctorSchedule.doctor
    date: string;             // "YYYY-MM-DD"
    startTime: string;        // "08:00"
    endTime: string;          // "08:30"
    displayTime: string;      // "8:00 AM" — human readable for UI
    capacity: number;         // max bookings allowed
    bookedCount: number;      // current bookings
    nextQueueNumber: number;  // next queue number to assign (starts at 1)
    status: SlotStatus;       // "open" | "full" | "blocked" (admin can block)
    scheduleId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSlotSchema = new Schema<IAppointmentSlot>(
    {
        doctor: { type: String, required: true, trim: true },
        date: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        displayTime: { type: String, required: true },
        capacity: { type: Number, default: 1 },
        bookedCount: { type: Number, default: 0 },
        nextQueueNumber: { type: Number, default: 1 },
        status: {
            type: String,
            enum: ["open", "full", "blocked"],
            default: "open",
        },
        scheduleId: { type: Schema.Types.ObjectId, ref: "DoctorSchedule", required: true },
    },
    { timestamps: true }
);

AppointmentSlotSchema.index({ doctor: 1, date: 1, startTime: 1 });
AppointmentSlotSchema.index({ date: 1, status: 1 });

const AppointmentSlot: Model<IAppointmentSlot> =
    mongoose.models.AppointmentSlot ||
    mongoose.model<IAppointmentSlot>("AppointmentSlot", AppointmentSlotSchema);

export default AppointmentSlot;
