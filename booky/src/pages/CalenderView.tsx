import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import { Label } from "@/components/ui/label";

interface CalenderViewProps {
  teamName: string;
  admin: string;
}

export default function CalenderView({ teamName, admin }: CalenderViewProps) {
  const calendars = [
    { id: "cal1", name: "Personal" },
    { id: "cal2", name: "Work" },
  ];
  const initialEvents = [
    {
      id: "1",
      calendarId: "cal1",
      title: "Lunch",
      category: "time",
      start: "2025-01-03T12:00:00",
      end: "2025-01-03T13:30:00",
    },
    {
      id: "2",
      calendarId: "cal2",
      title: "Coffee Break",
      category: "time",
      start: "2025-01-03T15:00:00",
      end: "2025-01-03T15:30:00",
    },
  ];

  const onAfterRenderEvent = (event) => {
    console.log(event.title);
  };

  const handleBeforeUpdateSchedule = (event) => {
    // Prevent dragging or updating schedules
    console.log("Dragging disabled!", event);
    return false; // Cancels the drag event
  };

  return (
    <section className="flex w-full bg-white rounded-lg mt-5 md:h-[740px] px-4">
      <div className="grid w-1/6">
        <div className="grid h-fit space-y-1">
          <Label className="font-bold text-2xl">Course: {teamName}</Label>
          <Label className="text-gray-500 font-medium">Admin: {admin}</Label>
        </div>
      </div>
      <div className="w-5/6 ml-2 rounded-2xl border overflow-hidden">
        <Calendar
          height="740px"
          view="month"
          month={{
            dayNames: ["S", "M", "T", "W", "T", "F", "S"],
            visibleWeeksCount: 3,
          }}
          calendars={calendars}
          events={initialEvents}
          isReadOnly={true}
        />
      </div>
    </section>
  );
}
