import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import NavigationBar from "../features/NavigationBar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";

export default function Login() {
  return (
    <section className="h-screen w-screen bg-white px-8 py-4">
      <div className="flex items-center gap-2">
        <img src="/mcgill.png" alt="McGill Logo" className="w-10 h-10" />
        <div className="text-sm font-bold text-black -ml-4 -mt-1.5">Booky</div>
      </div>
      <div className="flex flex-col-2 items-center justify-center h-5/6 w-full mt-12">
        <div className="flex flex-col h-full w-1/2 py-12">
          <div className="flex w-full">
            <Button variant="ghost" className="gap-1.5 w-20 rounded-xl">
              <HiOutlineArrowNarrowLeft size={25} />
              Back
            </Button>
          </div>
          <div>
            <Label className="text-3xl font-bold">
              Create your Booky account
            </Label>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-full w-1/2">
          <div>
            <h1 className="text-4xl font-bold">Sign In</h1>
          </div>
        </div>
      </div>
    </section>
  );
}
