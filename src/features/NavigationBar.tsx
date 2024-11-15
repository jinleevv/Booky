import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NavigationBar() {
  const navigate = useNavigate();   
  return (
    <nav className="flex items-center justify-between w-full px-8 py-4 bg-white">
      <div className="flex items-center gap-2">
        <img src="/mcgill.png" alt="McGill Logo" className="w-10 h-10" />
        <div className="text-sm font-bold text-black -ml-4 -mt-1.5">Booky</div>
      </div>

      <div className="flex items-center w-[700px] border-2 border-red-700 rounded-full overflow-hidden">
        <div className="flex items-center px-3 py-3 bg-white border-r-2 border-red-700">
          <Search className="ml-2 text-gray-600" size={16} />
        </div>

        <Input
          type="text"
          placeholder="Search for a course or a professor"
          className="w-full px-4 py-2 text-gray-700 placeholder-gray-500 border-none focus:outline-none text-right"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="bg-white hover:text-red-700 border-none"
        >
          Sign In
        </Button>
        <Button
          onClick={() => navigate("/login")}
          className="bg-black hover:bg-zinc-800 border-none text-white rounded-xl"
        >
          Get Started
        </Button>
      </div>
    </nav>
  );
}
