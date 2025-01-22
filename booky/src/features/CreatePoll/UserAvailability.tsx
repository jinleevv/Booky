import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useHook } from "@/hooks";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { formatTime } from "../time";
import ParticipatePollForm from "./ParticipatePollForm";
import TimeGrid from "./TimeGrid";

interface UserAvailabilityProps {
  isLoggedIn: boolean;
  handleLogin: (email: string) => void;
  timeSlots: string[];
  userEmail: string;
  selectedDays: string[];
  groupAvailability: Map<string, Set<string>>;
  selectedCells: Set<string>;
  setSelectedCells: (selectedCells: Set<string>) => void;
}

export default function UserAvailability({
  isLoggedIn,
  handleLogin,
  timeSlots,
  userEmail,
  selectedDays,
  groupAvailability,
  selectedCells,
  setSelectedCells,
}: UserAvailabilityProps) {
  const { id: urlPath } = useParams<string>();
  const { server } = useHook();

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSelecting, setIsSelecting] = useState(true);

  // Track hovered cells
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    time: string;
  }>(null);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [notAvailableUsers, setNotAvailableUsers] = useState<string[]>([]);

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

    const userEmailInGroup =
      userEmail && !groupAvailability.has(userEmail) ? 1 : 0;

    const totalParticipants = groupAvailability.size + userEmailInGroup; // Include current user

    // Check group availability
    groupAvailability.forEach((availability) => {
      if (availability.has(cellId)) {
        availableCount++;
      }
    });

    return { availableCount, totalParticipants };
  }

  // Retrieve the list of available users for a cell
  function getAvailableUsers(day: string, time: string): string[] {
    const cellId = getCellId(day, time);
    const availableUsers: string[] = [];

    // Check group availability
    groupAvailability.forEach((availability, email) => {
      if (availability.has(cellId)) {
        availableUsers.push(email);
      }
    });

    // Include current user's selection if not contained in availableUsers
    if (selectedCells.has(cellId) && !availableUsers.includes(userEmail)) {
      availableUsers.push(userEmail);
    }
    const allUsers = Array.from(groupAvailability.keys());
    setNotAvailableUsers(
      allUsers.filter((user) => !availableUsers.includes(user))
    );
    setAvailableUsers(availableUsers);
    return availableUsers;
  }

  const userEmailInGroup =
    userEmail && !groupAvailability.has(userEmail) ? 1 : 0;

  return (
    <div className="grid grid-cols-2 w-full py-2 relative z-10">
      {!isLoggedIn ? (
        <ParticipatePollForm onLogin={handleLogin} />
      ) : hoveredCell ? (
        <div>
          <div className="text-center gap-4">
            <h2 className="text-lg font-bold">
              {`${availableUsers.length.toString()} /
                ${(
                  availableUsers.length + notAvailableUsers.length
                ).toString()}`}
            </h2>
            <p className="text-md">
              {hoveredCell.day} {formatTime(hoveredCell.time)}
            </p>
          </div>
          <div className="mt-2 w-full p-4 border-l grid grid-cols-2">
            <div className="text-center">
              <h3 className="font-semibold">Available</h3>
              <ul>
                {availableUsers.map((user) => (
                  <li key={user} className="text-sm">
                    {user}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Not Available</h3>
              <ul>
                {notAvailableUsers.map((user) => (
                  <li key={user} className="text-sm">
                    {user}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <Card className="h-full shadow-none">
          <CardContent className="p-6">
            <Card className="border-none shadow-none" onMouseUp={handleMouseUp}>
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
                  setHoveredCell={setHoveredCell}
                  handleMouseDown={handleMouseDown}
                  handleMouseEnter={handleMouseEnter}
                  groupAvailability={groupAvailability}
                  getCellAvailability={getCellAvailability}
                  getAvailableUsers={getAvailableUsers}
                  isUserGrid={true}
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
                {groupAvailability.size + userEmailInGroup} Participant
                {groupAvailability.size + userEmailInGroup !== 1 && "s"}
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
                setHoveredCell={setHoveredCell}
                handleMouseDown={handleMouseDown}
                handleMouseEnter={handleMouseEnter}
                groupAvailability={groupAvailability}
                getCellAvailability={getCellAvailability}
                getAvailableUsers={getAvailableUsers}
                isUserGrid={false}
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
