import { formatTime } from "@/features/time";

export default function TimeGrid({
  timeSlots,
  selectedDays,
  selectedCells,
  setHoveredCell,
  handleMouseDown,
  handleMouseEnter,
  groupAvailability,
  getCellAvailability,
  getAvailableUsers,
  isUserGrid,
}: {
  timeSlots: string[];
  selectedDays: string[];
  selectedCells: Set<string>;
  setHoveredCell: (cell: { day: string; time: string } | null) => void;
  handleMouseDown?: (day: string, time: string) => void;
  handleMouseEnter?: (day: string, time: string) => void;
  groupAvailability: Map<string, Set<string>>;
  getCellAvailability: (
    day: string,
    time: string
  ) => { availableCount: number; totalParticipants: number };
  getAvailableUsers: (day: string, time: string) => string[];
  isUserGrid: boolean;
}) {
  function getColorIntensity(
    availableCount: number,
    totalParticipants: number
  ) {
    if (totalParticipants === 0) return "bg-gray-100";
    const percentage = availableCount / totalParticipants;
    if (percentage > 0 && percentage <= 1 / 11) return "bg-red-50";
    if (percentage > 1 / 11 && percentage <= 2 / 11) return "bg-red-100";
    if (percentage > 2 / 11 && percentage <= 3 / 11) return "bg-red-200";
    if (percentage > 3 / 11 && percentage <= 4 / 11) return "bg-red-300";
    if (percentage > 4 / 11 && percentage <= 5 / 11) return "bg-red-400";
    if (percentage > 5 / 11 && percentage <= 6 / 11) return "bg-red-500";
    if (percentage > 6 / 11 && percentage <= 7 / 11) return "bg-red-600";
    if (percentage > 7 / 11 && percentage <= 8 / 11) return "bg-red-700";
    if (percentage > 8 / 11 && percentage <= 9 / 11) return "bg-red-800";
    if (percentage > 9 / 11 && percentage <= 10 / 11) return "bg-red-900";
    return "bg-red-950";
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

                const colorIntensity = isUserGrid
                  ? selectedCells.has(cellId)
                    ? "opacity-100"
                    : "opacity-0"
                  : getColorIntensity(availableCount, totalParticipants);

                // Calculate cell color based on whether it's user or group grid
                let cellColor = "bg-gray-100";
                if (isUserGrid) {
                  cellColor = isSelected ? "bg-red-700" : "bg-gray-100";
                } else if (groupAvailability.size > 0) {
                  const { availableCount } = getCellAvailability(day, time);
                  cellColor =
                    isSelected && availableCount > 0
                      ? `${colorIntensity}`
                      : "bg-gray-100";
                  if (availableCount > 0) {
                    cellColor = `${colorIntensity}`;
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
                        onMouseEnter={() => {
                          if (isUserGrid) return;
                          setHoveredCell({ day, time });
                          getAvailableUsers(day, time);
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
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
