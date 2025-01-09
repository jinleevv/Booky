import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";
import User from "../../models/user";

const router = express.Router();

// Retrieve all team information (except createdAt, plus admin name)
export const getTeamDetailsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;

  try {
    // Fetch team by id.
    const team = await Team.findById(teamId);

    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    res.status(200).json(team);
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/:teamId", getTeamDetailsHandler);

export default router;
