import cron from "node-cron";
import Team from "./models/team";
import ShortUniqueId from "short-uuid";

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

export const scheduleMeetings = async () => {
  try {
    const teams = await Team.find({
      "meetingTeam.weekSchedule": { $exists: true },
    });

    const todayUTC: Date = new Date();
    const today: Date = convertToEST(todayUTC);

    for (const team of teams) {
      for (const meetingTeam of team.meetingTeam) {
        if (meetingTeam.schedule === "recurring" && meetingTeam.weekSchedule) {
          for (let i = 0; i < 14; i++) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i);

            const targetDay = targetDate.toLocaleString("en-US", {
              weekday: "long",
              timeZone: "America/New_York",
            });

            const daySchedule = meetingTeam.weekSchedule.find(
              (schedule) => schedule.day === targetDay && schedule.enabled
            );

            if (daySchedule) {
              for (const timeRange of daySchedule.times) {
                const meetingId = `meeting-${ShortUniqueId().generate()}`;

                const meetingExists = meetingTeam.meeting.some(
                  (meeting) =>
                    meeting.date === targetDate.toISOString().split("T")[0] &&
                    meeting.time.start === timeRange.start &&
                    meeting.time.end === timeRange.end
                );
                if (!meetingExists) {
                  meetingTeam.meeting.push({
                    _id: meetingId,
                    date: targetDate.toISOString().split("T")[0],
                    time: timeRange,
                    cancelled: false,
                    merged: false,
                    attendees: [],
                  });
                }
              }
            }
          }
        }
      }

      // Save the team after all meetings are added
      await team.save();
    }
    console.log("Scheduled meetings updated successfully.");
  } catch (error) {
    console.error("Error scheduling meetings:", error);
  }
};

// Schedule the task
export const meetingCreateScheduler = () => {
  // Schedule the job to run every day at **8 AM EST**
  cron.schedule("0 8 * * *", scheduleMeetings, {
    timezone: "America/New_York",
  });
  console.log("🔄 Running meeting create scheduler every day at 8 AM EST");
};
