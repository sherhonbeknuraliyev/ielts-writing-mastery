import mongoose, { Schema, type Document } from "mongoose";

export interface UserDocument extends Document {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchemaDB = new Schema<UserDocument>(
  {
    telegramId: { type: Number, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    username: { type: String },
    photoUrl: { type: String },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>("User", userSchemaDB);
