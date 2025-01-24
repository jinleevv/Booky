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
    userEmail &&
    poll.participants.some(
      (p) => p.email == userEmail && p.schedule.length == 0
    )
      ? 1
      : 0;

  const availableCount =
    poll.participants.filter((p) => p.schedule.length > 0).length +
    userEmailInGroup;

  return (
    <div className="border py-3 rounded-lg">
      <div className="flex justify-between items-center">
        <p className="text-sm font-bold w-1/4 text-center">
          {`${availableCount.toString()} /
                ${(poll.participants.length + userEmailInGroup).toString()}`}
        </p>

        <p className="text-sm w-1/4 text-center">
          {formatDate(poll.dateRange.start.date)}~
          {formatDate(poll.dateRange.end.date)}
        </p>
        <p className="text-sm w-1/4 text-center">
          {formatTime(poll.time.start)}-{formatTime(poll.time.end)}
        </p>
        <div className="w-1/4 text-center">
          <Button disabled={isLoggedIn} className="bg-gray-500" size="sm">
            Create Meeting
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AvailableTimeItem;
