import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
import MeetingMinute from "@/features/MeetingMinute/MeetingMinute";
import { useParams } from "react-router-dom";

export default function MeetingMinutePage() {
  const { date, time } = useParams();

  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="w-full h-full px-3 py-4 relative z-10 bg-white font-outfit">
          <div className="flex w-full">
            <div className="grid w-full">
              <Label className="text-2xl font-bold text-black">
                Meeting Minute
              </Label>{" "}
              <Label className="text-xs text-gray-400">Date: {date}</Label>
              <Label className="text-xs text-gray-400">Time: {time}</Label>
            </div>
          </div>
          <div>
            <MeetingMinute />
          </div>
        </div>
      </div>
    </section>
  );
}
