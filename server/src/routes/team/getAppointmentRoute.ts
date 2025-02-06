import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

export const getAppointmentHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { teamId, meetingTeamId, meetingId, appointmentToken } = req.query;

  if (!teamId || !meetingTeamId || !meetingId || !appointmentToken) {
    res.status(400).json({ message: "Missing teamId, meetingTeamId, meetingId, or token" });
    return;
  }

  try {
    // Find the team.
    const team = await Team.findById(teamId).exec();

    if (!team) {
      res.status(404).json({ message: "No teams found for this user" });
      return;
    }

    const meetingTeam = team.meetingTeam.find(
      (meetingTeam) => meetingTeam._id.toString() === meetingTeamId
    );

    if (!meetingTeam) {
      res.status(404).json({ message: "Meeting team not found" });
      return;
    }

    const meeting = meetingTeam.meeting.find(
      (meeting) => meeting._id.toString() === meetingId
    );

    if (!meeting) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }

    const date = meeting.date;
    
    const attendee = meeting.attendees.find((attendee) => attendee.token === appointmentToken);
    
    if (!attendee) {
      res.status(404).json({ message: "Attendee not found" });
      return;
    }

    const today = new Date();
    if (attendee.tokenExpiry <= today) {
      res.status(409).json({ message: "Expired Appointment" });
      return;
    }

    res.status(200).json({
      team: team.teamName,
      meetingTeam: meetingTeam.meetingName,
      day: date, 
      time: attendee.time
    });
  } catch (error) {
    console.error("Error querying teams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/", getAppointmentHandler);

export default router;