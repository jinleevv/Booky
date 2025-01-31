import NavigationBar from "@/features/NavigationBar";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useHook } from "@/hooks";

interface IAppointment {
  day: string;
  time: string;
}

export function Appointment() {
  const { teamId, code: appointmentToken } = useParams();
  const { server } = useHook();
  const [appointment, setAppointment] = useState<IAppointment>({
    day: "",
    time: "",
  });
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // Send GET request to backend API
        const response = await fetch(
          `${server}/api/appointment/get-appointment?teamId=${teamId}&appointmentToken=${appointmentToken}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (
            response.status === 400 &&
            errorData.message === "Expired Appointment"
          ) {
            setError(errorData.message);
          }
        }

        const data = await response.json();
        setAppointment(data);
      } catch (err) {
        toast("Fetch Meeting Information Failed");
      }
    };

    // Call the fetch function
    fetchAppointment();
  }, [teamId, appointmentToken]);

  async function handleCancel() {
    const response = await fetch(
      `${server}/api/appointment/delete-appointment?teamId=${teamId}&appointmentToken=${appointmentToken}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      toast("Unable to cancel the meeting");
      return;
    }

    toast("Successfully cancelled the meeting");
  }

  return (
    <section className="h-screen w-screen bg-white">
      <NavigationBar />
      <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2 left-1/3 z-10"></div>
      <Card className="relative translate-y-1/4 w-1/2 z-50 items-center justify-center ml-auto mr-auto">
        <CardHeader>
          <CardTitle>Cancel the Meeting</CardTitle>
          <CardDescription>cancel the meeting</CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          {error !== "" ? (
            <Label>Expired Link</Label>
          ) : (
            <>
              <Label>Date: {appointment.day}</Label> <br />
              <Label>Time: {appointment.time}</Label> <br />
              <div className="flex w-full justify-end">
                <Dialog>
                  <DialogTrigger>
                    <Button variant="outline">Cancel Meeting</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex w-full justify-end">
                      <Button onClick={handleCancel}>Cancel</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
