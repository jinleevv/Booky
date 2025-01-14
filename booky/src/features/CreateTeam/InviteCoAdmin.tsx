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

const formSchema = z.object({
  coadmin: z.string().min(2).max(50),
});

export default function InviteCoAdmin() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coadmin: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="coadmin"
          render={({ field }) => (
            <FormItem className="flex w-full h-full my-auto">
              <div className="flex w-24 mt-5">
                <FormLabel>Co-Admin</FormLabel>
              </div>
              <FormControl>
                <Input placeholder="coadmin@mail.mcgill.ca" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full justify-end">
          <Button type="submit">Invite</Button>
        </div>
      </form>
    </Form>
  );
}
