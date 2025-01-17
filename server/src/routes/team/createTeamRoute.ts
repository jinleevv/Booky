import express, { Request, Response, RequestHandler } from "express";
import ShortUniqueId from "short-uuid";
import Team from "../../models/team";

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

    if (currentTab === "recurring") {
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
      const date =
        oneTimeMeetingStartInfo[0].split("-")[1] +
        "-" +
        oneTimeMeetingStartInfo[0].split("-")[2] +
        "-" +
        oneTimeMeetingStartInfo[0].split("-")[0];
      meetingTeam = [
        {
          schedule: "one-time",
          hostName: adminName,
          hostEmail: adminEmail,

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
