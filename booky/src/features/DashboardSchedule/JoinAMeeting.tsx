import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { IoPersonCircle } from "react-icons/io5";
import { Trash } from "lucide-react";
import { TbEdit, TbCalendarCancel } from "react-icons/tb";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useHook } from "@/hooks";
import { IoIosAdd } from "react-icons/io";
import ScheduleForm from "../CreateAppointment/ScheduleForm";

interface TimeSlot {
  day: string;
  slots: string[]; // You can replace `any` with a more specific type for slots if available
}

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
  teamDescription: string;
  adminEmail: string;
  teamCoAdmin: string[];
  teamMembers: string[];
  setTeamMembers: React.Dispatch<React.SetStateAction<string[]>>;
  meetingTeam: any[];
  setMeetingTeam: React.Dispatch<React.SetStateAction<any>>;
  existingAppointments: any[];
  cancelledDays: ICancelledDays[];
  selectedHost: string | null;
  setSelectedHost: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function JoinAMeeting({
  teamId,
  teamName,
  teamDescription,
  adminEmail,
  teamCoAdmin,
  teamMembers,
  setTeamMembers,
  meetingTeam,
  setMeetingTeam,
  selectedHost,
  setSelectedHost,
}: IJoinAMeetingProps) {
  const { server, userEmail, loggedInUser } = useHook();

  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const [duration, setDuration] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const [selectedMeetingTeam, setSelectedMeetingTeam] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [enabledDays, setEnabledDays] = useState<Array<string>>([]);

  const [groupMeetingStatus, setGroupMeetingStatus] = useState<boolean>(false);

  useEffect(() => {
    setTimeSlots([]);

    if (selectedHost && selectedMeetingTeam) {
      updateEnabledDaysAndDisabledDates(selectedMeetingTeam);
    }
  }, [selectedHost, selectedMeetingTeam]);

  // Generate time slots when the selected date changes.
  useEffect(() => {
    if (!selectedDate || !selectedMeetingTeam) return;
    if (selectedMeetingTeam.type === "group") {
      return;
    }
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0"); // Add leading zero if needed
    const date = selectedDate.getDate().toString().padStart(2, "0"); // Add leading zero if needed
    const year = selectedDate.getFullYear();

    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const dayAvailability = selectedMeetingTeam.weekSchedule.find(
      (day) => day.day === dayOfWeek
    );

    if (!dayAvailability || !dayAvailability.enabled) {
      const updateTimeSlots = [{ day: `${year}-${month}-${date}`, slots: [] }];
      setTimeSlots([...timeSlots, ...updateTimeSlots]);
      return;
    }

    let newTimeSlots = [...timeSlots];

    dayAvailability.times.forEach((time) => {
      const generatedTimeSlots = generateTimeSlots(
        year + "-" + month + "-" + date,
        time.start,
        time.end,
        parseInt(duration, 10)
      );

      const existingDate = timeSlots.find(
        (slot) => slot.day === `${year}-${month}-${date}`
      );

      if (!existingDate) {
        // If the date doesn't exist, add a new object for this date with the generated slots
        newTimeSlots.push({
          day: `${year}-${month}-${date}`,
          slots: generatedTimeSlots,
        });
      }
    });
    setTimeSlots(newTimeSlots);
  }, [selectedDate]);

  function updateEnabledDaysAndDisabledDates(selectedMeetingTeam) {
    const meetingDates = [];
    const meetings = selectedMeetingTeam.meeting;
    meetings.forEach((meeting) => {
      meetingDates.push(meeting.date);
    });

    setEnabledDays(meetingDates);
  }

  // Utility function to generate time slots
  function generateTimeSlots(
    date: string,
    start: string,
    end: string,
    interval: number
  ) {
    const slots: string[] = [];
    const startTime = new Date(`1970-01-01T${convertTo24Hour(start)}`);
    const endTime = new Date(`1970-01-01T${convertTo24Hour(end)}`);

    // Check for booked times of the meeting
    let bookedTimes = [];

    if (selectedMeetingTeam.meeting.length !== 0) {
      selectedMeetingTeam.meeting.map((m) => {
        if (m.date === date && m.time.start === start && m.time.end) {
          bookedTimes = m.attendees;
        }
      });
    }

    // Check for cancelled date
    selectedMeetingTeam.cancelledMeetings.map((m) => {
      if (m.date === date && m.time === start) {
        return [];
      }
    });

    while (startTime < endTime) {
      const timeSlot = startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      slots.push(timeSlot);

      startTime.setMinutes(startTime.getMinutes() + interval);
    }

    const finalSlots = slots.filter((item) => {
      return !bookedTimes.some((booked) => booked.time === item);
    });
    return finalSlots;
  }

  // Utility to convert 12-hour time to 24-hour time format
  function convertTo24Hour(time: string) {
    const [hours, minutes, period] = time.match(/(\d+):(\d+) (\w+)/)!.slice(1);
    let hours24 = parseInt(hours, 10);
    if (period === "PM" && hours24 !== 12) hours24 += 12;
    if (period === "AM" && hours24 === 12) hours24 = 0;
    return `${hours24.toString().padStart(2, "0")}:${minutes}`;
  }

  const isUserMember = teamMembers.includes(userEmail);
  const isUserAdmin = userEmail === adminEmail;

  async function handleJoinTeam() {
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
  }

  async function handleRemoveMeetingTeam(meetingTeamId: string) {
    try {
      const response = await fetch(
        `${server}/api/teams/${teamId}/team-meetings/${meetingTeamId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        toast("Failed to delete the team meeting");
        return;
      }

      setMeetingTeam((prevMeetings) =>
        prevMeetings.filter((meeting) => meeting._id !== meetingTeamId)
      );
      toast("Team meeting deleted successfully!");
    } catch (error) {
      console.error("Error deleting team meeting:", error);
      toast("An error occurred while deleting the team meeting.");
    }
  }

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
                            setSelectedMeetingTeam(null);
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
              {selectedMeetingTeam === null ? (
                <div className="flex flex-col w-full mt-1.5 p-0 gap-2 overflow-y-auto">
                  <div className="flex w-full justify-between">
                    <Label className="text-lg font-bold">Meetings</Label>
                    <div>
                      <Button
                        onClick={() =>
                          navigate(`/dashboard/${teamId}/create-meeting`)
                        }
                      >
                        <IoIosAdd />
                        New Meeting
                      </Button>
                    </div>
                  </div>

                  {selectedHost ? (
                    <>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-3 w-full">
                        {meetingTeam
                          .filter(
                            (meetingTeam) =>
                              meetingTeam.hostEmail === selectedHost
                          )
                          .map((meetingTeam) => (
                            <Card
                              className="w-full border rounded-3xl shadow-md cursor-pointer"
                              onClick={() => {
                                setSelectedMeetingTeam(meetingTeam);
                                setDuration(meetingTeam.duration);
                              }}
                            >
                              <CardHeader className="pt-4">
                                <CardTitle className="flex flex-wrap justify-between">
                                  <div className="flex flex-wrap my-auto gap-1">
                                    <Label className="text-lg font-bold">
                                      {meetingTeam.meetingName}
                                    </Label>
                                    <div className="my-auto">
                                      {(adminEmail === userEmail ||
                                        teamCoAdmin.includes(userEmail)) && (
                                        <Button
                                          variant="ghost"
                                          className="w-5 h-5"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(
                                              `/dashboard/${teamId}/edit-meetingTeam/${meetingTeam._id}`
                                            );
                                          }}
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
                                        <Dialog
                                          open={isDialogOpen}
                                          onOpenChange={setIsDialogOpen}
                                        >
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              className="text-red-700 hover:text-red-700 w-5 h-5"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setIsDialogOpen(true);
                                              }}
                                            >
                                              <Trash size={10} />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <DialogHeader>
                                              <DialogTitle>
                                                Delete Meeting
                                              </DialogTitle>
                                              <DialogDescription>
                                                Are you sure you want to delete
                                                this meeting? This action cannot
                                                be undone.
                                              </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                              <Button
                                                variant="outline"
                                                onClick={(e) => {
                                                  setIsDialogOpen(false);
                                                }}
                                              >
                                                Cancel
                                              </Button>
                                              <Button
                                                variant="destructive"
                                                onClick={(e) => {
                                                  handleRemoveMeetingTeam(
                                                    meetingTeam._id
                                                  );
                                                  setIsDialogOpen(false);
                                                }}
                                              >
                                                Delete
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </>
                                    )}
                                  </div>
                                </CardTitle>
                                <CardDescription className="grid space-y-1">
                                  <Label className="text-xs">
                                    Meeting Type: {meetingTeam.schedule}
                                  </Label>
                                  <Label className="text-xs">
                                    Description:{" "}
                                    {meetingTeam.meetingDescription}
                                  </Label>
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          ))}
                      </div>
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
                  disabled={(date) => {
                    const today = new Date(); 
                    today.setHours(0, 0, 0, 0);
                
                    const dateISO = date.toISOString().split("T")[0];
                
                    return date < today || !enabledDays.some((enabledDate) => enabledDate === dateISO);
                  }}
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
                  {selectedDate ? (
                    selectedMeetingTeam.type == "group" ? (
                      <Button
                        variant="outline"
                        className={cn(
                          "p-4 text-center rounded-lg",
                          groupMeetingStatus
                            ? "bg-black text-white"
                            : "bg-white"
                        )}
                        disabled={true}
                      >
                        Attend Group Meeting
                      </Button>
                    ) : (
                      timeSlots.length > 0 ? (
                        timeSlots
                        .filter((timeSlot) => timeSlot.day === selectedDate.toISOString().split("T")[0]) // Filter slots for the selected date
                        .map((timeSlot) =>
                          timeSlot.slots.map((time) => (
                            <Button
                              key={`${timeSlot.day}-${time}`} // Combine day and time for a unique key
                              variant="outline"
                              className={cn(
                                "p-4 text-center rounded-lg",
                                selectedTimeSlot === time
                                  ? "bg-black text-white"
                                  : "bg-white"
                              )}
                              onClick={() => setSelectedTimeSlot(time)} // Set the selected time slot
                            >
                              {time}
                            </Button>
                          ))
                        )
                    ) : (<p className="col-span-2 text-center">No available slots</p>)
                      
                    )
                  ) : (
                    <p className="col-span-2 text-center">No available slots</p>
                  )}
                </div>
              </CardContent>
              <ScheduleForm
                selectedMeetingTeam={selectedMeetingTeam}
                selectedDate={selectedDate ? selectedDate.toISOString().split("T")[0] : null}
                selectedTime={selectedTimeSlot}
                teamId={teamId!}
                timeSlots={timeSlots}
                setTimeSlots={setTimeSlots}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
