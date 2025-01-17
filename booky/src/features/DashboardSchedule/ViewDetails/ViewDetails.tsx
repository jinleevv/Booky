import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
import { MeetingColumns, MeetingInformation } from "./columns";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { addDays, format, parseISO } from "date-fns";

interface ITimeRange {
  start: string;
  end: string;
}

interface ICancelledDays {
  day: string;
  meeting: ITimeRange;
}

interface IJoinAMeetingProps {
  teamId: string;
  teamName: string;
  teamDescription: string;
  setTeamName: React.Dispatch<React.SetStateAction<string>>;
  adminName: string;
  setAdminName: React.Dispatch<React.SetStateAction<string>>;
  adminEmail: string;
  setAdminEmail: React.Dispatch<React.SetStateAction<string>>;
  teamCoAdmin: string[];
  setTeamCoAdmin: React.Dispatch<React.SetStateAction<string[]>>;
  teamMembers: string[];
  setTeamMembers: React.Dispatch<React.SetStateAction<string[]>>;
  availableTimes: any[];
  setAvailableTimes: React.Dispatch<React.SetStateAction<any[]>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  existingAppointments: any[];
  setExistingAppointments: React.Dispatch<React.SetStateAction<any[]>>;
  cancelledDays: ICancelledDays[];
  setCancelledDays: React.Dispatch<React.SetStateAction<ICancelledDays[]>>;
  selectedHost: string | null;
  setSelectedHost: React.Dispatch<React.SetStateAction<string | null>>;
  enabledDays: Set<number>;
  setEnabledDays: React.Dispatch<React.SetStateAction<Set<number>>>;
  createdAt: string;
}

export default function ViewDetails({
  teamId,
  teamName,
  teamDescription,
  setTeamName,
  adminName,
  setAdminName,
  adminEmail,
  setAdminEmail,
  teamCoAdmin,
  setTeamCoAdmin,
  teamMembers,
  setTeamMembers,
  availableTimes,
  setAvailableTimes,
  duration,
  setDuration,
  existingAppointments,
  setExistingAppointments,
  cancelledDays,
  setCancelledDays,
  selectedHost,
  setSelectedHost,
  enabledDays,
  setEnabledDays,
  createdAt,
}: IJoinAMeetingProps) {
  const navigate = useNavigate();
  const { server, userEmail } = useHook();
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [meetingData, setMeetingData] = useState<any>(null);

  // Load the initial value from local storage on component mount
  useEffect(() => {
    const storedMeeting = localStorage.getItem("ViewSelectedMeeting");
    const storedHost = localStorage.getItem("ViewSelectedHost");
    const meetingExpirationTime = localStorage.getItem(
      "ViewSelectedMeetingExpiration"
    );

    if (storedMeeting && meetingExpirationTime) {
      const now = new Date().getTime();
      if (now < parseInt(meetingExpirationTime, 10)) {
        setSelectedHost(storedHost);
        setSelectedMeeting(storedMeeting); // Value is still valid
      } else {
        // Value has expired
        localStorage.removeItem("ViewSelectedMeeting");
        localStorage.removeItem("ViewSelectedHost");
        localStorage.removeItem("ViewSelectedMeetingExpiration");
      }
    } else {
      const now = new Date().getTime();
      const expirationTime = now + 10 * 60 * 1000; // 10 minutes from now
      localStorage.setItem("ViewSelectedMeeting", selectedMeeting);
      localStorage.setItem("ViewSelectedHost", selectedHost);
      localStorage.setItem(
        "ViewSelectedMeetingExpiration",
        expirationTime.toString()
      );
    }
  }, []); // Runs only once on mount

  // Sync the state with local storage whenever it changes
  useEffect(() => {
    if (selectedMeeting !== null) {
      const now = new Date().getTime();
      const expirationTime = now + 10 * 60 * 1000; // 10 minutes from now

      localStorage.setItem("ViewSelectedMeeting", selectedMeeting);
      localStorage.setItem("ViewSelectedHost", selectedHost);
      localStorage.setItem(
        "ViewSelectedMeetingExpiration",
        expirationTime.toString()
      );
    } else {
      localStorage.removeItem("ViewSelectedMeeting");
      localStorage.removeItem("ViewSelectedHost");
      localStorage.removeItem("ViewSelectedMeetingExpiration");
    }
  }, [selectedMeeting]); // Runs whenever selectedMeeting changes

  useEffect(() => {
    if (availableTimes) {
      if (availableTimes.length > 0) {
        const weekSchedule = availableTimes[0].meeting.weekSchedule;
        const generatedMeetings = generateMeetings(createdAt, weekSchedule);
        setMeetingData(generatedMeetings);
      }
    }
  }, [availableTimes]);

  function generateMeetings(
    createdAt: string,
    weekSchedule: any[]
  ): MeetingInformation[] {
    const meetings: MeetingInformation[] = [];
    const startDate = parseISO(createdAt); // Convert `createdAt` to a Date object
    const today = new Date();
    const endDate = addDays(today, 7); // One week into the future

    for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
      const dayName = format(date, "EEEE"); // Get the day name (e.g., "Monday")

      // Find the matching schedule for the day
      const daySchedule = weekSchedule.find(
        (schedule) => schedule.day === dayName
      );

      if (daySchedule && daySchedule.enabled) {
        daySchedule.times.forEach((time: any) => {
          const startTime = time.start;
          const endTime = time.end;
          const formattedDate = format(date, "yyyy-MM-dd");

          meetings.push({
            id: `${formattedDate}-${startTime}-${endTime}`, // Unique ID
            teamId: teamId,
            date: formattedDate,
            time: `${startTime} - ${endTime}`,
          });
        });
      }
    }

    return meetings;
  }

  const columns = MeetingColumns();

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      const response = await fetch(
        `${server}/api/teams/${teamId}/meetings/${meetingId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        toast("Meeting deleted successfully!");
      } else {
        toast("Failed to delete the meeting");
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast("An error occurred while deleting the meeting.");
    }
  };

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
            {selectedHost ? (
              <>
                {availableTimes
                  .filter((meeting) => meeting.email === selectedHost)
                  .map((meeting) => (
                    <Card
                      className="w-1/2 border rounded-3xl shadow-md cursor-pointer"
                      onClick={() => setSelectedMeeting(meeting._id)}
                    >
                      <CardHeader className="pt-4">
                        <CardTitle className="flex justify-between">
                          <div className="flex my-auto gap-1">
                            <Label className="text-lg font-bold">
                              {meeting.meeting.name}
                            </Label>
                            <div className="my-auto">
                              {(adminEmail === userEmail ||
                                teamCoAdmin.includes(userEmail)) && (
                                <Button variant="ghost" className="w-5 h-5">
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
                                          handleDeleteMeeting(meeting._id);
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
                            Meeting Type: {meeting.meeting.schedule}
                          </Label>
                          <Label className="text-xs">
                            Description: {teamDescription}
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
                  <DataTable columns={columns} data={meetingData} />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
