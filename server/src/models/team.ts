import mongoose, { Schema, Document, Model } from "mongoose";
import { IMeetingMinute } from "./meetingMinute";

// The structure of a team.
interface ITeam extends Document {
  _id: string;
  teamName: string;
  teamDescription: string;
  adminEmail: string;
  adminName: string;
  coadmins: string[];
  members: string[];
  meetingTeam: IMeetingTeam[];
  createdAt: Date;
}

export interface IMeetingTeam {
  _id: string;
  schedule: "recurring" | "one-time";
  hostName: string;
  hostEmail: string;

  meetingName: string;
  meetingDescription: string;
  meeting: IMeeting[];

  weekSchedule?: ISchedule[]; // For recurring
  date?: string; // For one-time
  time?: ITimeRange; // For one-time

  type: "oneOnOne" | "group";
  duration: string;
  zoomLink?: string;

  cancelledMeetings: ICancelledMeetings[];
}

interface IMeeting {
  _id: string;
  date: string;
  time: ITimeRange;
  attendees: IAttendee[];
}

// An office hour schedule is defined by these attributes.
// There is one for each day of the week (7 total).
interface ISchedule {
  day: string;
  enabled: boolean;
  times: ITimeRange[];
}

// The start and end time of an office hour.
interface ITimeRange {
  start: string;
  end: string;
}

// Define the structure of an appointment.
// The email is necessary to send a confirmation email.
// The token/tokenExpirey is necessary to allow users to cancel their appointments.
interface IAttendee {
  // To check which meeting they are attending
  time: ITimeRange;

  participantName?: string;
  participantEmail: string;

  token: string;
  tokenExpiry: Date;
}

// A professor can cancel an office hour time slot.
// An office hour time slot can be uniquely identified within a team by the day and meeting.
// Necessary for modifying availability in the calendar.
interface ICancelledMeetings {
  day: string;
  time: ITimeRange;
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

const CancelledMeetingsSchema: Schema = new Schema<ICancelledMeetings>({
  day: { type: String, required: true },
  time: { type: String, required: true },
});

// Storing the name is optional.
const AttendeeSchema: Schema = new Schema<IAttendee>({
  time: { type: String, required: true },

  participantName: { type: String, required: false },
  participantEmail: { type: String, required: true },

  token: { type: String, required: true },
  tokenExpiry: { type: Date, required: true },
});

const MeetingSchema: Schema = new Schema<IMeeting>({
  _id: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: TimeRangeSchema, required: true },
  attendees: [AttendeeSchema],
});

const MeetingTeamSchema: Schema = new Schema<IMeetingTeam>({
  schedule: { type: String, enum: ["recurring", "one-time"], required: true },
  hostName: { type: String, required: true },
  hostEmail: { type: String, required: true },
  cancelledMeetings: [CancelledMeetingsSchema],
  meetingName: { type: String, required: true },
  meetingDescription: { type: String, required: false },
  weekSchedule: {
    type: [ScheduleSchema],
    required: function () {
      return this.schedule === "recurring";
    },
  },
  date: {
    type: String,
    required: function () {
      return this.schedule === "one-time";
    },
  },
  time: {
    type: TimeRangeSchema,
    required: function () {
      return this.schedule === "one-time";
    },
  },
  type: { type: String, enum: ["oneOnOne", "group"], required: true },
  duration: { type: String, required: false },
  zoomLink: { type: String, required: false },
  meeting: { type: [MeetingSchema], required: true },
});

const TeamSchema: Schema = new Schema<ITeam>({
  _id: { type: String, required: true },
  teamName: { type: String, required: true },
  teamDescription: { type: String, required: false },
  adminEmail: { type: String, required: true },
  adminName: { type: String, required: true },
  coadmins: [{ type: String, required: false }],
  members: [{ type: String, required: true }],
  meetingTeam: { type: [MeetingTeamSchema], required: false },
  createdAt: { type: Date, default: Date.now },
});

const Team: Model<ITeam> = mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
