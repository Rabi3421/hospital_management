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
