import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
import { IoIosAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHook } from "@/hooks";
import { Trash, Settings, Copy } from "lucide-react";
import { toast } from "sonner";

export default function DashBoardTeams() {
  const navigate = useNavigate();
  const { server, userEmail } = useHook();
  const [teams, setTeams] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Retrieve teams that the user is a part of
  useEffect(() => {
    if (userEmail) {
      const fetchTeams = async () => {
        try {
          const response = await fetch(
            `${server}/api/teams/by-user?userEmail=${userEmail}`
          );
          const data = await response.json();

          if (response.ok) {
            setTeams(data);
          }
        } catch (err) {
          setError("Error fetching teams");
        }
      };

      fetchTeams();
    }
  }, [userEmail]);

  const handleCardClick = (teamId: string) => {
    // Navigate to the schedule page for the clicked team
    navigate(`/dashboard/${teamId}`);
  };

  async function handleRemoveTeam(teamId: string) {
    const response = await fetch(
      `${server}/api/team/remove-user-from-team?teamId=${teamId}&userEmail=${userEmail}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      toast("Failed to delete the team");
      return;
    }

    setTeams((prevTeams) => prevTeams.filter((team) => team._id !== teamId));
    toast("Successfully deleted the team");
  }

  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="w-full px-3 py-4 relative z-20 font-outfit">
          <div className="flex w-full">
            <div className="grid w-full">
              <Label className="text-2xl font-bold text-black">Teams</Label>{" "}
              <Label className="text-xs text-gray-400">
                Create and Manage your Teams{" "}
              </Label>
            </div>
            <div className="m-auto">
              <Button onClick={() => navigate("/dashboard/teams/create-team")}>
                <IoIosAdd />
                New Team
              </Button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {error && <p className="text-red-500">{error}</p>}
            {teams.map((team) => (
              <Card
                key={team._id}
                className="border rounded-3xl shadow-md cursor-pointer"
                onClick={() => handleCardClick(team._id)}
              >
                <CardHeader className="pt-4">
                  <CardTitle className="flex justify-between">
                    <div className="flex my-auto gap-1">
                      <Label className="text-lg font-bold">{team.name}</Label>
                      <div className="my-auto">
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            const el = document.createElement("textarea");
                            el.value = team._id;
                            el.style.position = "absolute";
                            el.style.left = "-9999px";
                            document.body.appendChild(el);

                            el.select();
                            document.execCommand("copy");
                            document.body.removeChild(el);

                            toast("Team Code copied to clipboard!");
                          }}
                          className="w-5 h-5"
                        >
                          <Copy size={5} />
                        </Button>
                        {(team.adminEmail === userEmail ||
                          team.coadmins.includes(userEmail)) && (
                          <Button
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/${team._id}/settings`);
                            }}
                            className="w-5 h-5"
                          >
                            <Settings size={10} />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="my-auto">
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTeam(team._id);
                        }}
                        className="text-red-700 w-5 h-5"
                      >
                        <Trash size={10} />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="grid space-y-1">
                    <Label className="text-xs">ID: {team._id}</Label>
                    <Label className="text-xs">Admin: {team.adminEmail}</Label>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
