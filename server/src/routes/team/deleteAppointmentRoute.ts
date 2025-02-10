import express, { Request, Response, RequestHandler } from "express";
import nodemailer from "nodemailer";
import Team from "../../models/team";

const router = express.Router();

// When a user cancels their appointment via their confirmation link.
// Delete the appointment from the team appointments list.
export const deleteAppointmentHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId, meetingTeamId, meetingId, appointmentToken } = req.query;
  const { appointment } = req.body;

  if (!teamId || !meetingTeamId || !meetingId || !appointmentToken) {
    res
      .status(400)
      .json({ message: "Missing teamId, meetingTeamId, meetingId, or token" });
    return;
  }

  try {
    const result = await Team.updateOne(
      {
        _id: teamId,
        "meetingTeam._id": meetingTeamId,
        "meetingTeam.meeting._id": meetingId,
      },
      {
        $pull: {
          "meetingTeam.$[].meeting.$[m].attendees": { token: appointmentToken },
        },
      },
      {
        arrayFilters: [{ "m._id": meetingId }],
      }
    );

    if (result.modifiedCount === 0) {
      res
        .status(404)
        .json({ message: "Appointment not found or already removed" });
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: `Booky <${process.env.EMAIL}>`,
      to: appointment.attendee.participantEmail,
      subject: "Booky Cancellation Confirmation",
      text: `Booky Confirmation Email\n\nYou have successfully cancelled a meeting.\n\n🏢Meeting: ${appointment.meetingTeam}\n\n🗓️Meeting Time: ${appointment.day}, ${appointment.attendee.time}\n\nHave a great day 😊\n Booky`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending failed:", error);
      }
    });

    res.status(200).json({ message: "cancelled appointment successfully" });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/", deleteAppointmentHandler);

export default router;
