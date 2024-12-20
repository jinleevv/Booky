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
import { useEffect, useState } from "react";
import { auth } from "../../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useHook } from "@/hooks";

interface PasswordRequirement {
  match: boolean;
  text: string;
}

interface PasswordRequirements {
  length: PasswordRequirement;
  number: PasswordRequirement;
  special: PasswordRequirement;
}

const formSchema = z.object({
  name: z.string().min(1),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(
      /^[a-zA-Z0-9._%+-]+@(mail\.mcgill\.ca|mcgill\.ca)$/,
      "Email must be in the format yourname@mail.mcgill.ca or yourname@mcgill.ca"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least 1 special character"
    ),
});

export default function SignUpForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const navigate = useNavigate();
  const { server } = useHook();
  const [password, setPassword] = useState<string>("");
  const [requirements, setRequirements] = useState<PasswordRequirements>({
    length: { match: false, text: "At least 8 characters" },
    number: { match: false, text: "Contains at least 1 number" },
    special: { match: false, text: "Contains at least 1 special character" },
  });

  useEffect(() => {
    setRequirements({
      length: {
        match: password.length >= 8,
        text: "At least 8 characters",
      },
      number: {
        match: /[0-9]/.test(password),
        text: "Contains at least 1 number",
      },
      special: {
        match: /[^a-zA-Z0-9]/.test(password),
        text: "Contains at least 1 special character",
      },
    });
  }, [password]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    );

    if (!response.user) {
      toast("Failed to Create User");
      return -1;
    }

    // Update the user's profile with their name
    await updateProfile(response.user, {
      displayName: values.name,
    });

    const uid = response.user.uid;

    const db_response = await saveUserToDatabase(
      uid,
      values.email,
      values.name
    );

    if (db_response !== 0) {
      toast("Faild to store the information on MongoDB");
    }
    toast("Successfully Created Account");
    navigate("/login");
  }

  async function saveUserToDatabase(uid: string, email: string, name: string) {
    const response = await fetch(`${server}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: uid,
        email: email,
        name: name,
      }),
    });

    if (!response.ok) {
      console.log("Failed to save user to database");
      console.log(response);
      return -1;
    } else {
      console.log("Successfully saved user to database");
    }
    return 0;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl className="w-3/4">
                <Input placeholder="Booky" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setPassword(e.target.value);
                  }}
                />
              </FormControl>
              <div className="text-xs mt-2 space-y-1">
                {Object.entries(requirements).map(([key, requirement]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span
                      className={
                        requirement.match ? "text-green-500" : "text-gray-400"
                      }
                    >
                      {requirement.match ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        requirement.match ? "text-green-500" : "text-gray-400"
                      }
                    >
                      {requirement.text}
                    </span>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end w-3/4">
          <Button type="submit">Register</Button>
        </div>
      </form>
    </Form>
  );
}
