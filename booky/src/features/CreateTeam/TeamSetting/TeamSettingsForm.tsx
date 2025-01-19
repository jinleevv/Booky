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
import { toast } from "sonner";
import { useHook } from "@/hooks";
import { Label } from "@/components/ui/label";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import InviteCoAdmin from "../InviteCoAdmin";
import UpdateDescription from "./UpdateDescription";

export default function TeamSettings() {
  const navigate = useNavigate();
  const { team: teamId } = useParams();
  const { server, userName } = useHook(); // Use global state from the hook
  const [teamAdmin, setTeamAdmin] = useState<string | null>(null);
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
        setTeamAdmin(data.adminEmail);
        setTeamName(data.teamName);
        setTeamDescription(data.teamDescription);
        setTeamMembers(teamMembersList);
      } else {
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
              <Label className="ml-1">{teamAdmin || "Loading..."}</Label>
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
