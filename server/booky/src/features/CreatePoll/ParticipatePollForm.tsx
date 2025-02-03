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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

type ParticipatePollFormProps = {
  onLogin: (email: string, passwordVerified: boolean) => void;
};

const formSchema = z.object({
  email: z.string().email("Please enter a valid email").min(2, {
    message: "Email is required",
  }),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ParticipatePollForm({
  onLogin,
}: ParticipatePollFormProps) {
  const { id: urlPath } = useParams<string>();

  // Defining participant form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    let passwordVerified: boolean = true;
    const response = await fetch(`/api/polls/${urlPath}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail: values.email,
        password: values.password,
        selectedSlots: [],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      if (data.message === "Password is required") {
        passwordVerified = false;
        toast.error("Failed to check in - Password required -");
        return -1;
      }
      toast.error("Server error");
      return -1;
    }

    toast("Successfully checked into the poll");
    onLogin(values.email, passwordVerified);
  }

  return (
    <div className="w-4/5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white py-6 px-20 space-y-4 border rounded-2xl"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <div className="flex w-full gap-2">
                  <FormLabel className="w-28 m-auto">Email:</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="w-full"
                      placeholder="booky@mail.mcgill.ca"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex w-full gap-2">
                  <FormLabel className="m-auto">Password (Optional):</FormLabel>
                  <FormControl>
                    <Input className="w-full" type="password" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">
            Check in
          </Button>
        </form>
      </Form>
    </div>
  );
}
