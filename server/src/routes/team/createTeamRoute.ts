import express, { Request, Response, RequestHandler } from "express";
import ShortUniqueId from "short-uuid";
import Team, { ISchedule, IMeetingTeam, IMeeting } from "../../models/team";
import MeetingMinute from "../../models/meetingMinute";
import mongoose from "mongoose";

const router = express.Router();

// Create a new team.
export const createTeamHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    teamName,
    teamDescription,
    adminEmail,
    adminName,
    coadmins,
    currentTab,
    recurringMeeting,
    oneTimeMeeting,
    meetingName,
    meetingDescription,
    meetingType,
    duration,
    meetingLink,
  } = req.body;

  try {
    if (
      !teamName ||
      !adminEmail ||
      !adminName ||
      !currentTab ||
      !recurringMeeting ||
      !oneTimeMeeting ||
      !meetingName ||
      !meetingType
    ) {
      res.status(400).json({
        message: "Missing required fields",
      });
      return;
    }

    let meetingTeam = [];
    const uid = ShortUniqueId();

    if (currentTab === "recurring") {

      const generatedMeetings: IMeeting[] = [];
      const today = new Date();

      for (let i = 0; i < 14; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);

        const targetDay = targetDate.toLocaleString("en-US", {
          weekday: "long",
        });

        const daySchedule = recurringMeeting.find(
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

      meetingTeam = [
        {
          schedule: "recurring",
          hostName: adminName,
          hostEmail: adminEmail,

          meetingName: meetingName,
          meetingDescription: meetingDescription,
          meeting: [],

          weekSchedule: recurringMeeting,

          type: meetingType,
          duration: meetingType === "oneOnOne" ? duration : null,
          zoomLink: meetingLink,
          cancelledMeetings: [],
        },
      ];
    } else {
      const oneTimeMeetingStartInfo = oneTimeMeeting.start.split("T"); // YYYY-MM-DD
      const oneTimeMeetingEndInfo = oneTimeMeeting.end.split("T");
      const date = oneTimeMeetingStartInfo[0]
      const meetingId = `meeting-${uid.generate()}`;

      const meetingMinute = await MeetingMinute.create({
        _id: meetingId,
        data: {},
        createdAt: new Date(),
      });

      meetingTeam = [
        {
          schedule: "one-time",
          hostName: adminName,
          hostEmail: adminEmail,

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
        },
      ];
    }

    // Generate unique teamId
    const _id = `team-${teamName.replaceAll(
      /\s/g,
      "-"
    )}-${ShortUniqueId().generate()}`;

    // Create the new team and save in teams collection.
    // Unitialized attributes are set to their default values.
    const newTeam = new Team({
      _id,
      teamName,
      teamDescription,
      adminEmail,
      adminName,
      coadmins,
      members: [],
      meetingTeam: meetingTeam,
      duration,
    });
    await newTeam.save();

    res.status(201).json({ message: "Team creating successfully" });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/", createTeamHandler);

export default router;
