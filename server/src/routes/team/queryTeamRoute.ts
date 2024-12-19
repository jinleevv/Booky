import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

// Handler to query teams by the admin's email
export const queryTeamsByAdminHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userEmail } = req.query; // Expecting query parameter 'admin'

  if (!userEmail || typeof userEmail !== "string") {
    res.status(400).json({ message: "Invalid or missing admin email" });
    return;
  }

  try {
    // Find teams where the 'admin' field matches the provided email
    const teams = await Team.find({ admin: userEmail }).exec();

    if (teams.length === 0) {
      res.status(404).json({ message: "No teams found for this admin" });
      return;
    }

    // Return the list of teams
    res.status(200).json(teams);
  } catch (error) {
    console.error("Error querying teams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Set up the route to handle GET requests for teams by admin email
router.get("/", queryTeamsByAdminHandler);

export default router;
