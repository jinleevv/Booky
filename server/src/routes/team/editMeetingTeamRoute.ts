import express, { Request, Response, RequestHandler } from "express";
import MeetingMinute from "../../models/meetingMinute";
import Team, { IMeetingTeam, IMeeting, ISchedule } from "../../models/team";
import mongoose from "mongoose";
import ShortUniqueId from "short-uuid";

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

export const editMeetingHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId, meetingTeamId } = req.params;
  const {
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
      !teamId ||
      !meetingTeamId ||
      !meetingName ||
      !recurringMeetingSchedule ||
      !oneTimeMeetingSchedule ||
      !meetingType ||
      !currentTab
    ) {
      res.status(400).json({ message: "Invalid or missing meeting data" });
      return;
    }

    // const today = new Date().toISOString().split("T")[0];

    const todayUTC = new Date();
    const today = convertToEST(todayUTC);

    const updateFields: Record<string, any> = {
      "meetingTeam.$.meetingName": meetingName,
      "meetingTeam.$.meetingDescription": meetingDescription,
      "meetingTeam.$.type": meetingType,
      "meetingTeam.$.duration": meetingType === "oneOnOne" ? duration : null,
      "meetingTeam.$.zoomLink": meetingLink,
    };

    const unsetFields: Record<string, ""> = {};

    let newMeetings: IMeeting[] = [];
    const uid = ShortUniqueId();

    if (currentTab === "recurring") {
      updateFields["meetingTeam.$.schedule"] = "recurring";
      updateFields["meetingTeam.$.weekSchedule"] = recurringMeetingSchedule;
      unsetFields["meetingTeam.$.date"] = "";
      unsetFields["meetingTeam.$.time"] = "";

      //   const todayDate = new Date();

      for (let i = 0; i < 14; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);

        const targetDay = targetDate.toLocaleString("en-US", {
          weekday: "long",
        });

        const daySchedule = recurringMeetingSchedule.find(
          (schedule: ISchedule) =>
            schedule.day === targetDay && schedule.enabled
        );

        if (daySchedule) {
          for (const timeRange of daySchedule.times) {
            const meetingId = `meeting-${uid.generate()}`;

            const meetingMinute = await MeetingMinute.create({
              _id: meetingId,
              data: {},
              createdAt: new Date(),
            });

            newMeetings.push({
              _id: meetingId,
              date: targetDate.toISOString().split("T")[0],
              time: timeRange,
              attendees: [],
            });
          }
        }
      }
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

      updateFields["meetingTeam.$.schedule"] = "one-time";
      updateFields["meetingTeam.$.date"] = date;
      updateFields["meetingTeam.$.time"] = {
        start: oneTimeMeetingStartInfo[1],
        end: oneTimeMeetingEndInfo[1],
      };
      unsetFields["meetingTeam.$.weekSchedule"] = "";

      newMeetings.push({
        _id: `meeting-${uid.generate()}`,
        date: date,
        time: {
          start: oneTimeMeetingStartInfo[1],
          end: oneTimeMeetingEndInfo[1],
        },
        attendees: [],
      });
    }

    const todayString = today.toISOString().split("T")[0];
    const team = await Team.findOneAndUpdate(
      {
        _id: teamId,
        "meetingTeam._id": meetingTeamId,
      },
      {
        // $set: updateFields,
        // $unset: unsetFields,
        $pull: {
          "meetingTeam.$.meeting": {
            date: { $gt: todayString },
          },
        },
      },
      { new: true }
    );

    if (!team) {
      res.status(404).json({ message: "Team or Meeting not found" });
      return;
    }

    await Team.findOneAndUpdate(
      { _id: teamId, "meetingTeam._id": meetingTeamId },
      { $push: { "meetingTeam.$.meeting": { $each: newMeetings } } }
    );

    res.status(200).json({ message: "Meeting updated successfully" });
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

router.patch("/:teamId/meetingTeams/:meetingTeamId", editMeetingHandler);

export default router;
