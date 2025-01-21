import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/features/time";
import { useHook } from "@/hooks";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type AvailabilityCalendarProps = {
  calendarType: "user" | "group";
  userEmail?: string;
  timeSlots: string[];
  selectedDays: string[];
  groupAvailability?: Map<string, Set<string>>;
  handleTimeSlots?: (selectedTimeSlots: Set<string>) => void;
};

export default function AvailabilityCalendar({
  calendarType,
  timeSlots,
  selectedDays,
  userEmail,
  groupAvailability,
  handleTimeSlots,
}: AvailabilityCalendarProps) {
  const { id: urlPath } = useParams<string>();
  const { server } = useHook();

  const [selectedCells, setSelectedCells] = useState(new Set<string>());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSelecting, setIsSelecting] = useState(true);
  // fetching group availability
  async function fetchGroupAvailability() {
    const response = await fetch(`${server}/api/polls/${urlPath}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Failed to fetch group availability", data);
      return;
    }
    console.log("groupAvailability iin calendar", data.participants);
  }

  useEffect(() => {
    if (calendarType === "group") {
      fetchGroupAvailability();
    }
  }, []);

  function getCellId(day: string, time: string) {
    return `${day}-${time}`;
  }

  function handleMouseDown(day: string, time: string) {
    setIsMouseDown(true);
    const cellId = getCellId(day, time);
    setIsSelecting(!selectedCells.has(cellId));

    const newSelected = new Set(selectedCells);
    if (!selectedCells.has(cellId)) {
      newSelected.add(cellId);
    } else {
      newSelected.delete(cellId);
    }
    setSelectedCells(newSelected);
    handleTimeSlots(newSelected);
  }

  function handleMouseEnter(day: string, time: string) {
    if (isMouseDown) {
      const cellId = getCellId(day, time);
      const newSelected = new Set(selectedCells);

      if (isSelecting) {
        newSelected.add(cellId);
      } else {
        newSelected.delete(cellId);
      }
      setSelectedCells(newSelected);
      handleTimeSlots(newSelected);
    }
  }

  function handleMouseUp() {
    setIsMouseDown(false);
  }

  // Calculate total participants and available count for each cell
  function getCellAvailability(day: string, time: string) {
    const cellId = getCellId(day, time);
    let availableCount = 0;
    const totalParticipants = groupAvailability.size + (userEmail ? 1 : 0); // Include current user

    // Check group availability
    groupAvailability.forEach((availability) => {
      if (availability.has(cellId)) {
        availableCount++;
      }
    });

    // Include current user's selection
    if (selectedCells.has(cellId)) {
      availableCount++;
    }

    return { availableCount, totalParticipants };
  }

  return (
    <>
      {calendarType == "user" ? (
        <Card
          className="border-none shadow-none"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <h2 className="text-md font-semibold mb-4">
            {userEmail}'s Availability
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500"></div>
              <span>Available</span>
            </div>
          </div>
          <CardContent className="p-4">
            <TimeGrid
              timeSlots={timeSlots}
              selectedDays={selectedDays}
              selectedCells={selectedCells}
              handleMouseDown={handleMouseDown}
              handleMouseEnter={handleMouseEnter}
              groupAvailability={groupAvailability}
              getCellAvailability={getCellAvailability}
              isUserGrid={true}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-none">
          <h2 className="text-md font-semibold mb-4">Group's Availability</h2>
          <div className="text-sm mb-4">
            Mouseover the Calendar to See Who Is Available
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span>
              {groupAvailability.size + (userEmail ? 1 : 0)} Participant
              {groupAvailability.size + (userEmail ? 1 : 0) !== 1 && "s"}
            </span>
          </div>
          <CardContent className="p-4">
            <TimeGrid
              timeSlots={timeSlots}
              selectedDays={selectedDays}
              selectedCells={selectedCells}
              handleMouseDown={handleMouseDown}
              handleMouseEnter={handleMouseEnter}
              groupAvailability={groupAvailability}
              getCellAvailability={getCellAvailability}
              isUserGrid={false}
              userEmail={userEmail}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}

// Separate component for the time grid
function TimeGrid({
  timeSlots,
  selectedDays,
  selectedCells,
  handleMouseDown,
  handleMouseEnter,
  groupAvailability,
  getCellAvailability,
  isUserGrid,
  userEmail,
}: {
  timeSlots: string[];
  selectedDays: string[];
  selectedCells: Set<string>;
  handleMouseDown?: (day: string, time: string) => void;
  handleMouseEnter?: (day: string, time: string) => void;
  groupAvailability: Map<string, Set<string>>;
  getCellAvailability: (
    day: string,
    time: string
  ) => { availableCount: number; totalParticipants: number };
  isUserGrid: boolean;
  userEmail?: string;
}) {
  function getOpacityClass(availableCount: number, totalParticipants: number) {
    if (totalParticipants === 0) return "opacity-0";
    const percentage = (availableCount / totalParticipants) * 100;
    if (percentage === 0) return "opacity-0";
    if (percentage <= 25) return "opacity-25";
    if (percentage <= 50) return "opacity-50";
    if (percentage <= 75) return "opacity-75";
    return "opacity-100";
  }

  return (
    <div className="flex">
      {/* Time labels column */}
      <div className="w-20 pt-8">
        {timeSlots.map((time, index) => {
          const isHalfHour = time.endsWith("30");
          if (!isHalfHour) {
            return (
              <div key={time} className="h-8 relative">
                <span className="absolute right-2 top-0 text-sm whitespace-nowrap">
                  {formatTime(time)}
                </span>
              </div>
            );
          }
          return <div key={time} className="h-8" />;
        })}
      </div>

      {/* Days columns */}
      <div className="flex flex-1">
        {selectedDays.map((day, index) => (
          <div key={day} className="flex-1">
            <div className="text-center font-medium mb-2">{day}</div>
            <div key={`${day}-${index}`} className="flex flex-col">
              {timeSlots.map((time, index) => {
                const isHalfHour = time.endsWith("30");
                const cellId = `${day}-${time}`;
                const isSelected = selectedCells.has(cellId);

                const { availableCount, totalParticipants } =
                  getCellAvailability(day, time);

                const opacityClass = isUserGrid
                  ? selectedCells.has(cellId)
                    ? "opacity-100"
                    : "opacity-0"
                  : getOpacityClass(availableCount, totalParticipants);

                // Calculate cell color based on whether it's user or group grid
                let cellColor = "bg-gray-100";
                if (isUserGrid) {
                  cellColor = isSelected ? "bg-red-500" : "bg-gray-100";
                } else if (groupAvailability && userEmail) {
                  cellColor = isSelected ? "bg-red-500" : "bg-gray-100";
                  const { availableCount, totalParticipants } =
                    getCellAvailability(day, time);
                  if (availableCount > 0) {
                    const opacity = (availableCount / totalParticipants) * 100;
                    cellColor = `bg-red-500 ${opacityClass}`;
                  }
                }
                return (
                  <>
                    {isUserGrid ? (
                      <div
                        key={`${day}-${time}`}
                        className={`
                        h-8
                        border-l border-r
                        ${
                          !isHalfHour ? "border-t" : "border-t border-t-dotted"
                        } 
                        ${index === timeSlots.length - 1 ? "border-b" : ""}
                        cursor-pointer
                        transition-colors
                        ${cellColor}
                      `}
                        onMouseDown={() =>
                          isUserGrid && handleMouseDown?.(day, time)
                        }
                        onMouseEnter={() =>
                          isUserGrid && handleMouseEnter?.(day, time)
                        }
                      />
                    ) : (
                      <div
                        key={`${day}-${time}`}
                        className={`
                        h-8
                        border-l border-r
                        ${
                          !isHalfHour ? "border-t" : "border-t border-t-dotted"
                        } 
                        ${index === timeSlots.length - 1 ? "border-b" : ""}
                        cursor-pointer
                        transition-colors
                        ${cellColor}
                      `}
                      />
                    )}
                  </>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
