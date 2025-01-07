import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AvailabilityScheduler() {
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSelecting, setIsSelecting] = useState(true);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // Generate time slots from 9 AM to 5 PM with 30-minute intervals
  const timeSlots = [];
  for (let hour = 9; hour <= 21; hour++) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${period}`;
  };

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
                              ? "bg-blue-500"
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
  );
}
