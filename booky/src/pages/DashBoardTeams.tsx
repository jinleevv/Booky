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
import { Trash, Settings } from "lucide-react";
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
        <div className="w-full px-3 py-4 relative z-20">
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
                className="border rounded shadow-md cursor-pointer"
                onClick={() => handleCardClick(team._id)}
              >
                <CardHeader>
                  <CardTitle className="flex text-lg font-bold justify-between">
                    {team.name}
                    <div className="flex space-x-1">
                      {team.coadmins.includes(userEmail) && (
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/${team._id}/settings`);
                          }}
                        >
                          <Settings size={20} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTeam(team._id);
                        }}
                      >
                        <Trash size={20} />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>Professor: {team.admin}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
