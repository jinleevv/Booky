import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { auth } from "../../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useHook } from "@/hooks";

const formSchema = z.object({
  email: z.string().min(1),
  password: z.string(),
});

export default function SignInForm() {
  const navigate = useNavigate();
  const { setLoggedInUser, setUserName } = useHook();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      toast("Sign-In Successful");
      setLoggedInUser(true);
      setUserName(response.user.displayName);
      navigate("/");
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        toast("Invalid email or password");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl className="w-3/4">
                <Input placeholder="booky@mail.mcgill.ca" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl className="w-3/4">
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end w-3/4">
          <Button type="submit">Sign In</Button>
        </div>
      </form>
    </Form>
  );
}
