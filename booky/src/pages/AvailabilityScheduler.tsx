import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NavigationBar from "@/features/NavigationBar";
import { availableTime, convertTo24Hour, formatTime } from "@/features/time";
import { useHook } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getDayOfWeek,
  getLocalTimeZone,
  parseZonedDateTime,
  today,
  ZonedDateTime,
} from "@internationalized/date";
import { DateRangePicker } from "@nextui-org/date-picker";
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formSchema = z.object({
  pollName: z
    .string()
    .min(1)
    .max(50)
    .nonempty({ message: "Poll name is required" }),
  pollDescription: z.string().max(200).optional(),
  range: z.object({
    start: z.object({
      date: z.any(),
      day: z.number(),
    }),
    end: z.object({
      date: z.any(),
      day: z.number(),
    }),
  }),
  startTime: z.string(),
  endTime: z.string(),
});

const formatDateTime = (dateObject: ZonedDateTime): string => {
  const { year, month, day, hour, minute } = dateObject;

  // Pad month, day, hour, and minute with leading zeros if needed
  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
};

export default function AvailabilityScheduler() {
  const now = today(getLocalTimeZone());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pollName: "",
      pollDescription: "",
      range: {
        start: {
          date: now,
          day: getDayOfWeek(now, "en-US"),
        },
        end: {
          date: now.add({ days: 6 }),
          day: getDayOfWeek(now.add({ days: 6 }), "en-US"),
        },
      },
      startTime: "09:00 AM",
      endTime: "05:00 PM",
    },
  });

  const { server, loggedInUser, userEmail } = useHook();
  const navigate = useNavigate();

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!loggedInUser) {
      console.error("No user is logged in");
      return;
    }

    values.startTime = convertTo24Hour(values.startTime);
    values.endTime = convertTo24Hour(values.endTime);
  }

  return (
    <section className="h-screen w-screen bg-white">
      <NavigationBar />
      <div className="flex">
        {/* Left Side - Event Creation Form */}
        <div className="w-1/3 p-6 mt-6">
          <Form {...form}>
            <Card>
              <CardContent className="p-6">
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold mb-6">Create New Poll</h2>
                  <FormField
                    control={form.control}
                    name="pollName"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-2">
                          <FormLabel htmlFor="pollName">Event Name</FormLabel>
                          <Input
                            id="pollName"
                            {...field}
                            placeholder="Team Meeting"
                            required
                          />
                          <FormMessage>
                            {form.formState.errors.pollName?.message}
                          </FormMessage>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pollDescription"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-2">
                          <FormLabel htmlFor="pollDescription">
                            Description (Optional)
                          </FormLabel>
                          <Input
                            id="pollDescription"
                            {...field}
                            placeholder="Weekly team sync..."
                          />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="range"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-2">
                          <DateRangePicker
                            isRequired
                            hideTimeZone
                            minValue={now}
                            labelPlacement="inside"
                            label="Meeting / Event"
                            className="max-w-md rounded-md"
                            onChange={(value) => {
                              const formattedStart = value.start
                                ? formatDateTime(
                                    parseZonedDateTime(
                                      `${
                                        value.start
                                          .toDate("America/Toronto")
                                          .toISOString()
                                          .split("T")[0]
                                      }T09:00[America/Toronto]`
                                    )
                                  )
                                : "";
                              const formattedEnd = value.end
                                ? formatDateTime(
                                    parseZonedDateTime(
                                      `${
                                        value.end
                                          .toDate("America/Toronto")
                                          .toISOString()
                                          .split("T")[0]
                                      }T17:00[America/Toronto]`
                                    )
                                  )
                                : "";
                              field.onChange({
                                start: {
                                  date: formattedStart,
                                  day: getDayOfWeek(value.start, "en-US"),
                                },
                                end: {
                                  date: formattedEnd,
                                  day: getDayOfWeek(value.end, "en-US"),
                                },
                              });
                            }}
                          />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <Label htmlFor="startTime">Start Time</Label>
                              <SelectTrigger className="w-28">
                                <SelectValue
                                  id="startTime"
                                  placeholder="Start Time"
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTime.map((timeOption) => (
                                  <SelectItem
                                    key={timeOption}
                                    value={timeOption}
                                  >
                                    {timeOption}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <Label htmlFor="endTime">End Time</Label>
                              <SelectTrigger className="w-28">
                                <SelectValue
                                  id="endTime"
                                  placeholder="End Time"
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTime.map((timeOption) => (
                                  <SelectItem
                                    key={timeOption}
                                    value={timeOption}
                                  >
                                    {timeOption}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Create Poll
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Form>
        </div>

        {/* Right Side - Availability Scheduler */}
        <div className="w-2/3 p-8 overflow-x-auto">
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
      </div>
    </section>
  );
}
