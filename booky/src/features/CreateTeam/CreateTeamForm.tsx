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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { parseZonedDateTime } from "@internationalized/date";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHook } from "@/hooks";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CreateMeeting from "./CreateMeeting";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import InviteCoAdmin from "./InviteCoAdmin";

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
  oneTimeMeetingSchedule: z.object({
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
      recurringMeetingSchedule: days.map((day) => ({
        day,
        enabled: false,
        times: [{ start: "09:00 AM", end: "05:00 PM" }],
      })),
      coadmins: [],
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
      meetingDescription: "",
      meetingLink: "",
    },
  });

  const { server, loggedInUser, userEmail, userName } = useHook();
  const [currentTab, setCurrentTab] = useState<string>("recurring");
  const [pendingCoAdmin, setPendingCoAdmin] = useState<string[]>([]);
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!loggedInUser) {
      console.error("No user is logged in");
      return;
    }

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
        teamName: values.teamName,
        teamDescription: values.teamDescription,
        adminEmail: userEmail,
        adminName: userName,
        coadmins: pendingCoAdmin,
        currentTab: currentTab,
        recurringMeeting: values.recurringMeetingSchedule,
        oneTimeMeeting: values.oneTimeMeetingSchedule,
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
    setPendingCoAdmin([]);
    toast("Successfully Created Team");
    navigate("/dashboard/teams");
    return 0;
  }

  return (
    <section className="grid mt-4 bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex w-full gap-2">
            <div className="w-1/3 h-full border rounded-2xl p-3">
              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="flex w-full gap-2">
                      <FormLabel className="w-24 mt-auto mb-auto">
                        Team Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
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
            <div className="w-1/3 border rounded-2xl p-3">
              <div className="flex w-full h-full">
                <Label className="my-auto">Admin: {userName}</Label>
              </div>
            </div>
            <div className="w-1/3 border rounded-2xl p-3">
              <div className="flex flex-col w-full h-full">
                <div className="flex w-full h-full">
                  <Label className="my-auto">Co-Admin</Label>
                  <div className="flex w-full overflow-auto gap-2 mt-2">
                    {pendingCoAdmin.map((email) => (
                      <div className="h-full w-fit px-2 rounded-full bg-gray-700 text-white">
                        <Label>{email}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Dialog>
                <DialogTrigger className="h-full w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-full rounded-2xl"
                  >
                    <Plus />
                    Co-Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Co-Admin</DialogTitle>
                    <DialogDescription>
                      <InviteCoAdmin
                        teamId={"CreateTeam"}
                        onAddCoadmin={(email) =>
                          setPendingCoAdmin((prev) => [...prev, email])
                        }
                      />
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="w-full h-fit border rounded-2xl p-3">
            <FormField
              control={form.control}
              name="teamDescription"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex w-full gap-2">
                    <FormLabel className="w-32 mt-auto mb-auto">
                      Team Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Team Description"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
    </section>
  );
}
