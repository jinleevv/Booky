// createPollRoute.ts
import express, { Request, RequestHandler, Response } from "express";
import ShortUniqueId from "short-uuid";
import Poll from "../../models/poll";

const router = express.Router();

export const createPollHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pollName, pollDescription, urlPath, range, startTime, endTime } =
    req.body;

  console.log(req.body);

  try {
    if (!pollName || !urlPath || !range || !startTime || !endTime) {
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
      urlPath,
      dateRange: range,
      time: {
        start: startTime,
        end: endTime,
      },
      createdAt: new Date(),
    });

    await newPoll.save();

    res.status(201).json({
      message: "Poll created successfully",
      pollId: _id,
    });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/", createPollHandler);

export default router;
