import { model, Schema, models } from "mongoose";

export interface IMessage {
    clerkId: string;
    bookId: Schema.Types.ObjectId;
    sessionId?: string; // Optional for backward compatibility
    role: string;
    content: string;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    clerkId: { type: String, required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    sessionId: { type: String, index: true },
    role: { type: String, required: true }, // 'user' | 'assistant'
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

MessageSchema.index({ clerkId: 1, bookId: 1, sessionId: 1, createdAt: 1 });

const Message = models.Message || model<IMessage>('Message', MessageSchema);

export default Message;
