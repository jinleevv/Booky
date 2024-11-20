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
import { createUserWithEmailAndPassword } from "firebase/auth";

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
  email: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least 1 special character"
    ),
});

export default function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

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
    console.log(response);
    const uid = response.user.uid;
    console.log("Firebase UID", uid);
   
    await saveUserToDatabase(uid);
  }

  async function saveUserToDatabase(uid: string) {
    console.log("Sending UID to backend:", uid);
    const response = await fetch("http://localhost:5001/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid }), 
    });

    console.log("Response from backend:", response);
    if (!response.ok) {
      console.error("Failed to save user to database");
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
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
