import express, { Request, Response, RequestHandler } from "express";
import Team, { IAvailableTime } from "../../models/team";

const router = express.Router();

export const editMeetingHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { teamId, meetingId } = req.params;
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
        if(
            !teamId ||
            !meetingId ||
            !meetingName ||
            !recurringMeetingSchedule ||
            !oneTimeMeetingSchedule ||
            !meetingType ||
            !currentTab
        ) {
            res.status(400).json({ message: "Invalid or missing meeting data" });
            return;
        }

        const team = await Team.findById(teamId);
        if (!team) {
            res.status(404).json({ message: "Team not found" });
            return;
        }

        const availableTimesWithId = team.availableTimes as (IAvailableTime & { _id: string })[];
        const meeting = availableTimesWithId.find((meeting) => meeting._id.toString() === meetingId);
        if (!meeting) {
            res.status(404).json({ message: "Meeting not found" });
            return;
        }
        const hostEmail = meeting.email;
        team.availableTimes = availableTimesWithId.filter((meeting) => meeting._id.toString() !== meetingId);

        if (currentTab === "recurring") {
            team.availableTimes.push({
                email: hostEmail,
                meeting: {
                    schedule: "recurring",
                    name: meetingName,
                    description: meetingDescription,
                    weekSchedule: recurringMeetingSchedule,
                    type: meetingType,
                    duration: meetingType === "oneOnOne" ? duration : null,
                    attendees: meetingType === "group" ? 0 : undefined,
                    zoomLink: meetingLink,
                }
            })
        }
        else {
            const oneTimeMeetingStartInfo = oneTimeMeetingSchedule.start.split("T"); // YYYY-MM-DD
            const oneTimeMeetingEndInfo = oneTimeMeetingSchedule.end.split("T");
            const date =
                oneTimeMeetingStartInfo[0].split("-")[0] +
                "-" +
                oneTimeMeetingStartInfo[0].split("-")[1] +
                "-" +
                oneTimeMeetingStartInfo[0].split("-")[2];
            
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
                    zoomLink: meetingLink
                }
            });
        }

        await team.save();

        res.status(200).json({ message: "Meeting updated successfully" });
    } catch (error) {
        console.error("Error updating meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

router.put("/:teamId/meetings/:meetingId", editMeetingHandler);

export default router;