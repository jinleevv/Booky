import mongoose, { Schema, Document, Model } from "mongoose";

// The structure of a team. 
// All team related information like office hours and appointments are stored here.
interface ITeam extends Document {
  _id: string;
  name: string;
  admin: string;
  coadmins: string[];
  members: string[];
  availableTimes: Map<string,
    {
      recurring: IRecurringSchedule[];
      oneTime: IOneTimeSchedule[];
    }
  >;  
  appointments: IAppointments[];
  cancelledMeetings: ICancelledMeetings[];
  createdAt: Date;
}

interface IRecurringSchedule {
  name: string,
  weekSchedule: ISchedule[],
  type: "oneOnOne" | "group",
  duration?: string;
  attendees?: number;
  zoomLink: string,
}

interface IOneTimeSchedule {
  name: string,
  date: string,
  time: ITimeRange,
  type: "oneOnOne" | "group",
  duration?: string;
  attendees?: number;
  zoomLink: string,
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
interface IAppointments {
  meetingType: "recurring" | "oneTime";
  appointmentType: "oneOnOne" | "group";
  meetingId: string,
  date: string;
  time: string;
  hostName: string;
  hostEmail: string;
  participantName: string;
  participantEmail: string;
  token: string;
  tokenExpiry: Date;
}

// A professor can cancel an office hour time slot.
// An office hour time slot can be uniquely identified within a team by the day and meeting.
// Necessary for modifying availability in the calendar.
interface ICancelledMeetings {
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

const RecurringScheduleSchema: Schema = new Schema<IRecurringSchedule>({
  name: { type: String, required: true },
  weekSchedule: { type: [ScheduleSchema], required: true },
  type: { 
    type: String, 
    enum: ["oneOnOne", "group"], 
    required: true 
  },
  duration: {
    type: String,
    required: function (this: IRecurringSchedule) {
      return this.type === "oneOnOne";
    },
  },
  attendees: {
    type: Number,
    required: function (this: IRecurringSchedule) {
      return this.type === "group";
    },
  },
  zoomLink: { type: String, required: true },
});

const OneTimeScheduleSchema: Schema = new Schema<IOneTimeSchedule>({
  name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: TimeRangeSchema, required: true },
  type: { 
    type: String, 
    enum: ["oneOnOne", "group"], 
    required: true 
  },
  duration: {
    type: String,
    required: function (this: IRecurringSchedule) {
      return this.type === "oneOnOne";
    },
  },
  attendees: {
    type: Number,
    required: function (this: IRecurringSchedule) {
      return this.type === "group";
    },
  },
  zoomLink: { type: String, required: true },
})

// Storing the name is optional.
const AppointmentSchema: Schema = new Schema<IAppointments>({
  meetingType: { 
    type: String, 
    enum: ["recurring", "oneTime"], 
    required: true 
  },
  appointmentType: { 
    type: String, 
    enum: ["oneOnOne", "group"], 
    required: true 
  },
  meetingId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  hostName: { type: String, required: false },
  hostEmail: { type: String, required: true },
  participantName: { type: String, required: false },
  participantEmail: { type: String, required: true },
  token: { type: String, required: true },              
  tokenExpiry: { type: Date, required: true },
});

const CancelledMeetingsSchema: Schema = new Schema<ICancelledMeetings>({
  day: { type: String, required: true },
  meeting: { type: TimeRangeSchema, required: true },
});

const TeamSchema: Schema = new Schema<ITeam>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  admin: { type: String, required: true },
  coadmins: [{ type: String, required: false }],
  members: [{ type: String, required: true }],
  availableTimes: {
    type: Map,
    of: new Schema({
      recurring: { type: [RecurringScheduleSchema], default: [] },
      oneTime: { type: [OneTimeScheduleSchema], default: [] },
    }),
    default: {},
  },
  appointments: [AppointmentSchema],
  cancelledMeetings: [CancelledMeetingsSchema],
  createdAt: { type: Date, default: Date.now },
});

const Team: Model<ITeam> = mongoose.model<ITeam>("Team", TeamSchema);

export default Team;