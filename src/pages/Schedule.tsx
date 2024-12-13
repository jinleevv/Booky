import NavigationBar from "@/features/NavigationBar";
import { useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import ScheduleForm from "@/features/CreateAppointment/ScheduleForm";

export default function Schedule() {
  const { code: teamId } = useParams();
  const [teamName, setTeamName] = useState<string>("Loading...");
  const [adminName, setAdminName] = useState<string>("Loading...");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [enabledDays, setEnabledDays] = useState<Set<number>>(new Set());
  const [availableTime, setAvailableTime] = useState<any[]>([]);
  const [duration, setDuration] = useState<number>(5); // Default to 5 minutes
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null); // Track selected time slot
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]); // State to store existing appointments

  const [userSelectedDate, setUserSelectedDate] = useState<string>("");

  useEffect(() => {
    // Initial fetch information - the team and admin details
    fetchTeamDetails();
  }, [teamId]);

  // Generate time slots dynamically when the selected date changes
  useEffect(() => {
    if (!selectedDate || availableTime.length === 0) return;
    const month = selectedDate.getMonth() + 1;
    const date = selectedDate.getDate();
    const year = selectedDate.getFullYear();

    setUserSelectedDate(month + "-" + date + "-" + year);

    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const dayAvailability = availableTime.find((day) => day.day === dayOfWeek);

    if (dayAvailability?.enabled) {
      const startTime = dayAvailability.times[0]?.start; // Start Time
      const endTime = dayAvailability.times[0]?.end; // End Time

      if (startTime && endTime) {
        setTimeSlots(
          generateTimeSlots(
            month + "-" + date + "-" + year,
            startTime,
            endTime,
            duration
          )
        );
      }
    } else {
      setTimeSlots([]); // No slots if not available
    }
  }, [selectedDate, availableTime, duration, existingAppointments]);

  async function fetchTeamDetails() {
    try {
      const response = await fetch(`http://localhost:5001/api/teams/${teamId}`);
      const data = await response.json();

      if (response.ok) {
        setTeamName(data.name);
        setAdminName(data.adminName);
        setAvailableTime(data.availableTime);
        setDuration(parseInt(data.durations[0], 10));
        setExistingAppointments(data.appointments); // Set the existing appointments

        const dayMap: { [key: string]: number } = {
          Sunday: 0,
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
        };

        // Check for the available days (Monday, Tuesday, Wednesday, Thursday, Friday, Saterday, Sunday)
        const enabled = data.availableTime.reduce((acc: number[], day: any) => {
          if (day.enabled && dayMap[day.day] !== undefined) {
            acc.push(dayMap[day.day]);
          }
          return acc;
        }, []);

        setEnabledDays(new Set(enabled));
      } else {
        setTeamName("Not Found");
        setAdminName("Not Found");
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
    }
  }

  const disablePastDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate date 7 days from today
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    // Disable past dates, dates beyond 7 days, and dates not in enabledDays
    const dayIndex = date.getDay();
    return date < today || date > maxDate || !enabledDays.has(dayIndex);
  };

  // Utility function to generate time slots
  const generateTimeSlots = (
    date: string,
    start: string,
    end: string,
    interval: number
  ) => {
    const slots: string[] = [];
    const startTime = new Date(`1970-01-01T${convertTo24Hour(start)}`);
    const endTime = new Date(`1970-01-01T${convertTo24Hour(end)}`);

    const bookedTimes = new Set(
      existingAppointments
        .filter((appointment) => appointment.day === date) // Only filter for the selected day
        .map((appointment) => appointment.time) // Extract the time from the appointment
    );

    while (startTime < endTime) {
      const timeSlot = startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Only add the slot if it's not already booked
      if (!bookedTimes.has(timeSlot)) {
        slots.push(timeSlot);
      }

      startTime.setMinutes(startTime.getMinutes() + interval);
    }
    return slots;
  };

  // Utility to convert 12-hour time to 24-hour time format
  const convertTo24Hour = (time: string) => {
    const [hours, minutes, period] = time.match(/(\d+):(\d+) (\w+)/)!.slice(1);
    let hours24 = parseInt(hours, 10);
    if (period === "PM" && hours24 !== 12) hours24 += 12;
    if (period === "AM" && hours24 === 12) hours24 = 0;
    return `${hours24.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleTimeSlotClick = (time: string) => {
    setSelectedTimeSlot(time); // Set the selected time slot
  };

  const handleNewAppointment = (newAppointment: {
    day: string;
    time: string;
    email: string;
  }) => {
    console.log("New appointment received:", newAppointment);
    setExistingAppointments((prevAppointments) => {
      const updatedAppointments = [...prevAppointments, newAppointment];
      return updatedAppointments;
    });
  };

  return (
    <section className="h-screen w-screen bg-white">
      <NavigationBar />
      <div className="flex flex-col items-center justify-center">
        <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2"></div>
      </div>
      <div className="flex relative w-4/5 h-5/6 m-auto">
        {teamName === "Not Found" ? (
          <>
            <h1>Team Not Found</h1>
          </>
        ) : (
          <>
            <Card className="flex w-full h-4/6 m-auto shadow-sm">
              <CardHeader className="w-1/6 border-r-[1px] border-gray-200">
                <CardTitle>Course: {teamName}</CardTitle>
                <CardDescription>Professor: {adminName}</CardDescription>
              </CardHeader>
              <CardContent className="flex w-3/6 py-2 border-r-[1px] border-gray-200">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disablePastDates}
                  showOutsideDays={false}
                  className="flex h-[461px] overflow-y-auto mt-3 p-0"
                  classNames={{
                    months:
                      "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
                    month: "space-y-4 w-full",
                    table: "w-full border-collapse space-y-1",
                    head_row: "w-full flex justify-between",
                    head_cell: "w-16 font-normal text-xs text-center",
                    row: "w-full mt-2 flex justify-between",
                    cell: "w-16 relative p-0 text-center focus-within:relative focus-within:z-20",
                    day: "h-16 w-16 p-0 rounded-lg font-normal aria-selected:opacity-100 hover:bg-gray-100",
                    day_selected:
                      "bg-black text-white hover:bg-gray-800 focus:bg-black focus:text-white",
                    day_today: "bg-accent text-accent-foreground",
                    caption: "flex items-start justify-start pb-4 pl-2",
                    caption_label: "w-64 text-xl font-semibold",
                    nav: "space-x-1 flex w-full justify-end",
                    nav_button: cn(
                      buttonVariants({ variant: "outline" }),
                      "h-7 w-10 p-0"
                    ),
                    nav_button_previous: "",
                    nav_button_next: "",
                  }}
                />
              </CardContent>
              <div className="w-2/6 h-full">
                <CardContent className="h-1/2 w-full py-2 border-b-[1px] border-gray-200 overflow-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.length > 0 ? (
                      timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant="outline"
                          className={cn(
                            "p-4 text-center rounded-lg",
                            selectedTimeSlot === time
                              ? "bg-black text-white"
                              : "bg-white"
                          )}
                          onClick={() => handleTimeSlotClick(time)}
                        >
                          {time}
                        </Button>
                      ))
                    ) : (
                      <p className="col-span-2 text-center">
                        No available slots
                      </p>
                    )}
                  </div>
                </CardContent>
                <ScheduleForm
                  selectedDate={userSelectedDate}
                  selectedTime={selectedTimeSlot}
                  teamId={teamId!}
                  handleNewAppointment={handleNewAppointment}
                />
              </div>
            </Card>
          </>
        )}
      </div>
    </section>
  );
}
