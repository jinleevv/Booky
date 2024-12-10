import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DashboardNavBar from "@/features/DashboardNavBar";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { availableTime } from "@/features/time";

interface MemoizedSelectProps {
  value: string;
  onChange: (value: string) => void;
  availableTime: string[];
}

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function CreateTeam() {
  const [teamName, setTeamName] = useState<string>("");
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [schedule, setSchedule] = useState(
    days.map((day) => ({
      day,
      enabled: day !== "Sunday" && day !== "Saturday",
      times: [{ start: "09:00 AM", end: "05:00 PM" }],
    }))
  );

  const MemoizedSelectItem = memo(({ value }: { value: string }) => (
    <SelectItem key={value} value={value}>
      {value}
    </SelectItem>
  ));

  const MemoizedSelect = memo(
    ({ value, onChange, availableTime }: MemoizedSelectProps) => {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Select Time" />
          </SelectTrigger>
          <SelectContent className="w-28">
            {availableTime.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
  );

  const handleDuration = (time: string) => {
    setSelectedDurations(
      (prev) =>
        prev.includes(time)
          ? prev.filter((duration) => duration !== time) // Remove if already selected
          : [...prev, time] // Add if not already selected
    );
  };

  const handleSwitchChange = (dayIndex: number) => {
    // const updatedSchedule = [...schedule];
    // updatedSchedule[dayIndex].enabled = !updatedSchedule[dayIndex].enabled;
    // setSchedule(updatedSchedule);
    setSchedule((prevSchedule) => {
      const updatedDay = {
        ...prevSchedule[dayIndex],
        enabled: !prevSchedule[dayIndex].enabled,
      };
      return prevSchedule.map((day, idx) =>
        idx === dayIndex ? updatedDay : day
      );
    });
  };

  const handleTimeChange = (
    dayIndex: number,
    timeIndex: number,
    field: "start" | "end",
    value: string
  ) => {
    // const updatedSchedule = [...schedule];
    // updatedSchedule[dayIndex].times[timeIndex][field] = value;

    // // Ensure there is at least one time slot if enabled
    // if (
    //   updatedSchedule[dayIndex].enabled &&
    //   updatedSchedule[dayIndex].times.length === 0
    // ) {
    //   updatedSchedule[dayIndex].times.push({
    //     start: "09:00 AM",
    //     end: "05:00 PM",
    //   });
    // }

    // setSchedule(updatedSchedule);
    setSchedule((prevSchedule) => {
      const updatedTimes = prevSchedule[dayIndex].times.map((time, idx) =>
        idx === timeIndex ? { ...time, [field]: value } : time
      );
      const updatedDay = { ...prevSchedule[dayIndex], times: updatedTimes };
      return prevSchedule.map((day, idx) =>
        idx === dayIndex ? updatedDay : day
      );
    });
  };

  const addTimeSlot = (dayIndex: number) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].times.push({
      start: "09:00 AM",
      end: "05:00 PM",
    });
    setSchedule(updatedSchedule);
  };

  const deleteTimeSlot = (dayIndex: number, timeIndex: number) => {
    const updatedSchedule = [...schedule];
    if (updatedSchedule[dayIndex].times.length > 1) {
      updatedSchedule[dayIndex].times.splice(timeIndex, 1);
      setSchedule(updatedSchedule);
    }
  };

  async function handleCreateTeam() {
    const response = await fetch("http://localhost:5001/api/teams/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: teamName,
        durations: selectedDurations,
        availableTime: availableTime,
      }),
    });

    if (!response.ok) {
      console.error("Failed to save team to database");
      return -1;
    }
    return 0;
  }

  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="w-full px-3 py-4 relative z-10 bg-white">
          <div className="flex w-full">
            <div className="grid w-full">
              <Label className="text-2xl font-bold text-black">New Team</Label>{" "}
              <Label className="text-xs text-gray-400">Teams Settings </Label>
            </div>
          </div>
          <div className="grid mt-10 gap-y-2 bg-white">
            <div className="flex w-full gap-2">
              <div className="mt-auto mb-auto">
                <Label>Team Name:</Label>
              </div>
              <div className="mt-auto mb-auto">
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="space-y-4">
                {schedule.map((day, dayIndex) => (
                  <div key={day.day} className="flex items-center space-x-4">
                    {/* Switch and Day Label */}
                    <div className="flex w-32 items-center space-x-2">
                      <Switch
                        id={day.day}
                        checked={day.enabled}
                        onCheckedChange={() => handleSwitchChange(dayIndex)}
                      />
                      <Label htmlFor={day.day} className="font-medium">
                        {day.day}
                      </Label>
                    </div>

                    {/* Time Inputs */}
                    {day.enabled && (
                      <div className="flex flex-col space-y-2">
                        {day.times.map((time, timeIndex) => (
                          <div
                            key={timeIndex}
                            className="flex items-center space-x-2"
                          >
                            <MemoizedSelect
                              value={time.start}
                              onChange={(value) =>
                                handleTimeChange(
                                  dayIndex,
                                  timeIndex,
                                  "start",
                                  value
                                )
                              }
                              availableTime={availableTime}
                            />
                            <span className="text-gray-500">-</span>
                            <MemoizedSelect
                              value={time.end}
                              onChange={(value) =>
                                handleTimeChange(
                                  dayIndex,
                                  timeIndex,
                                  "end",
                                  value
                                )
                              }
                              availableTime={availableTime}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => addTimeSlot(dayIndex)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            {day.times.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  deleteTimeSlot(dayIndex, timeIndex)
                                }
                              >
                                <Trash className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex w-full gap-2">
              <div className="mt-auto mb-auto">
                <Label>Duration:</Label>
              </div>
              <div className="flex border rounded-md py-1 px-0.5 gap-1">
                {["5m", "15m", "30m", "45m", "1h"].map((time) => (
                  <Button
                    key={time}
                    variant="ghost"
                    onClick={() => handleDuration(time)}
                    className={`
                        ${
                          selectedDurations.includes(time)
                            ? "text-red-700 hover:text-red-700 border"
                            : ""
                        }`}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateTeam}>Create</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
