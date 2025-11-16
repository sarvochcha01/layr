import { NextRequest } from "next/server";
import { auth } from "./firebase";

export async function getUserIdFromRequest(
    request: NextRequest
): Promise<string | null> {
    try {
        // Get the Authorization header
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.split("Bearer ")[1];

        // Verify the token with Firebase Admin (if you have it set up)
        // For now, we'll use the client-side approach with the token
        // In production, you should verify this server-side with Firebase Admin SDK

        // For development, we'll accept the user ID from a custom header
        const userId = request.headers.get("x-user-id");
        return userId;
    } catch (error) {
        console.error("Error getting user ID:", error);
        return null;
    }
}
