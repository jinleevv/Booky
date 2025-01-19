import express, { Request, Response, RequestHandler } from "express";
import Team, { IMeetingTeam } from "../../models/team";
import mongoose from "mongoose";

const router = express.Router();

export const createMeetingHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { teamId } = req.params;
  const {
    hostEmail,
    hostName,
    meetingName,
    meetingDescription,
    recurringMeetingSchedule,
    oneTimeMeetingSchedule,
    meetingType,
    duration,
    meetingLink,
    currentTab,
  } = req.body;

  try {
    if (
      !hostEmail ||
      !hostName ||
      !meetingName ||
      !recurringMeetingSchedule ||
      !oneTimeMeetingSchedule ||
      !meetingType ||
      !currentTab ||
      !teamId
    ) {
      res.status(400).json({ message: "Invalid or missing meeting data" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    let newMeeting: IMeetingTeam;

    if (currentTab === "recurring") {
      newMeeting = 
        {
          _id: new mongoose.Types.ObjectId().toString(),
          schedule: "recurring",
          hostName: hostName,
          hostEmail: hostEmail,

          meetingName: meetingName,
          meetingDescription: meetingDescription,
          meeting: [],

          weekSchedule: recurringMeetingSchedule,

          type: meetingType,
          duration: meetingType === "oneOnOne" ? duration : null,
          zoomLink: meetingLink,
          cancelledMeetings: []
        };
    } else {
      const oneTimeMeetingStartInfo = oneTimeMeetingSchedule.start.split("T"); // YYYY-MM-DD
      const oneTimeMeetingEndInfo = oneTimeMeetingSchedule.end.split("T");
      const date =
        oneTimeMeetingStartInfo[0].split("-")[1] +
        "-" +
        oneTimeMeetingStartInfo[0].split("-")[2] +
        "-" +
        oneTimeMeetingStartInfo[0].split("-")[0];
      newMeeting = 
        {
          _id: new mongoose.Types.ObjectId().toString(),
          schedule: "one-time",
          hostName: hostName,
          hostEmail: hostEmail,

          meetingName: meetingName,
          meetingDescription: meetingDescription,
          meeting: [],

          date: date,
          time: {
            start: oneTimeMeetingStartInfo[1],
            end: oneTimeMeetingEndInfo[1],
          },

          type: meetingType,
          duration: meetingType === "oneOnOne" ? duration : null,
          zoomLink: meetingLink,
          cancelledMeetings: [],
        };
    }

    team.meetingTeam.push(newMeeting);
    await team.save();
    
    res.status(200).json({ message: "Meeting created successfully" });
  } catch (error) {
    console.error("Error creating meeting", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/:teamId/meetings", createMeetingHandler);

export default router;