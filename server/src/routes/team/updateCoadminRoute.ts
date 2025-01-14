import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

export const updateCoadminsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;
  const { coadmin } = req.body;

  try {
    if (!coadmin || !Array.isArray(coadmin)) {
      res.status(400).json({ message: "Invalid or missing coadmin data" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    team.coadmins = [...new Set([...team.coadmins, ...coadmin])];
    await team.save();

    res.status(200).json({
      message: "Coadmins updated successfully",
      availableTime: team.availableTimes,
    });
  } catch (error) {
    console.error("Error updating coadmins:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/coadmins", updateCoadminsHandler);

export default router;
