import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

// When a user cancels their appointment via their confirmation link.
// Delete the appointment from the team appointments list.
export const deleteAppointmentHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { teamId, appointmentToken } = req.query;

  if (!appointmentToken || typeof appointmentToken !== "string") {
    res.status(400).json({ message: "Invalid or missing token" });
    return;
  }

  try {
    await Team.updateOne({ _id: teamId }, { $pull: {appointments: {token: appointmentToken}} });

    res.status(200).json();
  } catch (error) {
    console.error("Error querying teams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/", deleteAppointmentHandler);

export default router;