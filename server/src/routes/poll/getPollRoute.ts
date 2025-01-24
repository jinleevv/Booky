import express, { Request, RequestHandler, Response } from "express";
import Poll from "../../models/poll";

const router = express.Router();

export const getPollHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { urlPath } = req.params;
  try {
    const poll = await Poll.findOne({ urlPath: urlPath });
    if (!poll) {
      res.status(404).json({ message: "Poll not found" });
      return;
    }

    res.status(200).json({
      ...poll.toObject(),
      participants: poll.participants!,
    });
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPollsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const polls = await Poll.find();
    if (!polls) {
      res.status(404).json({ message: "Polls not found" });
      return;
    }

    res.status(200).json(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/all", getPollsHandler);
router.get("/:urlPath/availability", getPollHandler);
router.get("/:urlPath", getPollHandler);

export default router;
