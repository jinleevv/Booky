import express, { Request, Response, RequestHandler } from "express";
import Team, { IMeetingTeam } from "../../models/team";
import mongoose from "mongoose";

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

        const updateFields: Record<string, any> = {
            "meetingTeam.$.meetingName": meetingName,
            "meetingTeam.$.meetingDescription": meetingDescription,
            "meetingTeam.$.type": meetingType,
            "meetingTeam.$.duration": meetingType === "oneOnOne" ? duration : null,
            "meetingTeam.$.zoomLink": meetingLink,
        };

        const unsetFields: Record<string, ""> = {};

        if (currentTab === "recurring") {
            updateFields["meetingTeam.$.schedule"] = "recurring";
            updateFields["meetingTeam.$.weekSchedule"] = recurringMeetingSchedule;
            unsetFields["meetingTeam.$.date"] = "";
            unsetFields["meetingTeam.$.time"] = "";
        } else {
            const oneTimeMeetingStartInfo = oneTimeMeetingSchedule.start.split("T"); // YYYY-MM-DD
            const oneTimeMeetingEndInfo = oneTimeMeetingSchedule.end.split("T");
            const date =
                oneTimeMeetingStartInfo[0].split("-")[1] +
                "-" +
                oneTimeMeetingStartInfo[0].split("-")[2] +
                "-" +
                oneTimeMeetingStartInfo[0].split("-")[0];

            updateFields["meetingTeam.$.schedule"] = "one-time";
            updateFields["meetingTeam.$.date"] = date;
            updateFields["meetingTeam.$.time"] = {
                start: oneTimeMeetingStartInfo[1],
                end: oneTimeMeetingEndInfo[1],
            };
            unsetFields["meetingTeam.$.weekSchedule"] = "";
        }

        const team = await Team.findOneAndUpdate(
            { 
                _id: teamId, 
                "meetingTeam._id": new mongoose.Types.ObjectId(meetingId)
            },
            {
                $set: updateFields,
                $unset: unsetFields,
            },
            { new: true, runValidators: true }
        );

        if (!team) {
            res.status(404).json({ message: "Team or Meeting not found" });
            return;
        }

        res.status(200).json({ message: "Meeting updated successfully" });
    } catch (error) {
        console.error("Error updating meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

router.patch("/:teamId/meetings/:meetingId", editMeetingHandler);

export default router;