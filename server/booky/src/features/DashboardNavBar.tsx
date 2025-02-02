import { Button } from "@/components/ui/button";
import { useHook } from "@/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoPersonCircle } from "react-icons/io5";
import { Label } from "@/components/ui/label";
import { RiArrowDropDownLine } from "react-icons/ri";
import { LogOut, UserPen, Vote } from "lucide-react";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

export default function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName } = useHook();

  return (
    <nav className="flex flex-col h-screen w-1/6 min-w-[147px] py-4 bg-zinc-50 border-r border-gray-200">
      <div
        className="flex items-center gap-2 px-8"
        onClick={() => navigate("/")}
      >
        <img src="/booky_logo.png" alt="Booky Logo" className="w-26 h-14" />
      </div>

      <div className="flex flex-col items-center gap-2 px-3 mt-5">
        <Button
          variant="ghost"
          className={`flex w-full h-8 justify-start ${
            location.pathname === "/dashboard"
              ? "text-red-700 hover:text-red-700"
              : "hover:text-red-700"
          }`}
          onClick={() => navigate("/dashboard")}
        >
          Meetings
        </Button>
        <Button
          variant="ghost"
          className={`flex w-full h-8 justify-start ${
            location.pathname === "/dashboard/teams"
              ? "text-red-700 hover:text-red-700"
              : "hover:text-red-700"
          }`}
          onClick={() => navigate("/dashboard/teams")}
        >
          Teams
        </Button>
      </div>
      <div className="mt-auto flex w-full justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="hover:bg-slate-100 p-1 rounded-lg"
          >
            <div className="flex gap-1">
              <IoPersonCircle size={25} className="m-auto" />
              <Label className="font-bold m-auto">{userName}</Label>
              <RiArrowDropDownLine className="m-auto" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/")}>
              <UserPen /> <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/poll")}>
              <Vote /> <span>Poll</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                signOut(auth);
              }}
            >
              <LogOut /> <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
