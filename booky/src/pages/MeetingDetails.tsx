import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardNavBar from "@/features/DashboardNavBar";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function MeetingDetails() {
  const navigate = useNavigate();
  return (
    <section className="h-screen w-screen bg-white font-outfit">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <DashboardNavBar />
        <div className="flex flex-col w-full p-5">
          <div className="flex flex-col w-full h-fit mb-2">
            <div className="-ml-4 rounded-2xl">
              <Button
                variant="ghost"
                className="gap-1.5 w-20 rounded-xl"
                onClick={() => navigate("/")}
              >
                <HiOutlineArrowNarrowLeft size={25} />
                Back
              </Button>
            </div>

            <Label className="text-lg font-bold">Meeting Name</Label>
            <Label className="text-sm font-light text-gray-600">Date:</Label>
            <Label className="text-sm font-light text-gray-600">Time:</Label>
          </div>
          <div className="p-4 w-full h-full border border-dashed rounded-lg">
            <div className="w-full h-fit">
              <Label className="text-medium font-bold">Meeting Minute </Label>{" "}
              <Button variant="ghost" className="w-10">
                Link
              </Button>
            </div>
            <div>
              <Label>Preview:</Label>
              <ScrollArea className="w-full h-36 text-sm border rounded-lg p-3 mt-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
                at luctus nibh. Duis in mi ac nulla gravida ultricies ac
                convallis orci. Mauris eu lorem vel nibh elementum bibendum a a
                nulla. Suspendisse id metus at neque mattis sodales eu a purus.
                Sed odio lorem, blandit vitae consectetur eget, accumsan sed
                quam. Pellentesque aliquam ipsum ut nulla accumsan, in sodales
                nisl elementum. Nulla eleifend venenatis libero, sit amet
                finibus massa fringilla non. Nullam mattis cursus lacinia. Sed
                sed justo tortor. In interdum dictum arcu non ullamcorper. Nulla
                mollis enim vel hendrerit convallis. Quisque varius, leo eu
                molestie interdum, augue nunc egestas massa, ac porta sapien
                eros id nisl. Cras commodo vestibulum turpis sit amet volutpat.
                Curabitur neque nisl, imperdiet ut ipsum vitae, lobortis
                eleifend purus. Quisque fermentum quam ut mi ultricies, non
                auctor arcu imperdiet. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Morbi at luctus nibh. Duis in mi ac nulla
                gravida ultricies ac convallis orci. Mauris eu lorem vel nibh
                elementum bibendum a a nulla. Suspendisse id metus at neque
                mattis sodales eu a purus. Sed odio lorem, blandit vitae
                consectetur eget, accumsan sed quam. Pellentesque aliquam ipsum
                ut nulla accumsan, in sodales nisl elementum. Nulla eleifend
                venenatis libero, sit amet finibus massa fringilla non. Nullam
                mattis cursus lacinia. Sed sed justo tortor. In interdum dictum
                arcu non ullamcorper. Nulla mollis enim vel hendrerit convallis.
                Quisque varius, leo eu molestie interdum, augue nunc egestas
                massa, ac porta sapien eros id nisl. Cras commodo vestibulum
                turpis sit amet volutpat. Curabitur neque nisl, imperdiet ut
                ipsum vitae, lobortis eleifend purus. Quisque fermentum quam ut
                mi ultricies, non auctor arcu imperdiet.
              </ScrollArea>
            </div>
            <div className="mt-6">
              <Label className="text-medium font-bold">Tasks</Label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
