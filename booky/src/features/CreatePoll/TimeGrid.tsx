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
  userEmail,
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
  userEmail?: string;
}) {
  function opacityClass(availableCount: number, totalParticipants: number) {
    if (totalParticipants === 0) return "opacity-0";
    const percentage = (availableCount / totalParticipants) * 100;

    if (percentage <= 10) return "opacity-10";
    if (percentage <= 20) return "opacity-20";
    if (percentage <= 25) return "opacity-25";
    if (percentage <= 30) return "opacity-30";
    if (percentage <= 40) return "opacity-40";
    if (percentage <= 50) return "opacity-50";
    if (percentage <= 55) return "opacity-55";
    if (percentage <= 60) return "opacity-60";
    if (percentage <= 70) return "opacity-70";
    if (percentage <= 80) return "opacity-80";
    if (percentage <= 90) return "opacity-90";
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

                const opacity = isUserGrid
                  ? selectedCells.has(cellId)
                    ? "opacity-100"
                    : "opacity-0"
                  : opacityClass(availableCount, totalParticipants);

                // Calculate cell color based on whether it's user or group grid
                let cellColor = "bg-gray-100";
                if (isUserGrid) {
                  cellColor = isSelected ? "bg-red-600" : "bg-gray-100";
                } else if (groupAvailability) {
                  cellColor = isSelected ? "bg-red-600" : "bg-gray-100";

                  const { availableCount } = getCellAvailability(day, time);

                  if (availableCount > 0) {
                    cellColor = `bg-red-600 ${opacity}`;
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
