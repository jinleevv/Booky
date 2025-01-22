import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface MeetingInformation {
  _id: string; // Unique meeting ID
  teamId: string;
  meetingTeamId: string;
  meetingTeamName: string;
  date: string; // Meeting date in "YYYY-MM-DD" format
  time: {
    start: string; // Start time in "HH:MM AM/PM" format
    end: string; // End time in "HH:MM AM/PM" format
  };
  attendees: Attendee[]; // Array of attendees
}

export interface Attendee {
  participantName?: string; // Optional name of the attendee
  participantEmail: string; // Email of the attendee
  token: string; // Unique token for the attendee
  tokenExpiry: Date; // Token expiration date
}

export function MeetingColumns(): ColumnDef<MeetingInformation>[] {
  const navigate = useNavigate();
  return [
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorFn: (row) => `${row.time.start} - ${row.time.end}`,
      id: "time",
      header: "Time",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const meetingId = row.original._id;
        const teamId = row.original.teamId;
        const meetingTeamId = row.original.meetingTeamId;
        const meetingTeamName = row.original.meetingTeamName;
        return (
          <div className="flex justify-end items-center">
            <Button
              onClick={(e) => {
                e.preventDefault();
                navigate(
                  `/dashboard/${teamId}/${meetingTeamId}/${meetingTeamName}/${meetingId}`
                );
              }}
            >
              Details
              <ArrowRight />
            </Button>
          </div>
        );
      },
    },
  ];
}
