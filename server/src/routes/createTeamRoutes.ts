import express, { Request, Response, RequestHandler } from "express";
import { v4 as uuidv4 } from "uuid";
import Team from "../models/team";

const router = express.Router();

// User registration route
const createTeamHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, durations, availableTime } = req.body;

  try {
    if (!name || !durations || !availableTime) {
      res
        .status(400)
        .json({
          message:
            "Missing required fields: name, durations, or availableTime.",
        });
      return;
    }

    const teamId = `team-${uuidv4()}`;

    // Create new user instance with UID only
    const newTeam = new Team({
      _id: teamId,
      name: name,
      durations: durations,
      availableTime: availableTime,
    });

    await newTeam.save();
    res.status(201).json({ message: "Team registered successfully" });
  } catch (error) {
    console.error("Error registering team:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Register the route and use the handler
router.post("/register", createTeamHandler);

export default router;