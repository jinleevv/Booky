import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
import { useHook } from "@/hooks";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useParams, useNavigate } from "react-router-dom";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { toast } from "sonner";

export default function MeetingDetails() {
  const navigate = useNavigate();
  const { teamId, meetingTeamId, meetingTeamName, meetingId } = useParams();
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

  // Convert Delta to HTML
  function renderQuillContent(delta) {
    if (!delta || !delta.ops) return "";

    const converter = new QuillDeltaToHtmlConverter(delta.ops, {
      inlineStyles: true, // Use inline styles for formatting
    });

    return converter.convert(); // Converts Delta to HTML
  }

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
                <Label className="text-lg font-bold">{meetingTeamName}</Label>
                <Label className="text-sm font-light text-gray-600">
                  Date: {meetingData.date}
                </Label>
                <Label className="text-sm font-light text-gray-600">
                  Time: {meetingData.time.start} - {meetingData.time.end}
                </Label>
              </div>
              <div className="p-4 w-full h-full border border-dashed rounded-lg">
                <div className="flex w-full h-6 my-auto">
                  <Label className="text-medium font-bold my-auto">
                    Meeting Minute{" "}
                  </Label>{" "}
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full h-full"
                      onClick={() =>
                        navigate(
                          `/dashboard/document/${meetingData.date}/${meetingData.time.start} - ${meetingData.time.end}/${meetingId}`
                        )
                      }
                    >
                      <ArrowRight size={15} />
                    </Button>
                  </div>
                </div>
                {meetingMinuteData ? (
                  meetingMinuteData.data ? (
                    <div
                      className="w-full h-[650px] p-4 mt-3 border rounded-lg text-sm" // Optional: To mimic Quill editor styling
                      dangerouslySetInnerHTML={{
                        __html: renderQuillContent(meetingMinuteData.data),
                      }}
                    />
                  ) : (
                    <div className="flex w-full h-full items-center justify-center">
                      <Label className="text-sm">No meeting data found.</Label>
                    </div>
                  )
                ) : (
                  <div className="flex w-full h-full items-center justify-center">
                    <div className="w-6 h-6 border-4 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {/* <div className="mt-6">
                  <Label className="text-medium font-bold">Tasks</Label>
                </div> */}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
