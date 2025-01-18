import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";
import MeetingMinute from "../../models/meetingMinute";

const router = express.Router();

export const getMeetingMinuteHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { meetingId } = req.params;
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

    res.status(200).json(meetingMinute);
  } catch (error) {
    console.error("Error updating availableTimes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/:meetingId", getMeetingMinuteHandler);

export default router;
