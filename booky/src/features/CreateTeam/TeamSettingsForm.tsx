import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { availableTime as defaultAvailableTime } from "@/features/time";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useHook } from "@/hooks";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const formSchema = z.object({
  durations: z.array(z.string()).min(1, "Please select a duration"),
  schedule: z.array(
    z.object({
      day: z.string(),
      enabled: z.boolean(),
      times: z.array(
        z.object({
          start: z.string(),
          end: z.string(),
        })
      ),
    })
  ),
});

export default function TeamSettings() {
  const navigate = useNavigate();
  const { team: teamId } = useParams();
  const { server, loggedInUser, userEmail } = useHook(); // Use global state from the hook
  const [teamName, setTeamName] = useState<string | null>(null);
  const [availableTime, setAvailableTime] = useState<Record<string, any>>({});

  // Fetch team name on load
  useEffect(() => {
    const fetchTeam = async () => {
      const response = await fetch(`${server}/api/teams/${teamId}`);
      const data = await response.json();
      if (response.ok) {
        setAvailableTime(data.availableTime);
        setTeamName(data.name);
      } else {
        console.error("Failed to fetch team details");
        toast("Failed to fetch team details");
        navigate("/dashboard/teams");
      }
    };
    fetchTeam();
  }, [teamId, server, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      durations: [],
      schedule: days.map((day) => ({
        day,
        enabled: false,
        times: [{ start: "09:00 AM", end: "05:00 PM" }],
      })),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!loggedInUser) {
      console.error("No user is logged in");
      return;
    }

    const updatedAvailableTime = {
      ...availableTime,
      [userEmail]: values.schedule,
    };

    const response = await fetch(`${server}/api/teams/${teamId}/availableTime`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        availableTime: updatedAvailableTime,
      }),
    });

    if (!response.ok) {
      console.error("Failed to update schedule");
      toast("Failed to update update schedule");
      return;
    }

    toast("Successfully updated your schedule");
    navigate("/dashboard/teams");
  }

  return (
    <section className="grid mt-10 bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Team Name Display */}
          <div className="border rounded-lg p-4">
            <FormLabel className="text-lg font-bold">{teamName || "Loading..."}</FormLabel>
          </div>

          {/* Schedule Section */}
          <FormField
            control={form.control}
            name="schedule"
            render={() => (
              <div className="border rounded-lg p-4">
                <div className="space-y-4">
                  {form.watch("schedule").map((day, dayIndex) => (
                    <div key={day.day} className="flex items-center space-x-4">
                      <FormField
                        control={form.control}
                        name={`schedule.${dayIndex}.enabled`}
                        render={({ field }) => (
                          <FormItem className="flex w-32 items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-2"
                              />
                            </FormControl>
                            <FormLabel className="font-medium">{day.day}</FormLabel>
                          </FormItem>
                        )}
                      />

                      {/* Time Selects */}
                      {day.enabled && (
                        <div className="flex flex-col space-y-2">
                          {day.times.map((time, timeIndex) => (
                            <div key={timeIndex} className="flex items-center space-x-2">
                              {/* Start Time */}
                              <FormField
                                control={form.control}
                                name={`schedule.${dayIndex}.times.${timeIndex}.start`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger className="w-28">
                                          <SelectValue placeholder="Start Time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {defaultAvailableTime.map((timeOption) => (
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

                              <span className="text-gray-500">-</span>

                              {/* End Time */}
                              <FormField
                                control={form.control}
                                name={`schedule.${dayIndex}.times.${timeIndex}.end`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger className="w-28">
                                          <SelectValue placeholder="End Time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {defaultAvailableTime.map((timeOption) => (
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

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const updatedSchedule = form.getValues("schedule");
                                  updatedSchedule[dayIndex].times.push({
                                    start: "09:00 AM",
                                    end: "05:00 PM",
                                  });
                                  form.setValue("schedule", updatedSchedule);
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              {day.times.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const updatedSchedule = form.getValues("schedule");
                                    updatedSchedule[dayIndex].times.splice(timeIndex, 1);
                                    form.setValue("schedule", updatedSchedule);
                                  }}
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
            )}
          />

          {/* Durations Section */}
          <div className="border rounded-lg p-4">
            <FormField
              control={form.control}
              name="durations"
              render={({ field }) => (
                <FormItem className="flex">
                  <div className="flex w-20 space-x-2 mt-auto mb-auto">
                    <FormLabel>Duration:</FormLabel>
                  </div>
                  <div className="flex border w-fit rounded-md py-1 px-0.5 gap-1">
                    {["5m", "15m", "30m", "45m", "1h"].map((time) => {
                      const isSelected = field.value.includes(time);

                      return (
                        <Button
                          key={time}
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            const selectedDuration = isSelected ? [] : [time];
                            field.onChange(selectedDuration);
                          }}
                          className={`${
                            isSelected
                              ? "text-red-700 border border-red-700"
                              : "text-gray-700 hover:text-gray-900"
                          }`}
                        >
                          {time}
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex w-full justify-end">
            <Button type="submit">Save Schedule</Button>
          </div>
        </form>
      </Form>
    </section>
  );
}