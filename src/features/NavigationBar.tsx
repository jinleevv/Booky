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
import { useMemo, useState } from "react";

export default function NavigationBar() {
  const navigate = useNavigate();
  const [courseSearch, setCourseSearch] = useState<string>("");
  const courses = [
    { course: "COMP307", label: "Web Development" },
    { course: "COMP250", label: "Introduction to Computer Science" },
    { course: "MATH223", label: "Linear Algebra" },
    // Add more courses as needed
  ];

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
      <div className="flex items-center gap-2">
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
        <Button
          variant="ghost"
          className="bg-white hover:text-red-700 border-none"
        >
          Sign In
        </Button>
        <Button onClick={() => navigate("/login")} className="rounded-xl">
          Get Started
        </Button>
      </div>
    </nav>
  );
}
