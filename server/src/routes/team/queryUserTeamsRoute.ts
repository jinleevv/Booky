import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

// Retrieve all teams the user is a part of.
export const queryTeamsByUserHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { userEmail } = req.query;

  if (!userEmail || typeof userEmail !== "string") {
    res.status(400).json({ message: "Invalid or missing email" });
    return;
  }

  try {
    // Find teams where userEmail is in the admin or members attribute.
    const teams = await Team.find({ $or: [{admin: userEmail}, {members: userEmail}] }).exec();

    if (!teams || teams.length === 0) {
      res.status(404).json({ message: "No teams found for this user" });
      return;
    }

    res.status(200).json(teams);
  } catch (error) {
    console.error("Error querying teams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/by-user", queryTeamsByUserHandler);

export default router;