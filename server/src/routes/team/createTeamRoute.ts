import express, { Request, Response, RequestHandler } from "express";
import ShortUniqueId from "short-uuid";
import Team from "../../models/team";

const router = express.Router();

// Create a new team.
export const createTeamHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { name, durations, availableTime, admin, coadmins } = req.body;

  try {
    if (!name || !durations || !availableTime || !admin || !coadmins) {
      res.status(400).json({ message: "Missing required fields: name, durations, availableTime, or admin." });
      return;
    }

    // Generate unique teamId
    const _id = `team-${name.replaceAll(/\s/g, "-")}-${ShortUniqueId().generate()}`;

    // Create the new team and save in teams collection.
    // Unitialized attributes are set to their default values.
    const newTeam = new Team({ _id, name, admin, coadmins, availableTime, durations });
    await newTeam.save();

    res.status(201).json({ message: "Team creating successfully" });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/register", createTeamHandler);

export default router;