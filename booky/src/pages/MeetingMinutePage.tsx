import MeetingMinute from "@/features/MeetingMinute/MeetingMinute";
import { useHook } from "@/hooks";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function MeetingMinutePage() {
  const { teamId } = useParams();
  const { server, userEmail } = useHook();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeamDetails();
  }, []);

  async function fetchTeamDetails() {
    try {
      const response = await fetch(`${server}/api/teams/${teamId}`);
      const data = await response.json();

      if (response.ok) {
        const teamCoAdmin = data.coadmins;
        const teamAdmin = data.adminEmail;
        if (userEmail !== teamAdmin || !teamCoAdmin.includes(userEmail)) {
          navigate(`/dashboard/${teamId}`);
        }
      } else {
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
    }
  }

  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <div className="w-full h-full px-3 py-4 relative z-10 font-outfit">
          <div>
            <MeetingMinute />
          </div>
        </div>
      </div>
    </section>
  );
}
