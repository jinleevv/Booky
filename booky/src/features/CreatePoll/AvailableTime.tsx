import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useHook } from "@/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AvailableTimeItem from "./AvailableTimeItem";

export interface Participant {
  email: string;
  schedule: string[];
}

export interface PollData {
  _id: string;
  pollName: string;
  pollDescription?: string;
  urlPath: string;
  dateRange: {
    start: { date: string; day: number };
    end: { date: string; day: number };
  };
  time: {
    start: string;
    end: string;
  };
  participants: Participant[];
  createdAt: Date;
  updatedAt?: Date;
}

export default function AvailableTime({ userEmail }: { userEmail: string }) {
  const { server, loggedInUser } = useHook();
  const [polls, setPolls] = useState<PollData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch poll data
  useEffect(() => {
    async function fetchPolls() {
      try {
        setIsLoading(true);
        const response = await fetch(`${server}/api/polls/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch poll data");
        }

        const data = await response.json();
        // Sort the polls by number of participants (descending) and start date (ascending)
        const sortedPolls = data.sort((a: PollData, b: PollData) => {
          // Sort by number of participants
          if (b.participants.length !== a.participants.length) {
            return b.participants.length - a.participants.length;
          }

          // 2. Sort by start date
          const dateA = new Date(a.dateRange.start.date).getTime();
          const dateB = new Date(b.dateRange.start.date).getTime();
          if (dateA !== dateB) {
            return dateA - dateB;
          }

          // 3. Sort by start time
          const timeA = a.time.start; // Assuming time.start is in "HH:MM" format
          const timeB = b.time.start;
          return timeA.localeCompare(timeB);
        });

        setPolls(sortedPolls);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
        toast.error("Failed to fetch poll data");
      } finally {
        setIsLoading(false);
      }
    }

    if (polls.length === 0) {
      fetchPolls();
    }
  }, [server]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card className="mt-6 shadow-none relative z-10">
      <CardContent className="p-6">
        <div className="flex justify-between text-center px-4">
          <Label className="text-lg font-semibold">Available Times</Label>
          <Button disabled={!loggedInUser} className="bg-gray-500" size="sm">
            Manually Create Meeting
          </Button>
        </div>
        <div className="pl-6 pr-16 pt-6 flex justify-between text-center text-sm text-gray-500">
          <span>Available Rate</span>
          <span>Date</span>
          <span>Time</span>
          <span>Create</span>
        </div>
        <hr />
        <div className="pt-2 space-y-3">
          {polls!.map((poll) => (
            <AvailableTimeItem
              key={poll._id}
              isLoggedIn={!loggedInUser}
              userEmail={userEmail}
              poll={poll}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
