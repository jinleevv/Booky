import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHook } from "@/hooks";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import InviteCoAdmin from "./InviteCoAdmin";

const formSchema = z.object({
  teamName: z.string().min(1).max(50),
  teamDescription: z.string().optional(),
});

export default function CreateTeamForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
      teamDescription: "",
    },
  });

  const { server, loggedInUser, userEmail, userName } = useHook();
  const [pendingCoAdmin, setPendingCoAdmin] = useState<string[]>([]);
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!loggedInUser) {
      console.error("No user is logged in");
      return;
    }

    const response = await fetch(`${server}/api/teams/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamName: values.teamName,
        teamDescription: values.teamDescription,
        adminEmail: userEmail,
        adminName: userName,
        coadmins: pendingCoAdmin,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to save team to database", data);
      return -1;
    }
    setPendingCoAdmin([]);
    toast("Successfully Created Team");
    navigate("/dashboard/teams");
    return 0;
  }

  return (
    <section className="grid mt-4 bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <div className="flex w-full border rounded-2xl p-3 gap-3">
            <div className="flex flex-col w-full h-full">
              <div className="grid w-full h-full">
                <Label className={`${pendingCoAdmin?.length ? "" : "mt-3"}`}>
                  Co-Admin
                </Label>
                <div className="flex w-full overflow-auto gap-2 mt-2 rounded-lg">
                  {pendingCoAdmin.map((email) => (
                    <div className="h-full w-fit overflow-x-auto px-2 rounded-full bg-gray-600 text-white shrink-0">
                      <Label>{email}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Dialog>
                <DialogTrigger className="h-full w-full">
                  <Button type="button" className="h-full rounded-2xl">
                    <Plus />
                    Co-Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Co-Admin</DialogTitle>
                    <DialogDescription>
                      <InviteCoAdmin
                        teamId={"CreateTeam"}
                        onAddCoadmin={(email) =>
                          setPendingCoAdmin((prev) => [...prev, email])
                        }
                      />
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex w-full gap-2">
            <div className="flex flex-col w-full h-full border rounded-2xl p-3 gap-3">
              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="w-full gap-2">
                      <FormLabel className="w-24">Team Name*</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full mt-1"
                          placeholder="Team Name"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamDescription"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="w-full gap-2 mb-1">
                      <FormLabel className="w-32">Team Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="w-full h-72 mt-1"
                          placeholder="Team Description"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex w-full justify-end p-3">
            <Button type="submit" className="rounded-2xl">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
