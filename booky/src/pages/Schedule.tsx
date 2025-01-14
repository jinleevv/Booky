import { Label } from "@/components/ui/label";
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
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import ScheduleForm from "@/features/CreateAppointment/ScheduleForm";
import { useHook } from "@/hooks";
import { toast } from "sonner";
import { IoPersonCircle } from "react-icons/io5";

interface ITimeRange {
  start: string;
  end: string;
}

interface ICancelledDays {
  day: string;
  meeting: ITimeRange;
}

export default function Schedule() {
  const { code: teamId } = useParams();
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

  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [teamAdmins, setTeamAdmins] = useState<
    { email: string; name: string; role: string }[]
  >([]);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  useEffect(() => {
    if (selectedAdmin && availableTime) {
      updateEnabledDays(selectedAdmin);
    }
  }, [selectedAdmin, availableTime]);

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
    const dayAvailability = availableTime[selectedAdmin].find((day) => day.day === dayOfWeek);

    if (!dayAvailability || !dayAvailability.enabled) {
      setTimeSlots([]);
      return;
    }

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

  async function fetchTeamDetails() {
    try {
      const response = await fetch(`${server}/api/teams/${teamId}`);
      const data = await response.json();

      if (response.ok) {
        setTeamName(data.name);
        setAdminName(data.adminName);
        setAdminEmail(data.adminEmail);
        setAvailableTime(data.availableTime);
        setDuration(parseInt(data.durations[0], 10));
        setExistingAppointments(data.appointments);
        setTeamMembers(data.members);
        setCancelledDays(data.cancelledMeetings);
        setSelectedAdmin(data.adminEmail);

        // Combine admin and coadmins
        const teamAdmins = [
          { email: data.adminEmail, role: "Admin" },
          ...(data.coadmins || []).map((coadmin: any) => ({
            email: coadmin,
            role: "Coadmin",
          })),
        ];
        setTeamAdmins(teamAdmins);

        updateEnabledDays(data.adminEmail);
      } else {
        setTeamName("Not Found");
        setAdminName("Not Found");
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
    }
  }

  const updateEnabledDays = (email: string) => {
    const dayMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
  
    // Recalculate enabledDays based on the admin's availability
    const enabled = availableTime[email]?.reduce((acc: number[], day: any) => {
      if (day.enabled && dayMap[day.day] !== undefined) {
        acc.push(dayMap[day.day]);
      }
      return acc;
    }, []);
  
    setEnabledDays(new Set(enabled)); // Update the enabledDays state
  };

  const disableUnavailableDates = useCallback(
    (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate the maximum allowed date (7 days from today)
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 7);

      const dayIndex = date.getDay();

      // Check if the date is beyond the range or not in enabledDays
      if (date < today || date > maxDate || !enabledDays.has(dayIndex)) {
        return true;
      }

      // If the date is today, check if there are any remaining slots
      if (date.toDateString() === today.toDateString()) {
        const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
        const dayAvailability = availableTime[selectedAdmin].find(
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
    },
    [selectedAdmin, availableTime, enabledDays]
  );

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
        .filter((appointment) => appointment.day === date)
        .map((appointment) => appointment.time)
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

  const convertTo24Hour = (time: string) => {
    const [hours, minutes, period] = time.match(/(\d+):(\d+) (\w+)/)!.slice(1);
    let hours24 = parseInt(hours, 10);
    if (period === "PM" && hours24 !== 12) hours24 += 12;
    if (period === "AM" && hours24 === 12) hours24 = 0;
    return `${hours24.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleTimeSlotClick = (time: string) => {
    setSelectedTimeSlot(time);
  };

  const handleNewAppointment = (newAppointment: {
    day: string;
    time: string;
    email: string;
  }) => {
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
        setTeamMembers([...teamMembers, userEmail]);
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
            <Card className="flex flex-col md:flex-row w-full h-auto md:h-4/6 m-auto shadow-sm overflow-hidden">
              <CardHeader className="w-full border-b-[1px] md:w-1/6 md:border-r-[1px] border-gray-200 flex flex-col justify-between h-full max-w-full overflow-hidden">
                <div className="flex flex-col gap-4">
                  <div>
                    <CardTitle>Team: {teamName}</CardTitle>
                  </div>
                  <div className="flex flex-col gap-2">
                    {teamAdmins.map((user, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedAdmin(user.email);
                          updateEnabledDays(user.email);
                          setSelectedDate(undefined);
                          setTimeSlots([]);
                        }}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                          selectedAdmin === user.email ? "bg-gray-200" : "hover:bg-gray-100"
                        }`}
                      >
                        <IoPersonCircle size={24} className="text-gray-600" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            {user.email}
                          </span>
                          <span className="text-xs text-gray-500"> ({user.role})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="md:hidden flex flex-col justify-start items-end">
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
                  disabled={disableUnavailableDates}
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
                  <div className="flex justify-center mb-4">
                    <Label className="font-bold text-black">{selectedAdmin}</Label>
                  </div>
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