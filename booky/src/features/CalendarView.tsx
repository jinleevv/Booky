import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { useEffect, useMemo, useState } from "react";
import "@schedule-x/theme-shadcn/dist/index.css";

export default function CalendarView({ userTeam }) {
  const [hasLoadedEvents, setHasLoadedEvents] = useState(false);

  const eventsService = useMemo(() => createEventsServicePlugin(), []);
  const eventModal = createEventModalPlugin();

  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    events: [],
    plugins: [eventsService, eventModal],
    theme: "shadcn",
  });

  useEffect(() => {
    if (!calendar || !calendar.events?.add || hasLoadedEvents) return;

    userTeam.forEach((team) => {
      team.meetingTeam.forEach((meetingTeam) => {
        meetingTeam.meeting.forEach((meeting) => {
          console.log(team);
          const startTime =
            meeting.date + " " + toMilitaryTime(meeting.time.start);
          const endTime = meeting.date + " " + toMilitaryTime(meeting.time.end);
          calendar.events.add({
            id: meeting.meetingId,
            title: meetingTeam.meetingName,
            location: team.teamName,
            start: startTime,
            end: endTime,
            description: "Insert zoom link here",
            _options: {
              additionalClasses: [],
            },
          });
        });
      });
    });

    setHasLoadedEvents(true);
  }, [calendar, hasLoadedEvents, userTeam]);

  useEffect(() => {
    // get all events
    eventsService.getAll();
  }, []);

  function toMilitaryTime(time12h: string): string {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours < 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    const militaryHours = hours.toString().padStart(2, "0");
    return `${militaryHours}:${minutes.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex w-full h-full p-10 mt-10 justify-center">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}
