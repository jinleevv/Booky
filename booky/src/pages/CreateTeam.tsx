import { Label } from "@/components/ui/label";
import CreateTeamForm from "@/features/CreateTeam/CreateTeamForm";
import DashboardNavBar from "@/features/DashboardNavBar";

export default function CreateTeam() {
  // const [teamName, setTeamName] = useState<string>("");
  // const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  // const [schedule, setSchedule] = useState(
  //   days.map((day) => ({
  //     day,
  //     enabled: day !== "Sunday" && day !== "Saturday",
  //     times: [{ start: "09:00 AM", end: "05:00 PM" }],
  //   }))
  // );

  // const MemoizedSelect = memo(
  //   ({ value, onChange, availableTime }: MemoizedSelectProps) => {
  //     return (
  //       <Select value={value} onValueChange={onChange}>
  //         <SelectTrigger className="w-28">
  //           <SelectValue placeholder="Select Time" />
  //         </SelectTrigger>
  //         <SelectContent className="w-28">
  //           {availableTime.map((t) => (
  //             <SelectItem key={t} value={t}>
  //               {t}
  //             </SelectItem>
  //           ))}
  //         </SelectContent>
  //       </Select>
  //     );
  //   }
  // );

  // const handleDuration = (time: string) => {
  //   setSelectedDurations(
  //     (prev) =>
  //       prev.includes(time)
  //         ? prev.filter((duration) => duration !== time) // Remove if already selected
  //         : [...prev, time] // Add if not already selected
  //   );
  // };

  // const handleSwitchChange = (dayIndex: number) => {
  //   // const updatedSchedule = [...schedule];
  //   // updatedSchedule[dayIndex].enabled = !updatedSchedule[dayIndex].enabled;
  //   // setSchedule(updatedSchedule);
  //   setSchedule((prevSchedule) => {
  //     const updatedDay = {
  //       ...prevSchedule[dayIndex],
  //       enabled: !prevSchedule[dayIndex].enabled,
  //     };
  //     return prevSchedule.map((day, idx) =>
  //       idx === dayIndex ? updatedDay : day
  //     );
  //   });
  // };

  // const handleTimeChange = (
  //   dayIndex: number,
  //   timeIndex: number,
  //   field: "start" | "end",
  //   value: string
  // ) => {
  //   setSchedule((prevSchedule) => {
  //     const updatedTimes = prevSchedule[dayIndex].times.map((time, idx) =>
  //       idx === timeIndex ? { ...time, [field]: value } : time
  //     );
  //     const updatedDay = { ...prevSchedule[dayIndex], times: updatedTimes };
  //     return prevSchedule.map((day, idx) =>
  //       idx === dayIndex ? updatedDay : day
  //     );
  //   });
  // };

  // const addTimeSlot = (dayIndex: number) => {
  //   const updatedSchedule = [...schedule];
  //   updatedSchedule[dayIndex].times.push({
  //     start: "09:00 AM",
  //     end: "05:00 PM",
  //   });
  //   setSchedule(updatedSchedule);
  // };

  // const deleteTimeSlot = (dayIndex: number, timeIndex: number) => {
  //   const updatedSchedule = [...schedule];
  //   if (updatedSchedule[dayIndex].times.length > 1) {
  //     updatedSchedule[dayIndex].times.splice(timeIndex, 1);
  //     setSchedule(updatedSchedule);
  //   }
  // };

  // async function handleCreateTeam() {
  //   const response = await fetch("http://localhost:5001/api/teams/register", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       name: teamName,
  //       durations: selectedDurations,
  //       availableTime: availableTime,
  //     }),
  //   });

  //   if (!response.ok) {
  //     console.error("Failed to save team to database");
  //     return -1;
  //   }
  //   return 0;
  // }

  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="w-full px-3 py-4 relative z-10 bg-white">
          <div className="flex w-full">
            <div className="grid w-full">
              <Label className="text-2xl font-bold text-black">New Team</Label>{" "}
              <Label className="text-xs text-gray-400">Teams Settings </Label>
            </div>
          </div>
          <CreateTeamForm />
        </div>
      </div>
    </section>
  );
}
