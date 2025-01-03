import mongoose, { Schema, Document, Model } from "mongoose";

// The structure of a team. 
// All team related information like office hours and appointments are stored here.
interface ITeam extends Document {
  _id: string;
  name: string;
  admin: string;
  coadmins: string[];
  members: string[];
  availableTime: ISchedule[];
  durations: string[];
  appointments: IAppointment[];
  cancelledMeetings: ICancelMeeting[];
  createdAt: Date;
}

// The start and end time of an office hour.
interface ITimeRange {
  start: string;
  end: string;
}

// An office hour schedule is defined by these attributes.
// There is one for each day of the week (7 total).
interface ISchedule {
  day: string;
  enabled: boolean;
  times: ITimeRange[];
}

// Define the structure of an appointment.
// The email is necessary to send a confirmation email.
// The token/tokenExpirey is necessary to allow users to cancel their appointments.
interface IAppointment {
  _id: string;
  day: string;
  time: string;
  name: string;
  email: string;
  token: string;
  tokenExpiry: Date;
}

// A professor can cancel an office hour time slot.
// An office hour time slot can be uniquely identified within a team by the day and meeting.
// Necessary for modifying availability in the calendar.
interface ICancelMeeting {
  day: string;
  meeting: ITimeRange;
}

const TimeRangeSchema: Schema = new Schema<ITimeRange>({
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const ScheduleSchema: Schema = new Schema<ISchedule>({
  day: { type: String, required: true },
  enabled: { type: Boolean, required: true },
  times: [TimeRangeSchema], 
});

// Storing the name is optional.
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
  meeting: { type: TimeRangeSchema, required: true },
});

const TeamSchema: Schema = new Schema<ITeam>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  admin: { type: String, required: true },
  coadmins: [{ type: String, required: false }],
  members: [{ type: String, required: true }],
  availableTime: [ScheduleSchema],
  appointments: [AppointmentSchema],
  durations: [{ type: String, required: true }],
  cancelledMeetings: [CancelMeetingSchema],
  createdAt: { type: Date, default: Date.now },
});

const Team: Model<ITeam> = mongoose.model<ITeam>("Team", TeamSchema);

export default Team;