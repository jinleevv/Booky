import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatTime } from "@/features/time";
import { useHook } from "@/hooks";
import { PollData } from "@/pages/ParticipatePoll";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import ParticipatePollForm from "./ParticipatePollForm";
import TimeGrid from "./TimeGrid";

interface UserAvailabilityProps {
  poll: PollData;
  isLoggedIn: boolean;
  handleLogin: (email: string) => void;
  timeSlots: string[];
  userEmail: string;
  selectedDays: string[];
  groupAvailability: Map<string, Set<string>>;
  selectedCells: Set<string>;
  setSelectedCells: (selectedCells: Set<string>) => void;
}

interface AvailableTime {
  start: string;
  end: string;
  participants: string[];
  day: string;
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
  const { server, loggedInUser } = useHook();

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSelecting, setIsSelecting] = useState(true);

  // Track hovered cells
  const [hoveredCell, setHoveredCell] = useState<{
    day: string;
    time: string;
  }>(null);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [notAvailableUsers, setNotAvailableUsers] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<AvailableTime[]>([]);

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

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        toast.error("Failed to update availabilities");
        return;
      }

      const updateAvailableTimes = await calculateAvailableTimes(
        selectedSlots,
        groupAvailability
      );
      setAvailableTimes(updateAvailableTimes);
    } catch (error) {
      console.error("Error updating availability", error);
    }
  }

  async function calculateAvailableTimes(
    selectedSlots: Set<string>,
    groupAvailability: Map<string, Set<string>>
  ): Promise<AvailableTime[]> {
    const timeSlotsMap = new Map<string, Set<string>>();

    // Iterate through all selected slots (from all users)
    groupAvailability.forEach((slots, email) => {
      slots.forEach((slot) => {
        if (!timeSlotsMap.has(slot)) {
          timeSlotsMap.set(slot, new Set());
        }
        timeSlotsMap.get(slot)?.add(email);
      });
    });

    // Add the current user's selected slots
    selectedSlots.forEach((slot) => {
      if (!timeSlotsMap.has(slot)) {
        timeSlotsMap.set(slot, new Set());
      }
      timeSlotsMap.get(slot)?.add(userEmail);
    });

    const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Sort by day of the week and then by time
    const sortedTimeSlots = Array.from(timeSlotsMap.entries()).sort((a, b) => {
      const parseDayAndTime = (slot: string) => {
        const [day, time] = slot.split("-");
        const [hour, minute] = time.split(":").map(Number);
        const dayIndex = dayOrder.indexOf(day);
        return { dayIndex, hour, minute };
      };

      const aDayTime = parseDayAndTime(a[0]);
      const bDayTime = parseDayAndTime(b[0]);

      // Compare by dayIndex first
      if (aDayTime.dayIndex !== bDayTime.dayIndex) {
        return aDayTime.dayIndex - bDayTime.dayIndex;
      }

      // If days are the same, compare by hour
      if (aDayTime.hour !== bDayTime.hour) {
        return aDayTime.hour - bDayTime.hour;
      }

      // If hours are the same, compare by minute
      return aDayTime.minute - bDayTime.minute;
    });

    // Group overlapping time slots
    const groupedTimeSlots: AvailableTime[] = [];
    let currentGroup: {
      start: string;
      end: string;
      participants: Set<string>;
      day: string; // Add day property
    } | null = null;

    console.log(sortedTimeSlots);
    sortedTimeSlots.forEach(([slot, participants]) => {
      const [day, currentTime] = slot.split("-"); // Extract day and time from the slot
      console.log("currentTime: ", currentTime);
      if (!currentGroup) {
        // Start a new group
        currentGroup = {
          start: currentTime,
          end: currentTime,
          participants: new Set(participants),
          day,
        };
      } else {
        // Check if the current slot is continuous with the previous one
        const prevEndTime = currentGroup.end;
        const currentStartTime = currentTime;

        if (
          currentGroup.day === day &&
          isContinuous(prevEndTime, currentStartTime) &&
          areSetsEqual(currentGroup.participants, participants)
        ) {
          // Extend the current group
          currentGroup.end = currentStartTime;

          // Merge participants
          participants.forEach((p) => currentGroup!.participants.add(p));
        } else {
          // Push the current group and start a new one
          groupedTimeSlots.push({
            start: currentGroup.start,
            end: currentGroup.end,
            participants: Array.from(currentGroup.participants),
            day: currentGroup.day,
          });

          // Start a new group
          currentGroup = {
            start: currentTime,
            end: currentTime,
            participants: new Set(participants),
            day,
          };
        }
      }
    });

    // Add the last group
    if (currentGroup) {
      groupedTimeSlots.push({
        start: currentGroup.start,
        end: currentGroup.end,
        participants: Array.from(currentGroup.participants),
        day: currentGroup.day,
      });
    }

    console.log(groupedTimeSlots);

    return groupedTimeSlots;
  }

  function areSetsEqual(setA: Set<string>, setB: Set<string>): boolean {
    if (setA.size !== setB.size) return false;

    for (const item of setA) {
      if (!setB.has(item)) return false;
    }

    return true;
  }

  // Helper to normalize time format (e.g., "9:00" -> "09:00")
  function normalizeTimeFormat(time: string): string {
    const [hour, minute] = time.split(":");
    const normalizedHour = hour.padStart(2, "0"); // Add leading zero if necessary
    return `${normalizedHour}:${minute}`;
  }
  // Helper function to check if two time slots are continuous
  function isContinuous(
    prevEndTime: string,
    currentStartTime: string
  ): boolean {
    const normalizedPrevEndTime = normalizeTimeFormat(prevEndTime);
    const normalizedCurrentStartTime = normalizeTimeFormat(currentStartTime);

    const prevEnd = new Date(`1970-01-01T${normalizedPrevEndTime}:00`);
    const currentStart = new Date(
      `1970-01-01T${normalizedCurrentStartTime}:00`
    );

    // Check if the current start time is 30 minutes after the previous end time
    return currentStart.getTime() - prevEnd.getTime() === 30 * 60 * 1000;
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
    groupAvailability.forEach((availability, email) => {
      if (availability.has(cellId) && email !== userEmail) {
        availableCount++;
      }
    });

    // Include current user's selection
    if (selectedCells.has(cellId)) {
      availableCount++;
    }

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
    <div className="relative z-10">
      <div className="grid grid-cols-2 w-full gap-5 py-2">
        {!isLoggedIn ? (
          <ParticipatePollForm onLogin={handleLogin} />
        ) : hoveredCell ? (
          <div>
            <div className="text-center gap-4">
              <h2 className="text-lg font-bold">
                {`${availableUsers.length.toString()} /
              ${(availableUsers.length + notAvailableUsers.length).toString()}`}
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
                    <div className="w-4 h-4 bg-red-600"></div>
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
                  userEmail={userEmail}
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
      {/*Available Time list*/}
      <Card className="mt-6 shadow-none">
        <CardContent className="p-6">
          <div className="flex justify-between text-center px-4">
            <Label className="text-lg font-semibold">Available Times</Label>
            <Button disabled={!loggedInUser} className="bg-gray-500" size="sm">
              Manually Create Meeting
            </Button>
          </div>
          <div className="pt-6 flex justify-between text-center text-sm text-gray-500">
            <span className="w-1/4 text-center">Available Rate</span>
            <span className="w-1/4 text-center">Date</span>
            <span className="w-1/4 text-center">Time</span>
            <span className="w-1/4 text-center">Create</span>
          </div>
          <hr className="my-2 border-gray-300" />
          <div className="space-y-3">
            {availableTimes.map((item, index) => (
              <div key={index} className="border px-6 py-3 rounded-lg">
                <div className="px-4 flex justify-between items-center">
                  <p className="text-sm font-bold w-1/4 text-center">
                    {`${item.participants.length} / ${
                      groupAvailability.size + 1
                    }`}
                  </p>
                  <p className="text-sm w-1/4 text-center">{item.day}</p>
                  <p className="text-sm w-1/4 text-center">
                    {formatTime(item.start)}-{formatTime(item.end)}
                  </p>
                  <div className="w-1/4 text-center">
                    <Button
                      disabled={!loggedInUser}
                      className="bg-gray-500"
                      size="sm"
                    >
                      Create Meeting
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
