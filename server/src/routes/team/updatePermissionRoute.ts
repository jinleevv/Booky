import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

export const updatePermissionHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;
  const { permission, user } = req.body;

  try {
    if (!user) {
      res.status(400).json({ message: "Missing user data" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    if (permission === "CoAdminToMember") {
      team.coadmins = team.coadmins.filter((coadmin) => coadmin !== user);
      team.members = [...new Set([...team.members, user])];
    } else {
      team.members = team.members.filter((member) => member !== user);
      team.coadmins = [...new Set([...team.coadmins, user])];
    }

    await team.save();

    // res.status(200).json({
    //   message: "Permission updated successfully",
    //   availableTime: team.availableTimes,
    // });
  } catch (error) {
    console.error("Error updating permission:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/permission", updatePermissionHandler);

export default router;
