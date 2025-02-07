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
import { auth } from "../../../firebase";
import { Label } from "@/components/ui/label";
import { signOut } from "firebase/auth";
import { LayoutPanelLeft, LogOut, Vote } from "lucide-react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { Input } from "@/components/ui/input";
import { IoSearchOutline } from "react-icons/io5";
import { motion, useCycle } from "framer-motion";
import ShortUniqueId from "short-uuid";
import { useHook } from "@/hooks";
import { MenuToggle } from "./Toggles";
import MobileNavMenu from "./MobileNavMenu";

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at calc(100% - 40px) 40px)`,
    transition: {
      type: "spring",
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: "circle(30px at calc(100% - 40px) 40px)",
    transition: {
      delay: 0.5,
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

export default function NavigationBar() {
  const navigate = useNavigate();
  const { loggedInUser, userName } = useHook();
  const [courseSearch, setCourseSearch] = useState<string>("");
  const [isOpen, toggleOpen] = useCycle(false, true);
  const urlPath = `taskFlow-${ShortUniqueId().generate()}`;

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
        <img
          src="/booky_logo.png"
          alt="Booky Logo"
          className="w-26 h-14 cursor-pointer"
        />
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
            <div className="flex w-full gap-2">
              <div className="hidden lg:flex w-full gap-2">
                {/* <Button
                  variant="outline"
                  className="bg-white hover:text-red-700 rounded-xl"
                  onClick={() => navigate(`/taskFlow/${urlPath}`)}
                  disabled={true}
                >
                  Task Flow
                </Button> */}
                <Button
                  variant="outline"
                  className="bg-white hover:text-red-700 rounded-xl"
                  onClick={() => navigate("/poll")}
                >
                  Availability Poll
                </Button>
                <Button
                  variant="outline"
                  className="bg-white hover:text-red-700 rounded-xl"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  className="rounded-xl"
                >
                  Get Started
                </Button>
              </div>
              <div className="flex lg:hidden items-center justify-between w-full gap-2">
                <motion.nav
                  initial={false}
                  animate={isOpen ? "open" : "closed"}
                  className="relative z-50"
                >
                  {/* Sidebar Menu */}
                  <motion.div
                    className="absolute -top-6 -right-8 w-screen h-screen bg-gradient-to-b from-white to-red-100 rounded-l-2xl shadow-lg border-l"
                    variants={sidebar}
                  >
                    <MobileNavMenu />
                  </motion.div>

                  {/* ✅ Ensure `MenuToggle` is properly positioned */}
                  <div className="relative z-50">
                    <MenuToggle toggle={() => toggleOpen()} />
                  </div>
                </motion.nav>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
