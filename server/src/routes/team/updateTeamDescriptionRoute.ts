import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

export const updateTeamDescriptionHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;
  const { teamDescription } = req.body;

  try {
    if (!teamDescription) {
      res.status(400).json({ message: "Missing team description data" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    team.teamDescription = teamDescription;

    await team.save();

    res.status(200).json({
      message: "Team description updated successfully",
    });
  } catch (error) {
    console.error("Error updating team description:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/teamDescription", updateTeamDescriptionHandler);

export default router;
