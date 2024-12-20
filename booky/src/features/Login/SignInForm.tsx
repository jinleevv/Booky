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

      // If successful, response contains a UserCredential object
      console.log("Sign-in successful:", response.user);
      console.log("User UID:", response.user.uid);
      console.log("User Email:", response.user.email);
      toast("Sign-In Successful");
      setLoggedInUser(true);
      setUserName(response.user.displayName);
      navigate("/");
      // Optionally, redirect the user or perform further actions
      return { success: true, user: response.user };
    } catch (error) {
      // Handle errors
      console.error("Error signing in:", error.code, error.message);

      // Return or display the error message
      return { success: false, error: error.message };
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
