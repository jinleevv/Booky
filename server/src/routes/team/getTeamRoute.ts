import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";
import User from "../../models/user";

const router = express.Router();

export const getTeamDetailsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;

  try {
    const team = await Team.findById(teamId).exec();
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const adminUser = await User.findOne({ email: team.admin }).exec();
    if (!adminUser) {
      res.status(404).json({ message: "Admin user not found" });
      return;
    }

    res.status(200).json({
      teamId: team._id,
      name: team.name,
      durations: team.durations,
      availableTime: team.availableTime,
      appointments: team.appointments,
      adminName: adminUser.name,
      adminEmail: team.admin,
    });
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/:teamId", getTeamDetailsHandler);

export default router;