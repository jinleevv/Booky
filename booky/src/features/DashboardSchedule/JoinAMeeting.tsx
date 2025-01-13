import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import ScheduleForm from "@/features/CreateAppointment/ScheduleForm";
import { IoPersonCircle } from "react-icons/io5";
import { Trash } from "lucide-react";
import { TbEdit, TbCalendarCancel } from "react-icons/tb";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useHook } from "@/hooks";

interface ITimeRange {
  start: string;
  end: string;
}

interface ICancelledDays {
  day: string;
  meeting: ITimeRange;
}

interface IJoinAMeetingProps {
  teamId: string;
  teamName: string;
  setTeamName: React.Dispatch<React.SetStateAction<string>>;
  adminName: string;
  setAdminName: React.Dispatch<React.SetStateAction<string>>;
  adminEmail: string;
  setAdminEmail: React.Dispatch<React.SetStateAction<string>>;
  teamCoAdmin: string[];
  setTeamCoAdmin: React.Dispatch<React.SetStateAction<string[]>>;
  teamMembers: string[];
  setTeamMembers: React.Dispatch<React.SetStateAction<string[]>>;
  availableTimes: any[];
  setAvailableTimes: React.Dispatch<React.SetStateAction<any[]>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  existingAppointments: any[];
  setExistingAppointments: React.Dispatch<React.SetStateAction<any[]>>;
  cancelledDays: ICancelledDays[];
  setCancelledDays: React.Dispatch<React.SetStateAction<ICancelledDays[]>>;
  selectedHost: string | null;
  setSelectedHost: React.Dispatch<React.SetStateAction<string | null>>;
  enabledDays: Set<number>;
  setEnabledDays: React.Dispatch<React.SetStateAction<Set<number>>>;
}

export default function JoinAMeeting({
  teamId,
  teamName,
  setTeamName,
  adminName,
  setAdminName,
  adminEmail,
  setAdminEmail,
  teamCoAdmin,
  setTeamCoAdmin,
  teamMembers,
  setTeamMembers,
  availableTimes,
  setAvailableTimes,
  duration,
  setDuration,
  existingAppointments,
  setExistingAppointments,
  cancelledDays,
  setCancelledDays,
  selectedHost,
  setSelectedHost,
  enabledDays,
  setEnabledDays,
}: IJoinAMeetingProps) {
  const { server, userEmail, loggedInUser } = useHook();

  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [userSelectedDate, setUserSelectedDate] = useState<string>(""); //Kind of redundent
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);

  useEffect(() => {
    if (selectedHost && availableTimes) {
      updateEnabledDays(selectedHost);
    }
  }, [selectedHost, availableTimes]);

  // Generate time slots when the selected date changes.
  useEffect(() => {
    if (!selectedDate || availableTimes.length === 0) return;
    const month = selectedDate.getMonth() + 1;
    const date = selectedDate.getDate();
    const year = selectedDate.getFullYear();

    setUserSelectedDate(month + "-" + date + "-" + year);

    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const dayAvailability = availableTimes[selectedHost].find(
      (day) => day.day === dayOfWeek
    );

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
  }, [selectedDate, availableTimes, duration, existingAppointments]);

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
    const enabled = availableTimes[email]?.reduce((acc: number[], day: any) => {
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
        const dayAvailability = availableTimes[adminEmail].find(
          (day) => day.day === dayOfWeek
        );

        if (dayAvailability?.enabled) {
          const currentTime = new Date();
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
    [selectedHost, availableTimes, enabledDays]
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
        /(\d{2}):(\d{2}) (AM|PM|a.m.|p.m.)/
      )!;
      let militaryHours = parseInt(hours);
      if ((period === "PM" || period === "p.m.") && hours !== "12") {
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
    <div className="flex relative w-full md:h-[800px] md:mt-24 sm:h-full">
      {teamName === "Not Found" ? (
        <>
          <h1>Team Not Found</h1>
        </>
      ) : (
        <>
          <Card className="flex flex-col md:flex-row w-full h-auto md:h-4/6 shadow-sm overflow-hidden ">
            <CardHeader className="flex flex-col w-full border-b-[1px] md:w-1/6 md:border-r-[1px] p-4 border-gray-200 justify-between md:h-full max-w-full overflow-hidden">
              <div className="flex flex-col gap-4 h-full">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {teamName}
                  </CardTitle>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="grid w-full gap-1">
                    <Label className="text-medium font-bold">Admin</Label>
                    <div className="w-full h-full overflow-hidden">
                      <Button
                        variant="ghost"
                        className="flex w-full justify-start"
                        onClick={() => setSelectedHost(adminEmail)}
                      >
                        <Label
                          className={`flex w-full gap-1 font-normal ${
                            selectedHost == adminEmail
                              ? "text-red-700"
                              : "text-black"
                          }`}
                        >
                          <IoPersonCircle size={24} className="text-gray-600" />
                          <div
                            className="overflow-auto w-full text-left"
                            title={adminEmail}
                          >
                            {adminEmail}
                          </div>
                        </Label>
                      </Button>
                    </div>
                  </div>
                  <div className="grid w-full gap-1">
                    <Label className="text-medium font-bold">Co-Admin</Label>
                    <div className="w-full h-full overflow-x-hidden overflow-y-auto">
                      {teamCoAdmin.map((email) => (
                        <Button
                          variant="ghost"
                          className="flex w-full justify-start"
                          onClick={() => {
                            setSelectedHost(email);
                            setSelectedMeeting(null);
                          }}
                        >
                          <Label
                            className={`flex w-full gap-1 font-normal ${
                              selectedHost == email
                                ? "text-red-700"
                                : "text-black"
                            }`}
                          >
                            <IoPersonCircle
                              size={24}
                              className="text-gray-600"
                            />
                            <div
                              className="overflow-auto w-full text-left"
                              title={email}
                            >
                              {email}
                            </div>
                          </Label>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex w-full mt-auto">
                  <Button
                    onClick={() => {
                      const el = document.createElement("textarea");
                      el.value = teamId || "";
                      el.style.position = "absolute";
                      el.style.left = "-9999px";
                      document.body.appendChild(el);

                      el.select();
                      document.execCommand("copy");
                      document.body.removeChild(el);

                      toast("Team Code copied to clipboard!");
                    }}
                    className="w-full"
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
              {selectedMeeting === null ? (
                <div className="flex flex-col w-full mt-1.5 p-0 gap-2">
                  <Label className="text-lg font-bold">Meetings</Label>
                  {selectedHost ? (
                    <>
                      {availableTimes
                        .filter((meeting) => meeting.email === selectedHost)
                        .map((meeting) => (
                          <Card
                            className="w-1/2 border rounded-3xl shadow-md cursor-pointer"
                            onClick={() => setSelectedMeeting("")}
                          >
                            <CardHeader className="pt-4">
                              <CardTitle className="flex justify-between">
                                <div className="flex my-auto gap-1">
                                  <Label className="text-lg font-bold">
                                    {meeting.meeting.name}
                                  </Label>
                                  <div className="my-auto">
                                    {(adminEmail === userEmail ||
                                      teamCoAdmin.includes(userEmail)) && (
                                      <Button
                                        variant="ghost"
                                        className="w-5 h-5"
                                      >
                                        <TbEdit size={10} />
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                <div className="my-auto">
                                  {(adminEmail === userEmail ||
                                    teamCoAdmin.includes(userEmail)) && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        className="w-5 h-5"
                                      >
                                        <TbCalendarCancel size={10} />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        className="text-red-700 hover:text-red-700 w-5 h-5"
                                      >
                                        <Trash size={10} />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </CardTitle>
                              <CardDescription className="grid space-y-1">
                                <Label className="text-xs">
                                  Meeting Type: {meeting.meeting.schedule}
                                </Label>
                                <Label className="text-xs">
                                  Description: {meeting.meeting.description}
                                </Label>
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ))}
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
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
              )}
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
                    <p className="col-span-2 text-center">No available slots</p>
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
  );
}
