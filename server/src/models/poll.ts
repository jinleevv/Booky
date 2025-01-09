import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for time slots
interface ITimeRange {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

// Interface for daily schedule
interface IDaySchedule {
  date: string; // YYYY-MM-DD format
  times: ITimeRange[];
}

// Interface for participant availability
interface IParticipantSchedule {
  email: string;
  name?: string;
  schedule: IDaySchedule[];
}

// Main Poll interface
interface IPoll extends Document {
  _id: string;
  pollName: string;
  pollDescription?: string;
  creatorEmail: string;
  dateRange: {
    start: string; // YYYY-MM-DD format
    end: string; // YYYY-MM-DD format
  };
  timeRange: {
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  participants: Map<string, IDaySchedule[]>; // Map of email to their schedule
  createdAt: Date;
  updatedAt: Date;
}

// Schema for time ranges (e.g., 9:00-10:00)
const TimeRangeSchema = new Schema<ITimeRange>(
  {
    start: { type: String, required: true }, // HH:mm format
    end: { type: String, required: true }, // HH:mm format
  },
  { _id: false }
);

// Schema for daily schedule
const DayScheduleSchema = new Schema<IDaySchedule>(
  {
    date: { type: String, required: true }, // YYYY-MM-DD format
    times: [TimeRangeSchema],
  },
  { _id: false }
);

// Schema for participant availability
const ParticipantScheduleSchema = new Schema<IParticipantSchedule>(
  {
    email: { type: String, required: true },
    name: { type: String },
    schedule: [DayScheduleSchema],
  },
  { _id: false }
);

// Main Poll Schema
const PollSchema = new Schema<IPoll>(
  {
    _id: { type: String, required: true },
    pollName: { type: String, required: true },
    pollDescription: { type: String },
    creatorEmail: { type: String, required: true },
    dateRange: {
      start: { type: String, required: true }, // YYYY-MM-DD format
      end: { type: String, required: true }, // YYYY-MM-DD format
    },
    timeRange: {
      start: { type: String, required: true }, // HH:mm format
      end: { type: String, required: true }, // HH:mm format
    },
    participants: {
      type: Map,
      of: [DayScheduleSchema],
      default: new Map(),
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
PollSchema.index({ creatorEmail: 1 });
PollSchema.index({ createdAt: -1 });

// Instance methods
PollSchema.methods.addParticipant = function (
  email: string,
  schedule: IDaySchedule[]
) {
  this.participants.set(email, schedule);
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

// Static methods
PollSchema.statics.findByCreator = function (creatorEmail: string) {
  return this.find({ creatorEmail });
};

PollSchema.statics.findActivePolls = function () {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return this.find({ createdAt: { $gte: oneMonthAgo } });
};

// Create interfaces for the model with static methods
interface IPollModel extends Model<IPoll> {
  findByCreator(creatorEmail: string): Promise<IPoll[]>;
  findActivePolls(): Promise<IPoll[]>;
}

// Create and export the model
const Poll: IPollModel = mongoose.model<IPoll, IPollModel>("Poll", PollSchema);

export default Poll;
