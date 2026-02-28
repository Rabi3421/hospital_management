/**
 * Slot generation utility.
 * Given a DoctorSchedule, generates AppointmentSlot documents for that day.
 * Idempotent: existing open/full slots are NOT overwritten (only missing ones added).
 * Blocked slots are always preserved.
 */

import AppointmentSlot from "@/models/AppointmentSlot";
import type { IDoctorSchedule, ITimeWindow } from "@/models/DoctorSchedule";

/** Convert "HH:MM" to total minutes since midnight */
export function toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

/** Convert total minutes to "HH:MM" */
export function fromMinutes(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Convert "HH:MM" to "H:MM AM/PM" display */
export function to12Hour(hhmm: string): string {
    const [h, m] = hhmm.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** Check if a time window overlaps with any break */
function isInBreak(startMin: number, breaks: ITimeWindow[]): boolean {
    for (const b of breaks) {
        const bs = toMinutes(b.start);
        const be = toMinutes(b.end);
        if (startMin >= bs && startMin < be) return true;
    }
    return false;
}

/**
 * Generates (upserts) slots for a given schedule.
 * Returns the number of slots created.
 */
export async function generateSlotsForSchedule(schedule: IDoctorSchedule): Promise<number> {
    if (!schedule.isOpen) {
        // Mark all existing open slots for this doctor+date as blocked
        await AppointmentSlot.updateMany(
            { doctor: schedule.doctor, date: schedule.date, status: "open" },
            { status: "blocked" }
        );
        return 0;
    }

    const startMin = toMinutes(schedule.startTime);
    const endMin = toMinutes(schedule.endTime);
    const duration = schedule.slotDuration || 30;
    const capacity = schedule.capacityPerSlot || 1;

    const ops: Promise<unknown>[] = [];
    let created = 0;

    for (let cur = startMin; cur + duration <= endMin; cur += duration) {
        if (isInBreak(cur, schedule.breaks)) continue;

        const slotStart = fromMinutes(cur);
        const slotEnd = fromMinutes(cur + duration);
        const displayTime = to12Hour(slotStart);

        // Upsert: create if not exists, leave bookedCount/status untouched if exists
        const op = AppointmentSlot.findOneAndUpdate(
            { doctor: schedule.doctor, date: schedule.date, startTime: slotStart },
            {
                $setOnInsert: {
                    doctor: schedule.doctor,
                    date: schedule.date,
                    startTime: slotStart,
                    endTime: slotEnd,
                    displayTime,
                    capacity,
                    bookedCount: 0,
                    nextQueueNumber: 1,
                    status: "open",
                    scheduleId: schedule._id,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).then((doc) => {
            if (doc?.bookedCount === 0 && doc?.status !== "blocked") created++;
        });

        ops.push(op);
    }

    await Promise.all(ops);
    return created;
}
