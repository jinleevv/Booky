import UserAvailability from "@/features/CreatePoll/UserAvailability";
import NavigationBar from "@/features/NavigationBar";
import { days, parseStringTimeToInt } from "@/features/time";
import { useHook } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
export interface Participant {
  email: string;
  schedule: string[];
}

interface DateRange {
  start: { date: string; day: number };
  end: { date: string; day: number };
}

interface TimeRange {
  start: string;
  end: string;
  q;
}

export interface PollData {
  _id: string;
  pollName: string;
  pollDescription?: string;
  urlPath: string;
  dateRange: DateRange;
  time: TimeRange;
  participants: Participant[];
  createdAt: Date;
  updatedAt?: Date;
}

export default function ParticipatePoll() {
  const { id: urlPath } = useParams<{ id: string }>();
  const { server } = useHook();

  // Crucial states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const [pollName, setPollName] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    start: { date: string; day: number };
    end: { date: string; day: number };
  }>({ start: { date: "", day: 0 }, end: { date: "", day: 0 } });
  const [poll, setPoll] = useState<PollData>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  // Group availability state
  const [groupAvailability, setGroupAvailability] = useState<
    Map<string, Set<string>>
  >(new Map());

  useEffect(() => {
    async function fetchPollDetails() {
      try {
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
        setPoll(data as PollData);

        // Convert participants data to Map
        const availabilityMap = new Map<string, Set<string>>();
        for (const participant of participants) {
          availabilityMap.set(participant.email, new Set(participant.schedule));
        }
      } catch (error) {
        toast.error("Failed to load poll details");
      }
    }
    if (urlPath && poll === undefined) {
      fetchPollDetails();
    }
  }, [server, urlPath]);

  async function getAvailability(email: string) {
    try {
      const response = await fetch(
        `${server}/api/polls/${urlPath}/availability`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
        if (participant.email === email) {
          setSelectedCells(new Set(participant.schedule));
        }
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
    getAvailability(email);
  }

  return (
    <section className="h-screen min-w-screen bg-white font-outfit">
      <NavigationBar />
      <main className="container mx-auto py-8 px-12">
        <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2 translate-x-1/2"></div>
        <div className="flex gap-4 items-baseline">
          <h2 className="text-2xl font-bold">{pollName}</h2>
          <p className="">
            <span>Share link:</span> {urlPath}
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-8">
          {/* Poll details */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <UserAvailability
                poll={poll}
                isLoggedIn={isLoggedIn}
                handleLogin={handleLogin}
                timeSlots={timeSlots}
                userEmail={userEmail}
                selectedDays={selectedDays}
                groupAvailability={groupAvailability}
                selectedCells={selectedCells}
                setSelectedCells={setSelectedCells}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </section>
  );
}
