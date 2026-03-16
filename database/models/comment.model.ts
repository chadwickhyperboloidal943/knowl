import { model, Schema, models, Document } from "mongoose";

export interface ICommentSchema extends Document {
    bookId: Schema.Types.ObjectId;
    clerkId: string;
    userName: string;
    userImage: string;
    text: string;
    createdAt: Date;
}

const CommentSchema = new Schema({
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    clerkId: { type: String, required: true },
    userName: { type: String, required: true },
    userImage: { type: String },
    text: { type: String, required: true },
    likes: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false },
}, { timestamps: true });

const Comment = models.Comment || model<ICommentSchema>('Comment', CommentSchema);

export default Comment;
