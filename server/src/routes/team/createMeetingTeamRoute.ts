import express, { Request, Response, RequestHandler } from "express";
import MeetingMinute from "../../models/meetingMinute";
import Team, { ISchedule, IMeetingTeam, IMeeting } from "../../models/team";
import mongoose from "mongoose";
import ShortUniqueId from "short-uuid";

const router = express.Router();

export const createMeetingTeamHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
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
      res.status(400).json({ message: "Invalid or missing meetingTeam data" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const uid = ShortUniqueId();
    let newMeeting: IMeetingTeam;

    if (currentTab === "recurring") {
      const generatedMeetings: IMeeting[] = [];
      const today = new Date();

      for (let i = 0; i < 14; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);

        const targetDay = targetDate.toLocaleString("en-US", {
          weekday: "long",
        });

        const daySchedule = recurringMeetingSchedule.find(
          (schedule: ISchedule) => schedule.day === targetDay && schedule.enabled
        );

        if (daySchedule) {
          for (const timeRange of daySchedule.times) {
            const meetingId = `meeting-${uid.generate()}`;

            const meetingMinute = await MeetingMinute.create({
              _id: meetingId,
              data: {},
              createdAt: new Date(),
            });

            generatedMeetings.push({
              _id: meetingId,
              date: targetDate.toISOString().split("T")[0],
              time: timeRange,
              attendees: [],
            });
          }
        }
      }

      newMeeting = {
        _id: new mongoose.Types.ObjectId().toString(),
        schedule: "recurring",
        hostName: hostName,
        hostEmail: hostEmail,

        meetingName: meetingName,
        meetingDescription: meetingDescription,
        meeting: generatedMeetings,

        weekSchedule: recurringMeetingSchedule,

        type: meetingType,
        duration: meetingType === "oneOnOne" ? duration : null,
        zoomLink: meetingLink,
        cancelledMeetings: []
      };
    } else {
      const oneTimeMeetingStartInfo = oneTimeMeetingSchedule.start.split("T"); // YYYY-MM-DD
      const oneTimeMeetingEndInfo = oneTimeMeetingSchedule.end.split("T");
      const date = oneTimeMeetingStartInfo[0];
      const meetingId = `meeting-${uid.generate()}`;

      const meetingMinute = await MeetingMinute.create({
        _id: meetingId,
        data: {},
        createdAt: new Date(),
      });

      newMeeting = {
        _id: new mongoose.Types.ObjectId().toString(),
        schedule: "one-time",
        hostName: hostName,
        hostEmail: hostEmail,

        meetingName: meetingName,
        meetingDescription: meetingDescription,
        meeting: [{
          _id: meetingId,
          date: date,
          time: {
            start: oneTimeMeetingStartInfo[1],
            end: oneTimeMeetingEndInfo[1],
          },
          attendees: [],
        }],
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
    
    res.status(200).json({ message: "meetingTeam created successfully" });
  } catch (error) {
    console.error("Error creating meetingTeam", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/:teamId/meetingTeam", createMeetingTeamHandler);

export default router;