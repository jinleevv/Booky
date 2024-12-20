import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user/userRegistrationRoute";
import createTeamRoutes from "./routes/team/createTeamRoute";
import getTeamRoutes from "./routes/team/getTeamRoute";
import updateAppointmentRoutes from "./routes/team/updateAppointmentRoute";
import queryTeamRoutes from "./routes/team/queryTeamRoute";
import updateTeamMembersRoute from "./routes/team/updateTeamMembersRoute";
import queryUserTeamsRoutes from "./routes/team/queryUserTeamsRoute";
import updateCancellationRoutes from "./routes/team/updateCancellationRoute";
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
app.use("/api/users", userRoutes);
app.use("/api/teams", queryUserTeamsRoutes);
app.use("/api/teams", createTeamRoutes);
app.use("/api/teams", updateAppointmentRoutes);
app.use("/api/teams", queryTeamRoutes);
app.use("/api/teams", updateTeamMembersRoute);
app.use("/api/teams", updateCancellationRoutes);
app.use("/api/teams", getTeamRoutes);
app.use("/api/appointment/get-appointment", queryAppointmentRoute);
app.use("/api/appointment/delete-appointment", deleteAppointmentRoute);

// MongoDB connection
mongoose
  .connect(process.env.SERVER_MONGODB!, {
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
