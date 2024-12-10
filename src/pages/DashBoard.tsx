import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";

export default function DashBoard() {
  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="w-full px-3 py-4 relative z-20">
          <Label className="text-2xl font-bold text-black">Meetings</Label>
          <div className="w-full h-5/6 mt-3 space-y-3">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                className="text-red-700 hover:text-red-700 w-20"
              >
                Upcoming
              </Button>
              <Button variant="ghost" className="w-20">
                Recurring
              </Button>
              <Button variant="ghost" className="w-12">
                Past
              </Button>
            </div>
            <div className="flex border p-4 rounded-md justify-between">
              <div className="flex gap-2 my-auto">
                <Label className="font-bold">Office Hour: </Label>
                <Label>1:00 PM - 2:00 PM</Label>
                <Label className="text-[10px] text-gray-500">
                  Number of Student: 60
                </Label>
              </div>

              <Button variant="outline">Zoom Link</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
