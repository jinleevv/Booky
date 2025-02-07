import cron from "node-cron";
import Team from "./models/team";
import nodemailer from "nodemailer";

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

// Function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = convertToEST(new Date());
  return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
};

// Function to send an email to attendees
const sendEmail = async (
  to: string,
  meetingName: string,
  meetingTime: string,
  meetingLink: string,
  hostName: string
) => {
  try {
    // Configure Nodemailer Transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Booky" <${process.env.EMAIL}>`,
      to,
      subject: `Reminder: Upcoming Meeting - ${meetingName}`,
      text: `Hello,\n\n📅This is a reminder that your meeting "${meetingName}" hosted by ${hostName} is scheduled at ${meetingTime} today. \n\n🔗Meeting Link: ${meetingLink} \n\nBest,\nBooky Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} for meeting: ${meetingName}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
};

// Function to check for today's meetings and send reminders
const sendMeetingReminders = async () => {
  try {
    console.log("🔄 Running daily meeting reminder cron job...");

    const today = getTodayDate();

    // Fetch all teams
    const teams = await Team.find();

    for (const team of teams) {
      for (const meetingTeam of team.meetingTeam) {
        for (const meeting of meetingTeam.meeting) {
          if (meeting.date === today) {
            // Send emails to all attendees
            for (const attendee of meeting.attendees) {
              await sendEmail(
                attendee.participantEmail,
                meetingTeam.meetingName,
                `${meeting.time.start} - ${meeting.time.end}`,
                meetingTeam.zoomLink || "",
                meetingTeam.hostName
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Error in meeting reminder cron job:", error);
  }
};

// Schedule the job to run every day at **8 AM EST**
cron.schedule("0 8 * * *", sendMeetingReminders, {
  timezone: "America/New_York",
});

export default sendMeetingReminders;
