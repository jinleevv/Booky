import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Ban, BanIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
import { RiArrowDropDownLine } from "react-icons/ri";
import { TbCalendar } from "react-icons/tb";
import { useEffect, useState } from "react";
import { useHook } from "@/hooks";
import { toast } from "sonner";

export default function DashBoard() {
  const { server, userEmail } = useHook();

  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [pastMeetings, setPastMeetings] = useState<any[]>([]);
  const [showUpcoming, setShowUpcoming] = useState(true); // Toggle between views
  const [cancelledMeetings, setCancelledMeetings] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<number>(7);

  useEffect(() => {
    const fetchOfficeHours = async () => {
      try {
        const response = await fetch(
          `${server}/api/teams/by-user?userEmail=${userEmail}`
        );

        if (!response.ok) {
          toast("Unable to fetch user information");
          return;
        }

        const teams = await response.json();

        const today = new Date();
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const date = today.getDate().toString().padStart(2, "0");
        const year = today.getFullYear();
        const hour = today.getHours();
        const todayConverted = year + "-" + month + "-" + date;

        const upcoming = [];
        const past = [];
        const cancelled = [];

        teams.forEach((team) => {
          team.meetingTeam.forEach((meetingTeam) => {
            cancelled.push(
              ...meetingTeam.cancelledMeetings.map((meeting) => meeting._id)
            );
            meetingTeam.meeting.forEach((meeting) => {
              if (meeting.date >= todayConverted) {
                upcoming.push({
                  teamId: team._id,
                  teamName: team.teamName,
                  meetingTeamId: meetingTeam._id,
                  meetingTeamName: meetingTeam.meetingName,
                  meetingId: meeting._id,
                  meetingHostEmail: meetingTeam.hostEmail,
                  date: meeting.date,
                  time: meeting.time,
                  attendees: meeting.attendees,
                });
              } else {
                past.push({
                  teamId: team._id,
                  teamName: team.teamName,
                  meetingTeamName: meetingTeam.meetingName,
                  meetingId: meeting._id,
                  meetingHostEmail: meetingTeam.hostEmail,
                  date: meeting.date,
                  time: meeting.time,
                  attendees: meeting.attendees,
                });
              }
            });
          });
        });

        // sort upcoming and past meetings by date
        upcoming.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        past.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Only show meetings within dateRange
        const upcomingDateLimit = new Date(today);
        upcomingDateLimit.setDate(today.getDate() + dateRange);
        const formattedUpcomingDateLimit = upcomingDateLimit
          .toISOString()
          .split("T")[0];
        const filteredUpcoming = upcoming.filter(
          (meeting) => meeting.date <= formattedUpcomingDateLimit
        );

        const pastDateLimit = new Date(today);
        pastDateLimit.setDate(today.getDate() - dateRange);
        const formattedPastDateLimit = pastDateLimit
          .toISOString()
          .split("T")[0];
        const filteredPast = past.filter(
          (meeting) => meeting.date >= formattedPastDateLimit
        );

        setUpcomingMeetings(filteredUpcoming);
        setPastMeetings(filteredPast);
        setCancelledMeetings(cancelled);
      } catch (error) {
        toast("Unable to fetch the meeting information");
        console.log(error);
      }
    };

    fetchOfficeHours();
  }, [userEmail, dateRange]);

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

  async function handleCancel(
    teamId: string,
    meetingTeamId: string,
    meetingId: string,
    cancelledDate: string,
    start: string,
    end: string
  ) {
    try {
      const response = await fetch(
        `${server}/api/teams/cancel/${teamId}/${meetingTeamId}/${meetingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cancelledDate: cancelledDate,
            start: start,
            end: end,
          }),
        }
      );

      if (!response.ok) {
        toast("Failed to cancel the meeting");
        return;
      }

      setCancelledMeetings((prev) => [...prev, meetingId]);
      toast(`Successfully cancelled the meeting`);
    } catch (error) {
      console.error("Error cancelling meeting:", error);
      toast("Failed to cancel the meeting.");
    }
  }

  function getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return "th"; // Special case for 11th-19th
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  function formatDateWithOrdinal(dateStr: string): string {
    const parsedDate = dateStr.split("-");
    const date = new Date(dateStr); // Convert YYYY-MM-DD to Date object
    const dayNumber = parsedDate[2];
    const monthName = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(date);

    return `${monthName} ${dayNumber}${getOrdinalSuffix(
      parseInt(dayNumber, 10)
    )}, ${date.getFullYear()}`;
  }

  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="w-full px-3 py-4 relative z-20 font-outfit">
          <Label className="text-2xl font-bold text-black">Meetings</Label>
          <div className="w-full h-5/6 mt-3 space-y-3">
            <div className="flex gap-1">
              <Button
                variant={"ghost"}
                onClick={() => setShowUpcoming(true)}
                className={`w-20 h-8 ${
                  showUpcoming
                    ? " text-red-700 hover:text-red-700 hover:bg-gray-100"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                Upcoming
              </Button>
              <Button
                variant={"ghost"}
                onClick={() => setShowUpcoming(false)}
                className={`w-12 h-8 ${
                  !showUpcoming
                    ? " text-red-700 hover:text-red-700 hover:bg-gray-100"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                Past
              </Button>
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    className="hover:bg-slate-100 p-1 rounded-lg"
                  >
                    <div className="flex gap-1">
                      <TbCalendar size={15} />
                      <Label className="font-bold m-auto">
                        Date Range: {dateRange} days
                      </Label>
                      <RiArrowDropDownLine className="m-auto" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-32">
                    <DropdownMenuItem onClick={() => setDateRange(1)}>
                      <span>1 Day</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDateRange(7)}>
                      <span>1 Week</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDateRange(31)}>
                      <span>1 Month</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="border border-dashed rounded-md p-4">
              <Accordion
                type="single"
                collapsible
                className="w-full border-b-0"
              >
                {showUpcoming ? (
                  <>
                    {upcomingMeetings.length === 0 ? (
                      <>
                        <div className="w-full text-center">
                          <Label>No Meetings</Label>
                        </div>
                      </>
                    ) : (
                      <>
                        {upcomingMeetings.map((meeting, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>
                              <div className="flex w-full justify-between">
                                <Label className="flex gap-2 font-bold">
                                  {cancelledMeetings.some(
                                    (cancelled) =>
                                      cancelled === meeting.meetingId
                                  ) ? (
                                    <BanIcon
                                      className="text-red-700"
                                      size={15}
                                    />
                                  ) : (
                                    <></>
                                  )}
                                  {`${formatDateWithOrdinal(
                                    meeting.date
                                  )} \u00A0\u00A0\u00A0 ${meeting.teamName}: ${
                                    meeting.meetingTeamName
                                  }`}
                                </Label>
                                <Label className="mr-2">
                                  {meeting.time.start} - {meeting.time.end}
                                </Label>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="flex w-full justify-between items-center mb-3">
                                <div className="w-full space-y-2">
                                  {meeting.attendees.map(
                                    (attendee, subIndex) => (
                                      <div className="flex w-full justify-between text-sm">
                                        <div>
                                          <Label className="font-bold text-black">
                                            Email:{" "}
                                          </Label>{" "}
                                          <Label className="text-gray-600">
                                            {attendee.participantEmail}
                                          </Label>
                                        </div>
                                        <div>
                                          <Label className="text-black font-bold">
                                            Time:{" "}
                                          </Label>
                                          <Label className="text-gray-600">
                                            {attendee.time}
                                          </Label>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                              {meeting.meetingHostEmail === userEmail ? (
                                <div className="flex w-full justify-end mt-2">
                                  <Button
                                    variant="outline"
                                    className="ml-4"
                                    onClick={() =>
                                      handleCancel(
                                        meeting.teamId,
                                        meeting.meetingTeamId,
                                        meeting.meetingId,
                                        meeting.date,
                                        meeting.time.start,
                                        meeting.time.end
                                      )
                                    }
                                    disabled={cancelledMeetings.some(
                                      (cancelled) =>
                                        cancelled === meeting.meetingId
                                    )}
                                  >
                                    Cancel the Meeting
                                  </Button>
                                </div>
                              ) : (
                                <></>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {pastMeetings.length === 0 ? (
                      <>
                        <div className="w-full text-center">
                          <Label>No Meetings</Label>
                        </div>
                      </>
                    ) : (
                      <>
                        {pastMeetings.map((meeting, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>
                              <div className="flex w-full justify-between">
                                <Label className="font-bold">
                                  {meeting.date}, {meeting.teamName}:{" "}
                                  {meeting.meetingTeamName}
                                </Label>
                                <Label className="mr-2">
                                  {meeting.time.start} - {meeting.time.end}
                                </Label>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="flex w-full justify-between items-center mt-3">
                                <div className="w-full space-y-2">
                                  {meeting.attendees.map(
                                    (attendee, subIndex) => (
                                      <div className="flex w-full justify-between text-sm">
                                        <div>
                                          <Label className="text-black font-bold">
                                            Time:{" "}
                                          </Label>
                                          <Label className="text-gray-600">
                                            {attendee.time}
                                          </Label>
                                        </div>
                                        <div>
                                          <Label className="font-bold text-black">
                                            Email:{" "}
                                          </Label>{" "}
                                          <Label className="text-gray-600">
                                            {attendee.participantEmail}
                                          </Label>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </>
                    )}
                  </>
                )}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
