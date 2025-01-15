import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseZonedDateTime } from "@internationalized/date";
import { toast } from "sonner";
import { useHook } from "@/hooks";
import { Label } from "@/components/ui/label";
import { DataTable } from "./data-table";
import { columns, TeamMembers } from "./columns";
import InviteCoAdmin from "../InviteCoAdmin";
import UpdateDescription from "./UpdateDescription";

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
  meetingName: z.string().min(1, "Please enter a name."),
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

export default function TeamSettings() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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

  const navigate = useNavigate();
  const { team: teamId } = useParams();
  const { server } = useHook(); // Use global state from the hook
  const [teamName, setTeamName] = useState<string | null>(null);
  const [teamDescription, setTeamDescription] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch team name on load
  useEffect(() => {
    const fetchTeam = async () => {
      const response = await fetch(`${server}/api/teams/${teamId}`);
      const data = await response.json();
      if (response.ok) {
        const dataTeamMembers: [string, string][] = [
          ...data.coadmins.map(
            (email) => [email, "co-admin"] as [string, string]
          ),
          ...data.members.map((email) => [email, "member"] as [string, string]),
        ];

        const teamMembersList = dataTeamMembers.map(([email, role]) => ({
          teamId: teamId,
          email,
          role,
        }));

        setTeamName(data.name);
        setTeamDescription(data.teamDescription);
        setTeamMembers(teamMembersList);
      } else {
        console.error("Failed to fetch team details");
        toast("Failed to fetch team details");
        navigate("/dashboard/teams");
      }
    };
    fetchTeam();
  }, [teamId, server, navigate]);

  const handleFormSubmitSuccess = () => {
    setIsDialogOpen(false);
    window.location.reload();
  };

  return (
    <section className="h-5/6 flex flex-col mt-10 bg-white font-outfit space-y-2">
      {/* Team Name Display */}
      <div className="flex w-full gap-2">
        <div className="flex w-full gap-2">
          <div className="w-1/2 border rounded-2xl p-4">
            <Label className="font-bold">
              Team:
              <Label className="ml-1">{teamName || "Loading..."}</Label>
            </Label>
          </div>
          <div className="w-1/2 border rounded-2xl p-4">
            <Label className="font-bold">
              Admin:
              <Label className="ml-1">{teamName || "Loading..."}</Label>
            </Label>
          </div>
        </div>
        <div>
          <Dialog>
            <DialogTrigger className="h-full w-full">
              <Button variant="outline" className="h-full rounded-2xl">
                <Plus />
                Co-Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Co-Admin</DialogTitle>
                <DialogDescription>
                  <InviteCoAdmin teamId={teamId} onAddCoadmin={() => null} />
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex w-full justify-between border rounded-2xl p-4">
        <Label className="font-bold my-auto">
          Description:
          <Label className="ml-1">{teamDescription || "Loading..."}</Label>
        </Label>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className="h-full w-full">
              <Button variant="ghost" className="w-5">
                <Edit size={15} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Description</DialogTitle>
                <DialogDescription>
                  <UpdateDescription
                    teamId={teamId}
                    onSuccess={handleFormSubmitSuccess}
                  />
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="w-full h-full border rounded-2xl p-4">
        <Label className="font-bold">
          Members{" "}
          <Label className="text-xs text-gray-500">
            Total: {teamMembers.length}
          </Label>
        </Label>
        <DataTable columns={columns} data={teamMembers} />
      </div>
    </section>
  );
}
