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

// Define Zod schema for validation
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

interface ScheduleFormProps {
    selectedDay: string | null;
    selectedTime: string | null;
    teamId: string;
    existingAppointments: { day: string; time: string; email: string }[]; // New prop for existing appointments
    handleNewAppointment: (newAppointment: { day: string; time: string; email: string }) => void; // Add handler for updating parent state
}

export default function ScheduleForm({
    selectedDay,
    selectedTime,
    teamId,
    existingAppointments,
    handleNewAppointment,
  }: ScheduleFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedDay || !selectedTime) {
        toast.error("Please select both date and time before submitting.");
        return;
      }
  
    const newAppointment = {
        day: selectedDay,
        time: selectedTime,
        email: values.email,
    };

      // Prepare the updated appointments array
    const updatedAppointments = [
        ...existingAppointments,
        newAppointment,
    ];
  
      const appointmentData = {
        appointments: updatedAppointments, // Send the updated appointments array
      };
  
      console.log("Form submitted:", values);

    try {
      // Example API call or logic to handle form submission
      const response = await fetch(`http://localhost:5001/api/teams/${teamId}/appointments`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        toast.success("Email submitted successfully!");
        handleNewAppointment(newAppointment);
      } else {
        throw new Error("Failed to submit email");
      }
    } catch (error) {
      console.error("Error submitting email:", error);
      toast.error("Something went wrong!");
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
              <FormControl>
                <Input placeholder="yourname@mail.mcgill.ca" {...field} />
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
