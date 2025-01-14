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
  description: z.string().min(1),
});

export default function UpdateDescription({ teamId, onSuccess }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });
  const { server } = useHook();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (teamId) {
      const response = await fetch(
        `${server}/api/teams/${teamId}/teamDescription`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamDescription: values.description }),
        }
      );

      if (!response.ok) {
        toast.error("Failed to update team description");
        return;
      }
    }
    toast.success("Successfully updated team description");
    onSuccess();
    form.reset();
  }

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex gap-2">
              <FormLabel className="w-24 mt-5">Description</FormLabel>
              <FormControl>
                <Input placeholder="Update team description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full justify-end">
          <Button type="button" onClick={form.handleSubmit(onSubmit)}>
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
}
