import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
import { IoIosAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase"; // Firebase authentication
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Assuming you have the card component
import { User } from "firebase/auth"; // Import user type for TypeScript
import { useHook } from "@/hooks";
import { Trash } from "lucide-react";
import { toast } from "sonner";

export default function DashBoardTeams() {
  const navigate = useNavigate();
  const { server } = useHook();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get the user's email from Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        setUserEmail(user.email); // Store the user's email
      }
    });
    return () => unsubscribe(); // Clean up on component unmount
  }, []);

  // Fetch teams from the backend API
  useEffect(() => {
    if (userEmail) {
      const fetchTeams = async () => {
        try {
          const response = await fetch(
            `${server}/api/teams/by-user?userEmail=${userEmail}`
          );
          const data = await response.json();

          if (response.ok) {
            setTeams(data); // Update the teams state
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
    }
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
                onClick={() => handleCardClick(team._id)} // Use navigate here
              >
                <CardHeader>
                  <CardTitle className="flex text-lg font-bold justify-between">
                    {team.name}
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveTeam(team._id)}
                    >
                      <Trash size={20} />
                    </Button>
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
