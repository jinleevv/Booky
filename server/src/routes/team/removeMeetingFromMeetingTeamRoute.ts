import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

export const deleteMeetingFromMeetingTeamHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
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

    await Team.updateOne(
      { _id: teamId },
      { $pull: { meetingTeam: { _id: meetingTeamId } } }
    ).exec();

    res.status(200).json({ message: "meetingTeam updated successfully" });
  } catch (error) {
    console.error("Error updating meetingTeam:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/team-meetings/:meetingTeamId", deleteMeetingFromMeetingTeamHandler);

export default router;