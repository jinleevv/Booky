import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./routes/user/userRegistrationRoute";
import createTeamRoute from "./routes/team/createTeamRoute";
import getTeamRoute from "./routes/team/getTeamRoute";
import updateAppointmentRoute from "./routes/team/updateAppointmentRoute";
import updateTeamMembersRoute from "./routes/team/updateTeamMembersRoute";
import getUserTeamsRoute from "./routes/team/getUserTeamsRoute";
import updateCancellationRoute from "./routes/team/updateCancellationRoute";
import updateCoadminRoute from "./routes/team/updateCoadminRoute";
import getAppointmentRoute from "./routes/team/getAppointmentRoute";
import deleteAppointmentRoute from "./routes/team/deleteAppointmentRoute";
import getMeetingRoute from "./routes/team/getMeetingRoute";
import createMeetingRoute from "./routes/team/createMeetingRoute";
import editMeetingRoute from "./routes/team/editMeetingRoute";
import deleteMeetingRoute from "./routes/team/deleteMeetingRoute";
import removeUserFromTeamRoute from "./routes/team/removeUserFromTeamRoute";
import updatePermissionRoute from "./routes/team/updatePermissionRoute";
import updateTeamDescriptionRoute from "./routes/team/updateTeamDescriptionRoute";
import { Server } from "socket.io";
import MeetingMinute from "./models/meetingMinute";
import { startScheduler } from "./meetingCreateScheduler";

dotenv.config();

const app = express();
const PORT = 5001;
const io = new Server(5002, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // If cookies or credentials are involved
  })
);

app.use(express.json());

// Routes
app.use("/api/users", userRoute);
app.use("/api/teams/by-user", getUserTeamsRoute);
app.use("/api/teams/create", createTeamRoute);
app.use("/api/teams", updateAppointmentRoute);
app.use("/api/teams", updateTeamMembersRoute);
app.use("/api/teams", updateCancellationRoute);
app.use("/api/teams", getMeetingRoute);
app.use("/api/teams", createMeetingRoute);
app.use("/api/teams", editMeetingRoute);
app.use("/api/teams", deleteMeetingRoute);
app.use("/api/teams", updateCoadminRoute);
app.use("/api/teams", updatePermissionRoute);
app.use("/api/teams", updateTeamDescriptionRoute);
app.use("/api/teams/", getTeamRoute);
app.use("/api/appointment/get-appointment", getAppointmentRoute);
app.use("/api/appointment/delete-appointment", deleteAppointmentRoute);
app.use("/api/team/remove-user-from-team", removeUserFromTeamRoute);

async function findOrCreateMeetingMinute(id: any) {
  if (id === null) return;

  const meetingMinute = await MeetingMinute.findById(id);
  if (meetingMinute) return meetingMinute;
  return await MeetingMinute.create({ _id: id, data: "" });
}

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI!, {
    dbName: "booky",
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Basic route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

startScheduler();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("Socket Connected");
  socket.on("get-document", async (meeting) => {
    const meetingMinute = await findOrCreateMeetingMinute(meeting);
    if (meetingMinute === undefined) {
      console.log("meeting minute is undefined");
      return;
    }
    socket.join(meeting);
    socket.emit("load-document", meetingMinute.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(meeting).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await MeetingMinute.findByIdAndUpdate(meeting, { data });
    });
  });
});
