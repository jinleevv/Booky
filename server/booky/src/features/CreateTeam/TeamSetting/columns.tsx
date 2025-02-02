import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useHook } from "@/hooks";

export type TeamMembers = {
  teamId: string;
  // name: string;
  email: string;
  role: string;
};

export const columns: ColumnDef<TeamMembers>[] = [
  // {
  //   accessorKey: "name",
  //   header: "Name",
  // },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { server } = useHook();
      const member = row.original;
      async function handleCoAdminToMember() {
        const response = await fetch(
          `${server}/api/teams/${member.teamId}/permission`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              permission: "CoAdminToMember",
              user: member.email,
            }),
          }
        );

        if (!response.ok) {
          toast.error("Failed to update permission");
          return;
        }
        toast.success("Successfully updated permission");
      }

      async function handleMemberToCoAdmin() {
        const response = await fetch(
          `${server}/api/teams/${member.teamId}/permission`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              permission: "MemberToCoAdmin",
              user: member.email,
            }),
          }
        );

        if (!response.ok) {
          toast.error("Failed to update permission");
          return;
        }
        toast.success("Successfully updated permission");
      }

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
              <DropdownMenuLabel>Permission</DropdownMenuLabel>
              {member.role === "co-admin" ? (
                <DropdownMenuItem onClick={() => handleCoAdminToMember()}>
                  Co-Admin to Member
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleMemberToCoAdmin()}>
                  Member to Co-Admin
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
