import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

// When a user cancels their appointment via their confirmation link.
// Delete the appointment from the team appointments list.
export const deleteAppointmentHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId, meetingTeamId, meetingId, appointmentToken } = req.query;

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

    res.status(200).json({ message: "cancelled appointment successfully" });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.patch("/", deleteAppointmentHandler);

export default router;
