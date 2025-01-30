import { DatePicker } from "@heroui/date-picker";
import { getLocalTimeZone, now } from "@internationalized/date";
import { QRCodeSVG } from "qrcode.react";

export default function Attendance() {
  return (
    <div>
      <DatePicker
        hideTimeZone
        showMonthAndYearPickers
        defaultValue={now(getLocalTimeZone())}
        label="Attendance Date and Time"
        variant="bordered"
        isDisabled
      />
      <QRCodeSVG value="https://reactjs.org/" />
    </div>
  );
}
