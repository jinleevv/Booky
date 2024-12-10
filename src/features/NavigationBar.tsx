import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoPersonCircle } from "react-icons/io5";
import { useEffect, useMemo, useState } from "react";
import { auth } from "../../firebase";
import { Label } from "@/components/ui/label";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { LayoutPanelLeft, LogOut, UserPen } from "lucide-react";
import { RiArrowDropDownLine } from "react-icons/ri";

export default function NavigationBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courseSearch, setCourseSearch] = useState<string>("");
  const courses = [
    { course: "COMP307", label: "Web Development" },
    { course: "COMP250", label: "Introduction to Computer Science" },
    { course: "MATH223", label: "Linear Algebra" },
    // Add more courses as needed
  ];

  useEffect(() => {
    const checkUser = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => checkUser();
  }, []);

  const filteredResults = useMemo(() => {
    const searchTerm = courseSearch.toLowerCase().split(" ").join("");
    if (!searchTerm) return [];

    return courses.filter(
      (course) =>
        course.course.toLowerCase().includes(searchTerm) ||
        course.label.toLowerCase().includes(searchTerm)
    );
  }, [courseSearch, courses]);

  const handleSearch = () => {
    const courseCode = courseSearch.split(" ").join("");
    if (courseSearch.trim()) {
      navigate(`/search/${encodeURIComponent(courseCode.toUpperCase())}`);
    }
  };

  return (
    <nav className="flex items-center justify-between w-full px-8 py-4 bg-white">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src="/mcgill.png" alt="McGill Logo" className="w-10 h-10" />
        <div className="text-sm font-bold text-black -ml-4 -mt-1.5">Booky</div>
      </div>

      <div className="relative w-[700px] h-11 border-2 border-red-700 rounded-full">
        <Command className="rounded-full w-full">
          <CommandInput
            placeholder="Search for a course or a professor"
            value={courseSearch}
            onValueChange={(value) => setCourseSearch(value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="text-gray-700 placeholder-gray-500 border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <CommandList className="absolute w-full left-0 right-0 top-[40px] bg-white rounded-lg shadow-lg z-[100] border-none">
            {courseSearch === "" ? (
              <div></div>
            ) : (
              <>
                {filteredResults.length === 0 ? (
                  <CommandEmpty>No courses or professors found.</CommandEmpty>
                ) : (
                  <CommandGroup heading="Courses or Professors">
                    {filteredResults.map((course) => (
                      <CommandItem
                        key={course.course}
                        value={course.course}
                        onSelect={(value) => {
                          setCourseSearch(value);
                          handleSearch(); // Automatically search when item is selected
                        }}
                      >
                        <span>
                          {course.label} ({course.course})
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <div className="mt-auto mb-auto">
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  className="hover:bg-slate-100 p-1 rounded-lg"
                >
                  <div className="flex gap-1">
                    <IoPersonCircle size={25} className="m-auto" />
                    <Label className="font-bold m-auto">
                      {user.displayName}
                    </Label>
                    <RiArrowDropDownLine className="m-auto" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutPanelLeft /> <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/")}>
                    <UserPen /> <span>Profile</span>
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
            {" "}
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
