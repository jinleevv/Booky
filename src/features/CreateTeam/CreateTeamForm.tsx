import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <section className="grid mt-10 bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="teamName"
            render={({ field }) => (
              <FormItem className="flex w-full">
                <FormLabel className="w-24 mt-auto mb-auto">
                  Team Name
                </FormLabel>
                <FormControl>
                  <Input className="w-1/3" placeholder="Team Name" {...field} />
                </FormControl>
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
                      {/* Switch and Day Label */}
                      <div className="flex w-32 items-center space-x-2">
                        <Controller
                          control={form.control}
                          name={`schedule.${dayIndex}.enabled`}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <FormLabel className="font-medium">{day.day}</FormLabel>
                      </div>

                      {/* Time Selects */}
                      {day.enabled && (
                        <div className="flex flex-col space-y-2">
                          {day.times.map((time, timeIndex) => (
                            <div
                              key={timeIndex}
                              className="flex items-center space-x-2"
                            >
                              {/* Start Time */}
                              <Controller
                                control={form.control}
                                name={`schedule.${dayIndex}.times.${timeIndex}.start`}
                                render={({ field }) => (
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
                                )}
                              />

                              <span className="text-gray-500">-</span>

                              {/* End Time */}
                              <Controller
                                control={form.control}
                                name={`schedule.${dayIndex}.times.${timeIndex}.end`}
                                render={({ field }) => (
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
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </section>
  );
}
