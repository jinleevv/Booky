import express, { Request, Response, RequestHandler } from "express";
import Team from "../../models/team";

const router = express.Router();

export const queryAppointmentHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId, appointmentToken } = req.query;

  if (!appointmentToken || typeof appointmentToken !== "string") {
    res.status(400).json({ message: "Invalid or missing token" });
    return;
  }

  try {
    const team = await Team.findById(teamId).exec();

    if (!team) {
      res.status(404).json({ message: "No teams found for this user" });
      return;
    }

    const appointment = team.appointments.find(
      (item) => item.token === appointmentToken
    );

    const isWithin7Days = (tokenExpireDate: Date) => {
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      return tokenExpireDate >= today && tokenExpireDate <= sevenDaysFromNow;
    };

    if (!isWithin7Days(appointment!.tokenExpiry)) {
      res.status(400).json({ message: "Expired Appointment" });
      return;
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error querying teams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/", queryAppointmentHandler);

export default router;