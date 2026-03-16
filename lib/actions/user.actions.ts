"use server";

import { connectToDatabase } from "@/database/mongoose";
import User from "@/database/models/user.model";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";

/**
 * Syncs a Clerk user to our MongoDB database.
 * Call this when a user performs an action that requires a DB presence.
 */
export async function syncUser(clerkUser: {
    clerkId: string;
    email: string;
    username?: string;
    imageUrl?: string;
    firstName?: string;
    lastName?: string;
}) {
    try {
        await connectToDatabase();

        await User.updateOne(
            { clerkId: clerkUser.clerkId },
            {
                $set: {
                    email: clerkUser.email,
                    username: clerkUser.username,
                    imageUrl: clerkUser.imageUrl,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                },
            },
            { upsert: true }
        );

        const user = await User.findOne({ clerkId: clerkUser.clerkId });

        return { success: true, data: serializeData(user) };
    } catch (error: any) {
        console.error("Error syncing user:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Toggles a follow relationship between two users.
 */
export async function toggleFollow(followerClerkId: string, followedClerkId: string) {
    try {
        await connectToDatabase();

        if (followerClerkId === followedClerkId) {
            throw new Error("You cannot follow yourself.");
        }

        const followedUser = await User.findOne({ clerkId: followedClerkId });
        if (!followedUser) throw new Error("User to follow not found.");

        const isFollowing = followedUser.followers.includes(followerClerkId);

        if (isFollowing) {
            // Unfollow
            await User.updateOne(
                { clerkId: followedClerkId },
                { $pull: { followers: followerClerkId } }
            );
            await User.updateOne(
                { clerkId: followerClerkId },
                { $pull: { following: followedClerkId } }
            );
        } else {
            // Follow
            await User.updateOne(
                { clerkId: followedClerkId },
                { $push: { followers: followerClerkId } }
            );
            await User.updateOne(
                { clerkId: followerClerkId },
                { $push: { following: followedClerkId } }
            );
        }

        revalidatePath(`/users/${followedClerkId}`);
        revalidatePath(`/profile`);

        return { success: true, isFollowing: !isFollowing };
    } catch (error: any) {
        console.error("Error toggling follow:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches follow information for a user.
 */
export async function getFollowInfo(clerkId: string, currentUserId?: string) {
    try {
        await connectToDatabase();

        const user = await User.findOne({ clerkId });
        if (!user) return { success: false, error: "User not found" };

        return {
            success: true,
            followersCount: user.followers.length,
            followingCount: user.following.length,
            isFollowing: currentUserId ? user.followers.includes(currentUserId) : false
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Gets a user profile by clerkId.
 */
export async function getUserProfile(clerkId: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ clerkId });
        return { success: true, data: serializeData(user) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
