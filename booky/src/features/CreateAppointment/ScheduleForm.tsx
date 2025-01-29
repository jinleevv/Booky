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
  name: z.string().optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(
      /^[a-zA-Z0-9._%+-]+@(mail\.mcgill\.ca|mcgill\.ca)$/,
      "Email must be in the format yourname@mail.mcgill.ca or yourname@mcgill.ca"
    ),
});

interface ScheduleFormProps {
  selectedMeetingTeam: any;
  selectedDate: string | null;
  selectedTime: string | null;
  teamId: string;
  timeSlots: any;
  setTimeSlots: any;
}

export default function ScheduleForm({
  selectedMeetingTeam,
  selectedDate: selectedDay,
  selectedTime,
  teamId,
  timeSlots,
  setTimeSlots,
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
      if (selectedMeetingTeam.type !== "group") {
        toast.error("Please select both date and time before submitting.");
        return;
      }
    }

    let newSelectedTime;

    if (selectedMeetingTeam.type == "group") {
      newSelectedTime = {
        start: "10:00 AM",
        end: "10:00 AM",
      };
    } else {
      newSelectedTime = selectedTime;
    }

    const newAttend = {
      time: newSelectedTime,

      participantName: values.name,
      participantEmail: values.email,

      token: generateRandomToken(),
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    try {
      const response = await fetch(
        `${server}/api/teams/${teamId}/appointments`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meetingTeamId: selectedMeetingTeam._id,
            day: selectedDay,
            time: newSelectedTime,
            attend: newAttend,
          }),
        }
      );

      if (response.ok) {
        const updateTimeSlots = timeSlots.map((timeSlot) => {
          if (timeSlot.day === selectedDay) {
            return {
              ...timeSlot,
              slots: timeSlot.slots.filter((time) => time !== selectedTime),
            };
          }
          return timeSlot;
        });

        setTimeSlots(updateTimeSlots);
        toast.success("Meeting submitted successfully!");
      } else {
        throw new Error("Failed to submit email");
      }
    } catch (error) {
      console.error("Error submitting email:", error);
      toast.error("You must complete the form!");
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
