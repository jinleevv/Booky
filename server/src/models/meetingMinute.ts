import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMeetingMinute extends Document {
  _id: string;
  data: Object;
  createdAt: Date;
}

const MeetingMinuteSchema: Schema = new Schema<IMeetingMinute>({
  _id: { type: String, required: true },
  data: { type: Object, required: true },
  createdAt: { type: Date },
});

// Create a model instance, to be used to interact with MongoDB users collection.
const MeetingMinute: Model<IMeetingMinute> = mongoose.model<IMeetingMinute>(
  "MeetingMinute",
  MeetingMinuteSchema
);

export default MeetingMinute;
