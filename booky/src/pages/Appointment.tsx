import NavigationBar from "@/features/NavigationBar/NavigationBar";
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
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function Appointment() {
  const {
    teamId,
    meetingTeamId,
    meetingId,
    code: appointmentToken,
  } = useParams();
  const [appointment, setAppointment] = useState<any>({
    team: "",
    meetingTeam: "",
    day: "",
    attendee: {},
  });
  const [error, setError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [teamId, appointmentToken]);

  async function fetchAppointment() {
    try {
      // Send GET request to backend API
      const response = await fetch(
        `http://localhost:10000/api/appointment/get-appointment?teamId=${teamId}&meetingTeamId=${meetingTeamId}&meetingId=${meetingId}&appointmentToken=${appointmentToken}`
      );

      if (response.ok) {
        const data = await response.json();

        setAppointment(data);
      } else if (response.status === 409) {
        setError("Appointment Expired");
      } else {
        toast("Fetch Meeting Information Failed");
      }
    } catch (err) {
      toast("Fetch Meeting Information Failed");
    }
  }

  async function handleCancel() {
    try {
      const response = await fetch(
        `http://localhost:10000/api/appointment/delete-appointment?teamId=${teamId}&meetingTeamId=${meetingTeamId}&meetingId=${meetingId}&appointmentToken=${appointmentToken}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointment: appointment,
          }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        if (data.message === "Appointment not found or already removed") {
          toast("Appointment not found or already cancelled");
        } else {
          toast("Unable to cancel the meeting");
        }
        return;
      }
      toast("Successfully cancelled the meeting");
    } catch (error) {
      console.error("Error canceling meeting:", error);
      toast("An error occurred while canceling");
    }
  }

  return (
    <section className="h-screen w-screen bg-white">
      <NavigationBar />
      <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2 left-1/3 z-10"></div>
      <Card className="relative translate-y-1/4 w-1/2 z-50 items-center justify-center ml-auto mr-auto">
        <CardHeader>
          <CardTitle>Cancel the Meeting</CardTitle>
          <CardDescription>
            {appointment.team}: {appointment.meetingTeam}
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          {error !== "" ? (
            <Label>Expired Link</Label>
          ) : (
            <>
              <Label>Date: {appointment.day}</Label> <br />
              <Label>Time: {appointment.attendee.time}</Label> <br />
              <div className="flex w-full justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      Cancel Meeting
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Meeting</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this meeting? This
                        action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                        }}
                      >
                        No
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setIsDialogOpen(false);
                          handleCancel();
                        }}
                      >
                        Yes
                      </Button>
                    </DialogFooter>
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
