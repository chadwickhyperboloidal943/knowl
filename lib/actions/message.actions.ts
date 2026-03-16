'use server';

import { connectToDatabase } from "@/database/mongoose";
import Message from "@/database/models/message.model";
import { auth } from "@clerk/nextjs/server";
import { serializeData } from "@/lib/utils";

export const getMessagesForBook = async (bookId: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();

        const messages = await Message.find({ clerkId: userId, bookId }).sort({ createdAt: 1 }).lean();

        return {
            success: true,
            data: serializeData(messages)
        };
    } catch (e: any) {
        console.error('Error fetching messages', e);
        return { 
            success: false, 
            error: "We've experienced a slight hiccup retrieving your messages. We will work on this. Please try again." 
        };
    }
}

export const saveMessage = async (bookId: string, role: string, content: string, sessionId?: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();

        const message = await Message.create({
            clerkId: userId,
            bookId,
            sessionId,
            role,
            content
        });

        return { success: true, data: serializeData(message) };
    } catch (e: any) {
        console.error('Error saving message', e);
        return { 
            success: false, 
            error: "We've experienced a slight hiccup saving your message. We will work on this." 
        };
    }
}

export const deleteMessagesBySession = async (sessionId: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();
        await Message.deleteMany({ clerkId: userId, sessionId });

        return { success: true };
    } catch (e: any) {
        console.error('Error deleting messages', e);
        return { 
            success: false, 
            error: "We've experienced a slight hiccup deleting those messages. We will work on this." 
        };
    }
}

export const deleteMessagesWithoutSession = async (bookId: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();
        // Delete messages that have no sessionId (legacy/unsorted messages)
        await Message.deleteMany({ 
            clerkId: userId, 
            bookId,
            $or: [{ sessionId: { $exists: false } }, { sessionId: null }, { sessionId: '' }]
        });

        return { success: true };
    } catch (e: any) {
        console.error('Error deleting legacy messages', e);
        return { 
            success: false, 
            error: "We've experienced a slight hiccup clearing legacy data. We will work on this." 
        };
    }
}

export const updateSessionTitle = async (sessionId: string, newTitle: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();
        // Since we derive the title from the first message content, 
        // we'll update the first message of the session to reflect the new title
        // or we could add a 'customTitle' field to the message model. 
        // For now, let's find the first message and update its content to the new title.
        const firstMessage = await Message.findOne({ clerkId: userId, sessionId }).sort({ createdAt: 1 });
        if (firstMessage) {
            firstMessage.content = newTitle;
            await firstMessage.save();
        }

        return { success: true };
    } catch (e: any) {
        console.error('Error updating session title', e);
        return { 
            success: false, 
            error: "We've experienced a slight hiccup renaming your thread. We will work on this." 
        };
    }
}
