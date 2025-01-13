import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type TeamMembers = {
  id: string;
  name: string;
  email: string;
};

export const columns: ColumnDef<TeamMembers>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const member = row.original;

      return (
        <div className="flex justify-end items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(member.id)}
              >
                Copy member's ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Permission</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
