import { Label } from "@/components/ui/label";
import NavigationBar from "@/features/NavigationBar";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { IoIosAdd } from "react-icons/io";

export default function Search() {
  const navigate = useNavigate();
  const { searchCode } = useParams();

  const handleRegisterTeam = (id: string) => {
    navigate(`/team/${encodeURIComponent(id)}`);
  };

  return (
    <section className="h-screen w-screen bg-white">
      <NavigationBar />
      <div className="flex flex-col items-center justify-center">
        <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2"></div>
      </div>
      <div className="flex flex-col px-8 mt-4 justify-start h-5/6 relative">
        <Label className="text-2xl font-bold text-black">
          Search Results for: {searchCode}
        </Label>
        <div className="flex flex-col-3 w-full h-full mt-2">
          <div className="w-1/3 h-full p-2 border-gray-200">
            <Card className="rounded-lg" id={"COMP 307"}>
              <CardHeader>
                <img
                  src="https://via.placeholder.com/150"
                  alt="Course Thumbnail"
                />
                <CardTitle className="text-2xl">COMP 307</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Professor: Joseph Vybihal <br />
                  Semester: Fall 2024
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => handleRegisterTeam("COMP307")}
                >
                  <IoIosAdd />
                  Add to My Schedule
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="w-1/3 h-full p-2 border-gray-200">
            <Card className="rounded-lg">
              <CardHeader>
                <img
                  src="https://via.placeholder.com/150"
                  alt="Course Thumbnail"
                />
                <CardTitle className="text-2xl">COMP 307</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Professor: Joseph Vybihal <br />
                  Semester: Fall 2024
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => handleRegisterTeam("COMP 307")}
                >
                  <IoIosAdd />
                  Add to My Schedule
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="w-1/3 h-full p-2 border-gray-200">
            <Card className="rounded-lg">
              <CardHeader>
                <img
                  src="https://via.placeholder.com/150"
                  alt="Course Thumbnail"
                />
                <CardTitle className="text-2xl">COMP 307</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Professor: Joseph Vybihal <br />
                  Semester: Fall 2024
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => handleRegisterTeam("COMP 307")}
                >
                  <IoIosAdd />
                  Add to My Schedule
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
