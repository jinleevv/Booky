import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

// Handler to update team members
export const updateTeamMembersHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;
  const { members } = req.body;
  try {
    if (!members || typeof members !== "string") {
      res.status(400).json({ message: "Invalid or missing member data" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }
    
    // Check if the new member is already in the team
    if (team.members.includes(members)) {
      res.status(400).json({ message: "Member already in the team" });
      return;
    }

    team.members = [...team.members, members];

    await team.save();

    res
      .status(200)
      .json({ message: "Team members updated successfully", team });
  } catch (error) {
    console.error("Error updating team members:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/members", updateTeamMembersHandler);

export default router;