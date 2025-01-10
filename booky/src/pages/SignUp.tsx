import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import SignUpForm from "@/features/Login/SignUpForm";

export default function SignUp() {
  const navigate = useNavigate();

  return (
    <section className="h-screen w-screen bg-white px-8 py-4">
      <div className="flex items-center gap-2">
        <img src="/booky_logo.png" alt="Booky Logo" className="w-26 h-14" />
      </div>
      <div className="flex flex-col-2 items-center justify-center h-5/6 w-full mt-12">
        <div className="flex flex-col h-full w-1/2 py-12">
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
        <div className="flex flex-col items-center justify-center h-fit w-1/2 border rounded-lg">
          <img src="/register_img.png" className="rounded-lg" />
        </div>
      </div>
    </section>
  );
}
