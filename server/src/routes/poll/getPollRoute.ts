// getPollRoute.ts
import express, { Request, RequestHandler, Response } from "express";
import Poll from "../../models/poll";

const router = express.Router();

export const getPollHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pollId } = req.params;

  try {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      res.status(404).json({ message: "Poll not found" });
      return;
    }

    res.status(200).json(poll);
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/:pollId", getPollHandler);

export default router;
