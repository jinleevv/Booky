import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

function App() {
  return (
    <section className="h-screen w-screen bg-white">
      <nav className="flex items-center justify-between w-full px-8 py-4 bg-white">
        <div className="flex items-center gap-2">
          <img src="/mcgill.png" alt="McGill Logo" className="w-10 h-10" />
          <div className="text-sm font-bold text-black -ml-4 -mt-1.5">
            Booky
          </div>
        </div>

        <div className="flex items-center w-[700px] border-2 border-red-700 rounded-full overflow-hidden">
          <div className="flex items-center px-4 py-2 bg-white border-r-2 border-red-700">
            <span className="text-gray-600 font-medium text-sm">Search</span>
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
          <Button className="bg-black hover:bg-zinc-800 border-none text-white rounded-xl">
            Get Started
          </Button>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-start h-5/6 relative">
        <div className="z-10 mt-8">
          <Label className="text-5xl font-bold text-black">
            Making Time for What Matters
          </Label>{" "}
          <br />
          <div className="flex w-full justify-center">
            <Label className="text-sm text-black">
              Booky is a platform that helps you manage your time and stay on
            </Label>
          </div>
        </div>
        <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2"></div>
        <div className="relative w-full h-4/6 flex items-center justify-center">
          <div className="absolute w-[1150px] h-full bg-black blur-[2px] mt-20 z-0 rounded-lg"></div>

          {/* Video on Top */}
          <div className="relative flex flex-col-2 w-3/5 h-full z-30 gap-14">
            <video
              autoPlay
              muted
              loop
              className="rounded-lg w-full h-full -ml-44 mt-10"
            >
              <source src="/demo.mp4" type="video/mp4" />
            </video>
            <div className="justify-center w-full h-full flex flex-col gap-10">
              <div className="text-right">
                <Label className="w-full text-white text-3xl font-bold whitespace-nowrap">
                  Search for a Course
                </Label>{" "}
                <br />
                <Label className="w-full text-white text-xs font-bold whitespace-nowrap">
                  Find a class that you are registered in
                </Label>
              </div>
              <div className="text-right">
                <Label className="w-full text-white text-3xl font-bold whitespace-nowrap">
                  Book an Appointment
                </Label>{" "}
                <br />
                <Label className="w-full text-white text-xs font-bold whitespace-nowrap">
                  Find available times with your professor and TAs
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;
