import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NavigationBar() {
  const navigate = useNavigate();

  return (
    <nav className="flex flex-col h-screen w-1/6 py-4 bg-zinc-50 border-r border-gray-200">
      <div className="flex items-center gap-2 px-8">
        <img src="/mcgill.png" alt="McGill Logo" className="w-10 h-10" />
        <div className="text-sm font-bold text-black -ml-4 -mt-1.5">Booky</div>
      </div>

      <div className="flex flex-col items-center gap-2 px-3 mt-5">
        <Button
          variant="ghost"
          className="flex hover:text-red-700 w-full h-8 justify-start"
        >
          Teams
        </Button>
        <Button
          variant="ghost"
          className="flex hover:text-red-700 w-full h-8 justify-start"
        >
          Meetings
        </Button>
      </div>
    </nav>
  );
}
