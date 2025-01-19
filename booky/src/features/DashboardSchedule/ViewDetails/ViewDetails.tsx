import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { IoPersonCircle } from "react-icons/io5";
import { TbCalendarCancel, TbEdit } from "react-icons/tb";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { useHook } from "@/hooks";
import { DataTable } from "./data-table";
import { MeetingColumns } from "./columns";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

interface ITimeRange {
  start: string;
  end: string;
}

interface ICancelledDays {
  day: string;
  meeting: ITimeRange;
}

interface IViewDetailsProps {
  teamId: string;
  teamName: string;
  teamDescription: string;
  adminEmail: string;
  teamCoAdmin: string[];
  teamMembers: string[];
  setTeamMembers: React.Dispatch<React.SetStateAction<string[]>>;
  meetingTeam: any[];
  setMeetingTeam: React.Dispatch<React.SetStateAction<any>>;
  duration: number;
  existingAppointments: any[];
  cancelledDays: ICancelledDays[];
  selectedHost: string | null;
  setSelectedHost: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function ViewDetails({
  teamId,
  teamName,
  teamDescription,
  adminEmail,
  teamCoAdmin,
  teamMembers,
  setTeamMembers,
  meetingTeam,
  setMeetingTeam,
  duration,
  selectedHost,
  setSelectedHost,
}: IViewDetailsProps) {
  const navigate = useNavigate();
  const { server, userEmail } = useHook();
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [meetingData, setMeetingData] = useState<any>(null);

  useEffect(() => {
    if (meetingTeam && meetingTeam.length > 0) {
      const displayMeetingTeams = meetingTeam.filter(
        (team) => team.hostEmail === selectedHost
      );
      setMeetingData(displayMeetingTeams);
    }
  }, [selectedHost, meetingTeam]);

  const columns = MeetingColumns();

  async function handleRemoveMeetingTeam(meetingTeamId: string) {
    try {
      const response = await fetch(
        `${server}/api/teams/${teamId}/team-meetings/${meetingTeamId}`,
        { 
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      if (!response.ok) {
        toast("Failed to delete the team meeting");
        return;
      }

      setMeetingTeam((prevMeetings) => prevMeetings.filter(meeting => meeting._id !== meetingTeamId));
      toast("Team meeting deleted successfully!");
    } catch (error) {
      console.error("Error deleting team meeting:", error);
      toast("An error occurred while deleting the team meeting.");
    }
  }

  return (
    <div className="flex w-full h-full gap-2">
      <div className="flex flex-col w-1/6 h-5/6 gap-2">
        <div className="grid w-full gap-1">
          <Label className="text-medium font-bold">Admin</Label>
          <div className="w-full h-full overflow-hidden">
            <Button
              variant="ghost"
              className="flex w-full justify-start"
              onClick={() => setSelectedHost(adminEmail)}
            >
              <Label
                className={`flex w-full gap-1 font-normal ${
                  selectedHost == adminEmail ? "text-red-700" : "text-black"
                }`}
              >
                <IoPersonCircle size={24} className="text-gray-600" />
                <div
                  className="overflow-auto w-full text-left"
                  title={adminEmail}
                >
                  {adminEmail}
                </div>
              </Label>
            </Button>
          </div>
        </div>
        <div className="grid w-full gap-1">
          <Label className="text-medium font-bold">Co-Admin</Label>
          <div className="w-full h-full overflow-x-hidden overflow-y-auto">
            {teamCoAdmin.map((email) => (
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={() => {
                  setSelectedHost(email);
                  setSelectedMeeting(null);
                }}
              >
                <Label
                  className={`flex w-full gap-1 font-normal ${
                    selectedHost == email ? "text-red-700" : "text-black"
                  }`}
                >
                  <IoPersonCircle size={24} className="text-gray-600" />
                  <div className="overflow-auto w-full text-left" title={email}>
                    {email}
                  </div>
                </Label>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col w-5/6 h-full border border-dashed rounded-lg p-4">
        {selectedMeeting === null ? (
          <div className="flex flex-col w-full mt-1.5 p-0 gap-2">
            <Label className="text-lg font-bold">Meetings</Label>
            {meetingData ? (
              <>
                {meetingData.map((meeting) => (
                  <Card
                    className="w-1/2 border rounded-3xl shadow-md cursor-pointer"
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <CardHeader className="pt-4">
                      <CardTitle className="flex justify-between">
                        <div className="flex my-auto gap-1">
                          <Label className="text-lg font-bold">
                            {meeting.meetingName}
                          </Label>
                          <div className="my-auto">
                            {(adminEmail === userEmail ||
                              teamCoAdmin.includes(userEmail)) && (
                              <Button
                                variant="ghost"
                                className="w-5 h-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/dashboard/${teamId}/edit-meeting/${meeting._id}`
                                  );
                                }}
                              >
                                <TbEdit size={10} />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="my-auto">
                          {(adminEmail === userEmail ||
                            teamCoAdmin.includes(userEmail)) && (
                            <>
                              <Button variant="ghost" className="w-5 h-5">
                                <TbCalendarCancel size={10} />
                              </Button>
                              <Dialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="text-red-700 hover:text-red-700 w-5 h-5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <Trash size={10} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <DialogHeader>
                                    <DialogTitle>Delete Meeting</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete this
                                      meeting? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={(e) => {
                                        setIsDialogOpen(false);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={(e) => {
                                        handleRemoveMeetingTeam(meeting._id);
                                        setIsDialogOpen(false);
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </CardTitle>
                      <CardDescription className="grid space-y-1">
                        <Label className="text-xs">
                          Meeting Type: {meeting.schedule}
                        </Label>
                        <Label className="text-xs">
                          Description: {meeting.meetingDescription}
                        </Label>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col w-full mt-1.5 p-0 gap-2">
              <div className="-ml-2 rounded-2xl">
                <Button
                  variant="ghost"
                  className="gap-1.5 w-20 rounded-xl"
                  onClick={() => {
                    setSelectedMeeting(null);
                  }}
                >
                  <HiOutlineArrowNarrowLeft size={25} />
                  Back
                </Button>
              </div>

              <Label className="text-lg font-bold">Meeting Name</Label>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Meeting Details</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <DataTable
                    columns={columns}
                    data={selectedMeeting.meeting?.map((meeting) => ({
                      ...meeting,
                      teamId: teamId, // Dynamically add teamId
                      meetingTeamId: selectedMeeting._id,
                    }))}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
