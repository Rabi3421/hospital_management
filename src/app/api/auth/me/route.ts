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
            const { name, currentPassword, newPassword } = body as {
                name?: string;
                currentPassword?: string;
                newPassword?: string;
            };

            const user = await User.findById(ctx.user.userId).select("+password");

            if (!user) return apiError("User not found", 404);
            if (!user.isActive) return apiError("Account has been deactivated", 403);

            // Update name if provided
            if (name && name.trim()) {
                user.name = name.trim();
            }

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
