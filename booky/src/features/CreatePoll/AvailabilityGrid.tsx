import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/features/time";
import { useState } from "react";

type Props = {
  timeSlots: string[];
  selectedDays: string[];
  userEmail?: string;
  groupAvailability?: Map<string, Set<string>>;
};

const AvailabilityGrid = ({
  timeSlots,
  selectedDays,
  userEmail,
  groupAvailability = new Map(),
}: Props) => {
  const [selectedCells, setSelectedCells] = useState(new Set<string>());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSelecting, setIsSelecting] = useState(true);

  console.log(selectedCells);
  const getCellId = (day: string, time: string) => `${day}-${time}`;

  const handleMouseDown = (day: string, time: string) => {
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
  };

  const handleMouseEnter = (day: string, time: string) => {
    if (isMouseDown) {
      const cellId = getCellId(day, time);
      const newSelected = new Set(selectedCells);

      if (isSelecting) {
        newSelected.add(cellId);
      } else {
        newSelected.delete(cellId);
      }
      setSelectedCells(newSelected);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  // Calculate total participants and available count for each cell
  const getCellAvailability = (day: string, time: string) => {
    const cellId = getCellId(day, time);
    let availableCount = 0;
    const totalParticipants = groupAvailability.size;

    groupAvailability.forEach((availability) => {
      if (availability.has(cellId)) {
        availableCount++;
      }
    });

    return { availableCount, totalParticipants };
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* User's Availability Calendar */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {userEmail}'s Availability
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-200"></div>
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500"></div>
            <span>Available</span>
          </div>
        </div>
        <Card
          className="border-none shadow-none"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
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
      </div>

      {/* Group's Availability Calendar */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Group's Availability</h2>
        <div className="text-sm mb-4">
          Mouseover the Calendar to See Who Is Available
        </div>
        <Card className="border-none shadow-none">
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
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Separate component for the time grid
const TimeGrid = ({
  timeSlots,
  selectedDays,
  selectedCells,
  handleMouseDown,
  handleMouseEnter,
  groupAvailability,
  getCellAvailability,
  isUserGrid,
}) => {
  return (
    <div className="flex">
      {/* Time labels column */}
      <div className="w-20 pt-8">
        {timeSlots.map((time, index) => {
          const isHalfHour = time.endsWith("30");
          if (!isHalfHour) {
            return (
              <div key={time} className="h-12 relative">
                <span className="absolute right-2 top-0 text-sm whitespace-nowrap">
                  {formatTime(time)}
                </span>
              </div>
            );
          }
          return <div key={time} className="h-12" />;
        })}
      </div>

      {/* Days columns */}
      <div className="flex flex-1">
        {selectedDays.map((day) => (
          <div key={day} className="flex-1">
            <div className="text-center font-medium mb-2">{day}</div>
            <div className="flex flex-col">
              {timeSlots.map((time, index) => {
                const isHalfHour = time.endsWith("30");
                const cellId = `${day}-${time}`;
                const isSelected = selectedCells.has(cellId);

                // Calculate cell color based on whether it's user or group grid
                let cellColor = "bg-gray-100 hover:bg-blue-100";
                if (isUserGrid) {
                  cellColor = isSelected ? "bg-green-500" : "bg-pink-200";
                } else if (groupAvailability) {
                  const { availableCount, totalParticipants } =
                    getCellAvailability(day, time);
                  if (availableCount > 0) {
                    const opacity = (availableCount / totalParticipants) * 100;
                    cellColor = `bg-green-500 opacity-${opacity}`;
                  }
                }

                return (
                  <div
                    key={`${day}-${time}`}
                    className={`
                      h-12 
                      border-l border-r
                      ${!isHalfHour ? "border-t" : "border-t border-t-dotted"} 
                      ${index === timeSlots.length - 1 ? "border-b" : ""}
                      cursor-pointer
                      transition-colors
                      ${cellColor}
                    `}
                    onMouseDown={() => handleMouseDown?.(day, time)}
                    onMouseEnter={() => handleMouseEnter?.(day, time)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityGrid;
