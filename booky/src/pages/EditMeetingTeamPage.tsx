import { Label } from "@/components/ui/label";
import EditMeetingTeam from "@/features/CreateTeam/TeamSetting/EditMeetingTeam";
import DashboardNavBar from "@/features/DashboardNavBar";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { parseZonedDateTime } from "@internationalized/date";
import { toast } from "sonner";
import { useHook } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
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

function formatZonedDateTime(date, time) {
  const [year, month, day] = date.split('-').map((value) => value.padStart(2, '0'));

  const [hour, minute] = time.split(':').map((value) => value.padStart(2, '0'));

  return `${year}-${month}-${day}T${hour}:${minute}[America/Toronto]`;
}

export default function EditMeetingTeamPage() {
  const { teamId, meetingTeamId } = useParams();
  const { server } = useHook();
  const [meetingData, setMeetingData] = useState<null | any>(null);
  const [currentTab, setCurrentTab] = useState<string>("recurring");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetingData = async () => {
      if (!meetingTeamId) return;
      try {
        const response = await fetch(`${server}/api/teams/${teamId}/meetingTeams/${meetingTeamId}`);
        const data = await response.json();
        setMeetingData(data);
      } catch (error) {
        console.error("Failed to fetch meeting data:", error);
      }
    }
    fetchMeetingData();
  }, [meetingTeamId, teamId]);

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
  
  useEffect(() => {
    if (meetingData) {
      setCurrentTab(meetingData.schedule === "recurring" ? "recurring" : "one-time");

      if (meetingData.schedule === "recurring") {
        const formattedData = {
          meetingName: meetingData.meetingName || "",
          meetingDescription: meetingData.meetingDescription || "",
          meetingLink: meetingData.zoomLink || "",
          recurringMeetingSchedule: meetingData.weekSchedule || [],
          oneTimeMeetingSchedule: {
            start: formatDateTime(
              parseZonedDateTime(`${new Date().toISOString().split("T")[0]}T09:00[America/Toronto]`)
            ),
            end: formatDateTime(
              parseZonedDateTime(`${new Date().toISOString().split("T")[0]}T17:00[America/Toronto]`)
            ),
          },
          meetingType: meetingData.type || "oneOnOne",
          duration: meetingData.duration || "",
        };
  
        form.reset(formattedData);
      }
      else {
        console.log(meetingData.date);
        const formattedData = {
          meetingName: meetingData.meetingName || "",
          meetingDescription: meetingData.meetingDescription || "",
          meetingLink: meetingData.zoomLink || "",
          oneTimeMeetingSchedule: {
            start: formatDateTime(
              parseZonedDateTime(
                formatZonedDateTime(
                  meetingData.date,
                  meetingData.time.start
                )
              )
            ),
            end: formatDateTime(
              parseZonedDateTime(
                formatZonedDateTime(
                  meetingData.date,
                  meetingData.time.end
                )
              )
            ),
          },
          meetingType: meetingData.type || "oneOnOne",
          duration: meetingData.duration || "",
        };
  
        form.reset(formattedData);
      }
    }
  }, [meetingData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.meetingType === "oneOnOne" && values.duration == "") {
      toast("Please select duration");
      return;
    }
    
    const response = await fetch(`${server}/api/teams/${teamId}/meetingTeams/${meetingTeamId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      console.error("Failed to save meetingTeam", data);
      return -1;
    }
    toast("Successfully Updated Meeting");
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
                Edit Meeting
              </Label>{" "}
              <Label className="text-xs text-gray-400">Teams Settings </Label>
            </div>
          </div>
          <div className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <EditMeetingTeam
                  form={form}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                />
                <div className="flex w-full justify-end">
                  <Button type="submit">Update Meeting</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}