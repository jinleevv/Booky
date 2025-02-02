import { Label } from "@/components/ui/label";
import Attendance from "@/features/Attendance/Attendance";
import DashboardNavBar from "@/features/DashboardNavBar";

export default function AttendancePage() {
  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex h-screen">
        <DashboardNavBar />
        <div className="grid w-full px-5 font-outfit overflow-y-auto">
          <div>
            <div className="w-full px-3 py-4 relative z-20">
              <div className="grid w-full">
                <Label className="text-2xl font-bold text-black">
                  Attendance
                </Label>{" "}
                <Label className="text-xs text-gray-400">
                  Verify people's attendance
                </Label>
              </div>
            </div>
            <div>
              <Attendance />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
