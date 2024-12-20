// Mongoose library, to interact with MongoDB collections.
import mongoose, { Schema, Document, Model } from "mongoose";

// Create an interface for the User schema, useful for TypeScript type-checking validation.
// _id attribute is inherited from Document
interface IUser extends Document {
  email: string;
  name: string;
}

// Define the schema, i.e., the structure of the users collection in MongoDB.
const UserSchema: Schema = new Schema<IUser>({
  _id: { type: String },
  email: { type: String },
  name: { type: String },
});

// Create a model instance, to be used to interact with MongoDB users collection.
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;