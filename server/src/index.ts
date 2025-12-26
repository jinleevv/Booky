import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { Server } from "socket.io";
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
import userRoute from "./routes/user/userRegistrationRoute";
import http from "http";

dotenv.config();

const app = express();

const PORT = process.env.PORT;
const allowedOrigins = [
  "http://localhost:5173",
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

app.options("*", cors());

app.use(express.json());

// Routes
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

app.use(express.static(path.join(__dirname, "../booky/dist")));

app.get("*", (req: any, res: any) => {
  res.sendFile(path.join(__dirname, "../booky/dist/index.html"));
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI!, {
    dbName: "booky",
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// -------CRON JOBS---------
// meetingCreateScheduler();
// sendMeetingReminders();
// --------------------------

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
