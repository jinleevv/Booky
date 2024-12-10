import mongoose, { Schema, Document, Model } from "mongoose";

interface IUser extends Document {
  email: string;
  name: string;
}

const UserSchema: Schema = new Schema<IUser>({
  _id: { type: String },
  email: { type: String },
  name: { type: String },
});

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
