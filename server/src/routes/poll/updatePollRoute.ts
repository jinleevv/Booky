// updatePollRoute.ts
import express, { Request, RequestHandler, Response } from "express";
import Poll from "../../models/poll";

const router = express.Router();

export const updatePollHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pollId } = req.params;
  const { userEmail, schedule } = req.body;

  try {
    if (!userEmail || !schedule) {
      res.status(400).json({
        message: "Missing required fields",
      });
      return;
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      res.status(404).json({ message: "Poll not found" });
      return;
    }

    // Update or add user's schedule
    const availableTime = poll.availableTime;
    availableTime.set(userEmail, schedule);
    poll.availableTime = availableTime;

    await poll.save();

    res.status(200).json({
      message: "Poll schedule updated successfully",
    });
  } catch (error) {
    console.error("Error updating poll:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:pollId/schedule", updatePollHandler);

export default router;
