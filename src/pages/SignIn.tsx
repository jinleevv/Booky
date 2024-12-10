import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import SignInForm from "@/features/Login/SignInForm";

export default function SignIn() {
  const navigate = useNavigate();

  return (
    <section className="h-screen w-screen bg-white px-8 py-4">
      <div className="flex items-center gap-2">
        <img src="/mcgill.png" alt="McGill Logo" className="w-10 h-10" />
        <div className="text-sm font-bold text-black -ml-4 -mt-1.5">Booky</div>
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
              <Label className="text-3xl font-bold">Sign In to Booky</Label>{" "}
              <br />
              <Label className="text-sm text-gray-500">
                Free for individuals. Team plans for collaborative features.
              </Label>
            </div>
            <SignInForm />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-full w-1/2 border rounded-lg">
          <img src="/register_img.png" />
        </div>
      </div>
    </section>
  );
}
