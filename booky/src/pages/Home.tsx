import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import NavigationBar from "@/features/NavigationBar";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "@firebase/auth";
import { auth } from "@/../firebase";
import { IoLogoGithub } from "react-icons/io5";
import { HiOutlineMail } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useHook } from "@/hooks";
import { LayoutPanelLeft } from "lucide-react";

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

  async function handleGithubLogin() {
    try {
      const provider = new GithubAuthProvider();
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

  return (
    <section className="h-screen w-screen bg-white font-outfit">
      <div className="relative z-1">
        <NavigationBar />
      </div>
      <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2 translate-x-1/2"></div>
      <div className="relative grid lg:grid-cols-2 gap-10 w-full h-5/6">
        <div className="grid gap-10 w-full h-fit z-10 mt-8 px-8 text-center lg:text-start">
          <div className="w-full lg:w-4/5 h-fit mt-16">
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
                  <Button className="w-full h-12 text-lg flex items-center gap-3">
                    <LayoutPanelLeft /> Go to Dashboard
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex lg:flex-col w-full gap-2">
                  <Button
                    className="w-full h-12 text-lg flex items-center gap-3"
                    onClick={handleGoogleLogin}
                  >
                    <img src="/google_logo.png" className="w-5 h-5" />
                    Sign Up with Google
                  </Button>
                  <Button className="w-full h-12 text-lg flex items-center gap-3">
                    <img
                      width="20"
                      height="20"
                      src="https://img.icons8.com/color/48/microsoft.png"
                      alt="microsoft"
                    />
                    Sign Up with Microsoft
                  </Button>
                  <Button
                    className="w-full h-12 text-lg flex items-center gap-3"
                    onClick={handleGithubLogin}
                  >
                    <IoLogoGithub size={24} />
                    Sign Up with Github
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
        <div className="relative">
          {/* Blurred background */}
          <div
            className="absolute hidden lg:block lg:w-[850px] 2xl:w-[1000px] 
        h-5/6 bg-black blur-[2px] rounded-lg 
        left-1/2 transform lg:-translate-x-[520px] 2xl:-translate-x-[570px] 
        translate-y-[100px]"
          ></div>

          {/* Content container */}
          <div className="relative gird hidden lg:block w-full h-fit translate-y-28 lg:-translate-x-24 2xl:-translate-x-16">
            {/* Video section */}
            <div className="w-full lg:h-[280px] 2xl:h-[400px] overflow-hidden rounded-lg mt-5">
              <video autoPlay muted loop className="object-cover rounded-lg">
                <source src="/demo.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Text content */}
            <div className="w-full h-full text-white text-center mt-10 space-y-7">
              <div>
                <Label className="text-4xl font-bold">
                  Organize Meetings Effortlessly
                </Label>
                <br />
                <Label className="text-medium">
                  Plan and schedule meetings with just a few clicks, keeping
                  your team aligned and productive.
                </Label>
              </div>
              <div>
                <Label className="text-4xl font-bold">
                  Track and Manage Tasks Seamlessly
                </Label>
                <br />
                <Label className="text-medium">
                  Stay on top of your responsibilities by assigning and
                  organizing tasks with ease.
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
