// createPollRoute.ts
import express, { Request, Response, RequestHandler } from "express";
import ShortUniqueId from "short-uuid";
import Poll from "../../models/poll";

const router = express.Router();

export const createPollHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    pollName,
    pollDescription,
    range,
    startTime,
    endTime,
    creatorEmail,
  } = req.body;

  try {
    if (!pollName || !range || !startTime || !endTime || !creatorEmail) {
      res.status(400).json({
        message: "Missing required fields",
      });
      return;
    }

    // Generate unique pollId
    const _id = `poll-${pollName.replaceAll(
      /\s/g,
      "-"
    )}-${ShortUniqueId().generate()}`;

    // Create new poll
    const newPoll = new Poll({
      _id,
      pollName,
      pollDescription,
      availableTime: new Map([[creatorEmail, []]]), // Initialize with creator's empty schedule
      durations: [`${startTime}-${endTime}`],
      createdAt: new Date(),
    });

    await newPoll.save();

    res.status(201).json({ 
      message: "Poll created successfully",
      pollId: _id 
    });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/", createPollHandler);

export default router;