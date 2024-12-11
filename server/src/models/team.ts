import mongoose, { Schema, Document, Model } from "mongoose";

interface ITimeRange {
  start: string;
  end: string;
}
interface ISchedule {
  day: string;
  enabled: boolean;
  times: ITimeRange[];
}

interface ITeam extends Document {
  _id: string;
  name: string;
  durations: string[];
  availableTime: ISchedule[];
  appointments: ISchedule[];
  //   members: string[];
  admin: string;
  //   coadmin: string[];
  createdAt: Date;
}
const TimeRangeSchema: Schema = new Schema<ITimeRange>({
    start: { type: String, required: true },
    end: { type: String, required: true },
  });
  
  // Define Schedule Sub-Schema
  const ScheduleSchema: Schema = new Schema<ISchedule>({
    day: { type: String, required: true },
    enabled: { type: Boolean, required: true },
    times: [TimeRangeSchema], // Use the TimeRange sub-schema
  });

const TeamSchema: Schema = new Schema<ITeam>({
  _id: { type: String, required: true },
  name: {
    type: String,
    required: true,
  },
  durations: [{ type: String, required: true }],
  availableTime: [ScheduleSchema],
  appointments: [ScheduleSchema],
  //   members: [
  //     {
  //       type: String,
  //       ref: "User",
  //     },
  //   ],
  admin: {
    type: String,
    required: true,
  },
  //   coadmin: [
  //     {
  //       type: String,
  //       ref: "User",
  //     },
  //   ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Team model
const Team: Model<ITeam> = mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
