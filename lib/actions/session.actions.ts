'use server';

import {EndSessionResult, StartSessionResult} from "@/types";
import {connectToDatabase} from "@/database/mongoose";
import VoiceSession from "@/database/models/voice-session.model";
import {getCurrentBillingPeriodStart} from "@/lib/subscription-constants";

export const startVoiceSession = async (providedClerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        const { auth } = await import("@clerk/nextjs/server");
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };
        const clerkId = userId; // Shadowing with secure ID

        await connectToDatabase();

        // Limits/Plan to see whether a session is allowed.
        const { getUserPlan } = await import("@/lib/subscription.server");
        const { PLAN_LIMITS, getCurrentBillingPeriodStart } = await import("@/lib/subscription-constants");

        const plan = await getUserPlan();
        const limits = PLAN_LIMITS[plan];
        const billingPeriodStart = getCurrentBillingPeriodStart();

        const sessionCount = await VoiceSession.countDocuments({
            clerkId,
            billingPeriodStart
        });

        if (sessionCount >= limits.maxSessionsPerMonth) {
            const { revalidatePath } = await import("next/cache");
            revalidatePath("/");

            return {
                success: false,
                error: `You have reached the monthly session limit for your ${plan} plan (${limits.maxSessionsPerMonth}). Please upgrade for more sessions.`,
                isBillingError: true,
            };
        }

        const session = await VoiceSession.create({
            clerkId,
            bookId,
            startedAt: new Date(),
            billingPeriodStart,
            durationSeconds: 0,
        });

        return {
            success: true,
            sessionId: session._id.toString(),
            maxDurationMinutes: limits.maxDurationPerSession,
        }
    } catch (e: any) {
        console.error('Error starting voice session details:', {
            message: e.message,
            stack: e.stack,
            providedClerkId,
            bookId
        });
        return { 
            success: false, 
            error: `Voice session initialization failed: ${e.message || "Please try again later."}` 
        }
    }
}

export const endVoiceSession = async (sessionId: string, durationSeconds: number): Promise<EndSessionResult> => {
    try {
        await connectToDatabase();

        const result = await VoiceSession.updateOne({ _id: sessionId }, {
            endedAt: new Date(),
            durationSeconds,
        });

        if(!result) return { success: false, error: 'Voice session not found.' }

        return { success: true }
    } catch (e: any) {
        console.error('Error ending voice session details:', {
            message: e.message,
            stack: e.stack,
            sessionId
        });
        
        let errorMessage = "Failed to conclude session properly.";
        if (e.message?.includes('network') || e.message?.includes('timeout')) {
            errorMessage = "Network error while saving session data.";
        } else if (e.name === 'ValidationError') {
            errorMessage = "Invalid session data provided.";
        } else if (e.message) {
            errorMessage = `Session error: ${e.message}`;
        }
        
        return {
            success: false,
            error: errorMessage
        }
    }
}

