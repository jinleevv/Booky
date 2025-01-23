import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/features/time";
import { PollData } from "./AvailableTime";

type AvailableTimeItemProps = {
  poll: PollData;
  isLoggedIn: boolean;
  userEmail: string;
};

function AvailableTimeItem({
  poll,
  isLoggedIn,
  userEmail,
}: AvailableTimeItemProps) {
  const userEmailInGroup =
    userEmail && !poll.participants.some((p) => p.email == userEmail) ? 1 : 0;

  const availableCount =
    poll.participants.filter((p) => p.schedule.length > 0).length +
    userEmailInGroup;

  return (
    <div className="border px-6 py-3 rounded-lg">
      <div className="px-4 flex justify-between items-center">
        <p className="text-sm font-bold">
          {`${availableCount.toString()} /
                ${poll.participants.length.toString()}`}
        </p>

        <p className="text-sm">
          {formatDate(poll.dateRange.start.date)}~
          {formatDate(poll.dateRange.end.date)}
        </p>
        <p className="text-sm">
          {formatTime(poll.time.start)}-{formatTime(poll.time.end)}
        </p>
        <div>
          <Button disabled={isLoggedIn} className="bg-gray-500" size="sm">
            Create Meeting
          </Button>
        </div>
      </div>
      {/* <div className="mt-2">
        <a
          href={`/poll/${poll.urlPath}`}
          className="text-sm text-blue-500 hover:underline"
        >
          View Poll
        </a>
      </div> */}
    </div>
  );
}

export default AvailableTimeItem;
