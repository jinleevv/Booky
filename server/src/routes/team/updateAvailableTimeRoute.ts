import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

// Update the availableTime map for a specific team.
export const updateAvailableTimeHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;
  const {
    hostEmail,
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
      !hostEmail ||
      !currentTab ||
      !recurringMeeting ||
      !oneTimeMeeting ||
      !meetingName ||
      !meetingType
    ) {
      res
        .status(400)
        .json({ message: "Invalid or missing availableTime data" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    if (currentTab === "recurring") {
      console.log("hello");
      team.availableTimes.push({
        email: hostEmail,
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
      });
    } else {
      const oneTimeMeetingStartInfo = oneTimeMeeting.start.split("T"); // YYYY-MM-DD
      const oneTimeMeetingEndInfo = oneTimeMeeting.end.split("T");
      const date =
        oneTimeMeetingStartInfo[0].split("-")[1] +
        "-" +
        oneTimeMeetingStartInfo[0].split("-")[2] +
        "-" +
        oneTimeMeetingStartInfo[0].split("-")[0];
      team.availableTimes.push({
        email: hostEmail,
        meeting: {
          schedule: "one-time",
          name: meetingName,
          description: meetingDescription,
          date: date,
          time: {
            start: oneTimeMeetingStartInfo[1],
            end: oneTimeMeetingEndInfo[1],
          },
          type: meetingType,
          duration: meetingType === "oneOnOne" ? duration : null,
          attendees: meetingType === "group" ? 0 : undefined,
          zoomLink: meetingLink === "" ? "" : meetingLink,
        },
      });
    }

    await team.save();

    res.status(200).json({
      message: "Available time updated successfully",
    });
  } catch (error) {
    console.error("Error updating available time:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/availableTime", updateAvailableTimeHandler);

export default router;
