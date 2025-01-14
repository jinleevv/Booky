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
import { toast } from "sonner";
import { useEffect } from "react";
import { useHook } from "@/hooks";

const formSchema = z.object({
  name: z
    .string()
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces")
    .optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(
      /^[a-zA-Z0-9._%+-]+@(mail\.mcgill\.ca|mcgill\.ca)$/,
      "Email must be in the format yourname@mail.mcgill.ca or yourname@mcgill.ca"
    ),
});

interface ScheduleFormProps {
  selectedDate: string | null;
  selectedTime: string | null;
  teamId: string;
  handleNewAppointment: (newAppointment: {
    day: string;
    time: string;
    email: string;
  }) => void;
}

export default function ScheduleForm({
  selectedDate: selectedDay,
  selectedTime,
  teamId,
  handleNewAppointment,
}: ScheduleFormProps) {
  const { server, userName, userEmail, loggedInUser } = useHook();

  useEffect(() => {
      if (loggedInUser) {
        form.setValue("email", userEmail);
        form.setValue("name", userName);
      }
    }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedDay || !selectedTime) {
      toast.error("Please select both date and time before submitting.");
      return;
    }

    const newAppointmentToken = {
      day: selectedDay,
      time: selectedTime,
      name: values.name,
      email: values.email,
      token: generateRandomToken(),
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    const newAppointment = {
      day: selectedDay,
      time: selectedTime,
      name: values.name,
      email: values.email,
    };

    try {
      const response = await fetch(
        `${server}/api/teams/${teamId}/appointments`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ appointments: [newAppointmentToken] }),
        }
      );

      if (response.ok) {
        toast.success("Meeting submitted successfully!");
        handleNewAppointment(newAppointment);
      } else {
        throw new Error("Failed to submit email");
      }
    } catch (error) {
      console.error("Error submitting email:", error);
      toast.error("Something went wrong!");
    }
  }

  const generateRandomToken = (length = 32) => {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 p-4 max-h-1/2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Name" disabled={loggedInUser} {...field} />
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
              <FormLabel>Email*</FormLabel>
              <FormControl>
                <Input
                  placeholder="yourname@mail.mcgill.ca"
                  disabled={loggedInUser}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
