import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for time slots
interface ITimeRange {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

interface IDateRange {
  start: {
    date: string; // YYYY-MM-DD format
    day: number;
  };
  end: {
    date: string; // YYYY-MM-DD format
    day: number;
  };
}

// Interface for daily schedule
interface IDaySchedule {
  day: Number;
  date: string; // YYYY-MM-DD format
  times: string[];
}

// Interface for participant availability
interface IParticipantSchedule {
  email: string;
  schedule: string[];
}

// Main Poll interface
interface IPoll extends Document {
  _id: string;
  pollName: string;
  pollDescription?: string;
  urlPath: string;
  dateRange: {
    start: string; // YYYY-MM-DD format
    end: string; // YYYY-MM-DD format
  };
  time: ITimeRange;
  participants?: IParticipantSchedule[]; // Map of email to their schedule
  createdAt: Date;
  updatedAt?: Date;
}

// Schema for time ranges (e.g., 9:00-10:00)
const TimeRangeSchema = new Schema<ITimeRange>({
  start: { type: String, required: true }, // HH:mm format
  end: { type: String, required: true }, // HH:mm format
});

const DateRangeSchema = new Schema<IDateRange>({
  start: {
    date: { type: String, required: true },
    day: { type: Number, required: true },
  },
  end: {
    date: { type: String, required: true },
    day: { type: Number, required: true },
  },
});

// Schema for daily schedule
const DayScheduleSchema = new Schema<IDaySchedule>(
  {
    day: { type: Number, required: true }, // 0 - Sunday, 1 - Monday, ...
    date: { type: String, required: true }, // YYYY-MM-DD format
    times: [{ type: String }],
  },
  { _id: false }
);

// Schema for participant availability
const ParticipantScheduleSchema = new Schema<IParticipantSchedule>(
  {
    email: { type: String, unique: true, required: true },
    schedule: [{ type: String }],
  },
  { _id: false }
);

// Main Poll Schema
const PollSchema = new Schema<IPoll>(
  {
    _id: { type: String, required: true },
    pollName: { type: String, required: true },
    pollDescription: { type: String },
    urlPath: { type: String, required: true },
    dateRange: { type: DateRangeSchema, required: true },
    time: { type: TimeRangeSchema, required: true },
    participants: [ParticipantScheduleSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better query performance
PollSchema.index({ urlPath: 1 }, { unique: true });
PollSchema.index({ creatorEmail: 1 });
PollSchema.index({ createdAt: -1 });

PollSchema.methods.getGroupParticipants = function (): Map<
  string,
  IDaySchedule[]
> {
  return this.participants;
};

PollSchema.methods.removeParticipant = function (email: string) {
  this.participants.delete(email);
};

PollSchema.methods.getOverlappingTimes = function (): IDaySchedule[] {
  // Implementation to find overlapping times among all participants
  // This would be used to find times when everyone is available
  const overlappingSchedule: IDaySchedule[] = [];
  // ... implementation details ...
  return overlappingSchedule;
};

PollSchema.statics.findActivePolls = function () {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return this.find({ createdAt: { $gte: oneMonthAgo } });
};

// Create interfaces for the model with static methods
interface IPollModel extends Model<IPoll> {
  findActivePolls(): Promise<IPoll[]>;
}

// Create and export the model
const Poll: IPollModel = mongoose.model<IPoll, IPollModel>("Poll", PollSchema);

export default Poll;
