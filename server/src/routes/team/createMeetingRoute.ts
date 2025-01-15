import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

export const createMeetingHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { teamId } = req.params;
    const {
        hostEmail,
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
            !hostEmail ||
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
        res.status(200).json({ message: "Meeting created successfully" });
        
    } catch (error) {
        console.error("Error creating meeting", error);
        res.status(500).json({ message: "Server error" });
    }
}

router.post("/:teamId/meetings", createMeetingHandler);

export default router;