import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

export const deleteMeetingsFromMeetingTeamHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { teamId, meetingTeamId } = req.params;
  const { meetingsToDelete } = req.body;

  try {
    if (!teamId || !meetingTeamId) {
      res.status(400).json({ message: "Invalid or missing teamId or meetingTeamId" });
      return;
    }

    if (!meetingsToDelete || !Array.isArray(meetingsToDelete) || meetingsToDelete.length === 0) {
      res.status(400).json({ message: "Invalid request. 'meetingsToDelete' must be a non-empty array." });
      return;
    }

    const result = await Team.updateOne(
        { _id: teamId, "meetingTeam._id": meetingTeamId },
        {
            $pull: {
            "meetingTeam.$.meeting": { _id: { $in: meetingsToDelete } }
            }
        }
    );

    if (result.modifiedCount === 0) {
        res.status(404).json({ message: "No meetings deleted. Check if team and meetings exist." });
        return;
    }

    res.status(200).json({ message: "Meetings updated successfully" });
  } catch (error) {
    console.error("Error updating meetings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/:meetingTeamId/delete-meetings", deleteMeetingsFromMeetingTeamHandler);

export default router;