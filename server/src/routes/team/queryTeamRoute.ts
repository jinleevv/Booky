import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

// Retrieve all the teams that the user is an admin of.
export const queryTeamsByAdminHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { userEmail } = req.query;

  if (!userEmail || typeof userEmail !== "string") {
    res.status(400).json({ message: "Invalid or missing admin email" });
    return;
  }

  try {
    // Find teams that have their admin attribute set to userEmail
    const teams = await Team.find({ admin: userEmail }).exec();

    res.status(200).json(teams);
  } catch (error) {
    console.error("Error querying teams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/get-user-teams", queryTeamsByAdminHandler);

export default router;