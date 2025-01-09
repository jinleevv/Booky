import mongoose, { Schema, Document, Model } from "mongoose";

interface IPoll extends Document {
    _id: string;
    pollName: string;
    pollDescription: string;
    createdAt: Date;
}



const PollSchema: Schema = new Schema<IPoll>({
  _id: { type: String, required: true },
  pollName: { type: String, required: true },
  pollDescription: { type: String },
  availableTime: {
    type: Map,
    of: [ScheduleSchema], // Map of user IDs to their schedules
    default: {}, // Initialize with an empty map
  },
  durations: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});


const Poll: Model<IPoll> = mongoose.model<IPoll>("Poll", PollSchema);
