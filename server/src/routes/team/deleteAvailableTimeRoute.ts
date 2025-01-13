import express, { Request, Response, RequestHandler } from "express";
import Team, {IAvailableTime} from "../../models/team";

const router = express.Router();

// Update the availableTime map for a specific team.
export const deleteAvailableTimeHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;
  const { meetingId } = req.body;

  try {
    if (!meetingId) {
      res
        .status(400)
        .json({ message: "Invalid or missing availableTime data" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const availableTimesWithId = team.availableTimes as (IAvailableTime & { _id: string })[];    
    team.availableTimes = availableTimesWithId.filter((meeting) => meeting._id.toString() !== meetingId);

    await team.save();

    res.status(200).json({
      message: "Available time updated successfully",
    });
  } catch (error) {
    console.error("Error updating available time:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/delete-availableTime", deleteAvailableTimeHandler);

export default router;