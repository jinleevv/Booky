import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardNavBar from "@/features/DashboardNavBar";
import { useHook } from "@/hooks";
import { useEffect, useState } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function MeetingDetails() {
  const navigate = useNavigate();
  const { teamId, meetingTeamId, meetingId } = useParams();
  const { server } = useHook();

  const [meetingData, setMeetingData] = useState<any>(null);
  const [meetingMinuteData, setMeetingMinuteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const fetchMeetingData = async () => {
      if (!meetingId) return;
      try {
        const response = await fetch(
          `${server}/api/teams/${teamId}/${meetingTeamId}/meetings/${meetingId}`
        );
        const data = await response.json();
        setMeetingData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch meeting data:", error);
      }
    };
    fetchMeetingData();
    localStorage.setItem("DisplayDashboardSchedule", "view");
  }, []);

  useEffect(() => {
    const fetchMeetingMinuteData = async () => {
      if (!meetingId) return;
      try {
        const response = await fetch(`${server}/api/document/${meetingId}`);
        const data = await response.json();
        setMeetingMinuteData(data);
      } catch (error) {
        toast.error("Failed to fetch meeting data:", error);
      }
    };
    fetchMeetingMinuteData();
  }, [meetingData]);

  return (
    <section className="h-screen w-screen bg-white font-outfit">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="flex flex-col w-full p-5">
          {isLoading ? (
            <>
              <div className="flex w-full h-full items-center justify-center">
                <div className="w-6 h-6 border-4 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col w-full h-fit mb-2">
                <div className="-ml-4 rounded-2xl">
                  <Button
                    variant="ghost"
                    className="gap-1.5 w-20 rounded-xl"
                    onClick={() => navigate(`/dashboard/${teamId}`)}
                  >
                    <HiOutlineArrowNarrowLeft size={25} />
                    Back
                  </Button>
                </div>
                <Label className="text-lg font-bold">Meeting Name</Label>
                <Label className="text-sm font-light text-gray-600">
                  Date: {meetingData.date}
                </Label>
                <Label className="text-sm font-light text-gray-600">
                  Time: {meetingData.time.start} - {meetingData.time.end}
                </Label>
              </div>
              <div className="p-4 w-full h-full border border-dashed rounded-lg">
                <div className="w-full h-fit">
                  <Label className="text-medium font-bold">
                    Meeting Minute{" "}
                  </Label>{" "}
                  <Button
                    variant="ghost"
                    className="w-10"
                    onClick={() =>
                      navigate(
                        `/dashboard/document/${meetingData.date}/${meetingData.time.start} - ${meetingData.time.end}/${meetingId}`
                      )
                    }
                  >
                    Link
                  </Button>
                </div>
                <div>
                  <Label>Preview:</Label>
                  <ScrollArea className="w-full h-36 text-sm border rounded-lg p-3 mt-2">
                    {meetingMinuteData
                      ? meetingMinuteData.data
                        ? meetingMinuteData.data.ops[0].insert
                        : ""
                      : ""}
                  </ScrollArea>
                </div>
                <div className="mt-6">
                  <Label className="text-medium font-bold">Tasks</Label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
