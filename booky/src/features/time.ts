export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const availableTime = [
  "12:00 AM",
  "12:30 AM",
  "01:00 AM",
  "01:30 AM",
  "02:00 AM",
  "02:30 AM",
  "03:00 AM",
  "03:30 AM",
  "04:00 AM",
  "04:30 AM",
  "05:00 AM",
  "05:30 AM",
  "06:00 AM",
  "06:30 AM",
  "07:00 AM",
  "07:30 AM",
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
  "11:30 PM",
  "11:59 PM",
];

// Time conversion helpers
export function convertTo24Hour(time12h) {
  // Parse the time components
  const [time, period] = time12h.split(" ");
  let [hours, minutes] = time.split(":");

  hours = parseInt(hours);

  if (hours === 12) {
    hours = period === "PM" ? 12 : 0;
  } else if (period === "PM") {
    hours += 12;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

export function formatTime(time) {
  const [hour, minute] = time.split(":");
  const hourNum = parseInt(hour);
  const period = hourNum >= 12 ? "PM" : "AM";
  const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
  return `${displayHour}:${minute} ${period}`;
}

export function parseStringTimeToInt(time: string): number {
  const [hour] = time.split(":");
  return parseInt(hour);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
