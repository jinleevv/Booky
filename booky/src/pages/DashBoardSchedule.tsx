import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JoinAMeeting from "@/features/DashboardSchedule/JoinAMeeting";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useHook } from "@/hooks";
import ViewDetails from "@/features/DashboardSchedule/ViewDetails/ViewDetails";
import { useLocation } from "react-router-dom";

interface ITimeRange {
  start: string;
  end: string;
}

interface ICancelledDays {
  day: string;
  meeting: ITimeRange;
}

export default function DashBoardSchedule() {
  const { team: teamId } = useParams();
  const { server } = useHook();

  const [teamName, setTeamName] = useState<string>("Loading...");
  const [adminName, setAdminName] = useState<string>("Loading...");
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [teamDescription, setTeamDescription] = useState<string>("");
  const [teamCoAdmin, setTeamCoAdmin] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [meetingTeam, setMeetingTeam] = useState<any[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [cancelledDays, setCancelledDays] = useState<ICancelledDays[]>([]);
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [displayTabs, setDisplayTabs] = useState<string>("join");

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  useEffect(() => {
    const tab = localStorage.getItem("DisplayDashboardSchedule");
    if (tab === "view") {
      setDisplayTabs("view");
    } else {
      setDisplayTabs("join");
    }
    localStorage.removeItem("DisplayDashboardSchedule");
  }, []);

  async function fetchTeamDetails() {
    try {
      const response = await fetch(`${server}/api/teams/${teamId}`);
      const data = await response.json();

      if (response.ok) {
        setTeamName(data.teamName);
        setAdminName(data.adminName);
        setTeamDescription(data.teamDescription);
        setAdminEmail(data.adminEmail);
        setTeamCoAdmin(data.coadmins);
        setTeamMembers(data.members);
        setMeetingTeam(data.meetingTeam);
        setSelectedHost(data.adminEmail);
        setCreatedAt(data.createdAt);
      } else {
        setTeamName("Not Found");
        setAdminName("Not Found");
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
    }
  }

  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="grid w-full px-5 font-outfit">
          <div>
            <div className="w-full px-3 py-4 relative z-20">
              <div className="grid w-full">
                <Label className="text-2xl font-bold text-black">
                  Schedule
                </Label>{" "}
                <Label className="text-xs text-gray-400">Join a Meeting</Label>
              </div>
            </div>
            <div>
              <Tabs
                value={displayTabs}
                onValueChange={(value) => setDisplayTabs(value)}
              >
                <TabsList>
                  <TabsTrigger value="join">Join a Meeting</TabsTrigger>
                  <TabsTrigger value="view">View</TabsTrigger>
                </TabsList>
                <TabsContent value="join">
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
                    existingAppointments={existingAppointments}
                    cancelledDays={cancelledDays}
                    selectedHost={selectedHost}
                    setSelectedHost={setSelectedHost}
                  />
                </TabsContent>
                <TabsContent value="view">
                  <ViewDetails
                    teamId={teamId}
                    teamName={teamName}
                    teamDescription={teamDescription}
                    adminEmail={adminEmail}
                    teamCoAdmin={teamCoAdmin}
                    teamMembers={teamMembers}
                    setTeamMembers={setTeamMembers}
                    meetingTeam={meetingTeam}
                    setMeetingTeam={setMeetingTeam}
                    existingAppointments={existingAppointments}
                    cancelledDays={cancelledDays}
                    selectedHost={selectedHost}
                    setSelectedHost={setSelectedHost}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
