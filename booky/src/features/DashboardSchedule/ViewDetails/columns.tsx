import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type MeetingInformation = {
  id: string;
  teamId: string;
  date: string;
  time: string;
};

export function MeetingColumns(): ColumnDef<MeetingInformation>[] {
  const navigate = useNavigate();
  return [
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "time",
      header: "Time",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const meetingId = row.original.id;

        return (
          <div className="flex justify-end items-center">
            <Button
              onClick={(e) => {
                e.preventDefault();
                navigate(`/dashboard/${meetingId}/${meetingId}/`);
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
