import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { startScheduler } from "./meetingCreateScheduler";
import MeetingMinute from "./models/meetingMinute";
import getMeetingMinuteRoute from "./routes/document/getMeetingMinuteRoute";
import mergeMeetingMinutes from "./routes/document/mergeMeetingMinutesRoute";
import createPollRoute from "./routes/poll/createPollRoute";
import getPollRoute from "./routes/poll/getPollRoute";
import updatePollRoute from "./routes/poll/updatePollRoute";
import createMeetingTeamRoute from "./routes/team/createMeetingTeamRoute";
import createTeamRoute from "./routes/team/createTeamRoute";
import deleteAppointmentRoute from "./routes/team/deleteAppointmentRoute";
import removeMeetingTeamFromTeamRoute from "./routes/team/removeMeetingTeamFromTeamRoute";
import mergeMeetingsInMeetingTeamRoute from "./routes/team/mergeMeetingsInMeetingTeamRoute";
import editMeetingTeamRoute from "./routes/team/editMeetingTeamRoute";
import getAppointmentRoute from "./routes/team/getAppointmentRoute";
import getMeetingRoute from "./routes/team/getMeetingRoute";
import getMeetingTeamRoute from "./routes/team/getMeetingTeamRoute";
import getTeamRoute from "./routes/team/getTeamRoute";
import getUserTeamsRoute from "./routes/team/getUserTeamsRoute";
import removeUserFromTeamRoute from "./routes/team/removeUserFromTeamRoute";
import updateAppointmentRoute from "./routes/team/updateAppointmentRoute";
import updateCancellationRoute from "./routes/team/updateCancellationRoute";
import updateCoadminRoute from "./routes/team/updateCoadminRoute";
import updatePermissionRoute from "./routes/team/updatePermissionRoute";
import updateTeamDescriptionRoute from "./routes/team/updateTeamDescriptionRoute";
import updateTeamMembersRoute from "./routes/team/updateTeamMembersRoute";
import updateCommentsRoute from "./routes/document/updateCommentsRoute";
import removeCommentsRoute from "./routes/document/removeCommentsRoute";
import userRoute from "./routes/user/userRegistrationRoute";
import getTaskFlowHandler from "./routes/taskFlow/getTaskFlow";
import updateTaskFlowHandler from "./routes/taskFlow/updateTaskFlow";

dotenv.config();

const app = express();

const DB_PORT = process.env.DB_PORT;
const SOCKET_PORT = Number(process.env.SOCKET_PORT);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

const io = new Server(SOCKET_PORT, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: [
      "Origin",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-Request-With",
    ],
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
app.use("/api/teams", createMeetingTeamRoute);
app.use("/api/teams", getMeetingTeamRoute);
app.use("/api/teams", editMeetingTeamRoute);
app.use("/api/teams", removeMeetingTeamFromTeamRoute);
app.use("/api/teams", mergeMeetingsInMeetingTeamRoute);
app.use("/api/teams", updateCoadminRoute);
app.use("/api/teams", updatePermissionRoute);
app.use("/api/teams", updateTeamDescriptionRoute);
app.use("/api/teams", getTeamRoute);
app.use("/api/appointment/get-appointment", getAppointmentRoute);
app.use("/api/appointment/delete-appointment", deleteAppointmentRoute);
app.use("/api/team/remove-user-from-team", removeUserFromTeamRoute);
app.use("/api/polls/create", createPollRoute);
app.use("/api/polls", updatePollRoute);
app.use("/api/polls", getPollRoute);
app.use("/api/document/", getMeetingMinuteRoute);
app.use("/api/document/", mergeMeetingMinutes);
app.use("/api/document/", updateCommentsRoute);
app.use("/api/document/", removeCommentsRoute);
app.use("/api/taskFlow", getTaskFlowHandler);
app.use("/api/taskFlow", updateTaskFlowHandler);

app.use(express.static(path.join(__dirname, "../booky/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../booky/dist/index.html"));
});

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

// startScheduler();

app.listen(DB_PORT, () => {
  console.log(`Server running on port ${DB_PORT}`);
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
    // socket.emit("load-document", meetingMinute.data);
    socket.emit("load-document", {
      data: meetingMinute.data,
      title: meetingMinute.title, // Send title
    });

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(meeting).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await MeetingMinute.findByIdAndUpdate(meeting, { data });
    });

    // Handle title changes
    socket.on("send-title-change", async (title) => {
      await MeetingMinute.findByIdAndUpdate(meeting, { title });
      socket.broadcast.to(meeting).emit("receive-title-change", title);
    });
  });
});
