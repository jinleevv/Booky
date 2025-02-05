import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import path from "path";
import { Server } from "socket.io";
import MeetingMinute from "./models/meetingMinute";
import getMeetingMinuteRoute from "./routes/document/getMeetingMinuteRoute";
import mergeMeetingMinutes from "./routes/document/mergeMeetingMinutesRoute";
import removeCommentsRoute from "./routes/document/removeCommentsRoute";
import updateCommentsRoute from "./routes/document/updateCommentsRoute";
import createPollRoute from "./routes/poll/createPollRoute";
import getPollRoute from "./routes/poll/getPollRoute";
import updatePollRoute from "./routes/poll/updatePollRoute";
import getTaskFlowHandler from "./routes/taskFlow/getTaskFlow";
import updateTaskFlowHandler from "./routes/taskFlow/updateTaskFlow";
import createMeetingTeamRoute from "./routes/team/createMeetingTeamRoute";
import createTeamRoute from "./routes/team/createTeamRoute";
import deleteAppointmentRoute from "./routes/team/deleteAppointmentRoute";
import editMeetingTeamRoute from "./routes/team/editMeetingTeamRoute";
import getAppointmentRoute from "./routes/team/getAppointmentRoute";
import getMeetingRoute from "./routes/team/getMeetingRoute";
import getMeetingTeamRoute from "./routes/team/getMeetingTeamRoute";
import getTeamRoute from "./routes/team/getTeamRoute";
import getUserTeamsRoute from "./routes/team/getUserTeamsRoute";
import mergeMeetingsInMeetingTeamRoute from "./routes/team/mergeMeetingsInMeetingTeamRoute";
import removeMeetingTeamFromTeamRoute from "./routes/team/removeMeetingTeamFromTeamRoute";
import removeUserFromTeamRoute from "./routes/team/removeUserFromTeamRoute";
import updateAppointmentRoute from "./routes/team/updateAppointmentRoute";
import updateCancellationRoute from "./routes/team/updateCancellationRoute";
import updateCoadminRoute from "./routes/team/updateCoadminRoute";
import updatePermissionRoute from "./routes/team/updatePermissionRoute";
import updateTeamDescriptionRoute from "./routes/team/updateTeamDescriptionRoute";
import updateTeamMembersRoute from "./routes/team/updateTeamMembersRoute";
import userRoute from "./routes/user/userRegistrationRoute";

dotenv.config();

const app = express();

const PORT = process.env.PORT;
// const SOCKET_PORT = Number(process.env.SOCKET_PORT);
const allowedOrigins = [
  "http://localhost:10000",
  "https://booky.im",
  "https://www.booky.im",
];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: (origin: any, callback: any) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: [
      "Origin",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-Requested-With",
    ],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// ✅ Add this to explicitly handle preflight requests (for OPTIONS)
app.options("*", cors());

app.use(express.json());

// Routes
// Basic route
app.get("/api/health", (req: any, res: any) => {
  res.json({ status: "ok" });
});
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

app.get("*", (req: any, res: any) => {
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

// startScheduler();

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

io.on("connection", (socket: any) => {
  console.log("Socket Connected");
  socket.on("get-document", async (meeting: any) => {
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

    socket.on("send-changes", (delta: any) => {
      socket.broadcast.to(meeting).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data: any) => {
      await MeetingMinute.findByIdAndUpdate(meeting, { data });
    });

    // Handle title changes
    socket.on("send-title-change", async (title: any) => {
      await MeetingMinute.findByIdAndUpdate(meeting, { title });
      socket.broadcast.to(meeting).emit("receive-title-change", title);
    });
  });
});
