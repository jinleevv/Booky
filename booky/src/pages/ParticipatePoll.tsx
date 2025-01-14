import AvailabilityCalendar from "@/features/CreatePoll/AvailabilityCalendar";
import ParticipatePollForm from "@/features/CreatePoll/ParticipatePollForm";
import NavigationBar from "@/features/NavigationBar";
import { parseStringTimeToInt } from "@/features/time";
import { useHook } from "@/hooks";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ParticipatePoll = () => {
  const { id: urlPath } = useParams<{ id: string }>();
  const { server } = useHook();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [pollName, setPollName] = useState<string>("");
  const [pollDescription, setPollDescription] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    start: { date: string; day: number };
    end: { date: string; day: number };
  }>({ start: { date: "", day: 0 }, end: { date: "", day: 0 } });

  // Group availability state
  const [groupAvailability, setGroupAvailability] = useState<
    Map<string, Set<string>>
  >(new Map());

  useEffect(() => {
    fetchPollDetails();
  }, [urlPath]);

  async function fetchPollDetails() {
    try {
      const response = await fetch(`${server}/api/polls/${urlPath}`);
      const data = await response.json();

      if (response.ok) {
        setPollName(data.pollName);
        setPollDescription(data.pollDescription);
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
      }
    } catch (err) {
      console.log("Error fetching poll details");
    }
  }

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

  return (
    <section className="h-screen w-screen bg-white">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto">
            <ParticipatePollForm
              pollName={pollName}
              pollDescription={pollDescription}
              startDate={dateRange.start.date}
              endDate={dateRange.end.date}
              onLogin={handleLogin}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold">{pollName}</h1>
              {pollDescription && <p className="mt-2">{pollDescription}</p>}
              <p className="mt-2">
                {dateRange.start.date} - {dateRange.end.date}
              </p>
            </div>

            <AvailabilityCalendar
              timeSlots={timeSlots}
              selectedDays={selectedDays}
              userEmail={userEmail}
              groupAvailability={groupAvailability}
            />
          </div>
        )}
      </div>
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
