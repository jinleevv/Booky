import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
import { auth } from "../../firebase";
import { useEffect, useState } from "react";

export default function DashBoard() {
  const [upcomingOfficeHours, setUpcomingOfficeHours] = useState<
    { nextDate: string; timeRange: string; day: string; teamName: string; appointments: { time: string; email: string; name: string }[] }[]
  >([]);

  useEffect(() => {
    const fetchOfficeHours = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const response = await fetch(`http://localhost:5001/api/teams?admin=${user.email}`);
        if (!response.ok) throw new Error("Failed to fetch teams");

        const teams = await response.json();
        const officeHours = [];
        

        teams.forEach((team: any) => {
          team.availableTime.forEach((timeSlot: any) => {
            if (timeSlot.enabled) {
              const closestDate = getClosestDate(timeSlot.day);
              // Filter the appointments for this time slot based on matching day and time
              const appointmentsForThisTimeSlot = team.appointments.filter(
                (appointment: any) =>
                  getDayNameFromDate(appointment.day) === timeSlot.day &&
                  parseTimeString(appointment.time) >= parseTimeString(timeSlot.times[0].start) &&
                  parseTimeString(appointment.time) <= parseTimeString(timeSlot.times[0].end)
              );
              officeHours.push({
                nextDate: closestDate,
                timeRange: `${timeSlot.times[0].start} - ${timeSlot.times[0].end}`,
                day: timeSlot.day,
                teamName: team.name,
                appointments: appointmentsForThisTimeSlot,
              });
            }
          });
        });

        setUpcomingOfficeHours(officeHours);
      } catch (error) {
        console.error("Error fetching office hours:", error);
      }
    };

    fetchOfficeHours();
  }, []);

  const getClosestDate = (day: string) => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    const todayIndex = today.getDay();
    const targetIndex = daysOfWeek.indexOf(day);

    let daysToAdd = targetIndex - todayIndex;
    if (daysToAdd < 0) daysToAdd += 7;

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysToAdd);

    return nextDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  };

  const getDayNameFromDate = (dateStr: string) => {
    const date = new Date(Date.parse(dateStr));
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOfWeek[date.getDay()];
  };

  const parseTimeString = (timeStr: string) => {
    // Normalize to uppercase "AM" or "PM" for consistency
    const normalizedTimeStr = timeStr.replace("p.m.", "PM").replace("a.m.", " AM");

    const [time, modifier] = normalizedTimeStr.split(" ");
    let [hours, minutes] = time.split(":").map((str) => parseInt(str));  // Convert both hours and minutes to numbers

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    } else if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
  
    return new Date(1970, 0, 1, hours, minutes, 0); // Return as Date object
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
                variant="ghost"
                className="text-red-700 hover:text-red-700 w-20"
              >
                Upcoming
              </Button>
              <Button variant="ghost" className="w-20">
                Recurring
              </Button>
              <Button variant="ghost" className="w-12">
                Past
              </Button>
            </div>
            <div className="border rounded-md p-4">
              <Accordion type="multiple">
                {upcomingOfficeHours.length > 0 ? (
                  upcomingOfficeHours.map((appointment, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>
                        {appointment.teamName} {appointment.nextDate} - {appointment.timeRange} 
                      </AccordionTrigger>
                      <AccordionContent>                        
                        {/* Appointment Listings */}
                        <div className="mt-3 space-y-2">
                          {appointment.appointments.length > 0 ? (
                            appointment.appointments.map((subAppointment, subIndex) => (
                              <Label key={subIndex} className="block text-sm text-gray-600">
                                ({subAppointment.time}) - {subAppointment.email}
                              </Label>
                            ))
                          ) : (
                            <Label className="text-gray-500">No appointments for this time slot.</Label>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <Label className="text-gray-500">No upcoming office hours.</Label>
                )}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
