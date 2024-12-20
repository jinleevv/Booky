import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./routes/user/userRegistrationRoute";
import createTeamRoute from "./routes/team/createTeamRoute";
import getTeamRoute from "./routes/team/getTeamRoute";
import updateAppointmentRoute from "./routes/team/updateAppointmentRoute";
import queryTeamRoute from "./routes/team/queryTeamRoute";
import updateTeamMembersRoute from "./routes/team/updateTeamMembersRoute";
import queryUserTeamsRoute from "./routes/team/queryUserTeamsRoute";
import updateCancellationRoute from "./routes/team/updateCancellationRoute";
import queryAppointmentRoute from "./routes/team/queryAppointmentRoute";
import deleteAppointmentRoute from "./routes/team/deleteAppointmentRoute";

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
app.use("/api/teams", queryUserTeamsRoute);
app.use("/api/teams", createTeamRoute);
app.use("/api/teams", updateAppointmentRoute);
app.use("/api/teams", queryTeamRoute);
app.use("/api/teams", updateTeamMembersRoute);
app.use("/api/teams", updateCancellationRoute);
app.use("/api/teams", getTeamRoute);
app.use("/api/appointment/get-appointment", queryAppointmentRoute);
app.use("/api/appointment/delete-appointment", deleteAppointmentRoute);

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
