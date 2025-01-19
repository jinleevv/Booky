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
import { z } from "zod";

type ParticipatePollFormProps = {
  onLogin: (email: string) => void;
};

const formSchema = z.object({
  email: z.string().email("Please enter a valid email").min(2, {
    message: "Email is required",
  }),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ParticipatePollForm = ({ onLogin }: ParticipatePollFormProps) => {
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
                    <Input className="w-full" type="text" {...field} />
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
};

export default ParticipatePollForm;
