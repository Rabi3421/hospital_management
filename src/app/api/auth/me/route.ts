import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { withAuth, apiSuccess, apiError } from "@/lib/api-auth";
import type { JWTPayload } from "@/types/auth";

export const GET = withAuth(
    async (_request: NextRequest, ctx: { user: JWTPayload }) => {
        try {
            await connectDB();

            const user = await User.findById(ctx.user.userId).select(
                "-password -__v"
            );

            if (!user) {
                return apiError("User not found", 404);
            }

            if (!user.isActive) {
                return apiError("Account has been deactivated", 403);
            }

            return apiSuccess({
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone ?? "",
                    dob: user.dob ?? "",
                    gender: user.gender ?? "",
                    address: user.address ?? "",
                    emergencyContact: user.emergencyContact ?? "",
                    bloodType: user.bloodType ?? "",
                    allergies: user.allergies ?? "",
                    currentMedications: user.currentMedications ?? "",
                    medicalConditions: user.medicalConditions ?? "",
                    insuranceProvider: user.insuranceProvider ?? "",
                    insuranceId: user.insuranceId ?? "",
                    createdAt: user.createdAt,
                },
            });
        } catch (err) {
            console.error("[me]", err);
            return apiError("Internal server error", 500);
        }
    }
);

export const PATCH = withAuth(
    async (request: NextRequest, ctx: { user: JWTPayload }) => {
        try {
            await connectDB();

            const body = await request.json();
            const {
                name, currentPassword, newPassword,
                phone, dob, gender, address, emergencyContact,
                bloodType, allergies, currentMedications, medicalConditions,
                insuranceProvider, insuranceId,
            } = body as {
                name?: string; currentPassword?: string; newPassword?: string;
                phone?: string; dob?: string; gender?: string; address?: string;
                emergencyContact?: string; bloodType?: string; allergies?: string;
                currentMedications?: string; medicalConditions?: string;
                insuranceProvider?: string; insuranceId?: string;
            };

            const user = await User.findById(ctx.user.userId).select("+password");

            if (!user) return apiError("User not found", 404);
            if (!user.isActive) return apiError("Account has been deactivated", 403);

            // Update name if provided
            if (name && name.trim()) { user.name = name.trim(); }

            // Update profile fields
            if (phone !== undefined) user.phone = phone;
            if (dob !== undefined) user.dob = dob;
            if (gender !== undefined) user.gender = gender;
            if (address !== undefined) user.address = address;
            if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
            if (bloodType !== undefined) user.bloodType = bloodType;
            if (allergies !== undefined) user.allergies = allergies;
            if (currentMedications !== undefined) user.currentMedications = currentMedications;
            if (medicalConditions !== undefined) user.medicalConditions = medicalConditions;
            if (insuranceProvider !== undefined) user.insuranceProvider = insuranceProvider;
            if (insuranceId !== undefined) user.insuranceId = insuranceId;

            // Change password if provided
            if (newPassword) {
                if (!currentPassword) {
                    return apiError("Current password is required to set a new password", 400);
                }
                const valid = await user.comparePassword(currentPassword);
                if (!valid) {
                    return apiError("Current password is incorrect", 400);
                }
                if (newPassword.length < 8) {
                    return apiError("New password must be at least 8 characters", 400);
                }
                user.password = newPassword; // pre-save hook will hash it
            }

            await user.save();

            return apiSuccess({
                message: "Profile updated successfully",
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (err) {
            console.error("[me PATCH]", err);
            return apiError("Internal server error", 500);
        }
    }
);
