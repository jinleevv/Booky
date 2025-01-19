import express, { Request, RequestHandler, Response } from "express";
import Poll from "../../models/poll";

const router = express.Router();

export const updatePollHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { urlPath } = req.params;
  const { userEmail, selectedSlots } = req.body;

  try {
    if (!userEmail || !selectedSlots) {
      res.status(400).json({
        message: "Missing required fields",
      });
      return;
    }

    const updatedPoll = await Poll.findOneAndUpdate(
      { urlPath: urlPath },
      {
        $addToSet: {
          participants: {
            email: userEmail,
            schedule: selectedSlots,
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log(updatedPoll);

    if (!updatedPoll) {
      res.status(404).json({ message: "Poll not found" });
      return;
    }

    // Update or add user's schedule
    // const availableTime = poll.availableTime;
    // availableTime.set(userEmail, schedule);
    // poll.availableTime = availableTime;

    // transform map to object for json response

    res.status(200).json({
      message: "Poll schedule updated successfully",
      groupAvailability: updatedPoll!.participants,
    });
  } catch (error) {
    console.error("Error updating poll:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:urlPath/availability", updatePollHandler);

export default router;
