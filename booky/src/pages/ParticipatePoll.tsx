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

interface TimeSlot {
  availableRate: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
}

const ParticipatePoll = () => {
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

  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set<string>());
  // Group availability state
  const [groupAvailability, setGroupAvailability] = useState<
    Map<string, Set<string>>
  >(new Map());

  async function fetchPollDetails() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${server}/api/polls/${urlPath}`);

      if (!response.ok) {
        toast.error("Failed to fetch poll details");
        throw new Error("Failed to fetch poll details");
      }

      const data = await response.json();

      setPollName(data.pollName);
      setStartTime(data.time.start);
      setEndTime(data.time.end);
      setDateRange(data.dateRange);

      // Convert participants data to Map
      const availabilityMap = new Map();
      Object.entries(data.participants).forEach(
        ([email, schedule]: [string, string]) => {
          availabilityMap.set(email, new Set(schedule));
        }
      );
      setGroupAvailability(availabilityMap);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      toast.error("Failed to load poll details");
    } finally {
      setIsLoading(false);
    }
  }

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
        console.log(response.url);
        toast.error("Failed to update availabilities");
        return;
      }

      // const data = await response.json();
      // if (data) {
      //   // Update local group availability state

      //   handleTimeSlots(selectedCells);
      // }
    } catch (error) {
      console.error("Error updating availability", error);
    }
  }

  useEffect(() => {
    fetchPollDetails();
  }, [urlPath]);

  // // Calendar grid state
  // const [selectedCells, setSelectedCells] = useState(new Set());
  // const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  // const [isSelecting, setIsSelecting] = useState<boolean>(true);

  // Generate time slots from 9 AM to 5 PM with 30-minute intervals
  const timeSlots = [];
  for (
    let hour = parseStringTimeToInt(startTime);
    hour <= parseStringTimeToInt(endTime);
    hour++
  ) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
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

  // const getCellId = (day, time) => `${day}-${time}`;

  // const handleMouseDown = (day, time) => {
  //   setIsMouseDown(true);
  //   const cellId = getCellId(day, time);
  //   setIsSelecting(!selectedCells.has(cellId));

  //   const newSelected = new Set(selectedCells);
  //   if (!selectedCells.has(cellId)) {
  //     newSelected.add(cellId);
  //   } else {
  //     newSelected.delete(cellId);
  //   }
  //   setSelectedCells(newSelected);
  // };

  // const handleMouseEnter = (day, time) => {
  //   if (isMouseDown) {
  //     const cellId = getCellId(day, time);
  //     const newSelected = new Set(selectedCells);

  //     if (isSelecting) {
  //       newSelected.add(cellId);
  //     } else {
  //       newSelected.delete(cellId);
  //     }
  //     setSelectedCells(newSelected);
  //   }
  // };

  // const handleMouseUp = () => {
  //   setIsMouseDown(false);
  // };

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const handleTimeSlots = (selectedTimeSlots: Set<string>) => {
    setSelectedTimeSlots(selectedTimeSlots);
    updateAvailability(selectedTimeSlots);
  };

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
                        urlPath={urlPath}
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
                    urlPath={urlPath}
                    timeSlots={timeSlots}
                    selectedDays={selectedDays}
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
};

// {/* <div className="flex">
// <div className="flex w-1/2 justify-center items-start">
//   <div className="space-y-4 mt-10">
//     <h1 className="font-bold text-2xl">{pollName}</h1>
//     <h2>{pollDescription}</h2>
//     <h2>
//       {dateRange.start.date} - {dateRange.end.date}
//     </h2>
//   </div>
// </div>
// <div className="w-1/2 p-8 overflow-x-auto">
//   {/* Availability Scheduler */}

//   <Card
//     className="border-none shadow-none"
//     onMouseUp={handleMouseUp}
//     onMouseLeave={handleMouseUp}
//   >
//     <CardContent className="p-4">
//       <div className="flex">
//         {/* Time labels column */}
//         <div className="w-20 pt-8">
//           {timeSlots.map((time, index) => {
//             const isHalfHour = time.endsWith("30");
//             if (!isHalfHour) {
//               return (
//                 <div key={time} className="h-12 relative">
//                   <span className="absolute right-2 top-0 text-sm whitespace-nowrap">
//                     {formatTime(time)}
//                   </span>
//                 </div>
//               );
//             }
//             return <div key={time} className="h-12" />;
//           })}
//         </div>

//         {/* Days columns */}
//         <div className="flex flex-1">
//           {selectedDays.map((day) => (
//             <div key={day} className="flex-1">
//               <div className="text-center font-medium mb-2">{day}</div>
//               <div className="flex flex-col">
//                 {timeSlots.map((time, index) => {
//                   const isHalfHour = time.endsWith("30");
//                   const cellId = getCellId(day, time);
//                   const isSelected = selectedCells.has(cellId);

//                   return (
//                     <div
//                       key={`${day}-${time}`}
//                       className={`
//                     h-12
//                     border-l border-r
//                     ${
//                       !isHalfHour
//                         ? "border-t"
//                         : "border-t border-t-dotted"
//                     }
//                     ${index === timeSlots.length - 1 ? "border-b" : ""}
//                     cursor-pointer
//                     transition-colors
//                     ${
//                       isSelected
//                         ? "bg-red-500"
//                         : "bg-gray-100 hover:bg-blue-100"
//                     }
//                   `}
//                       onMouseDown={() => handleMouseDown(day, time)}
//                       onMouseEnter={() => handleMouseEnter(day, time)}
//                     />
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// </div>
// </div> */}

export default ParticipatePoll;
