import { Label } from "@/components/ui/label";
import CreateTeamForm from "@/features/CreateTeam/CreateTeamForm";
import DashboardNavBar from "@/features/DashboardNavBar";

export default function CreateTeam() {
  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="w-full px-3 py-4 relative z-10 bg-white font-outfit">
          <div className="flex w-full">
            <div className="grid w-full">
              <Label className="text-2xl font-bold text-black">New Team</Label>{" "}
              <Label className="text-xs text-gray-400">Teams Settings </Label>
            </div>
          </div>
          <CreateTeamForm />
        </div>
      </div>
    </section>
  );
}
