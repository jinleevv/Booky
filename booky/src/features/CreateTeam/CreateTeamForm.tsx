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
import { Input } from "@/components/ui/input";
import { parseZonedDateTime } from "@internationalized/date";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHook } from "@/hooks";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CreateMeating from "./CreateMeeting";
import { useState } from "react";

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
  teamName: z.string().min(1).max(50),
  duration: z.string(),
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
  oneTimeMeeting: z.object({
    start: z.any(),
    end: z.any(),
  }),
  meetingName: z.string().min(1, "Please define name for the meeting"),
  meetingDescription: z.string(),
  meetingType: z.enum(["oneOnOne", "group"], {
    required_error: "You need to select the type.",
  }),
  meetingLink: z.string(),
});

const formatDateTime = (dateObject: any): string => {
  const { year, month, day, hour, minute } = dateObject;

  // Pad month, day, hour, and minute with leading zeros if needed
  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
};

export default function CreateTeamForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
      duration: "",
      schedule: days.map((day) => ({
        day,
        enabled: day !== "Sunday" && day !== "Saturday",
        times: [{ start: "09:00 AM", end: "05:00 PM" }],
      })),
      coadmins: [],
      oneTimeMeeting: {
        start: formatDateTime(
          parseZonedDateTime(
            `${new Date().toISOString().split("T")[0]}T09:00[America/Toronto]`
          )
        ),
        end: formatDateTime(
          parseZonedDateTime(
            `${new Date().toISOString().split("T")[0]}T17:00[America/Toronto]`
          )
        ),
      },
      meetingDescription: "",
      meetingLink: "",
    },
  });

  const meetingTypeSelection = form.watch("meetingType");

  const { server, loggedInUser, userEmail, userName } = useHook();
  const [currentTab, setCurrentTab] = useState<string>("recurring");
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!loggedInUser) {
      console.error("No user is logged in");
      return;
    }

    const filteredCoadmins = values.coadmins.filter(
      (email) => email && email.trim() !== ""
    );

    if (values.meetingType === "oneOnOne" && values.duration == "") {
      toast("Please select duration");
      return;
    }

    const response = await fetch(`${server}/api/teams/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: values.teamName,
        adminEmail: userEmail,
        adminName: userName,
        coadmins: filteredCoadmins,
        currentTab: currentTab,
        recurringMeeting: values.schedule,
        oneTimeMeeting: values.oneTimeMeeting,
        meetingName: values.meetingName,
        meetingDescription: values.meetingDescription,
        meetingType: values.meetingType,
        duration: values.duration,
        meetingLink: values.meetingLink,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Failed to save team to database", data);
      return -1;
    }
    toast("Successfully Created Team");
    navigate("/dashboard/teams");
    return 0;
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
          <div className="border rounded-lg p-4">
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
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex">
              <div className="my-auto">
                <FormLabel className="mb-2">Co-admins</FormLabel>
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
          <CreateMeating
            form={form}
            meetingTypeSelection={meetingTypeSelection}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
          <div className="flex w-full justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
