import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
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
import { useHook } from "@/hooks";
import { toast } from "sonner";

interface ITimeRange {
  start: string;
  end: string;
}

interface ICancelledDays {
  day: string;
  meeting: ITimeRange;
}

export default function DashBoardSchedule() {
  const { team: teamId } = useParams();
  const { server, userEmail, loggedInUser } = useHook();

  const [teamName, setTeamName] = useState<string>("Loading...");
  const [adminName, setAdminName] = useState<string>("Loading...");
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  const [cancelledDays, setCancelledDays] = useState<ICancelledDays[]>([]);
  const [enabledDays, setEnabledDays] = useState<Set<number>>(new Set());
  const [duration, setDuration] = useState<number>(5);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [availableTime, setAvailableTime] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [userSelectedDate, setUserSelectedDate] = useState<string>(""); //Kind of redundent
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Generate time slots when the selected date changes.
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

    let userOptionSlots = [];
    dayAvailability.times.forEach((time) => {
      const generatedTimeSlots = generateTimeSlots(
        month + "-" + date + "-" + year,
        time.start,
        time.end,
        duration
      );
      userOptionSlots = userOptionSlots.concat(generatedTimeSlots);
    });
    setTimeSlots(userOptionSlots);
  }, [selectedDate, availableTime, duration, existingAppointments]);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  async function fetchTeamDetails() {
    try {
      const response = await fetch(`${server}/api/teams/${teamId}`);
      const data = await response.json();

      if (response.ok) {
        setTeamName(data.name);
        setAdminName(data.adminName);
        setAdminEmail(data.adminEmail); // Assuming you fetch the admin email as well
        setAvailableTime(data.availableTime);
        setDuration(parseInt(data.durations[0], 10));
        setExistingAppointments(data.appointments); // Set the existing appointments
        setTeamMembers(data.members); // Store the team members
        setCancelledDays(data.cancelledMeetings); // Assuming you fetch the cancelled days array

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

    // Calculate the maximum allowed date (7 days from today)
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    // Format the current date into MM-DD-YYYY format
    // const formatDate = (date: Date) => {
    //   const month = (date.getMonth() + 1).toString().padStart(2, "0"); // months are 0-based
    //   const day = date.getDate().toString().padStart(2, "0");
    //   const year = date.getFullYear().toString();
    //   return `${month}-${day}-${year}`;
    // };

    // Check if the formatted date is in the cancelledDays array
    // const formattedDate = formatDate(date);

    // if (cancelledDays.includes(formattedDate)) {
    //   return true; // Disable the date if it's in the cancelledDays array
    // }

    const dayIndex = date.getDay();

    // Check if the date is beyond the range or not in enabledDays
    if (date < today || date > maxDate || !enabledDays.has(dayIndex)) {
      return true;
    }

    // If the date is today, check if there are any remaining slots
    if (date.toDateString() === today.toDateString()) {
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
      const dayAvailability = availableTime.find(
        (day) => day.day === dayOfWeek
      );

      if (dayAvailability?.enabled) {
        const currentTime = new Date(); // Get the current time
        const currentTimeInMinutes =
          currentTime.getHours() * 60 + currentTime.getMinutes();

        // Check if any slots are still available today
        return !dayAvailability.times.some((timeSlot: any) => {
          const slotStartInMinutes = convertTimeToMinutes(timeSlot.start);
          return slotStartInMinutes > currentTimeInMinutes;
        });
      }
      return true; // If no availability for today
    }

    return false; // Allow selection otherwise
  };

  // Helper function: Convert time (e.g., "10:00 AM") to total minutes since midnight
  const convertTimeToMinutes = (time: string) => {
    const [hours, minutes, period] = time.match(/(\d+):(\d+) (\w+)/)!.slice(1);
    let hours24 = parseInt(hours, 10);
    if (period === "PM" && hours24 !== 12) hours24 += 12;
    if (period === "AM" && hours24 === 12) hours24 = 0;
    return hours24 * 60 + parseInt(minutes, 10);
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

      const cancelDays = cancelledDays.filter((item) => item.day === date);
      let checkCancelTimes = [];
      cancelDays.forEach((item) => {
        if (isTimeWithinRange(timeSlot, item.meeting.start, item.meeting.end)) {
          checkCancelTimes = checkCancelTimes.concat(timeSlot);
        }
      });

      // Only add the slot if it's not already booked or not cancelled
      if (!bookedTimes.has(timeSlot) && !checkCancelTimes.includes(timeSlot)) {
        slots.push(timeSlot);
      }

      startTime.setMinutes(startTime.getMinutes() + interval);
    }
    return slots;
  };

  function isTimeWithinRange(
    time: string,
    start: string,
    end: string
  ): boolean {
    const toMilitaryTime = (timeStr: string): number => {
      const [_, hours, minutes, period] = timeStr.match(
        /(\d{2}):(\d{2}) (AM|PM)/
      )!;
      let militaryHours = parseInt(hours);
      if (period === "PM" && hours !== "12") {
        militaryHours += 12;
      }
      return militaryHours * 60 + parseInt(minutes);
    };

    const timeInMinutes = toMilitaryTime(time);
    const startInMinutes = toMilitaryTime(start);
    const endInMinutes = toMilitaryTime(end);

    return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
  }

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

  const isUserMember = teamMembers.includes(userEmail);
  const isUserAdmin = userEmail === adminEmail;

  const handleJoinTeam = async () => {
    try {
      const response = await fetch(`${server}/api/teams/${teamId}/members`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ members: userEmail }),
      });

      if (response.ok) {
        toast("Successfully joined the team!");
        setTeamMembers([...teamMembers, userEmail]); // Update local team members
      } else {
        const errorData = await response.json();
        toast(errorData.message || "Failed to join the team");
      }
    } catch (error) {
      console.error("Error joining team:", error);
      toast("An error occurred while trying to join the team.");
    }
  };
  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="grid w-full px-5">
          <div>
            <div className="w-full px-3 py-4 relative z-20">
              <div className="grid w-full">
                <Label className="text-2xl font-bold text-black">
                  Schedule
                </Label>{" "}
                <Label className="text-xs text-gray-400">
                  Book an Appointment
                </Label>
              </div>
            </div>
          </div>

          <div className="flex relative w-full md:h-[800px] md:mt-24 sm:h-full">
            {teamName === "Not Found" ? (
              <>
                <h1>Team Not Found</h1>
              </>
            ) : (
              <>
                <Card className="flex flex-col md:flex-row w-full h-auto md:h-4/6 shadow-sm overflow-hidden ">
                  <CardHeader className="w-full border-b-[1px] md:w-1/6 md:border-r-[1px] border-gray-200 flex flex-col justify-between md:h-full">
                    <div className="md:flex sm:grid md:flex-col sm:grid-cols-2 h-full justify-between">
                      <div>
                        <CardTitle>Course: {teamName}</CardTitle>
                        <CardDescription>
                          Professor: {adminName}
                        </CardDescription>
                      </div>
                      <div className="flex w-full justify-center">
                        {/* <Button
                          onClick={() => {
                            navigator.clipboard.writeText(teamId);
                            toast(
                              `Invitation Code copied to clipboard!: ${teamId}`
                            );
                          }}
                          className="w-full"
                        >
                          Copy Invite Code
                        </Button> */}
                        <Button
                          onClick={() => {
                            const el = document.createElement("textarea");
                            el.value = teamId || "";
                            el.style.position = "absolute";
                            el.style.left = "-9999px"; // Move it out of view
                            document.body.appendChild(el);

                            el.select();
                            document.execCommand("copy"); // Fallback command for older browsers
                            document.body.removeChild(el);

                            toast("Team Code copied to clipboard!");
                          }}
                        >
                          Copy Team Code
                        </Button>
                      </div>
                    </div>
                    <div className="mt-auto max-md:hidden">
                      {!isUserAdmin && !isUserMember && (
                        <Button
                          className="w-full"
                          onClick={handleJoinTeam}
                          disabled={!loggedInUser}
                        >
                          Join Team
                        </Button>
                      )}
                      {!loggedInUser && (
                        <p className="text-xs text-gray-500 mt-1">
                          Log in to join a team.
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex w-full border-b-[1px] md:w-3/6 md:border-r-[1px] py-2 border-gray-200">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={disablePastDates}
                      showOutsideDays={false}
                      className="flex-1 max-h-[461px] overflow-y-auto mt-3 p-0"
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
                  <div className="w-full md:w-2/6 h-full overflow-y-auto flex flex-col">
                    <CardContent className="max-md:max-h-[27vh] h-1/2 w-full flex-1 py-2 border-b-[1px] border-gray-200 overflow-auto">
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
        </div>
      </div>
    </section>
  );
}
