import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Participant } from "@/pages/ParticipatePoll";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseZonedDateTime } from "@internationalized/date";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import CreateMeeting from "../CreateTeam/CreateMeeting";

type CreateMeetingFromPollProps = {
  participants: Participant[];
};

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
  startDate: z.string(),
  meetingFrequency: z.string(),
  oneTimeMeetingSchedule: z.object({
    start: z.any(),
    end: z.any(),
  }),
  meetingType: z.enum(["group"]).default("group"),
  duration: z.string(),
});

const formatDateTime = (dateObject: any): string => {
  const { year, month, day, hour, minute } = dateObject;

  // Pad month, day, hour, and minute with leading zeros if needed
  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
};

export default function CreateMeetingFromPoll({
  participants,
}: CreateMeetingFromPollProps) {
  const { teamId } = useParams();
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
      startDate: `${new Date().toISOString().split("T")[0]}`,
      meetingFrequency: "Weekly",
      oneTimeMeetingSchedule: {
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
      duration: "",
      meetingType: "group",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch(`/api/teams/${teamId}/meetingTeam`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // !TODO: this needs to be fixed
        meetingName: values.meetingName,
        meetingDescription: values.meetingDescription,
        recurringMeetingSchedule: values.recurringMeetingSchedule,
        startDate: values.startDate,
        meetingFrequency: values.meetingFrequency,
        oneTimeMeetingSchedule: values.oneTimeMeetingSchedule,
        meetingType: values.meetingType,
        duration: values.duration,
        meetingLink: values.meetingLink,
        currentTab: currentTab,
      }),
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
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-xl">Create Team</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">
            New Meeting
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CreateMeeting
                form={form}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
              />
              <div className="flex w-full justify-end">
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
