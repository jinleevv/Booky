import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { availableTime as defaultAvailableTime } from "@/features/time";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useHook } from "@/hooks";
import { Label } from "@/components/ui/label";

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
  coadmins: z.array(
    z
      .string()
      .refine(
        (email) =>
          email === "" ||
          /^[a-zA-Z0-9._%+-]+@(mail\.mcgill\.ca|mcgill\.ca)$/.test(email),
        "Email must be in the format yourname@mail.mcgill.ca or yourname@mcgill.ca"
      )
  ),
  meetingName: z.string(),
  meetingDescription: z.string(),
  meetingType: z.enum(["appointment", "event"], {
    required_error: "You need to select the type.",
  }),
  meetingLink: z.string(),
});

export default function TeamSettings() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      durations: [],
      schedule: days.map((day) => ({
        day,
        enabled: false,
        times: [{ start: "09:00 AM", end: "05:00 PM" }],
      })),
      coadmins: [],
    },
  });

  const navigate = useNavigate();
  const { team: teamId } = useParams();
  const { server, loggedInUser, userEmail } = useHook(); // Use global state from the hook
  const [teamName, setTeamName] = useState<string | null>(null);
  const [availableTime, setAvailableTime] = useState<Record<string, any>>({});

  const meetingTypeSelection = form.watch("meetingType");

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!loggedInUser) {
      console.error("No user is logged in");
      return;
    }

    const updatedAvailableTime = {
      ...availableTime,
      [userEmail]: values.schedule,
    };

    try {
      const response1 = await fetch(
        `${server}/api/teams/${teamId}/availableTime`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            availableTime: updatedAvailableTime,
          }),
        }
      );

      if (!response1.ok) {
        console.error("Failed to update schedule");
        toast("Failed to update schedule");
        return;
      }

      const response2 = await fetch(`${server}/api/teams/${teamId}/coadmins`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coadmins: values.coadmins,
        }),
      });

      if (!response2.ok) {
        console.error("Failed to update coadmins");
        toast("Failed to update coadmins");
        return;
      }

      toast("Successfully updated your schedule and coadmins");
      navigate("/dashboard/teams");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast("An error occurred while submitting the form");
    }
  }

  const handleAddCoadmin = () => {
    const currentCoadmins = form.getValues("coadmins");
    form.setValue("coadmins", [...currentCoadmins, ""]);
  };

  const handleRemoveCoadmin = (index: number) => {
    const currentCoadmins = form.getValues("coadmins");
    form.setValue(
      "coadmins",
      currentCoadmins.filter((_, i) => i !== index)
    );
  };

  return (
    <section className="grid mt-10 bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Team Name Display */}
          <div className="border rounded-lg p-4">
            <FormLabel>
              <Label className="font-bold">Team: </Label>
              {teamName || "Loading..."}
            </FormLabel>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex">
              <div className="my-auto">
                <FormLabel className="mb-2">
                  Co-admins: display current co-admins
                </FormLabel>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleAddCoadmin}
              >
                <Plus className="w-2 h-2" />
              </Button>
            </div>
            <div className="space-y-2">
              {(form.watch("coadmins") || []).map((coadmin, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <FormField
                    control={form.control}
                    name={`coadmins.${index}`}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Coadmin Email"
                            className={`mt-2 ${
                              fieldState.invalid ? "border-red-400" : ""
                            }`}
                          />
                        </FormControl>
                        {fieldState.error && (
                          <p className="text-red-500 text-sm mt-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCoadmin(index)}
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <Tabs defaultValue="modify">
              <TabsList>
                <TabsTrigger value="modify">Modify</TabsTrigger>
                <TabsTrigger value="cancel">Cancel</TabsTrigger>
              </TabsList>
              <TabsContent value="modify" className="grid grid-cols-2">
                <div>
                  <Select>
                    <SelectTrigger className="w-[180px] mb-2">
                      <SelectValue placeholder="Select Meeting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m1">m1</SelectItem>
                      <SelectItem value="m2">m2</SelectItem>
                      <SelectItem value="m3">m3</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="w-full border-b-1"></div>

                  {/* Schedule Section */}
                  <FormField
                    control={form.control}
                    name="schedule"
                    render={() => (
                      <div className="space-y-4">
                        {form.watch("schedule").map((day, dayIndex) => (
                          <div
                            key={day.day}
                            className="flex items-center space-x-4"
                          >
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
                                                {defaultAvailableTime.map(
                                                  (timeOption) => (
                                                    <SelectItem
                                                      key={timeOption}
                                                      value={timeOption}
                                                    >
                                                      {timeOption}
                                                    </SelectItem>
                                                  )
                                                )}
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
                                                {defaultAvailableTime.map(
                                                  (timeOption) => (
                                                    <SelectItem
                                                      key={timeOption}
                                                      value={timeOption}
                                                    >
                                                      {timeOption}
                                                    </SelectItem>
                                                  )
                                                )}
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
                                        const updatedSchedule =
                                          form.getValues("schedule");
                                        updatedSchedule[dayIndex].times.push({
                                          start: "09:00 AM",
                                          end: "05:00 PM",
                                        });
                                        form.setValue(
                                          "schedule",
                                          updatedSchedule
                                        );
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
                                          const updatedSchedule =
                                            form.getValues("schedule");
                                          updatedSchedule[
                                            dayIndex
                                          ].times.splice(timeIndex, 1);
                                          form.setValue(
                                            "schedule",
                                            updatedSchedule
                                          );
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
                    )}
                  />
                </div>
                <div className="h-full border-l-1 p-2.5">
                  <FormField
                    control={form.control}
                    name="meetingDescription"
                    render={({ field }) => (
                      <FormItem className="flex mb-6">
                        <div className="w-48 my-auto">
                          <FormLabel>Meeting Description:</FormLabel>
                        </div>
                        <Input placeholder="Description" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meetingLink"
                    render={({ field }) => (
                      <FormItem className="flex mb-6">
                        <div className="w-32 my-auto">
                          <FormLabel>Meeting Link:</FormLabel>
                        </div>
                        <Input
                          placeholder="Zoom Link, Teams Link, etc"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meetingType"
                    render={({ field }) => (
                      <FormItem className="flex space-x-2">
                        <div>
                          <FormLabel>Meeting Type:</FormLabel>
                        </div>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex h-full"
                          >
                            <FormItem className="flex -mt-1 items-center space-x-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="appointment" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Appointment
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex -mt-1 items-center space-x-1 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="event" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Meeting / Event
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {meetingTypeSelection === "appointment" ? (
                    <FormField
                      control={form.control}
                      name="durations"
                      render={({ field }) => (
                        <FormItem className="flex p-4">
                          <div className="flex w-28 space-x-2 mt-auto mb-auto">
                            <FormLabel>Each Duration:</FormLabel>
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
                                    const selectedDuration = isSelected
                                      ? []
                                      : [time];
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
                  ) : (
                    <></>
                  )}
                </div>
              </TabsContent>
              <TabsContent
                value="cancel"
                className="grid grid-cols-2 px-2 gap-2"
              >
                <div>
                  <Label>Upcoming</Label>
                  <ScrollArea className="h-[350px] w-full border-r-1 px-1">
                    <div>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="flex justify-between">
                            <Label>Meeting Name</Label>
                            <Label>DateNTime</Label>
                          </AccordionTrigger>
                          <AccordionContent>
                            Display Meeting Information
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="flex justify-between">
                            <Label>Meeting Name</Label>
                            <Label>DateNTime</Label>
                          </AccordionTrigger>
                          <AccordionContent>
                            Display Meeting Information
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="flex justify-between">
                            <Label>Meeting Name</Label>
                            <Label>DateNTime</Label>
                          </AccordionTrigger>
                          <AccordionContent>
                            Display Meeting Information
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <Label>Meetings</Label>
                  <ScrollArea className="h-[350px] w-full px-1"></ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex w-full justify-end">
            <Button type="submit">Save Schedule</Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
