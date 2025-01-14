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
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ParticipatePollFormProps = {
  pollName: string;
  pollDescription: string;
  startDate: string;
  endDate: string;
  onLogin: (email: string) => void;
};

const formSchema = z.object({
  email: z.string().email("Please enter a valid email").min(2, {
    message: "Email is required",
  }),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ParticipatePollForm = ({
  pollName,
  pollDescription,
  startDate,
  endDate,
  onLogin,
}: ParticipatePollFormProps) => {
  // Defining participant form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: FormValues) {
    onLogin(values.email);
    console.log(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h2 className="text-2xl font-bold mb-4">{pollName}</h2>
        <div className="space-y-4">
          <Label></Label>
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email:</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="booky@mail.mcgill.ca"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password (Optional):</FormLabel>
              <FormControl onChange={field.onChange}>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default ParticipatePollForm;
