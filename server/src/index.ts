import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import createPollRoute from "./routes/poll/createPollRoute";
import getPollRoute from "./routes/poll/getPollRoute";
import updatePollRoute from "./routes/poll/updatePollRoute";
import createTeamRoute from "./routes/team/createTeamRoute";
import deleteAppointmentRoute from "./routes/team/deleteAppointmentRoute";
import getAppointmentRoute from "./routes/team/getAppointmentRoute";
import getTeamRoute from "./routes/team/getTeamRoute";
import getUserTeamsRoute from "./routes/team/getUserTeamsRoute";
import removeUserFromTeamRoute from "./routes/team/removeUserFromTeamRoute";
import updateAppointmentRoute from "./routes/team/updateAppointmentRoute";
import updateAvailableTimeRoute from "./routes/team/updateAvailableTimeRoute";
import updateCancellationRoute from "./routes/team/updateCancellationRoute";
import updateCoadminRoute from "./routes/team/updateCoadminRoute";
import updateTeamMembersRoute from "./routes/team/updateTeamMembersRoute";
import userRoute from "./routes/user/userRegistrationRoute";
import updatePermissionRoute from "./routes/team/updatePermissionRoute";
import updateTeamDescriptionRoute from "./routes/team/updateTeamDescriptionRoute";

dotenv.config();

const app = express();
const PORT = 5001;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
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
app.use("/api/teams", updateAvailableTimeRoute);
app.use("/api/teams", updateCoadminRoute);
app.use("/api/teams", updatePermissionRoute);
app.use("/api/teams", updateTeamDescriptionRoute);
app.use("/api/teams/", getTeamRoute);
app.use("/api/appointment/get-appointment", getAppointmentRoute);
app.use("/api/appointment/delete-appointment", deleteAppointmentRoute);
app.use("/api/team/remove-user-from-team", removeUserFromTeamRoute);
app.use("/api/polls/create", createPollRoute);
app.use("/api/polls", updatePollRoute);
app.use("/api/polls", getPollRoute);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
