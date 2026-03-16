'use server';

import { connectToDatabase } from "@/database/mongoose";
import Book from "@/database/models/book.model";
import Comment from "@/database/models/comment.model";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";

export const toggleBookPrivacy = async (bookId: string, hashtags?: string[]) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();
        const book = await Book.findById(bookId);

        if (!book) return { success: false, error: "Book not found" };
        if (book.clerkId !== userId) return { success: false, error: "Unauthorized" };

        const newVisibility = book.visibility === 'public' ? 'private' : 'public';
        book.visibility = newVisibility;
        if (newVisibility === 'public') {
            book.publishedAt = new Date();
            if (hashtags) {
                book.hashtags = hashtags;
            }
        }
        await book.save();

        revalidatePath(`/nodes/${book.slug}`);
        revalidatePath('/');
        revalidatePath('/shelf');

        return { success: true, visibility: newVisibility };
    } catch (e: any) {
        console.error('Error toggling privacy', e);
        return { success: false, error: "We've experienced a slight hiccup updating privacy. We will work on this." };
    }
}

export const likeBook = async (bookId: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();
        const book = await Book.findById(bookId);
        if (!book) return { success: false, error: "Book not found" };

        const likes = book.likes || [];
        const index = likes.indexOf(userId);

        if (index > -1) {
            likes.splice(index, 1);
        } else {
            likes.push(userId);
        }

        book.likes = likes;
        await book.save();

        revalidatePath('/');
        revalidatePath(`/nodes/${book.slug}`);

        return { success: true, likes: serializeData(likes) };
    } catch (e: any) {
        console.error('Error liking book', e);
        return { success: false, error: "We've experienced a slight hiccup. We will work on this." };
    }
}

export const addComment = async (bookId: string, text: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const { currentUser } = await import("@clerk/nextjs/server");
        const user = await currentUser();

        await connectToDatabase();
        
        const comment = await Comment.create({
            bookId,
            clerkId: userId,
            userName: `${user?.firstName} ${user?.lastName}`,
            userImage: user?.imageUrl,
            text
        });

        await Book.updateOne({ _id: bookId }, { $inc: { commentsCount: 1 } });

        revalidatePath(`/nodes/[slug]`, 'page');

        return { success: true, data: serializeData(comment) };
    } catch (e: any) {
        console.error('Error adding comment', e);
        return { success: false, error: "We've experienced a slight hiccup adding your comment." };
    }
}

export const getCommentsForBook = async (bookId: string) => {
    try {
        await connectToDatabase();
        // Sort by pinned first, then newest
        const comments = await Comment.find({ bookId })
            .sort({ isPinned: -1, createdAt: -1 })
            .lean();
        return { success: true, data: serializeData(comments) };
    } catch (e: any) {
        console.error('Error fetching comments', e);
        return { success: false, error: "Failed to load comments." };
    }
}

export const likeComment = async (commentId: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();
        const comment = await Comment.findById(commentId);

        if (!comment) return { success: false, error: "Comment not found" };

        const index = comment.likes.indexOf(userId);
        if (index === -1) {
            comment.likes.push(userId);
        } else {
            comment.likes.splice(index, 1);
        }

        await comment.save();
        return { success: true, likes: comment.likes };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to like comment" };
    }
};

export const deleteComment = async (commentId: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();
        const comment = await Comment.findById(commentId);
        if (!comment) return { success: false, error: "Comment not found" };

        // Check if user is author of comment OR author of the book
        const book = await Book.findById(comment.bookId);
        const isAuthorOfBook = book?.clerkId === userId;
        const isAuthorOfComment = comment.clerkId === userId;

        if (!isAuthorOfBook && !isAuthorOfComment) {
            return { success: false, error: "Unauthorized" };
        }

        await Comment.findByIdAndDelete(commentId);
        await Book.updateOne({ _id: comment.bookId }, { $inc: { commentsCount: -1 } });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to delete comment" };
    }
};

export const editComment = async (commentId: string, newText: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();
        const comment = await Comment.findById(commentId);
        if (!comment) return { success: false, error: "Comment not found" };

        if (comment.clerkId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        comment.text = newText;
        await comment.save();

        return { success: true, data: serializeData(comment) };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to edit comment" };
    }
};

export const togglePinComment = async (commentId: string) => {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        await connectToDatabase();
        const comment = await Comment.findById(commentId);
        if (!comment) return { success: false, error: "Comment not found" };

        // Only book author can pin
        const book = await Book.findById(comment.bookId);
        if (book?.clerkId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        comment.isPinned = !comment.isPinned;
        await comment.save();

        return { success: true, isPinned: comment.isPinned };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to pin comment" };
    }
};
