import express, { Request, Response, RequestHandler } from "express";
import Team, { IMeetingTeam } from "../../models/team";

const router = express.Router();

export const getMeetingHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
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

    const meetingToReturn = team.meetingTeam.find((meeting) => meeting._id.toString() === meetingId);
    
    if (!meetingToReturn) {
        res.status(404).json({ message: "Meeting not found" });
        return;
    }

    res.status(200).json( meetingToReturn );
  } catch (error) {
    console.error("Error updating availableTimes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/:teamId/meetings/:meetingId", getMeetingHandler);

export default router;