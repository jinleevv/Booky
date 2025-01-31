import { Label } from "@/components/ui/label";
import CreateMeeting from "@/features/CreateTeam/CreateMeeting";
import DashboardNavBar from "@/features/DashboardNavBar";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { parseZonedDateTime } from "@internationalized/date";
import { toast } from "sonner";
import { useHook } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
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
  meetingName: z.string().min(1, "Please define name for the meeting"),
  meetingDescription: z.string(),
  meetingLink: z.string(),
  recurringMeetingSchedule: z.array(
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
  oneTimeMeetingSchedule: z.object({
    start: z.any(),
    end: z.any(),
  }),
  meetingType: z.enum(["oneOnOne", "group"], {
    required_error: "You need to select the type.",
  }),
  duration: z.string(),
});

const formatDateTime = (dateObject: any): string => {
  const { year, month, day, hour, minute } = dateObject;

  // Pad month, day, hour, and minute with leading zeros if needed
  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
};

export default function CreateMeetingPage() {
  const { teamId } = useParams();
  const { server, userEmail, userName } = useHook();
  const [currentTab, setCurrentTab] = useState<string>("recurring");
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingName: "",
      meetingDescription: "",
      meetingLink: "",
      recurringMeetingSchedule: days.map((day) => ({
        day,
        enabled: false,
        times: [{ start: "09:00 AM", end: "05:00 PM" }],
      })),      
      oneTimeMeetingSchedule: {
        start: formatDateTime(
          parseZonedDateTime(`${new Date().toISOString().split("T")[0]}T09:00[America/Toronto]`)
        ),
        end: formatDateTime(
          parseZonedDateTime(`${new Date().toISOString().split("T")[0]}T17:00[America/Toronto]`)
        ),
      },
      duration: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.meetingType === "oneOnOne" && values.duration == "") {
      toast("Please select duration");
      return;
    }
    
    const response = await fetch(`${server}/api/teams/${teamId}/meetingTeam`, {
      method:"POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hostEmail: userEmail,
        hostName: userName,
        meetingName: values.meetingName,
        meetingDescription: values.meetingDescription,
        recurringMeetingSchedule: values.recurringMeetingSchedule,
        oneTimeMeetingSchedule: values.oneTimeMeetingSchedule,
        meetingType: values.meetingType,
        duration: values.duration,
        meetingLink: values.meetingLink,
        currentTab: currentTab,
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Failed to save meeting", data);
      return -1;
    }
    toast("Successfully Created Meeting");
    navigate(`/dashboard/${teamId}`);
    return 0;
  }

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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <CreateMeeting
                  form={form}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                />
                <div className="flex w-full justify-end">
                  <Button type="submit">
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}