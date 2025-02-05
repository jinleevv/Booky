import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import SignUpForm from "@/features/Login/SignUpForm";
import { motion } from "framer-motion";

export default function SignUp() {
  const navigate = useNavigate();

  return (
    <section className="h-screen w-screen bg-white px-8 py-4">
      <div className="flex items-center gap-2">
        <img src="/booky_logo.png" alt="Booky Logo" className="w-26 h-14" />
      </div>
      <div className="flex flex-col-2 items-center justify-center h-5/6 w-full mt-12">
        <div className="flex flex-col h-full w-full lg:w-1/2 py-12">
          <div className="flex w-full">
            <Button
              variant="ghost"
              className="gap-1.5 w-20 rounded-xl"
              onClick={() => navigate("/")}
            >
              <HiOutlineArrowNarrowLeft size={25} />
              Back
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-3xl font-bold">
                Create your Booky account
              </Label>{" "}
              <br />
              <Label className="text-sm text-gray-500">
                Free for individuals. Team plans for collaborative features.
              </Label>
            </div>
            <SignUpForm />
          </div>
        </div>
        <div className="hidden lg:flex flex-col h-2/3 w-2/3 border rounded-lg bg-zinc-50 -translate-y-24">
          <div className="flex flex-col pt-8 pl-10 font-outfit">
            <Label className="text-lg font-bold">
              Effortless Scheduling for Meetings & Appointments!
            </Label>{" "}
            <Label className="text-gray-700">
              Share your availability, let others choose a slot, and finalize
              the schedule—simple, seamless, and hassle-free!
            </Label>
          </div>

          <div className="flex items-center justify-center w-full h-full overflow-hidden">
            <motion.img
              src="/register_img.png"
              alt="Register Demo Image"
              initial={{
                scale: 1.1,
                filter: "drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.25))",
              }}
              whileHover={{
                scale: 1.2, // ✅ Makes the image pop out
                transition: { duration: 0.3, ease: "easeOut" },
                filter: "drop-shadow(6px 6px 8px rgba(0, 0, 0, 0.25))",
              }}
              className="w-full h-auto ml-32 2xl:ml-44 max-w-none object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
