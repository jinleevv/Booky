import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateRangePicker } from "@nextui-org/react";
import { availableTime } from "@/features/time";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { parseZonedDateTime } from "@internationalized/date";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

export default function CreateMeeting({ form, currentTab, setCurrentTab }) {
  const formatDateTime = (dateObject: any): string => {
    const { year, month, day, hour, minute } = dateObject;

    // Pad month, day, hour, and minute with leading zeros if needed
    const pad = (value: number) => value.toString().padStart(2, "0");

    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
  };

  return (
    <FormField
      control={form.control}
      name="recurringMeetingSchedule"
      render={() => (
        <div className="border w-full h-[590px] rounded-2xl p-4 overflow-auto">
          <div className="border-b-1 mb-4">
            <div className="flex w-full space-x-6">
              <FormField
                control={form.control}
                name="meetingName"
                render={({ field }) => (
                  <FormItem className="w-1/3 mb-6">
                    <div className="w-40 -mb-1">
                      <FormLabel>Meeting Name*</FormLabel>
                    </div>
                    <Input placeholder="Name" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meetingDescription"
                render={({ field }) => (
                  <FormItem className="w-1/3 mb-6">
                    <div className="w-32 -mb-1">
                      <FormLabel>Description</FormLabel>
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
                  <FormItem className="w-1/3 mb-6">
                    <div className="w-32 -mb-1">
                      <FormLabel>Meeting Link</FormLabel>
                    </div>
                    <Input
                      placeholder="Zoom Link, Teams Link, etc"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2">
            <Tabs defaultValue={currentTab} value={currentTab}>
              <TabsList>
                <TabsTrigger
                  value="recurring"
                  onClick={() => setCurrentTab("recurring")}
                >
                  Recurring Meetings
                </TabsTrigger>
                <TabsTrigger
                  value="one-time"
                  onClick={() => setCurrentTab("one-time")}
                >
                  One-Time Meeting / Event
                </TabsTrigger>
              </TabsList>
              <TabsContent value="recurring">
                <div className="space-y-4">
                  {form
                    .watch("recurringMeetingSchedule")
                    .map((day, dayIndex) => (
                      <div
                        key={day.day}
                        className="flex items-center space-x-4"
                      >
                        <FormField
                          control={form.control}
                          name={`recurringMeetingSchedule.${dayIndex}.enabled`}
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
                                  name={`recurringMeetingSchedule.${dayIndex}.times.${timeIndex}.start`}
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
                                  name={`recurringMeetingSchedule.${dayIndex}.times.${timeIndex}.end`}
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
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const updatedSchedule = form.getValues(
                                      "recurringMeetingSchedule"
                                    );
                                    updatedSchedule[dayIndex].times.push({
                                      start: "09:00 AM",
                                      end: "05:00 PM",
                                    });
                                    form.setValue(
                                      "recurringMeetingSchedule",
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
                                      const updatedSchedule = form.getValues(
                                        "recurringMeetingSchedule"
                                      );
                                      updatedSchedule[dayIndex].times.splice(
                                        timeIndex,
                                        1
                                      );
                                      form.setValue(
                                        "recurringMeetingSchedule",
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
              </TabsContent>
              <TabsContent value="one-time">
                <FormField
                  control={form.control}
                  name="oneTimeMeetingSchedule"
                  render={({ field }) => (
                    <FormItem className="flex flex-col p-1">
                      <div className="w-full max-w-xl flex flex-row gap-4 bg-white">
                        <DateRangePicker
                          hideTimeZone
                          defaultValue={{
                            start: parseZonedDateTime(
                              `${
                                new Date().toISOString().split("T")[0]
                              }T09:00[America/Toronto]`
                            ),
                            end: parseZonedDateTime(
                              `${
                                new Date().toISOString().split("T")[0]
                              }T17:00[America/Toronto]`
                            ),
                          }}
                          value={{
                            start: field.value.start
                              ? parseZonedDateTime(
                                  `${field.value.start}[America/Toronto]`
                                )
                              : undefined,
                            end: field.value.end
                              ? parseZonedDateTime(
                                  `${field.value.end}[America/Toronto]`
                                )
                              : undefined,
                          }}
                          label="Meeting / Event"
                          visibleMonths={2}
                          classNames={{
                            base: "bg-white",
                            calendar: "bg-white",
                            calendarContent: "bg-white",
                            popoverContent: "bg-white",
                            inputWrapper: "bg-white shadow-none border",
                            input: "text-black",
                            bottomContent: "bg-white",
                            label: "text-black",
                          }}
                          onChange={(value) => {
                            const formattedStart = value.start
                              ? formatDateTime(value.start)
                              : "";
                            const formattedEnd = value.end
                              ? formatDateTime(value.end)
                              : "";

                            field.onChange({
                              start: formattedStart,
                              end: formattedEnd,
                            });
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className="h-fit border-t-1 mt-6 p-2.5">
            <div>
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
                        value={field.value}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex h-full"
                      >
                        <FormItem className="flex -mt-1 items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="oneOnOne" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            One on One
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex -mt-1 items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="group" />
                          </FormControl>
                          <FormLabel className="font-normal">Group</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              {form.watch("meetingType") === "oneOnOne" ? (
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="flex">
                      <div className="flex w-28 space-x-2 my-auto">
                        <FormLabel className="">Each Duration:</FormLabel>
                      </div>
                      <div className="flex border w-fit h-10 rounded-md py-1 px-0.5 gap-1">
                        {["5m", "15m", "30m", "45m", "1h"].map((time) => {
                          const isSelected = field.value === time;
                          return (
                            <Button
                              key={time}
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                field.onChange(time);
                              }}
                              className={`h-full ${
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
          </div>
        </div>
      )}
    />
  );
}
