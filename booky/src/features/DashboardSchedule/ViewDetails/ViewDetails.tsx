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
import { useSearchParams } from "react-router-dom";
import { Merge } from "lucide-react";

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
  selectedHost,
  setSelectedHost,
}: IViewDetailsProps) {
  const navigate = useNavigate();
  const { server, userEmail } = useHook();
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [meetingData, setMeetingData] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const meetingTeamIdFromParam = searchParams.get("meetingTeamId");
  const [checkedMeetings, setCheckedMeetings] = useState<
    { meetingId: string; date: string }[]
  >([]);
  const [meetingList, setMeetingList] = useState<any[]>([]);

  useEffect(() => {
    if (meetingTeam && meetingTeam.length > 0) {
      const displayMeetingTeams = meetingTeam.filter(
        (team) => team.hostEmail === selectedHost
      );
      setMeetingData(displayMeetingTeams);
    }

    if (meetingTeam && meetingTeamIdFromParam) {
      const meetingTeamToShow = meetingTeam.find(
        (m) => m._id === meetingTeamIdFromParam
      );
      if (meetingTeamToShow) setSelectedMeeting(meetingTeamToShow);
    }
  }, [selectedHost, meetingTeam]);

  const columns = MeetingColumns(checkedMeetings, setCheckedMeetings);

  async function handleRemoveMeetingTeam(meetingTeamId: string) {
    try {
      const response = await fetch(
        `${server}/api/teams/${teamId}/team-meetings/${meetingTeamId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        toast("Failed to delete the team meeting");
        return;
      }

      setMeetingTeam((prevMeetings) =>
        prevMeetings.filter((meeting) => meeting._id !== meetingTeamId)
      );
      toast("Team meeting deleted successfully!");
    } catch (error) {
      console.error("Error deleting team meeting:", error);
      toast("An error occurred while deleting the team meeting.");
    }
  }

  async function handleMergeMeetings() {
    // Remove merged meetings
    const sortedMeetings = [...checkedMeetings].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    const meetingsToDelete = sortedMeetings.slice(1).map((m) => m.meetingId);

    try {
      const response = await fetch(
        `${server}/api/teams/${teamId}/${selectedMeeting._id}/delete-meetings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ meetingsToDelete }),
        }
      );
      if (!response.ok) {
        toast("Failed to merge the meetings");
        return;
      }

      // Merge meeting minutes
      const mergeMinutesResponse = await fetch(
        `${server}/api/document/${teamId}/${selectedMeeting._id}/merge-meeting-minutes`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meetingMinutesToMerge: sortedMeetings.map((m) => m.meetingId),
          }),
        }
      );

      if (!mergeMinutesResponse.ok) {
        toast("Failed to merge the meeting minutes");
        return;
      }

      const updatedMeetings = meetingList.filter(
        (meeting) => !meetingsToDelete.includes(meeting._id)
      );
      setMeetingList(updatedMeetings);
      setCheckedMeetings([]);

      toast("Meetings merged successfully!");
    } catch (error) {
      console.error("Error merging meetings:", error);
      toast("An error occurred while merging the meetings.");
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
                <div className="grid grid-cols-2 gap-x-3 gap-y-3 w-full">
                  {meetingData.map((meeting) => (
                    <Card
                      className="w-full border rounded-3xl shadow-md cursor-pointer"
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setMeetingList(meeting.meeting);
                      }}
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
                                      `/dashboard/${teamId}/edit-meetingTeam/${meeting._id}`
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
                </div>
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

              <Label className="text-lg font-bold">
                {selectedMeeting.meetingName}
              </Label>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Meeting Details</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <div className="flex justify-end mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          disabled={checkedMeetings.length < 2}
                        >
                          <Merge />
                          Merge Selected
                        </Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent onClick={(e) => e.stopPropagation()}>
                      <DialogHeader>
                        <DialogTitle>Merge Meeting Minutes</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to merge the selected meeting
                          minutes? This action cannot be undone.
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
                          className="bg-black text-white hover:bg-gray-800"
                          onClick={(e) => {
                            handleMergeMeetings();
                            setIsDialogOpen(false);
                          }}
                        >
                          Merge
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <DataTable
                    columns={columns}
                    data={meetingList.map((meeting) => ({
                      ...meeting,
                      teamId: teamId, // Dynamically add teamId
                      meetingTeamId: selectedMeeting._id,
                      meetingTeamName: selectedMeeting.meetingName,
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
