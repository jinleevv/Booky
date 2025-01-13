import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoPersonCircle } from "react-icons/io5";
import { useState } from "react";
import { auth } from "../../firebase";
import { Label } from "@/components/ui/label";
import { signOut } from "firebase/auth";
import { LayoutPanelLeft, LogOut, Vote } from "lucide-react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { Input } from "@/components/ui/input";
import { IoSearchOutline } from "react-icons/io5";
import { useHook } from "@/hooks";

export default function NavigationBar() {
  const navigate = useNavigate();
  const { loggedInUser, userName } = useHook();
  const [courseSearch, setCourseSearch] = useState<string>("");

  const handleSearch = () => {
    if (courseSearch === "") {
      navigate(`/schedule/none`);
      return -1;
    }
    navigate(`/schedule/${courseSearch}`);
    return 0;
  };

  return (
    <nav className="flex items-center justify-between w-full px-8 py-4 bg-white gap-x-4">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src="/booky_logo.png" alt="Booky Logo" className="w-26 h-14" />
      </div>

      <div className="flex flex-1 max-w-[700px] h-11 border-2 border-red-700 rounded-full">
        <Input
          className="rounded-full flex-1 max-w-[650px] h-full border-none shadow-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={courseSearch}
          onChange={(e) => setCourseSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search Team with Invitation Code"
        ></Input>
        <Button
          variant="ghost"
          className="m-auto hover:bg-transparent"
          onClick={handleSearch}
        >
          <IoSearchOutline />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {loggedInUser ? (
          <>
            <div className="mt-auto mb-auto">
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
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutPanelLeft /> <span>Dashboard</span>
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
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className="bg-white hover:text-red-700 border-none"
              onClick={() => navigate("/poll")}
            >
              Poll
            </Button>
            <Button
              variant="ghost"
              className="bg-white hover:text-red-700 border-none"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="rounded-xl"
            >
              Get Started
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
