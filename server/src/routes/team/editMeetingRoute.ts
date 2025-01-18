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

        // Construct the $unset fields dynamically
        const unsetFields: Record<string, ""> = {};

        if (currentTab === "recurring") {
            updateFields["meetingTeam.$.schedule"] = "recurring";
            updateFields["meetingTeam.$.weekSchedule"] = recurringMeetingSchedule;
            unsetFields["meetingTeam.$.date"] = ""; // Remove date if switching to recurring
            unsetFields["meetingTeam.$.time"] = ""; // Remove time if switching to recurring
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
            unsetFields["meetingTeam.$.weekSchedule"] = ""; // Remove weekSchedule if switching to one-time
        }

        // Find the team and update the specific meeting
        const team = await Team.findOneAndUpdate(
            { 
                _id: teamId, 
                "meetingTeam._id": new mongoose.Types.ObjectId(meetingId) // Convert meetingId
            },
            {
                $set: updateFields,
                $unset: unsetFields,
            },
            { new: true, runValidators: true }
        );

        // const team = await Team.findOneAndUpdate(
        //     { _id: teamId, "meetingTeam._id": meetingId }, // Find the team and the specific meeting
        //     {
        //         $set: {
        //             "meetingTeam.$.meetingName": meetingName,
        //             "meetingTeam.$.meetingDescription": meetingDescription,
        //             "meetingTeam.$.weekSchedule": currentTab === "recurring" ? recurringMeetingSchedule : undefined,
        //             "meetingTeam.$.date": currentTab === "one-time" ? oneTimeMeetingSchedule?.start?.split("T")[0] : undefined,
        //             "meetingTeam.$.time": currentTab === "one-time"
        //                 ? {
        //                       start: oneTimeMeetingSchedule?.start?.split("T")[1],
        //                       end: oneTimeMeetingSchedule?.end?.split("T")[1],
        //                   }
        //                 : undefined,
        //             "meetingTeam.$.type": meetingType,
        //             "meetingTeam.$.duration": meetingType === "oneOnOne" ? duration : null,
        //             "meetingTeam.$.zoomLink": meetingLink,
        //         },
        //     },
        //     { new: true, runValidators: true } // Return the updated document
        // );

        if (!team) {
            res.status(404).json({ message: "Team or Meeting not found" });
            return;
        }

        // const team = await Team.findById(teamId);
        // if (!team) {
        //     res.status(404).json({ message: "Team not found" });
        //     return;
        // }

        // const meetingToUpdate = team.meetingTeam.find((meeting) => meeting._id.toString() === meetingId);
        // if (!meetingToUpdate) {
        //     res.status(404).json({ message: "Meeting not found" });
        //     return;
        // }

        // if (currentTab === "recurring") {
            
        //     team.availableTimes.push({
        //         email: hostEmail,
        //         meeting: {
        //             schedule: "recurring",
        //             name: meetingName,
        //             description: meetingDescription,
        //             weekSchedule: recurringMeetingSchedule,
        //             type: meetingType,
        //             duration: meetingType === "oneOnOne" ? duration : null,
        //             attendees: meetingType === "group" ? 0 : undefined,
        //             zoomLink: meetingLink,
        //         }
        //     })
        // }
        // else {
        //     const oneTimeMeetingStartInfo = oneTimeMeetingSchedule.start.split("T"); // YYYY-MM-DD
        //     const oneTimeMeetingEndInfo = oneTimeMeetingSchedule.end.split("T");
        //     const date =
        //         oneTimeMeetingStartInfo[0].split("-")[0] +
        //         "-" +
        //         oneTimeMeetingStartInfo[0].split("-")[1] +
        //         "-" +
        //         oneTimeMeetingStartInfo[0].split("-")[2];
            
        //     team.availableTimes.push({
        //         email: hostEmail,
        //         meeting: {
        //             schedule: "one-time",
        //             name: meetingName,
        //             description: meetingDescription,
        //             date: date,
        //             time: {
        //                 start: oneTimeMeetingStartInfo[1],
        //                 end: oneTimeMeetingEndInfo[1],
        //             },
        //             type: meetingType,
        //             duration: meetingType === "oneOnOne" ? duration : null,
        //             attendees: meetingType === "group" ? 0 : undefined,
        //             zoomLink: meetingLink
        //         }
        //     });
        // }

        // await team.save();

        res.status(200).json({ message: "Meeting updated successfully" });
    } catch (error) {
        console.error("Error updating meeting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

router.patch("/:teamId/meetings/:meetingId", editMeetingHandler);

export default router;