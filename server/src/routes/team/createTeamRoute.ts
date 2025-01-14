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
    name,
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
      !name ||
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

    let availableTimes = [];

    if (currentTab === "recurring") {
      availableTimes = [
        {
          email: adminEmail,
          meeting: {
            schedule: "recurring",
            name: meetingName,
            description: meetingDescription,
            weekSchedule: recurringMeeting,
            type: meetingType,
            duration: meetingType === "oneOnOne" ? duration : null,
            attendees: meetingType === "group" ? 0 : undefined,
            zoomLink: meetingLink === "" ? "" : meetingLink,
          },
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
      availableTimes = [
        {
          email: adminEmail,
          meeting: {
            schedule: "one-time",
            name: meetingName,
            description: meetingDescription,
            // fix this after
            date: date,
            time: {
              start: oneTimeMeetingStartInfo[1],
              end: oneTimeMeetingEndInfo[1],
            },
            //
            type: meetingType,
            duration: meetingType === "oneOnOne" ? duration : null,
            attendees: meetingType === "group" ? 0 : undefined,
            zoomLink: meetingLink === "" ? "" : meetingLink,
          },
        },
      ];
    }

    // Generate unique teamId
    const _id = `team-${name.replaceAll(
      /\s/g,
      "-"
    )}-${ShortUniqueId().generate()}`;

    // Create the new team and save in teams collection.
    // Unitialized attributes are set to their default values.
    const newTeam = new Team({
      _id,
      name,
      teamDescription,
      adminEmail,
      adminName,
      coadmins,
      availableTimes: availableTimes, // Save as a Map
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
