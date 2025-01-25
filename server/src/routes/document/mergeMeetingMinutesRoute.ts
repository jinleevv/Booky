import express, { Request, Response, RequestHandler } from "express";
import MeetingMinute from "../../models/meetingMinute";

const router = express.Router();

interface QuillDelta {
  ops: Array<{ insert?: string | any; attributes?: any }>;
}

export const mergeMeetingMinutesHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { teamId, meetingTeamId } = req.params;
  const { meetingMinutesToMerge } = req.body; 

  try {
    if (!teamId || !meetingTeamId || !meetingMinutesToMerge || meetingMinutesToMerge.length < 2) {
      res.status(400).json({ message: "Invalid or missing parameters" });
      return;
    }

    const mostRecentMeetingId = meetingMinutesToMerge[0]; // Keep this meeting minute
    const minutesToMerge = meetingMinutesToMerge.slice(1); // Merge and remove these

    // Fetch all meeting minutes that need to be merged
    const meetingMinutes = await MeetingMinute.find({ _id: { $in: minutesToMerge } });

    if (!meetingMinutes || meetingMinutes.length === 0) {
      res.status(404).json({ message: "No meeting minutes found to merge" });
      return;
    }

    // Merge `ops` from the meeting minutes, ensuring each has `ops`
    const combinedDataOps = meetingMinutes.reduce((acc, minute) => {
      const delta = minute.data as QuillDelta; // ✅ Typecast to avoid TS errors
      const ops = delta?.ops ?? []; // ✅ Use optional chaining and default to empty array
      return acc.concat(ops);
    }, [] as QuillDelta["ops"]);

    // Fetch the most recent meeting's minute
    const mostRecentMinute = await MeetingMinute.findById(mostRecentMeetingId);
    if (!mostRecentMinute) {
      res.status(404).json({ message: "Most recent meeting minute not found" });
      return;
    }

    // Ensure `ops` exists in the most recent meeting minute
    if (!mostRecentMinute.data || !Array.isArray((mostRecentMinute.data as QuillDelta).ops)) {
      mostRecentMinute.data = { ops: [] }; // Initialize if empty
    }

    // Prepend the concatenated data
    (mostRecentMinute.data as QuillDelta).ops = [...combinedDataOps, ...(mostRecentMinute.data as QuillDelta).ops];

    console.log("Updated Data:", (mostRecentMinute.data as QuillDelta).ops);

    // ✅ Tell Mongoose that `data` has changed
    mostRecentMinute.markModified("data");

    // // Ensure `ops` exists in the most recent meeting minute
    // const recentDelta = mostRecentMinute.data as QuillDelta;
    // if (!recentDelta.ops) {
    //   recentDelta.ops = []; // ✅ Initialize if empty
    // }

    // // Prepend the concatenated data
    // recentDelta.ops = [...combinedDataOps, ...recentDelta.ops];

    // Save the updated meeting minute
    await mostRecentMinute.save();

    res.status(200).json({ message: "Meeting minutes merged successfully" });
  } catch (error) {
    console.error("Error merging meeting minutes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Define the route
router.patch("/:teamId/:meetingTeamId/merge-meeting-minutes", mergeMeetingMinutesHandler);

export default router;