import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/features/time";
import { useState } from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ParticipatePoll = () => {
  // Calendar grid state
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [isSelecting, setIsSelecting] = useState<boolean>(true);

  // Generate time slots from 9 AM to 5 PM with 30-minute intervals
  const timeSlots = [];
  for (let hour = 9; hour <= 21; hour++) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }

  const getCellId = (day, time) => `${day}-${time}`;

  const handleMouseDown = (day, time) => {
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

  const handleMouseEnter = (day, time) => {
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

  return (
    <div className="w-2/3 p-8 overflow-x-auto">
      {/* Availability Scheduler */}

      <Card
        className="border-none shadow-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <CardContent className="p-4">
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
              {days.map((day) => (
                <div key={day} className="flex-1">
                  <div className="text-center font-medium mb-2">{day}</div>
                  <div className="flex flex-col">
                    {timeSlots.map((time, index) => {
                      const isHalfHour = time.endsWith("30");
                      const cellId = getCellId(day, time);
                      const isSelected = selectedCells.has(cellId);

                      return (
                        <div
                          key={`${day}-${time}`}
                          className={`
                            h-12 
                            border-l border-r
                            ${
                              !isHalfHour
                                ? "border-t"
                                : "border-t border-t-dotted"
                            } 
                            ${index === timeSlots.length - 1 ? "border-b" : ""}
                            cursor-pointer
                            transition-colors
                            ${
                              isSelected
                                ? "bg-red-500"
                                : "bg-gray-100 hover:bg-blue-100"
                            }
                          `}
                          onMouseDown={() => handleMouseDown(day, time)}
                          onMouseEnter={() => handleMouseEnter(day, time)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParticipatePoll;
