import express, { Request, Response, RequestHandler } from "express";
import nodemailer from "nodemailer";
import Team from "../../models/team";

const router = express.Router();

// Handler to cancel an office hour by adding the date to cancelledDays
export const cancelOfficeHourHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;
  const { cancelledDate } = req.body;

  try {
    if (!cancelledDate || typeof cancelledDate !== "string") {
      res.status(400).json({ message: "Invalid or missing cancelled date" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    // Avoid adding duplicate cancelled dates
    if (team.cancelledDays.includes(cancelledDate)) {
      res.status(400).json({ message: "Date already cancelled" });
      return;
    }

    team.cancelledDays = [...team.cancelledDays, cancelledDate];
    await team.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: `Booky <${process.env.EMAIL}>`,
      to: [...team.members, team.admin].join(","),
      subject: "Booky Cancel Announcement",
      text: "Booky Cancel",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending failed:", error);
      } else {
        console.log("Email sent for: " + team.name + " | " + info.response);
      }
    });

    res.status(200).json({
      message: "Office hour cancelled successfully",
      cancelledDays: team.cancelledDays,
    });
  } catch (error) {
    console.error("Error cancelling office hour:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/cancel", cancelOfficeHourHandler);

export default router;
