import express, { Request, Response, RequestHandler } from "express";
import ShortUniqueId from "short-uuid";
import Team, { ISchedule, IMeeting } from "../../models/team";
import MeetingMinute from "../../models/meetingMinute";

const router = express.Router();

function convertToEST(date: Date): Date {
  try {
    const estString: string = date.toLocaleString("en-US", {
      timeZone: "America/New_York",
      timeZoneName: "longOffset",
    });

    const offsetString: string | undefined = estString.split(" ").pop();

    if (!offsetString) {
      throw new Error("Failed to extract timezone offset");
    }

    const offsetMatch: RegExpMatchArray | null = offsetString.match(/[-+]\d+/);

    if (!offsetMatch) {
      throw new Error("Invalid offset format");
    }

    const offsetHours: number = parseInt(offsetMatch[0]);
    return new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
  } catch (error) {
    console.error("Error converting to EST:", error);
    // Return original date if conversion fails
    return date;
  }
}

// Create a new team.
export const createTeamHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamName, teamDescription, adminEmail, adminName, coadmins } =
    req.body;

  try {
    if (!teamName || !adminEmail || !adminName) {
      res.status(400).json({
        message: "Missing required fields",
      });
      return;
    }

    // let meetingTeam = [];
    // const uid = ShortUniqueId();

    // if (currentTab === "recurring") {
    //   const generatedMeetings: IMeeting[] = [];
    //   const todayUTC = new Date();
    //   const today = convertToEST(todayUTC);

    //   for (let i = 0; i < 14; i++) {
    //     const targetDate = new Date(today);
    //     targetDate.setDate(today.getDate() + i);

    //     const targetDay = targetDate.toLocaleString("en-US", {
    //       weekday: "long",
    //     });

    //     const daySchedule = recurringMeeting.find(
    //       (schedule: ISchedule) =>
    //         schedule.day === targetDay && schedule.enabled
    //     );

    //     if (daySchedule) {
    //       for (const timeRange of daySchedule.times) {
    //         const meetingId = `meeting-${uid.generate()}`;

    //         const meetingMinute = await MeetingMinute.create({
    //           _id: meetingId,
    //           data: {},
    //           createdAt: new Date(),
    //         });

    //         generatedMeetings.push({
    //           _id: meetingId,
    //           date: targetDate.toISOString().split("T")[0],
    //           time: timeRange,
    //           attendees: [],
    //         });
    //       }
    //     }
    //   }

    //   meetingTeam = [
    //     {
    //       schedule: "recurring",
    //       hostName: adminName,
    //       hostEmail: adminEmail,

    //       meetingName: meetingName,
    //       meetingDescription: meetingDescription,
    //       meeting: generatedMeetings,

    //       weekSchedule: recurringMeeting,

    //       type: meetingType,
    //       duration: meetingType === "oneOnOne" ? duration : null,
    //       zoomLink: meetingLink,
    //       cancelledMeetings: [],
    //     },
    //   ];
    // } else {
    //   const oneTimeMeetingStartInfo = oneTimeMeeting.start.split("T"); // YYYY-MM-DD
    //   const oneTimeMeetingEndInfo = oneTimeMeeting.end.split("T");
    //   const date = oneTimeMeetingStartInfo[0];
    //   const meetingId = `meeting-${uid.generate()}`;

    //   const meetingMinute = await MeetingMinute.create({
    //     _id: meetingId,
    //     data: {},
    //     createdAt: new Date(),
    //   });

    //   meetingTeam = [
    //     {
    //       schedule: "one-time",
    //       hostName: adminName,
    //       hostEmail: adminEmail,

    //       meetingName: meetingName,
    //       meetingDescription: meetingDescription,
    //       meeting: [
    //         {
    //           _id: meetingId,
    //           date: date,
    //           time: {
    //             start: oneTimeMeetingStartInfo[1],
    //             end: oneTimeMeetingEndInfo[1],
    //           },
    //           attendees: [],
    //         },
    //       ],

    //       date: date,
    //       time: {
    //         start: oneTimeMeetingStartInfo[1],
    //         end: oneTimeMeetingEndInfo[1],
    //       },

    //       type: meetingType,
    //       duration: meetingType === "oneOnOne" ? duration : null,
    //       zoomLink: meetingLink,
    //       cancelledMeetings: [],
    //     },
    //   ];
    // }

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
