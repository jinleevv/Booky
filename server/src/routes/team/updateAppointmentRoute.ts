import express, { Request, Response, RequestHandler } from "express";
import nodemailer from "nodemailer";
import Team from "../../models/team";

const router = express.Router();

export const updateAppointmentsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;
  const { appointments } = req.body;

  try {
    if (!appointments || !Array.isArray(appointments)) {
      res.status(400).json({ message: "Invalid or missing appointments data" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    team.appointments = [...team.appointments, ...appointments];
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
      to: appointments[0].email,
      subject: "Booky Confirmation",
      text: "Booky Confirmation Email Test",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending failed:", error);
      } else {
        console.log("Email sent: " + appointments[0].email + " | " + info.response);
      }
    });

    res
      .status(200)
      .json({ message: "Appointments updated successfully", team });
  } catch (error) {
    console.error("Error updating appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/appointments", updateAppointmentsHandler);

export default router;
