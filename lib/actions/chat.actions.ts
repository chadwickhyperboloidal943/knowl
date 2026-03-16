'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDatabase } from "@/database/mongoose";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";
import Message from "@/database/models/message.model";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export const chatWithBook = async (bookId: string, userMessage: string, sessionId?: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();

        const book = await Book.findById(bookId);
        if (!book) return { success: false, error: "Book not found" };

        // Fetch recent conversation history (last 30 messages across all threads)
        const recentMessages = await Message.find({ 
            clerkId: userId, 
            bookId 
        }).sort({ createdAt: -1 }).limit(30).lean();

        const conversationHistory = recentMessages
            .reverse()
            .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n');

        // Fetch book segments for context
        const segments = await BookSegment.find({ bookId }).limit(10).lean();
        const bookContext = segments.map((s: any) => s.content).join('\n\n').slice(0, 12000);

        // Use the same model that works in ai.actions.ts
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are a knowledgeable AI assistant that specializes in discussing the book "${book.title}" by ${book.author}. You have deep knowledge of this book's content, themes, characters, and ideas.

INSTRUCTIONS:
- Respond helpfully, naturally, and conversationally.
- Keep responses concise (under 250 words) unless the user asks for detail.
- Always answer the user's question based on the book's content.
- Use the conversation history to provide continuity.
- Do NOT say you cannot access the book - you have the excerpts below.

BOOK EXCERPTS (use for reference):
${bookContext || "This is an AI assistant for discussing books. Answer based on your general knowledge of the title."}

CONVERSATION HISTORY:
${conversationHistory || "(No prior conversation)"}

User's message: ${userMessage}

Your response:`;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        if (!aiResponse) {
            return { success: false, error: "Empty response from AI" };
        }

        // Save AI response
        await Message.create({
            clerkId: userId,
            bookId,
            sessionId: sessionId || undefined,
            role: 'assistant',
            content: aiResponse
        });

        return { success: true, response: aiResponse };
    } catch (error: any) {
        console.error("chatWithBook error:", error);
        return { 
            success: false, 
            error: "We've experienced a slight hiccup in our conversation. We will work on this. Please try again." 
        };
    }
};
