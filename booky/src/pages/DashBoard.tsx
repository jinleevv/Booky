import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
import { useEffect, useState } from "react";
import { useHook } from "@/hooks";
import { toast } from "sonner";

export default function DashBoard() {
  const { server, userEmail } = useHook();

  const [upcomingOfficeHours, setUpcomingOfficeHours] = useState<any[]>([]);
  const [pastOfficeHours, setPastOfficeHours] = useState<any[]>([]);
  const [showUpcoming, setShowUpcoming] = useState(true); // Toggle between views

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
        const month = today.getMonth() + 1;
        const date = today.getDate();
        const year = today.getFullYear();
        const hour = today.getHours();
        const todayConverted = month + "-" + date + "-" + year;

        const upcoming = [];
        const past = [];
        const processedMeetings = new Set();

        teams.forEach((team) => {
          const teamName = team.name;
          const teamId = team._id;
          const teamAdmin = team.admin;
          const teamAvailableTime = team.availableTime;
          team.appointments.forEach((appointment) => {
            const daysOfWeek = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];

            const todayDate = new Date(todayConverted);
            const appointmentDate = new Date(appointment.day);
            const appointmentDay =
              daysOfWeek[new Date(appointment.day).getDay()];
            const dateDifference = Math.abs(
              todayDate.getDate() - appointmentDate.getDate()
            );

            Object.keys(teamAvailableTime).forEach((meetingHost) => {
              if (processedMeetings.has(appointment.token)) {
                return;
              }

              const appointmentAvailbleSlot = teamAvailableTime[
                meetingHost
              ].find((item) => item.day === appointmentDay);

              if (todayDate < appointmentDate) {
                if (dateDifference <= 7) {
                  let validStartTime;
                  let validEndTime;

                  appointmentAvailbleSlot.times.forEach((item) => {
                    const startTime = item.start;
                    const endTime = item.end;
                    const checkRange = isTimeWithinRange(
                      appointment.time,
                      startTime,
                      endTime
                    );
                    if (checkRange) {
                      validStartTime = startTime;
                      validEndTime = endTime;
                      return;
                    }
                  });

                  const checkDateEntry = upcoming.find(
                    (item) =>
                      item.date === appointment.day &&
                      item.start === validStartTime &&
                      item.end === validEndTime
                  );

                  if (!checkDateEntry) {
                    upcoming.push({
                      teamId: teamId,
                      admin: teamAdmin,
                      date: appointment.day,
                      day: appointmentDay,
                      start: validStartTime,
                      end: validEndTime,
                      team: teamName,
                      appointments: [],
                    });
                  }

                  const existingDateEntry = upcoming.find(
                    (item) =>
                      item.date === appointment.day &&
                      item.start === validStartTime &&
                      item.end === validEndTime
                  );

                  existingDateEntry.appointments.push({
                    time: appointment.time,
                    email: appointment.email,
                  });

                  processedMeetings.add(appointment.token);
                }
              } else if (todayDate > appointmentDate) {
                if (dateDifference <= 7) {
                  let validStartTime;
                  let validEndTime;

                  appointmentAvailbleSlot.times.forEach((item) => {
                    const startTime = item.start;
                    const endTime = item.end;
                    const checkRange = isTimeWithinRange(
                      appointment.time,
                      startTime,
                      endTime
                    );
                    if (checkRange) {
                      validStartTime = startTime;
                      validEndTime = endTime;
                      return;
                    }
                  });

                  const checkDateEntry = past.find(
                    (item) =>
                      item.date === appointment.day &&
                      item.start === validStartTime &&
                      item.end === validEndTime
                  );

                  if (!checkDateEntry) {
                    past.push({
                      teamId: teamId,
                      admin: teamAdmin,
                      date: appointment.day,
                      day: appointmentDay,
                      start: validStartTime,
                      end: validEndTime,
                      team: teamName,
                      appointments: [],
                    });
                  }

                  const existingDateEntry = past.find(
                    (item) =>
                      item.date === appointment.day &&
                      item.start === validStartTime &&
                      item.end === validEndTime
                  );

                  existingDateEntry.appointments.push({
                    time: appointment.time,
                    email: appointment.email,
                  });

                  processedMeetings.add(appointment.token);
                }
              } else {
                const [_, hours, __, period] = appointment.time.match(
                  /(\d{2}):(\d{2}) (AM|PM|a.m.|p.m.)/
                )!;
                let convertHours = parseInt(hours);
                if (
                  (period === "PM" || period === "p.m.") &&
                  convertHours !== 12
                ) {
                  convertHours += 12;
                }
                if (hour <= convertHours) {
                  let validStartTime;
                  let validEndTime;

                  appointmentAvailbleSlot.times.forEach((item) => {
                    const startTime = item.start;
                    const endTime = item.end;
                    const checkRange = isTimeWithinRange(
                      appointment.time,
                      startTime,
                      endTime
                    );
                    if (checkRange) {
                      validStartTime = startTime;
                      validEndTime = endTime;
                      return;
                    }
                  });

                  const checkDateEntry = upcoming.find(
                    (item) =>
                      item.date === appointment.day &&
                      item.start === validStartTime &&
                      item.end === validEndTime
                  );

                  if (!checkDateEntry) {
                    upcoming.push({
                      teamId: teamId,
                      admin: teamAdmin,
                      date: appointment.day,
                      day: appointmentDay,
                      start: validStartTime,
                      end: validEndTime,
                      team: teamName,
                      appointments: [],
                    });
                  }

                  const existingDateEntry = upcoming.find(
                    (item) =>
                      item.date === appointment.day &&
                      item.start === validStartTime &&
                      item.end === validEndTime
                  );

                  existingDateEntry.appointments.push({
                    time: appointment.time,
                    email: appointment.email,
                  });

                  processedMeetings.add(appointment.token);
                } else {
                  let validStartTime;
                  let validEndTime;

                  appointmentAvailbleSlot.times.forEach((item) => {
                    const startTime = item.start;
                    const endTime = item.end;
                    const checkRange = isTimeWithinRange(
                      appointment.time,
                      startTime,
                      endTime
                    );
                    if (checkRange) {
                      validStartTime = startTime;
                      validEndTime = endTime;
                      return;
                    }
                  });

                  const checkDateEntry = past.find(
                    (item) =>
                      item.date === appointment.day &&
                      item.start === validStartTime &&
                      item.end === validEndTime
                  );

                  if (!checkDateEntry) {
                    past.push({
                      teamId: teamId,
                      admin: teamAdmin,
                      date: appointment.day,
                      day: appointmentDay,
                      start: validStartTime,
                      end: validEndTime,
                      team: teamName,
                      appointments: [],
                    });
                  }

                  const existingDateEntry = past.find(
                    (item) =>
                      item.date === appointment.day &&
                      item.start === validStartTime &&
                      item.end === validEndTime
                  );

                  existingDateEntry.appointments.push({
                    time: appointment.time,
                    email: appointment.email,
                  });

                  processedMeetings.add(appointment.token);
                }
              }
            });
          });
        });

        let filteredUpcoming = upcoming;
        teams.forEach((team) => {
          team.cancelledMeetings.forEach((cancelledMeeting) => {
            filteredUpcoming = filteredUpcoming.filter((item) => {
              const isCancelled =
                item.date === cancelledMeeting.day &&
                item.start === cancelledMeeting.meeting.start &&
                item.end === cancelledMeeting.meeting.end;

              return !isCancelled;
            });
          });
        });

        const timeToMinutes = (time: string): number => {
          const [_, hours, minutes, period] = time.match(
            /(\d{2}):(\d{2}) (AM|PM|a.m.|p.m.)/
          )!;
          let militaryHours = parseInt(hours);
          if ((period === "PM" || period === "p.m.") && militaryHours !== 12)
            militaryHours += 12;
          if ((period === "AM" || period === "a.m.") && militaryHours === 12)
            militaryHours = 0;
          return militaryHours * 60 + parseInt(minutes);
        };

        filteredUpcoming.sort((a, b) => {
          // Compare by date first
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime(); // Sort by date
          }

          // If dates are equal, compare by start time
          const startMinutesA = timeToMinutes(a.start);
          const startMinutesB = timeToMinutes(b.start);

          return startMinutesA - startMinutesB; // Sort by start time
        });

        past.sort((a, b) => {
          // Compare by date first
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime(); // Sort by date
          }

          // If dates are equal, compare by start time
          const startMinutesA = timeToMinutes(a.start);
          const startMinutesB = timeToMinutes(b.start);

          return startMinutesA - startMinutesB; // Sort by start time
        });

        setUpcomingOfficeHours(filteredUpcoming);
        setPastOfficeHours(past);
      } catch (error) {
        toast("Unable to fetch the meeting information");
        console.log(error);
      }
    };

    fetchOfficeHours();
  }, [userEmail]);

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

  const handleCancel = async (
    cancelledDate: string,
    teamId: string,
    start: string,
    end: string
  ) => {
    try {
      const response = await fetch(`${server}/api/teams/${teamId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancelledDate: cancelledDate,
          start: start,
          end: end,
        }),
      });

      if (!response.ok) throw toast("Failed to cancel office hour");

      toast(`Successfully cancelled office hour for ${cancelledDate}`);

      // Remove cancelled office hour from state
      const filteredUpcoming = upcomingOfficeHours.filter((item) => {
        const isCancelled =
          item.date === cancelledDate &&
          item.start === start &&
          item.end === end;

        return !isCancelled; // Keep items that are not cancelled
      });
      setUpcomingOfficeHours(filteredUpcoming);
    } catch (error) {
      toast("Failed to cancel office hour.");
    }
  };

  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="w-full px-3 py-4 relative z-20">
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
            </div>
            <div className="border border-dashed rounded-md p-4">
              <Accordion
                type="single"
                collapsible
                className="w-full border-b-0"
              >
                {showUpcoming ? (
                  <>
                    {upcomingOfficeHours.length === 0 ? (
                      <>
                        <div className="w-full text-center">
                          <Label>No Meetings</Label>
                        </div>
                      </>
                    ) : (
                      <>
                        {upcomingOfficeHours.map((meeting, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>
                              <div className="flex w-full justify-between">
                                <Label className="font-bold">
                                  {meeting.date}, {meeting.team}
                                </Label>
                                <Label className="mr-2">
                                  {meeting.start} - {meeting.end}
                                </Label>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="flex w-full justify-between items-center mt-3">
                                <div className="w-full space-y-2">
                                  {meeting.appointments.map(
                                    (appointment, subIndex) => (
                                      <div className="flex w-full justify-between text-sm">
                                        <div>
                                          <Label className="text-black font-bold">
                                            Time:{" "}
                                          </Label>
                                          <Label className="text-gray-600">
                                            {appointment.time}
                                          </Label>
                                        </div>
                                        <div>
                                          <Label className="font-bold text-black">
                                            Email:{" "}
                                          </Label>{" "}
                                          <Label className="text-gray-600">
                                            {appointment.email}
                                          </Label>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                              {meeting.admin === userEmail ? (
                                <div className="flex w-full justify-end mt-5">
                                  <Button
                                    variant="outline"
                                    className="ml-4"
                                    onClick={() => {
                                      handleCancel(
                                        meeting.date,
                                        meeting.teamId,
                                        meeting.start,
                                        meeting.end
                                      );
                                    }}
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
                    {pastOfficeHours.length === 0 ? (
                      <>
                        <div className="w-full text-center">
                          <Label>No Meetings</Label>
                        </div>
                      </>
                    ) : (
                      <>
                        {pastOfficeHours.map((meeting, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>
                              <div className="flex w-full justify-between">
                                <Label className="font-bold">
                                  {meeting.date}, {meeting.team}
                                </Label>
                                <Label className="mr-2">
                                  {meeting.start} - {meeting.end}
                                </Label>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="flex w-full justify-between items-center mt-3">
                                <div className="w-full space-y-2">
                                  {meeting.appointments.map(
                                    (appointment, subIndex) => (
                                      <div className="flex w-full justify-between text-sm">
                                        <div>
                                          <Label className="text-black font-bold">
                                            Time:{" "}
                                          </Label>
                                          <Label className="text-gray-600">
                                            {appointment.time}
                                          </Label>
                                        </div>
                                        <div>
                                          <Label className="font-bold text-black">
                                            Email:{" "}
                                          </Label>{" "}
                                          <Label className="text-gray-600">
                                            {appointment.email}
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
