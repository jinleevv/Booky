import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

export const deleteMeetingHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { teamId, meetingId } = req.params;
  try {
    if (!teamId || !meetingId) {
      res.status(400).json({ message: "Invalid or missing teamId or meetingId" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    team.meetingTeam = team.meetingTeam.filter((meeting) => meeting._id.toString() !== meetingId);
    // const availableTimesWithId = team.availableTimes as (IAvailableTime & { _id: string })[];
    // team.availableTimes = availableTimesWithId.filter((meeting) => meeting._id.toString() !== meetingId);

    await team.save();

    res.status(200).json({ message: "availableTimes updated successfully" });
  } catch (error) {
    console.error("Error updating availableTimes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.delete("/:teamId/meetings/:meetingId", deleteMeetingHandler);

export default router;