import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DashboardNavBar from "@/features/DashboardNavBar";
import { IoIosAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";

export default function DashBoardTeams() {
  const navigate = useNavigate();

  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="w-full px-3 py-4 relative z-20">
          <div className="flex w-full">
            <div className="grid w-full">
              <Label className="text-2xl font-bold text-black">Teams</Label>{" "}
              <Label className="text-xs text-gray-400">
                Create and Manage your Teams{" "}
              </Label>
            </div>
            <div className="m-auto">
              <Button onClick={() => navigate("/dashboard/teams/create-team")}>
                <IoIosAdd />
                New Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
