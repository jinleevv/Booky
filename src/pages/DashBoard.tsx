import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
import { auth } from "../../firebase";
import { useEffect, useState } from "react";

export default function DashBoard() {
  const [upcomingOfficeHours, setUpcomingOfficeHours] = useState<any[]>([]);
  const [pastOfficeHours, setPastOfficeHours] = useState<any[]>([]);
  const [showUpcoming, setShowUpcoming] = useState(true); // Toggle between views

  useEffect(() => {
    const fetchOfficeHours = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const response = await fetch(
          `http://localhost:5001/api/teams?admin=${user.email}`
        );
        if (!response.ok) throw new Error("Failed to fetch teams");

        const teams = await response.json();
        const today = new Date();

        const upcoming = [];
        const past = [];

        teams.forEach((team: any) => {
          team.availableTime.forEach((timeSlot: any) => {
            if (timeSlot.enabled) {
              const closestDate = getClosestDate(timeSlot.day);
              const slotDate = new Date(closestDate);

              // Filter appointments for this time slot
              const appointmentsForThisTimeSlot = team.appointments.filter(
                (appointment: any) =>
                  getDayNameFromDate(appointment.day) === timeSlot.day &&
                  parseTimeString(appointment.time) >=
                    parseTimeString(timeSlot.times[0].start) &&
                  parseTimeString(appointment.time) <=
                    parseTimeString(timeSlot.times[0].end)
              );

              const officeHour = {
                nextDate: closestDate,
                timeRange: `${timeSlot.times[0].start} - ${timeSlot.times[0].end}`,
                day: timeSlot.day,
                teamName: team.name,
                teamId: team._id,
                appointments: appointmentsForThisTimeSlot,
              };

              // Categorize as past or upcoming
              if (slotDate >= today) {
                upcoming.push(officeHour);
              } else if (slotDate >= getDaysAgo(today, 7)) {
                past.push(officeHour);
              }
            }
          });
        });

        setUpcomingOfficeHours(upcoming);
        setPastOfficeHours(past);
      } catch (error) {
        console.error("Error fetching office hours:", error);
      }
    };

    fetchOfficeHours();
  }, []);

  const getClosestDate = (day: string) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const todayIndex = today.getDay();
    const targetIndex = daysOfWeek.indexOf(day);

    let daysToAdd = targetIndex - todayIndex;
    if (daysToAdd < 0) daysToAdd += 7;

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysToAdd);

    // Format the date as MM-DD-YYYY
    const month = String(nextDate.getMonth() + 1).padStart(2, "0"); // Month is zero-based
    const date = String(nextDate.getDate()).padStart(2, "0");
    const year = nextDate.getFullYear();

    return `${month}-${date}-${year}`;
  };

  const getDayNameFromDate = (dateStr: string) => {
    const date = new Date(Date.parse(dateStr));
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return daysOfWeek[date.getDay()];
  };

  const getDaysAgo = (date: Date, days: number) => {
    const pastDate = new Date(date);
    pastDate.setDate(date.getDate() - days);
    return pastDate;
  };

  const parseTimeString = (timeStr: string) => {
    const normalizedTimeStr = timeStr
      .replace("p.m.", "PM")
      .replace("a.m.", " AM");

    const [time, modifier] = normalizedTimeStr.split(" ");
    let [hours, minutes] = time.split(":").map((str) => parseInt(str));

    if (modifier === "PM" && hours !== 12) hours += 12;
    else if (modifier === "AM" && hours === 12) hours = 0;

    return new Date(1970, 0, 1, hours, minutes, 0);
  };

  const handleCancel = async (cancelledDate: string, teamId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/teams/${teamId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cancelledDate: cancelledDate }),
        }
      );

      if (!response.ok) throw new Error("Failed to cancel office hour");

      alert(`Successfully cancelled office hour for ${cancelledDate}`);

      // Remove cancelled office hour from state
      setUpcomingOfficeHours((prev) =>
        prev.filter((item) => item.nextDate !== cancelledDate)
      );
    } catch (error) {
      console.error("Error cancelling office hour:", error);
      alert("Failed to cancel office hour.");
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
                variant={showUpcoming ? "default" : "ghost"}
                onClick={() => setShowUpcoming(true)}
                className="w-20"
              >
                Upcoming
              </Button>
              <Button
                variant={!showUpcoming ? "default" : "ghost"}
                onClick={() => setShowUpcoming(false)}
                className="w-12"
              >
                Past
              </Button>
            </div>
            <div className="border rounded-md p-4">
              <Accordion type="multiple">
                {(showUpcoming ? upcomingOfficeHours : pastOfficeHours).length >
                0 ? (
                  (showUpcoming ? upcomingOfficeHours : pastOfficeHours).map(
                    (appointment, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>
                          {appointment.teamName} {appointment.nextDate} -{" "}
                          {appointment.timeRange}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex justify-between items-center mt-3">
                            <div className="space-y-2">
                              {appointment.appointments.length > 0 ? (
                                appointment.appointments.map(
                                  (subAppointment, subIndex) => (
                                    <Label
                                      key={subIndex}
                                      className="block text-sm text-gray-600"
                                    >
                                      ({subAppointment.time}) -{" "}
                                      {subAppointment.email}
                                    </Label>
                                  )
                                )
                              ) : (
                                <Label className="text-gray-500">
                                  No appointments for this time slot.
                                </Label>
                              )}
                            </div>
                            <Button
                              variant="destructive"
                              className="ml-4"
                              onClick={() =>
                                handleCancel(
                                  appointment.nextDate,
                                  appointment.teamId
                                )
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  )
                ) : (
                  <Label className="text-gray-500">
                    No {showUpcoming ? "upcoming" : "past"} office hours.
                  </Label>
                )}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
