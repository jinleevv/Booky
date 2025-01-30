import MeetingMinute from "@/features/MeetingMinute/MeetingMinute";

export default function MeetingMinutePage() {
  return (
    <section className="h-screen w-screen bg-white">
      <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
      <div className="flex">
        <div className="w-full h-full px-3 py-4 relative z-10 font-outfit">
          <div>
            <MeetingMinute />
          </div>
        </div>
      </div>
    </section>
  );
}
