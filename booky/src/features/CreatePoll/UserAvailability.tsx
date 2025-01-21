import { Card, CardContent } from "@/components/ui/card";
import ParticipatePollForm from "./ParticipatePollForm";
import TimeGrid from "./TimeGrid";
import { useParams } from "react-router-dom";
import { useHook } from "@/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function UserAvailability({
  isLoggedIn,
  handleLogin,
  timeSlots,
  userEmail,
  selectedDays,
  groupAvailability,
  selectedCells,
  setSelectedCells,
}) {
  const { id: urlPath } = useParams<string>();
  const { server } = useHook();

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSelecting, setIsSelecting] = useState(true);

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
        toast.error("Failed to update availabilities");
        return;
      }
    } catch (error) {
      console.error("Error updating availability", error);
    }
  }

  function handleMouseDown(day: string, time: string) {
    setIsMouseDown(true);
    const cellId = getCellId(day, time);

    setIsSelecting(!selectedCells.has(cellId));

    const newSelected: Set<string> = new Set(selectedCells);
    if (!newSelected.has(cellId)) {
      newSelected.add(cellId);
    } else {
      newSelected.delete(cellId);
    }
    setSelectedCells(newSelected);
    updateAvailability(newSelected);
  }

  function handleMouseEnter(day: string, time: string) {
    if (isMouseDown) {
      const cellId = getCellId(day, time);

      const newSelected: Set<string> = new Set(selectedCells);
      if (isSelecting) {
        newSelected.add(cellId);
      } else {
        newSelected.delete(cellId);
      }

      setSelectedCells(newSelected);
      updateAvailability(newSelected);
    }
  }

  function handleMouseUp() {
    setIsMouseDown(false);
  }

  function getCellId(day: string, time: string) {
    return `${day}-${time}`;
  }

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
    <div className="grid grid-cols-2 w-full py-2 relative z-10">
      {!isLoggedIn ? (
        <ParticipatePollForm onLogin={handleLogin} />
      ) : (
        <Card className="h-full shadow-none">
          <CardContent className="p-6">
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
                  <div className="w-4 h-4 bg-red-700"></div>
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
                  userEmail={userEmail}
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
      <Card className="h-full shadow-none">
        <CardContent className="p-6">
          <Card className="border-none shadow-none">
            <div className="flex w-full justify-between">
              <Label className="text-md font-semibold mb-4">
                Group's Availability
              </Label>
              <Label className="text-sm font-semibold mb-4">
                {groupAvailability.size + (userEmail ? 1 : 0)} Participant
                {groupAvailability.size + (userEmail ? 1 : 0) !== 1 && "s"}
              </Label>
            </div>

            <div className="text-sm mb-4">
              Mouseover the Calendar to See Who Is Available
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
        </CardContent>
      </Card>
    </div>
  );
}
