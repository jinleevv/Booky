import express, { Request, Response, RequestHandler } from "express";
import MeetingMinute from "../../models/meetingMinute";

const router = express.Router();

export const updateCommentsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { meetingId } = req.params;
  const { id, text, comment, range } = req.body;
  try {
    if (!meetingId) {
      res
        .status(400)
        .json({ message: "Invalid or missing teamId or meetingId" });
      return;
    }

    const meetingMinute = await MeetingMinute.findById(meetingId);

    if (!meetingMinute) {
      res.status(404).json({ message: "Meeting minute not found" });
      return;
    }

    if (!meetingMinute.comments) {
      meetingMinute.comments = [];
    }
    meetingMinute.comments.push({ id, text, comment, range });

    await meetingMinute.save();

    res.status(200).json(meetingMinute);
  } catch (error) {
    console.error("Error updating comments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/updateComments/:meetingId", updateCommentsHandler);

export default router;
