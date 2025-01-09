import express, { Request, Response, RequestHandler } from "express";
import nodemailer from "nodemailer";
import Team from "../../models/team";

const router = express.Router();

// Called when a professor cancels an office hour.
// This adds the cancelled office hour to the team's cancelledMeetings list.
// Necessary to update this so we can disable that office hour on the calendar.
export const cancelOfficeHourHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;
  const { cancelledDate, start, end } = req.body;

  try {
    if (!cancelledDate || !start || !end) {
      res.status(400).json({ message: "Invalid or missing cancelled date" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Check if the cancelledMeeting already exists.
    if (
      team.cancelledMeetings.includes({
        day: cancelledDate,
        meeting: { start: start, end: end },
      })
    ) {
      res.status(400).json({ message: "Date already cancelled" });
      return;
    }

    team.cancelledMeetings = [
      ...team.cancelledMeetings,
      { day: cancelledDate, meeting: { start: start, end: end } },
    ];
    await team.save();

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
      text: `Booky Cancel Announcement \n\n Cancelled Date: ${cancelledDate} \n Start Time: ${start} \n End Time: ${end} \n\n We are sorry for the inconvenience,\n Booky`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending failed:", error);
      }
    });

    res.status(200).json({
      message: "Office hour cancelled successfully",
      cancelledDays: team.cancelledMeetings,
    });
  } catch (error) {
    console.error("Error cancelling office hour:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/cancel", cancelOfficeHourHandler);

export default router;
