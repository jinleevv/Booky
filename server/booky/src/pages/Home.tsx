import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import NavigationBar from "@/features/NavigationBar/NavigationBar";
import {
  GoogleAuthProvider,
  // GithubAuthProvider,
  signInWithPopup,
} from "@firebase/auth";
import { auth } from "@/../firebase";
// import { IoLogoGithub } from "react-icons/io5";
import { HiOutlineMail } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useHook } from "@/hooks";
import { motion } from "framer-motion";
import { CalendarCheck, LayoutPanelLeft, Waypoints } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { loggedInUser, setLoggedInUser, setUserName } = useHook();

  async function handleGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      const response = await signInWithPopup(auth, provider);
      toast("Sign-In Successful");
      setLoggedInUser(true);
      setUserName(response.user.displayName);
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        toast("Invalid email or password");
      } else {
        toast("Unable to log in due to an error");
      }
    }
  }

  // async function handleGithubLogin() {
  //   try {
  //     const provider = new GithubAuthProvider();
  //     const response = await signInWithPopup(auth, provider);
  //     toast("Sign-In Successful");
  //     setLoggedInUser(true);
  //     setUserName(response.user.displayName);
  //   } catch (error) {
  //     if (error.code === "auth/invalid-credential") {
  //       toast("Invalid email or password");
  //     } else {
  //       toast("Unable to log in due to an error");
  //     }
  //   }
  // }

  return (
    <section className="h-screen w-screen bg-white font-outfit">
      <div className="relative z-1">
        <NavigationBar />
      </div>
      <div className="absolute w-3/6 h-2/6 lg:bg-red-700 blur-[500px] top-1/2 translate-x-1/2"></div>
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 w-full h-5/6">
        <div className="grid gap-10 w-full h-fit z-10 mt-8 px-8 text-center lg:text-start">
          <div className="flex flex-col w-full lg:w-4/5 h-fit mt-16">
            <Label className="text-6xl font-bold text-black">
              Easily Collaborate & Manage Your Schedules
            </Label>{" "}
            <br />
            <div className="lg:w-5/6">
              <Label className="text-sm text-black">
                Booky is a platform that allows you to streamline scheduling and
                foster seamless collaboration.
              </Label>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full lg:w-3/5 justify-center items-center lg:justify-start lg:items-start">
            {loggedInUser ? (
              <>
                <div className="flex w-full">
                  <Button
                    className="w-full h-12 text-lg flex items-center gap-3"
                    onClick={() => navigate("/dashboard")}
                  >
                    <LayoutPanelLeft /> Go to Dashboard
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col mt-10 lg:mt-0 w-full gap-2">
                  <Button
                    className="w-full h-12 text-lg flex items-center gap-3"
                    onClick={handleGoogleLogin}
                  >
                    <img src="/google_logo.png" className="w-5 h-5" />
                    Sign Up with Google
                  </Button>
                </div>
                <div className="w-full border border-t-1 border-black rounded-full"></div>
                <div className="w-full text-center">
                  <Button
                    variant="ghost"
                    className="hover:bg-inherit hover:text-red-700"
                    onClick={() => navigate("/register")}
                  >
                    <HiOutlineMail />
                    <Label className="text-xs">Sign Up with Email</Label>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        <div>
          <div className="w-full hidden lg:flex flex-col justify-center items-center py-6 bg-zinc-100 shadow-2xl shadow-red-800 border border-gray-300 rounded-xl -ml-8 mt-10 mb-10">
            {/* Two-Column Section */}
            <div className="grid grid-cols-1 gap-8 w-full px-2">
              {/* Left Section */}
              <div className="grid grid-cols-2 w-full h-full items-center p-3 rounded-lg overflow-hidden">
                {/* Text Content */}
                <div className="mt-4">
                  <h3 className="text-2xl font-bold text-black">
                    Effortless Scheduling for Meetings & Appointments!
                  </h3>
                  <p className="text-sm text-gray-700 mt-2">
                    Share your availability, let others choose a slot, and
                    finalize the schedule—simple, seamless, and hassle-free!
                  </p>
                  <div className="flex w-full mt-4">
                    <Button
                      variant="outline"
                      className="text-black w-full mt-4"
                      onClick={() => navigate("/register")}
                    >
                      <CalendarCheck />
                      Start Scheduling
                    </Button>
                  </div>
                </div>

                {/* Image Container - Overflows Naturally */}
                <div className="relative flex items-center justify-center w-full h-64 overflow-hidden rounded-lg">
                  <motion.img
                    src="/meeting.png"
                    alt="Meeting Illustration"
                    initial={{
                      scale: 1.6,
                      filter: "drop-shadow(-2px 2px 4px rgba(0, 0, 0, 0.25))",
                    }}
                    whileHover={{
                      rotate: -5,
                      transition: { duration: 0.3, ease: "easeOut" },
                      filter: "drop-shadow(-3px 3px 5px rgba(0, 0, 0, 0.25))",
                    }}
                    className="w-full h-auto ml-64 mt-12 2xl:ml-96 2xl:mt-28 max-w-none object-cover"
                  />
                </div>
              </div>
              <div className="w-full border-b-1"></div>

              {/* Right Section */}
              <div className="grid grid-cols-2 w-full h-full items-center -mt-4 p-3 rounded-lg overflow-hidden">
                {/* Image Container - Overflows Naturally */}
                <div className="relative flex items-center justify-center w-full h-72 overflow-hidden">
                  <motion.img
                    src="/poll.png"
                    alt="Meeting Illustration"
                    initial={{
                      scale: 0.9,
                      filter: "drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.25))",
                    }}
                    whileHover={{
                      rotate: 5,
                      transition: { duration: 0.3, ease: "easeOut" },
                      filter: "drop-shadow(6px 6px 8px rgba(0, 0, 0, 0.25))",
                    }}
                    className="w-full h-auto -ml-14 mt-24 2xl:-ml-16 2xl:mt-52 max-w-none object-cover"
                  />
                </div>
                {/* Text Content */}
                <div>
                  <h3 className="text-2xl font-bold text-black">
                    Need to Find the Best Time for your Meeting?
                  </h3>
                  <p className="text-sm text-gray-700 mt-2">
                    Easily check when everyone is free! Share the invitation
                    code and let your team mark their availability in seconds!
                  </p>
                  <div className="flex w-full mt-7">
                    <Button
                      variant="outline"
                      className="text-black w-full mt-2"
                      onClick={() => navigate("/poll")}
                    >
                      <Waypoints />
                      Share Your Availability
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
