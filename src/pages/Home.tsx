import { Label } from "@/components/ui/label";
import NavigationBar from "@/features/NavigationBar";

export default function Home() {
  return (
    <section className="h-screen w-screen bg-white">
      <NavigationBar />
      <div className="flex flex-col items-center justify-start h-5/6 relative">
        <div className="z-10 mt-8">
          <Label className="text-5xl font-bold text-black">
            Making Time for What Matters
          </Label>{" "}
          <br />
          <div className="flex w-full justify-center mt-0.5">
            <Label className="text-sm text-black">
              Booky is a platform that helps you manage your time and stay on
            </Label>
          </div>
        </div>
        <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2"></div>
        <div className="flex w-full h-4/6 items-center justify-center m-auto">
          <div className="absolute w-[1150px] h-[580px] bg-black blur-[2px] z-0 mt-16 rounded-lg"></div>

          <div className="flex flex-col-2 w-3/5 h-full z-30 gap-10">
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
