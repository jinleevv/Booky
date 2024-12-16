import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

// Handler to query teams by either the admin's email or member's email
export const queryTeamsByUserHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userEmail } = req.query; // Expecting query parameter 'email' for either admin or member

  if (!userEmail || typeof userEmail !== "string") {
    res.status(400).json({ message: "Invalid or missing email" });
    return;
  }

  try {
    // Find teams where the email is in either the 'admin' field or 'members' array
    const teams = await Team.find({
      $or: [
        { admin: userEmail },  // Check if email is in the 'admin' field
        { members: userEmail } // Check if email is in the 'members' array
      ]
    }).exec();

    if (!teams || teams.length === 0) {
      res.status(404).json({ message: "No teams found for this user" });
      return;
    }

    // Return the list of teams
    res.status(200).json(teams);
  } catch (error) {
    console.error("Error querying teams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Set up the route to handle GET requests for teams by user email (admin or member)
router.get("/by-user", queryTeamsByUserHandler);

export default router;
