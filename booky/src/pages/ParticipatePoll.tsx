import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AvailabilityCalendar from "@/features/CreatePoll/AvailabilityCalendar";
import ParticipatePollForm from "@/features/CreatePoll/ParticipatePollForm";
import NavigationBar from "@/features/NavigationBar";
import { days, parseStringTimeToInt } from "@/features/time";
import { useHook } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface Participant {
  email: string;
  schedule: string[];
}

export default function ParticipatePoll() {
  const { id: urlPath } = useParams<{ id: string }>();
  const { server } = useHook();

  // Crucial states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const [pollName, setPollName] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    start: { date: string; day: number };
    end: { date: string; day: number };
  }>({ start: { date: "", day: 0 }, end: { date: "", day: 0 } });
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set<string>());

  // Group availability state
  const [groupAvailability, setGroupAvailability] = useState<
    Map<string, Set<string>>
  >(new Map());

  useEffect(() => {
    async function fetchPollDetails() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${server}/api/polls/${urlPath}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          toast.error("Failed to fetch poll details");
          throw new Error("Failed to fetch poll details");
        }

        const data = await response.json();

        setPollName(data.pollName);
        setStartTime(data.time.start);
        setEndTime(data.time.end);
        setDateRange(data.dateRange);
        // populate participants state
        setParticipants(data.participants as Participant[]);

        // Convert participants data to Map
        const availabilityMap = new Map<string, Set<string>>();
        for (const participant of participants) {
          console.log("This is participant", participant.email);
          availabilityMap.set(participant.email, new Set(participant.schedule));
        }

        setGroupAvailability(availabilityMap);

        console.log("This is map", groupAvailability);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
        toast.error("Failed to load poll details");
      } finally {
        setIsLoading(false);
      }
    }
    if (urlPath) {
      fetchPollDetails();
    }
  }, [server, urlPath]);

  async function updateAvailability(selectedSlots: Set<string>) {
    try {
      const response = await fetch(
        `${server}/api/polls/${urlPath}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: userEmail,
            selectedSlots: Array.from(selectedSlots),
          }),
        }
      );

      if (!response.ok) {
        toast.error("Failed to update availabilities");
        return;
      }
    } catch (error) {
      console.error("Error updating availability", error);
    }
  }

  async function getAvailability() {
    try {
      const response = await fetch(`${server}/api/polls/${urlPath}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        toast.error("Failed to fetch cell availability");
        return;
      }

      const data = await response.json();

      // populate participants state
      setParticipants(data.participants);

      // Convert participants data to Map
      const availabilityMap = new Map();
      for (const participant of participants) {
        availabilityMap.set(participant.email, new Set(participant.schedule));
      }

      setGroupAvailability(availabilityMap);
    } catch (error) {
      console.error("Error fetching cell availability", error);
    }
  }

  // Generate time slots from 9 AM to 5 PM with 30-minute intervals
  const timeSlots = [];
  for (
    let hour = parseStringTimeToInt(startTime);
    hour < parseStringTimeToInt(endTime);
    hour++
  ) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }

  if (endTime.endsWith("30")) {
    timeSlots.push(`${parseStringTimeToInt(endTime)}:00`);
  }

  // Generate the days as columns for time slots
  const selectedDays = [];
  if (dateRange.start && dateRange.end) {
    if (dateRange.start.day > dateRange.end.day) {
      for (let i = dateRange.start.day; i <= 6; i++) {
        selectedDays.push(days[i]);
      }
      for (let i = 0; i <= dateRange.end.day; i++) {
        selectedDays.push(days[i]);
      }
    } else {
      for (let i = dateRange.start.day; i <= dateRange.end.day; i++) {
        selectedDays.push(days[i]);
      }
    }
  }

  function handleLogin(email: string) {
    setIsLoggedIn(true);
    setUserEmail(email);
    getAvailability();
  }

  function handleTimeSlots(selectedTimeSlots: Set<string>) {
    setSelectedTimeSlots(selectedTimeSlots);
    updateAvailability(selectedTimeSlots);
    getAvailability();
  }

  return (
    <section className="h-screen min-w-screen bg-white font-outfit">
      <NavigationBar />
      <main className="container mx-auto py-8 px-12">
        <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2 translate-x-1/2"></div>
        <h2 className="text-2xl font-bold">{pollName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Poll details */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="w-full py-4 relative z-10">
                {!isLoggedIn ? (
                  <ParticipatePollForm onLogin={handleLogin} />
                ) : (
                  <Card className="h-full shadow-none">
                    <CardContent className="p-6">
                      <AvailabilityCalendar
                        calendarType="user"
                        timeSlots={timeSlots}
                        userEmail={userEmail}
                        selectedDays={selectedDays}
                        groupAvailability={groupAvailability}
                        handleTimeSlots={handleTimeSlots}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Time slots */}
                <motion.div
                  className="mt-8 bg-white w-4/5 px-8 py-6  space-y-2 rounded-2xl border"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <div className="flex items-center justify-between mb-4 bg-white">
                    <h3 className="font-semibold">Available Time</h3>
                    <Button variant="outline" size="sm">
                      Manually Create Meeting
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {timeSlots.map((slot, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium">
                            {slot.availableRate}
                          </span>
                          <span className="text-sm text-gray-600">
                            {slot.date}
                          </span>
                          <span className="text-sm text-gray-600">
                            {slot.time}
                          </span>
                          <span className="text-xs text-gray-500">
                            {slot.participants}/{slot.maxParticipants}{" "}
                            participants
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleTimeSlotSelect(`${slot.date}-${slot.time}`)
                          }
                          className={
                            selectedTimeSlots.has(`${slot.date}-${slot.time}`)
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : ""
                          }
                        >
                          {selectedTimeSlots.has(`${slot.date}-${slot.time}`)
                            ? "Selected"
                            : "Select Time"}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className=" w-full py-4 relative z-10">
            {/* Right Side Calendar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Card className="h-full shadow-none">
                <CardContent className="p-6">
                  <AvailabilityCalendar
                    calendarType="group"
                    timeSlots={timeSlots}
                    selectedDays={selectedDays}
                    userEmail={userEmail}
                    groupAvailability={groupAvailability}
                    handleTimeSlots={handleTimeSlots}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </section>
  );
}
