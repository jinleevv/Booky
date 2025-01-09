import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

// Utility function to encode keys (replace "." with "__dot__")
const encodeAvailableTime = (
  availableTime: Map<string, any>
): Map<string, any> => {
  return new Map(
    Array.from(availableTime.entries()).map(([key, value]) => [
      key.replace(/\./g, "__dot__"),
      value,
    ])
  );
};

// Update the availableTime map for a specific team.
export const updateAvailableTimeHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { teamId } = req.params;
  const { availableTime } = req.body;

  try {
    if (!availableTime || typeof availableTime !== "object") {
        res.status(400).json({ message: "Invalid or missing availableTime data" });
        return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const encodedAvailableTime = encodeAvailableTime(availableTime);

    team.availableTimes = encodedAvailableTime;
    await team.save();

    res.status(200).json({ message: "Available time updated successfully", availableTime: team.availableTimes });
  } catch (error) {
    console.error("Error updating available time:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/availableTime", updateAvailableTimeHandler);

export default router;