import NavigationBar from "@/features/NavigationBar";
import { useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Schedule() {
  const { code: teamId } = useParams();
  const [teamName, setTeamName] = useState<string>("Loading...");
  const [adminName, setAdminName] = useState<string>("Loading...");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    // Fetch the team and admin details
    const fetchTeamDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/teams/${teamId}`);
        const data = await response.json();

        if (response.ok) {
          setTeamName(data.name);
          setAdminName(data.adminName);
        } else {
          setTeamName("Not Found");
          setAdminName("Not Found");
          setTeamName("Error");
        }
      } catch (error) {
        console.error("Error fetching team details:", error);
        setAdminName("Error");
      }
    };

    fetchTeamDetails();
  }, [teamId]);

  const disablePastDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate date 7 days from today
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    // Disable if date is before today or after maxDate
    return date < today || date > maxDate;
  };

  return (
    <section className="h-screen w-screen bg-white">
      <NavigationBar />
      <div className="flex flex-col items-center justify-center">
        <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2"></div>
      </div>
      <div className="flex relative w-4/5 h-5/6 m-auto">
        <Card className="flex w-full h-4/6 m-auto shadow-sm">
          <CardHeader className="w-1/6 border-r-[1px] border-gray-200">
            <CardTitle>Course: {teamName}</CardTitle>
            <CardDescription>
              Professor: {adminName}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex w-3/6 py-2 border-r-[1px] border-gray-200">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disablePastDates}
              showOutsideDays={false}
              className="flex h-[461px] overflow-y-auto mt-3 p-0"
              classNames={{
                months:
                  "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
                month: "space-y-4 w-full",
                table: "w-full border-collapse space-y-1",
                head_row: "w-full flex justify-between",
                head_cell: "w-16 font-normal text-xs text-center",
                row: "w-full mt-2 flex justify-between",
                cell: "w-16 relative p-0 text-center focus-within:relative focus-within:z-20",
                day: "h-16 w-16 p-0 rounded-lg font-normal aria-selected:opacity-100 hover:bg-gray-100",
                day_selected:
                  "bg-black text-white hover:bg-gray-800 focus:bg-black focus:text-white",
                day_today: "bg-accent text-accent-foreground",
                caption: "flex items-start justify-start pb-4 pl-2",
                caption_label: "w-64 text-xl font-semibold",
                nav: "space-x-1 flex w-full justify-end",
                nav_button: cn(
                  buttonVariants({ variant: "outline" }),
                  "h-7 w-10 p-0"
                ),
                nav_button_previous: "",
                nav_button_next: "",
              }}
            />
          </CardContent>
          <div className="w-2/6 h-full">
            <CardContent className="h-1/2 w-full py-2 border-b-[1px] border-gray-200 overflow-auto">
              <div className="grid gap-2">
                {Array.from({ length: 13 }, (_, i) => {
                  const hour = 13 + Math.floor((i * 5) / 60);
                  const minutes = (i * 5) % 60;
                  const timeString = `${hour}:${minutes
                    .toString()
                    .padStart(2, "0")}`;
                  const displayTime = `${timeString}`;

                  return (
                    <Button
                      key={timeString}
                      variant="outline"
                      className="p-4 text-center rounded-lg"
                    >
                      {displayTime}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
}
