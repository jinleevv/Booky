import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { availableTime } from "@/features/time";
import { Switch } from "@/components/ui/switch";

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
  teamName: z.string().min(2).max(50),
  durations: z.array(z.string()),
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

export default function CreateTeamForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
      durations: [],
      schedule: days.map((day) => ({
        day,
        enabled: day !== "Sunday" && day !== "Saturday",
        times: [{ start: "09:00 AM", end: "05:00 PM" }],
      })),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch("http://localhost:5001/api/teams/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: values.teamName,
        durations: values.durations,
        availableTime: values.schedule,
      }),
    });

    if (!response.ok) {
      console.error("Failed to save team to database");
      return -1;
    }
    return 0;
  }
  return (
    <section className="grid mt-10 bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="teamName"
            render={({ field }) => (
              <FormItem>
                <div className="flex w-full">
                  <FormLabel className="w-24 mt-auto mb-auto">
                    Team Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="w-1/3"
                      placeholder="Team Name"
                      {...field}
                    />
                  </FormControl>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />
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
                        name={`schedule.${dayIndex}.enabled`} // Explicitly map 'enabled'
                        render={({ field }) => (
                          <FormItem className="flex w-32 items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-2"
                              />
                            </FormControl>
                            <FormLabel className="font-medium">
                              {day.day}
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      {/* Time Selects */}
                      {day.enabled && (
                        <div className="flex flex-col space-y-2">
                          {day.times.map((time, timeIndex) => (
                            <div
                              key={timeIndex}
                              className="flex items-center space-x-2"
                            >
                              {/* Start Time */}
                              <FormField
                                control={form.control}
                                name={`schedule.${dayIndex}.times.${timeIndex}.start`} // Target nested start field
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
                                    <FormMessage />{" "}
                                    {/* Display any validation error */}
                                  </FormItem>
                                )}
                              />

                              <span className="text-gray-500">-</span>

                              {/* End Time */}
                              <FormField
                                control={form.control}
                                name={`schedule.${dayIndex}.times.${timeIndex}.end`} // Target nested start field
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
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const updatedSchedule =
                                    form.getValues("schedule");
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
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const updatedSchedule =
                                      form.getValues("schedule");
                                    updatedSchedule[dayIndex].times.splice(
                                      timeIndex,
                                      1
                                    );
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
                    // Check if the time is already in the array
                    const isSelected = field.value.includes(time);

                    return (
                      <Button
                        key={time}
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          const updatedDurations = isSelected
                            ? field.value.filter((val: string) => val !== time)
                            : [...field.value, time];
                          field.onChange(updatedDurations);
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
          <div className="flex w-full justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
