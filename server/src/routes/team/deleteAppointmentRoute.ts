import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

export const deleteAppointmentHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId, appointmentToken } = req.query;

  if (!appointmentToken || typeof appointmentToken !== "string") {
    res.status(400).json({ message: "Invalid or missing token" });
    return;
  }

  try {
    await Team.updateOne(
      { _id: teamId }, // Filter: Find the team by ID
      { $pull: { appointments: { token: appointmentToken } } }
    );

    res.status(200).json();
  } catch (error) {
    console.error("Error querying teams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/", deleteAppointmentHandler);

export default router;