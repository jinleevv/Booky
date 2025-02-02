import NavigationBar from "@/features/NavigationBar";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useHook } from "@/hooks";
import JoinAMeeting from "@/features/DashboardSchedule/JoinAMeeting";

export default function Schedule() {
  const { code: teamId } = useParams();
  const { server } = useHook();
  const [teamName, setTeamName] = useState<string>("Loading...");
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [teamDescription, setTeamDescription] = useState<string>("");
  const [teamCoAdmin, setTeamCoAdmin] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [meetingTeam, setMeetingTeam] = useState<any[]>([]);
  const [selectedHost, setSelectedHost] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  async function fetchTeamDetails() {
    try {
      const response = await fetch(`${server}/api/teams/${teamId}`);
      const data = await response.json();

      if (response.ok) {
        setTeamName(data.teamName);
        setTeamDescription(data.teamDescription);
        setAdminEmail(data.adminEmail);
        setTeamCoAdmin(data.coadmins);
        setTeamMembers(data.members);
        setMeetingTeam(data.meetingTeam);
        setSelectedHost(data.adminEmail);
      } else {
        setTeamName("Not Found");
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
    }
  }

  return (
    <section className="h-screen w-screen bg-white">
      <NavigationBar />
      <div className="flex flex-col items-center justify-center">
        <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2"></div>
      </div>
      <div className="flex relative w-4/5 h-5/6 m-auto">
        {teamName === "Not Found" ? (
          <>
            <div className="flex w-full h-20 justify-center items-center border border-dashed rounded-lg font-outfit text-sm">
              <h1>Team Not Found</h1>
            </div>
          </>
        ) : (
          <>
            <JoinAMeeting
              teamId={teamId}
              teamName={teamName}
              teamDescription={teamDescription}
              adminEmail={adminEmail}
              teamCoAdmin={teamCoAdmin}
              teamMembers={teamMembers}
              setTeamMembers={setTeamMembers}
              meetingTeam={meetingTeam}
              setMeetingTeam={setMeetingTeam}
              selectedHost={selectedHost}
              setSelectedHost={setSelectedHost}
            />
          </>
        )}
      </div>
    </section>
  );
}
