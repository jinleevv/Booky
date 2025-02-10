import express, { Request, Response, RequestHandler } from "express";
import nodemailer from "nodemailer";
import Team from "../../models/team";
import mongoose from "mongoose";

const router = express.Router();

// Called when a professor cancels an office hour.
// This cancels the specific meeting by setting the cancelled attribute to true.
// Necessary to update this so we can disable that office hour on the calendar.
export const cancelOfficeHourHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId, meetingTeamId, meetingId } = req.params;
  const { cancelledDate, start, end } = req.body;

  try {
    if (!teamId || !meetingTeamId || !meetingId) {
      res.status(400).json({ message: "Invalid or missing cancelled date" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const result = await Team.updateOne(
      { _id: teamId, "meetingTeam._id": meetingTeamId },
      {
        $set: {
          "meetingTeam.$[].meeting.$[m].cancelled": true,
        },
      },
      {
        arrayFilters: [{ "m._id": meetingId }],
      }
    );

    if (!result) {
      res.status(404).json({ message: "Team or meeting team not found" });
      return;
    }

    // Send a cancellation notification email to all members of the team.
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: `Booky <${process.env.EMAIL}>`,
      to: [...team.members, team.adminEmail].join(","),
      subject: "Booky Cancel Announcement",
      text: `Booky Cancel Announcement \n\n🏢Team: ${team.teamName}\n\n❌Cancelled Date: ${cancelledDate}\n Start Time: ${start} \nEnd Time: ${end} \n\nHost has cancelled the meeting\nWe are sorry for the inconvenience,\nBooky`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending failed:", error);
      }
    });

    res.status(200).json({
      message: "Office hour cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling the meeting:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch(
  "/cancel/:teamId/:meetingTeamId/:meetingId",
  cancelOfficeHourHandler
);

export default router;
