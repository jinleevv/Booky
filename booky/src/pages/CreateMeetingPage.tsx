import { Label } from "@/components/ui/label";
import CreateMeeting from "@/features/CreateTeam/CreateMeeting";
import DashboardNavBar from "@/features/DashboardNavBar";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { parseZonedDateTime } from "@internationalized/date";
import { useState } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

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
  teamDescription: z.string(),
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

export default function CreateMeetingPage() {
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
  const [currentTab, setCurrentTab] = useState<string>("recurring");
  const meetingTypeSelection = form.watch("meetingType");

  function onSubmit() {}
  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="w-full px-3 py-4 relative z-10 bg-white font-outfit">
          <div className="flex w-full">
            <div className="grid w-full">
              <Label className="text-2xl font-bold text-black">
                New Meeting
              </Label>{" "}
              <Label className="text-xs text-gray-400">Teams Settings </Label>
            </div>
          </div>
          <div className="mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <CreateMeeting
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
          </div>
        </div>
      </div>
    </section>
  );
}
