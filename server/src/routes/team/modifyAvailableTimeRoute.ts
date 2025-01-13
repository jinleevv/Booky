import express, { Request, Response, RequestHandler } from "express";
import Team, {IAvailableTime} from "../../models/team";

const router = express.Router();

// Update the availableTime map for a specific team.
export const modifyAvailableTimeHandler: RequestHandler = async (
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
    meetingId,
  } = req.body;

  try {
    if (
      !hostEmail ||
      !currentTab ||
      !recurringMeeting ||
      !oneTimeMeeting ||
      !meetingName ||
      !meetingType ||
      !meetingId
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

    const availableTimesWithId = team.availableTimes as (IAvailableTime & { _id: string })[];    
    const meetingToModify = availableTimesWithId.find((meeting) => meeting._id.toString() === meetingId);
    
    if (meetingToModify) {
        if (meetingToModify.meeting.schedule === "recurring") {
            meetingToModify.meeting.name = meetingName;
            meetingToModify.meeting.weekSchedule = recurringMeeting;
            meetingToModify.meeting.description = meetingDescription;
            meetingToModify.meeting.zoomLink = meetingLink;
        } else {
            console.log(oneTimeMeeting);
            const oneTimeMeetingStartInfo = oneTimeMeeting.start.split("T"); // YYYY-MM-DD
            const oneTimeMeetingEndInfo = oneTimeMeeting.end.split("T");
            const date =
                oneTimeMeetingStartInfo[0].split("-")[1] +
                "-" +
                oneTimeMeetingStartInfo[0].split("-")[2] +
                "-" +
                oneTimeMeetingStartInfo[0].split("-")[0];
            meetingToModify.meeting.name = meetingName;
            meetingToModify.meeting.date = date;
            meetingToModify.meeting.time = {
                start: oneTimeMeetingStartInfo[1],
                end: oneTimeMeetingEndInfo[1],
            };
            meetingToModify.meeting.description = meetingDescription;
            meetingToModify.meeting.zoomLink = meetingLink;
        }
    }

    // if (currentTab === "recurring") {
    //   team.availableTimes.push({
    //     email: hostEmail,
    //     meeting: {
    //       schedule: "recurring",
    //       name: meetingName,
    //       description: meetingDescription,
    //       weekSchedule: recurringMeeting,
    //       type: meetingType,
    //       duration: meetingType === "oneOnOne" ? duration : null,
    //       attendees: meetingType === "group" ? 0 : undefined,
    //       zoomLink: meetingLink === "" ? "" : meetingLink,
    //     },
    //   });
    // } else {
    //   const oneTimeMeetingStartInfo = oneTimeMeeting.start.split("T"); // YYYY-MM-DD
    //   const oneTimeMeetingEndInfo = oneTimeMeeting.end.split("T");
    //   const date =
    //     oneTimeMeetingStartInfo[0].split("-")[1] +
    //     "-" +
    //     oneTimeMeetingStartInfo[0].split("-")[2] +
    //     "-" +
    //     oneTimeMeetingStartInfo[0].split("-")[0];
    //   team.availableTimes.push({
    //     email: hostEmail,
    //     meeting: {
    //       schedule: "one-time",
    //       name: meetingName,
    //       description: meetingDescription,
    //       date: date,
    //       time: {
    //         start: oneTimeMeetingStartInfo[1],
    //         end: oneTimeMeetingEndInfo[1],
    //       },
    //       type: meetingType,
    //       duration: meetingType === "oneOnOne" ? duration : null,
    //       attendees: meetingType === "group" ? 0 : undefined,
    //       zoomLink: meetingLink === "" ? "" : meetingLink,
    //     },
    //   });
    // }

    await team.save();

    res.status(200).json({
      message: "Available time updated successfully",
    });
  } catch (error) {
    console.error("Error updating available time:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/modify-availableTime", modifyAvailableTimeHandler);

export default router;