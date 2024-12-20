import NavigationBar from "@/features/NavigationBar";
import { useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export default function RegisterTeam() {
  const { teamId } = useParams();
  return (
    <section className="h-screen w-screen bg-white">
      <NavigationBar />
      <div className="flex flex-col items-center justify-center">
        <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2"></div>
      </div>
      <div className="flex flex-col items-center justify-center h-5/6 relative">
        <Card className="w-2/3">
          <CardHeader>
            <CardTitle>Join Team: {teamId}</CardTitle>
            <CardDescription>
              Professor: Joseph Vybihal <br />
              Semester: Fall 2024
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Enter Team Registration Code"
              className="text-right"
            />
            <div className="flex justify-end mt-2">
              <Button>Register</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
