import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JoinAMeeting from "@/features/DashboardSchedule/JoinAMeeting";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useHook } from "@/hooks";
import ViewDetails from "@/features/DashboardSchedule/ViewDetails/ViewDetails";

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
  const { server, userEmail, loggedInUser } = useHook();

  const [teamName, setTeamName] = useState<string>("Loading...");
  const [adminName, setAdminName] = useState<string>("Loading...");
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [teamCoAdmin, setTeamCoAdmin] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<any[]>([]);
  const [duration, setDuration] = useState<number>(5);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [cancelledDays, setCancelledDays] = useState<ICancelledDays[]>([]);
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [enabledDays, setEnabledDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  async function fetchTeamDetails() {
    try {
      const response = await fetch(`${server}/api/teams/${teamId}`);
      const data = await response.json();

      if (response.ok) {
        setTeamName(data.name);
        setAdminName(data.adminName);
        setAdminEmail(data.adminEmail);
        setTeamCoAdmin(data.coadmins);
        setTeamMembers(data.members);

        setAvailableTimes(data.availableTimes);
        setDuration(parseInt(data.durations[0], 10));
        setExistingAppointments(data.appointments);
        setCancelledDays(data.cancelledMeetings);
        setSelectedHost(data.adminEmail);
        updateEnabledDays(data.adminEmail);
      } else {
        setTeamName("Not Found");
        setAdminName("Not Found");
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
    }
  }

  const updateEnabledDays = (email: string) => {
    const dayMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    // Recalculate enabledDays based on the admin's availability
    const enabled = availableTimes[email]?.reduce((acc: number[], day: any) => {
      if (day.enabled && dayMap[day.day] !== undefined) {
        acc.push(dayMap[day.day]);
      }
      return acc;
    }, []);

    setEnabledDays(new Set(enabled)); // Update the enabledDays state
  };

  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="grid w-full px-5">
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
              <Tabs defaultValue="join">
                <TabsList>
                  <TabsTrigger value="join">Join a Meeting</TabsTrigger>
                  <TabsTrigger value="view">View</TabsTrigger>
                </TabsList>
                <TabsContent value="join">
                  <JoinAMeeting
                    teamId={teamId}
                    teamName={teamName}
                    setTeamName={setTeamName}
                    adminName={adminName}
                    setAdminName={setAdminName}
                    adminEmail={adminEmail}
                    setAdminEmail={setAdminEmail}
                    teamCoAdmin={teamCoAdmin}
                    setTeamCoAdmin={setTeamCoAdmin}
                    teamMembers={teamMembers}
                    setTeamMembers={setTeamMembers}
                    availableTimes={availableTimes}
                    setAvailableTimes={setAvailableTimes}
                    duration={duration}
                    setDuration={setDuration}
                    existingAppointments={existingAppointments}
                    setExistingAppointments={setExistingAppointments}
                    cancelledDays={cancelledDays}
                    setCancelledDays={setCancelledDays}
                    selectedHost={selectedHost}
                    setSelectedHost={setSelectedHost}
                    enabledDays={enabledDays}
                    setEnabledDays={setEnabledDays}
                  />
                </TabsContent>
                <TabsContent value="view">
                  <ViewDetails />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
