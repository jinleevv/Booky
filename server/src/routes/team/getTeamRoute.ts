import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";
import User from "../../models/user";

const router = express.Router();

// Retrieve all team information (except createdAt, plus admin name)
export const getTeamDetailsHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { teamId } = req.params;

  try {
    // Fetch team by id.
    const team = await Team.findById(teamId).exec();
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Get the name of the admin.
    const adminUser = await User.findOne({ email: team.admin }).exec();
    if (!adminUser) {
      res.status(404).json({ message: "Admin user not found" });
      return;
    }

    // Set response with team information.
    res.status(200).json({
      teamId: team._id,
      name: team.name,
      adminName: adminUser.name,
      adminEmail: team.admin,
      members: team.members,
      availableTime: team.availableTime,
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