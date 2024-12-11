import express, { Request, Response, RequestHandler } from "express";
import { v4 as uuidv4 } from "uuid";
import Team from "../models/team";
import User from "../models/user";

const router = express.Router();

// User registration route
const createTeamHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, durations, availableTime, admin } = req.body;

  try {
    if (!name || !durations || !availableTime || !admin) {
      res
        .status(400)
        .json({
          message:
            "Missing required fields: name, durations, availableTime, or admin.",
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
      appointments: [],
      admin: admin
    });

    await newTeam.save();
    res.status(201).json({ message: "Team registered successfully" });
  } catch (error) {
    console.error("Error registering team:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Team details retrieval handler
const getTeamDetailsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;

  try {
    // Find the team by ID
    const team = await Team.findById(teamId).exec();
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Find the admin's user details by email
    const adminUser = await User.findOne({ email: team.admin }).exec();
    if (!adminUser) {
      res.status(404).json({ message: "Admin user not found" });
      return;
    }
    
    // Respond with team details and admin's name
    res.status(200).json({
      teamId: team._id,
      name: team.name,
      durations: team.durations,
      availableTime: team.availableTime,
      adminName: adminUser.name,
    });
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Register the route and use the handler
router.post("/register", createTeamHandler);
router.get("/:teamId", getTeamDetailsHandler);

export default router;
