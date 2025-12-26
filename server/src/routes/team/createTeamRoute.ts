import express, { Request, Response, RequestHandler } from "express";
import ShortUniqueId from "short-uuid";
import Team, { ISchedule, IMeeting } from "../../models/team";

const router = express.Router();

function convertToEST(date: Date): Date {
  try {
    const estString: string = date.toLocaleString("en-US", {
      timeZone: "America/New_York",
      timeZoneName: "longOffset",
    });

    const offsetString: string | undefined = estString.split(" ").pop();

    if (!offsetString) {
      throw new Error("Failed to extract timezone offset");
    }

    const offsetMatch: RegExpMatchArray | null = offsetString.match(/[-+]\d+/);

    if (!offsetMatch) {
      throw new Error("Invalid offset format");
    }

    const offsetHours: number = parseInt(offsetMatch[0]);
    return new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
  } catch (error) {
    console.error("Error converting to EST:", error);
    // Return original date if conversion fails
    return date;
  }
}

// Create a new team.
export const createTeamHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamName, teamDescription, adminEmail, adminName, coadmins } =
    req.body;

  try {
    if (!teamName || !adminEmail || !adminName) {
      res.status(400).json({
        message: "Missing required fields",
      });
      return;
    }

    // Generate unique teamId
    const _id = `team-${teamName.replaceAll(
      /\s/g,
      "-"
    )}-${ShortUniqueId().generate()}`;

    // Create the new team and save in teams collection.
    // Unitialized attributes are set to their default values.
    const newTeam = new Team({
      _id,
      teamName,
      teamDescription,
      adminEmail,
      adminName,
      coadmins,
      members: [],
    });
    await newTeam.save();

    res.status(201).json({ message: "Team creating successfully" });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.post("/", createTeamHandler);

export default router;
