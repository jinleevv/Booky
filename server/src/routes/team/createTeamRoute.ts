import express, { Request, Response, RequestHandler } from "express";
import { v4 as uuidv4 } from "uuid";
import Team from "../../models/team";

const router = express.Router();

export const createTeamHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, durations, availableTime, admin } = req.body;

  try {
    if (!name || !durations || !availableTime || !admin) {
      res.status(400).json({
        message:
          "Missing required fields: name, durations, availableTime, or admin.",
      });
      return;
    }

    const teamId = `team-${uuidv4()}`;

    const newTeam = new Team({
      _id: teamId,
      name,
      durations,
      availableTime,
      appointments: [],
      admin,
    });

    await newTeam.save();
    res.status(201).json({ message: "Team registered successfully" });
  } catch (error) {
    console.error("Error registering team:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/register", createTeamHandler);

export default router;
