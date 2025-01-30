import { Button } from "@/components/ui/button";
import { DatePicker } from "@heroui/date-picker";
import { getLocalTimeZone, now } from "@internationalized/date";
import { useState } from "react";

export default function Attendance() {
  const [sessionStatus, setSessionStatus] = useState<boolean>(false);
  const [attendanceCode, setAttendanceCode] = useState<string>("");

  // Function to generate a random 6-character alphanumeric code
  function generateRandomCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    setAttendanceCode(result);
    setSessionStatus(true);
  }

  return (
    <div>
      <div className="flex w-full h-full gap-2">
        <div className="w-1/3">
          <DatePicker
            hideTimeZone
            showMonthAndYearPickers
            defaultValue={now(getLocalTimeZone())}
            label="Attendance Date and Time"
            variant="bordered"
            isDisabled
          />
        </div>
        <div className="flex w-full h-full justify-end my-auto">
          {sessionStatus ? (
            <Button
              onClick={() => {
                setSessionStatus(false);
                setAttendanceCode("");
              }}
            >
              Close Session
            </Button>
          ) : (
            <Button onClick={generateRandomCode}>Generate Code</Button>
          )}
        </div>
      </div>
      <div>
        {/* Generate 6 digit Random Code that is alphanumerical */}
        {attendanceCode && (
          <div className="flex justify-center gap-2 mt-4">
            {attendanceCode.split("").map((char, index) => (
              <div
                key={index}
                className="w-12 h-12 flex items-center justify-center text-2xl font-bold border border-gray-400 rounded-lg shadow-md bg-gray-100"
              >
                {char}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
