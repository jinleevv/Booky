import { formatTime } from "@/features/time";

export default function TimeGrid({
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
                console.log(selectedCells);

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
                            !isHalfHour
                              ? "border-t"
                              : "border-t border-t-dotted"
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
                            !isHalfHour
                              ? "border-t"
                              : "border-t border-t-dotted"
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
