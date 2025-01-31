import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

type IUsersAvailability = {
  availableRate: string;
  date: string;
  time: string;
  loggedInUser: boolean;
};

export const columns: ColumnDef<IUsersAvailability>[] = [
  {
    accessorKey: "availableRate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Availability Rate
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
  },
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
      const loggedInUser = row.original.loggedInUser;
      return (
        <div className="flex justify-end items-center">
          <Button
            onClick={(e) => {
              e.preventDefault();
            }}
            size="sm"
            disabled={!loggedInUser}
          >
            Create Meeting
          </Button>
        </div>
      );
    },
  },
];
