import { model, Schema, models } from "mongoose";
import { IUser } from "@/types";

const UserSchema = new Schema<IUser>({
    clerkId: { type: String, required: true, unique: true },
    username: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    imageUrl: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    followers: { type: [String], default: [] }, // Array of clerkIds
    following: { type: [String], default: [] }, // Array of clerkIds
    bio: { type: String },
}, { timestamps: true });

const User = models.User || model<IUser>('User', UserSchema);

export default User;
