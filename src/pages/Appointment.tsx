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

export function Appointment() {
  const { team: teamId, code: appointmentToken } = useParams();
  const [appointment, setAppointment] = useState("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // Send GET request to backend API
        const response = await fetch(
          `http://localhost:5001/api/appointment/get-appointment?teamId=${teamId}&appointmentToken=${appointmentToken}`
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
        toast("Fetch Appointment Information Failed");
      }
    };

    // Call the fetch function
    fetchAppointment();
  }, [teamId, appointmentToken]);

  async function handleCancel() {
    const response = await fetch(
      `http://localhost:5001/api/appointment/delete-appointment?teamId=${teamId}&appointmentToken=${appointmentToken}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      toast("Unable to cancel the appointment");
      return;
    }

    toast("Successfully cancelled the appointment");
  }

  return (
    <section className="h-screen w-screen bg-white">
      <NavigationBar />
      <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2 left-1/3 z-10"></div>
      <Card className="relative translate-y-1/4 w-1/2 z-50 items-center justify-center ml-auto mr-auto">
        <CardHeader>
          <CardTitle>Modify or Cancel the Appointment</CardTitle>
          <CardDescription>modify or cancel the appoiontment</CardDescription>
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
                    <Button variant="outline">Cancel Appointment</Button>
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
