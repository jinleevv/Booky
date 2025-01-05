import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";
import User from "../../models/user";

const router = express.Router();

// Utility function to decode keys (replace "__dot__" with ".")
const decodeAvailableTime = (availableTime: Record<string, any>): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(availableTime).map(([key, value]) => [key.replace(/__dot__/g, "."), value])
  );
};

// Retrieve all team information (except createdAt, plus admin name)
export const getTeamDetailsHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { teamId } = req.params;

  try {
    // Fetch team by id.
    const team = await Team.findById(teamId).lean();
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Get the name of the admin.
    const adminUser = await User.findOne({ email: team.admin }).lean();
    if (!adminUser) {
      res.status(404).json({ message: "Admin user not found" });
      return;
    }

    // Decode `availableTime` keys
    const decodedAvailableTime = decodeAvailableTime(team.availableTime);

    // Set response with team information.
    // TODO: don't need adminUser.
    res.status(200).json({
      teamId: team._id,
      name: team.name,
      adminName: adminUser.name,
      adminEmail: team.admin,
      coadmins: team.coadmins,
      members: team.members,
      availableTime: decodedAvailableTime,
      durations: team.durations,
      appointments: team.appointments,
      cancelledMeetings: team.cancelledMeetings,
    });
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/:teamId", getTeamDetailsHandler);

export default router;