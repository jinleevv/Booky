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
import { availableTime, convertTo24Hour } from "@/features/time";
import { DateRangePicker } from "@heroui/date-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getDayOfWeek,
  getLocalTimeZone,
  parseZonedDateTime,
  today,
  ZonedDateTime,
} from "@internationalized/date";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { z } from "zod";

const formSchema = z.object({
  pollName: z.string().min(2, { message: "Poll name is required" }).max(50),
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

export default function CreatePollForm() {
  const now = today(getLocalTimeZone());
  const [invalidRange, setInvalidRange] = useState<boolean>(false);

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

  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (invalidRange) {
      toast.error("Date range cannot exceed 7 days");
      return;
    }
    values.startTime = convertTo24Hour(values.startTime);
    values.endTime = convertTo24Hour(values.endTime);

    const urlPath = uuid();

    const response = await fetch(`http://localhost:10000/api/polls/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pollName: values.pollName,
        pollDescription: values.pollDescription,
        urlPath: urlPath,
        range: values.range,
        startTime: values.startTime,
        endTime: values.endTime,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Failed to save poll to server", data);
      return -1;
    }

    toast("Successfully Created Poll");
    navigate(`/poll/${urlPath}`);
  }

  return (
    <div className="w-full max-w-lg p-6">
      {/* Left Side - Event Creation Form */}
      <Form {...form}>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Create New Poll</h2>
              <FormField
                control={form.control}
                name="pollName"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2">
                      <FormLabel htmlFor="pollName">Poll Name</FormLabel>
                      <FormControl>
                        <Input
                          id="pollName"
                          {...field}
                          placeholder="Team Meeting"
                        />
                      </FormControl>
                      <FormMessage />
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
                        errorMessage={
                          invalidRange
                            ? "Date range cannot exceed 7 days"
                            : undefined
                        }
                        isInvalid={invalidRange}
                        minValue={now}
                        labelPlacement="inside"
                        label="Meeting / Event"
                        className="max-w-md rounded-md"
                        onChange={(value) => {
                          if (!value.start || !value.end) return;
                          const diffInDays = value.end.compare(value.start);
                          if (diffInDays > 6) {
                            setInvalidRange(true);
                            return;
                          }
                          setInvalidRange(false);
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
                              <SelectItem key={timeOption} value={timeOption}>
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
                            <SelectValue id="endTime" placeholder="End Time" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTime.map((timeOption) => (
                              <SelectItem key={timeOption} value={timeOption}>
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
  );
}
