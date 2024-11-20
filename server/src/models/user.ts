import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser extends Document {
  uid: string; 
}

const UserSchema: Schema = new Schema<IUser>({
  _id: { type: String }
});

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
