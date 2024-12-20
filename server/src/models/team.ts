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

interface IAppointment {
  _id: string;
  day: string;
  time: string;
  name: string;
  email: string;
  token: string;
  tokenExpiry: Date;
}

interface ICancelMeeting {
  day: string;
  meeting: ITimeRange;
}

interface ITeam extends Document {
  _id: string;
  name: string;
  admin: string;
  members: string[];
  availableTime: ISchedule[];
  appointments: IAppointment[];
  durations: string[];
  //   coadmin: string[];
  cancelledMeetings: ICancelMeeting[];
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

// Define Appointment Schema
const AppointmentSchema: Schema = new Schema<IAppointment>({
  day: { type: String, required: true },
  time: { type: String, required: true },
  name: { type: String, required: false },
  email: { type: String, required: true },
  token: { type: String, required: true },              
  tokenExpiry: { type: Date, required: true },
});

const CancelMeetingSchema: Schema = new Schema<ICancelMeeting>({
  day: { type: String, required: true },
  meeting: TimeRangeSchema,
});

const TeamSchema: Schema = new Schema<ITeam>({
  _id: { type: String, required: true },
  name: {
    type: String,
    required: true,
  },
  admin: {
    type: String,
    required: true,
  },
  members: [{ type: String, required: true }],
  availableTime: [ScheduleSchema],
  appointments: [AppointmentSchema],
  durations: [{ type: String, required: true }],
  cancelledMeetings: [CancelMeetingSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Team model
const Team: Model<ITeam> = mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
