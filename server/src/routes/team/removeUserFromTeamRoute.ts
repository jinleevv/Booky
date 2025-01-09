import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

// When a user cancels their appointment via their confirmation link.
// Delete the appointment from the team appointments list.
export const deleteUserFromTeamHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId, userEmail } = req.query;
  try {
    // 1. Find the team with the given teamId
    const team = await Team.findById(teamId);

    // 2. Check if the userEmail is the admin or a member
    const isAdmin = team!.adminEmail === userEmail;
    const isMember = team!.members.includes(userEmail as string);

    if (isAdmin) {
      await Team.deleteOne({ _id: teamId }).exec();
      res.status(200).json({ message: "Team deleted successfully" });
    } else {
      await Team.updateOne(
        { _id: teamId },
        { $pull: { members: userEmail } }
      ).exec();
      res.status(200).json({ message: "User removed from team members" });
    }
  } catch (error) {
    console.error("Error deleting user from team:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/", deleteUserFromTeamHandler);

export default router;
