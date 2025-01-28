import express, { Request, Response, RequestHandler } from "express";
import MeetingMinute from "../../models/meetingMinute";

const router = express.Router();

export const removeCommentsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { meetingId } = req.params;
  const { id } = req.body;
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
      res.status(200).json(meetingMinute);
      return;
    }
    meetingMinute.comments = meetingMinute.comments.filter(
      (comment) => comment.id !== id
    );

    await meetingMinute.save();

    res.status(200).json(meetingMinute);
  } catch (error) {
    console.error("Error removing a comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/removeComments/:meetingId", removeCommentsHandler);

export default router;
