import express, { Request, Response, RequestHandler } from "express";
import nodemailer from "nodemailer";
import Team from "../../models/team";

const router = express.Router();

function isTimeInRange(time: string, startTime: string, endTime: string) {
  // Helper function to parse time strings into Date objects
  const parseTime = (timeString: string) => {
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if ((modifier === "PM" || modifier === "p.m.") && hours !== 12) {
      hours += 12;
    } else if ((modifier === "AM" || modifier === "p.m.") && hours === 12) {
      hours = 0;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const timeDate = parseTime(time);
  const startDate = parseTime(startTime);
  const endDate = parseTime(endTime);

  // Check if the time is in range
  return timeDate >= startDate && timeDate <= endDate;
}

// Called when a user makes an appointment. Adds the appointment to the team appointments list.
export const updateAppointmentsHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;
  const { meetingTeamId, day, time, attend } = req.body;
  try {
    if (!meetingTeamId || !attend || !day || !time) {
      res.status(400).json({ message: "Invalid or missing appointments data" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    const findMeetingTeam = team.meetingTeam.find(
      (meeting) => meeting._id.toString() === meetingTeamId
    );

    if (!findMeetingTeam) {
      res.status(404).json({ message: "Meeting team not found" });
      return;
    }

    let appointmentUpdated = true;

    if (findMeetingTeam.type !== "group") {
      findMeetingTeam.meeting.forEach((m: any) => {
        if (m.date === day && isTimeInRange(time, m.time.start, m.time.end)) {
          m.attendees.push(attend);
          appointmentUpdated = true;
        }
      });
    }
    // else {
    //   findMeetingTeam.meeting.forEach((m: any) => {
    //     if (m.date === day) {
    //       m.attendees.push(attend);
    //       appointmentUpdated = true;
    //     }
    // })}

    if (!appointmentUpdated) {
      res
        .status(400)
        .json({
          message: "No matching appointment found or attendee already added",
        });
      return;
    }

    await team.save();

    // Set up email components to send a confirmation email to the user about their appointment.
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: `Booky <${process.env.EMAIL}>`,
      to: attend.participantEmail,
      subject: "Booky Confirmation",
      text: `Booky Confirmation Email\n\n Cancel Link: http://10.140.17.108:3000/${team._id}/${attend.token} \n\n Have a great day :) \n Booky`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending failed:", error);
      }
    });

    res.status(200).json({ message: "Appointments updated successfully" });
  } catch (error) {
    console.error("Error updating appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/:teamId/appointments", updateAppointmentsHandler);

export default router;
