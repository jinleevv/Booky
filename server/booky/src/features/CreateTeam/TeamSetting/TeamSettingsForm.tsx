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
import { Label } from "@/components/ui/label";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import InviteCoAdmin from "../InviteCoAdmin";
import UpdateDescription from "./UpdateDescription";

export default function TeamSettings() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [teamAdmin, setTeamAdmin] = useState<string | null>(null);
  const [teamDescription, setTeamDescription] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch team name on load
  useEffect(() => {
    const fetchTeam = async () => {
      const response = await fetch(`http://localhost:10000/api/teams/${teamId}`);
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
        setTeamDescription(data.teamDescription);
        setTeamMembers(teamMembersList);
      } else {
        toast("Failed to fetch team details");
        navigate("/dashboard/teams");
      }
    };
    fetchTeam();
  }, [teamId, navigate]);

  const handleFormSubmitSuccess = () => {
    setIsDialogOpen(false);
    window.location.reload();
  };

  return (
    <section className="h-5/6 flex flex-col mt-10 bg-white font-outfit space-y-2">
      {/* Team Name Display */}
      <div className="flex w-full gap-2">
        <div className="flex w-full gap-2">
          <div className="flex w-full border rounded-2xl p-4">
            <Label className="my-auto font-bold">
              Admin:
              <Label className="ml-1">{teamAdmin || "Loading..."}</Label>
            </Label>
            <div className="flex w-full">
              <Dialog>
                <DialogTrigger className="flex h-full w-full justify-end">
                  <Button className="h-full rounded-2xl">
                    <Plus />
                    Co-Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-4/5 rounded-lg">
                  <DialogHeader>
                    <DialogTitle>Invite Co-Admin</DialogTitle>
                    <DialogDescription>
                      <InviteCoAdmin
                        teamId={teamId}
                        onAddCoadmin={() => null}
                      />
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full justify-between border rounded-2xl p-4">
        <Label className="font-bold my-auto">
          Description:
          <Label className="ml-1">{teamDescription || ""}</Label>
        </Label>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger className="h-full w-full">
              <Button variant="ghost" className="w-5">
                <Edit size={15} />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-4/5 rounded-lg">
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
