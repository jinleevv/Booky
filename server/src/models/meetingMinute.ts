import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment {
  id: number;
  text: string; // The text that the comment is associated with
  comment: string;
  range: {
    index: number;
    length: number;
  };
}

export interface IMeetingMinute extends Document {
  _id: string;
  title: string;
  data: Object;
  comments: IComment[];
  createdAt: Date;
}

const CommentSchema: Schema = new Schema<IComment>({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  comment: { type: String, required: true },
  range: {
    index: { type: Number, required: true },
    length: { type: Number, required: true },
  },
});

const MeetingMinuteSchema: Schema = new Schema<IMeetingMinute>({
  _id: { type: String, required: true },
  title: { type: String, required: false },
  data: { type: Object, required: true },
  comments: { type: [CommentSchema], required: false },
  createdAt: { type: Date },
});

// Create a model instance, to be used to interact with MongoDB users collection.
const MeetingMinute: Model<IMeetingMinute> = mongoose.model<IMeetingMinute>(
  "MeetingMinute",
  MeetingMinuteSchema
);

export default MeetingMinute;
