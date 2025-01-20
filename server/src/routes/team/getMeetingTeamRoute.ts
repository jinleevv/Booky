import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

export const getMeetingTeamHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { teamId, meetingTeamId } = req.params;
  try {
    if (!teamId || !meetingTeamId) {
      res.status(400).json({ message: "Invalid or missing teamId or meetingId" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const meetingTeamToReturn = team.meetingTeam.find((meeting) => meeting._id.toString() === meetingTeamId);
    
    if (!meetingTeamToReturn) {
        res.status(404).json({ message: "Meeting not found" });
        return;
    }

    res.status(200).json(meetingTeamToReturn);
  } catch (error) {
    console.error("Error retrieving from meetingTeam:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/:teamId/meetingTeams/:meetingTeamId", getMeetingTeamHandler);

export default router;