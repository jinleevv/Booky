import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useHook } from "@/hooks";
import { toast } from "sonner";

const formSchema = z.object({
  coadmin: z.string().min(1).max(50),
});

export default function InviteCoAdmin({
  teamId,
  onAddCoadmin,
}: {
  teamId: string;
  onAddCoadmin: (email: string) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coadmin: "",
    },
  });
  const { server } = useHook();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (teamId !== "CreateTeam") {
      const response = await fetch(`${server}/api/teams/${teamId}/coadmins`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coadmins: values.coadmin }),
      });

      if (!response.ok) {
        toast.error("Failed to update coadmins");
        return;
      }
    } else {
      onAddCoadmin(values.coadmin); // Use the callback to update coadmins
    }

    toast.success("Successfully updated coadmins");
    form.reset();
  }

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="coadmin"
          render={({ field }) => (
            <FormItem className="flex gap-2">
              <FormLabel className="w-24 mt-5">Co-Admin</FormLabel>
              <FormControl>
                <Input placeholder="Enter co-admin email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full justify-end">
          <Button type="button" onClick={form.handleSubmit(onSubmit)}>
            Invite
          </Button>
        </div>
      </form>
    </Form>
  );
}
