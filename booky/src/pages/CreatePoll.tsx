import CreatePollForm from "@/features/CreatePoll/CreatePollForm";
import NavigationBar from "@/features/NavigationBar";

export default function CreatePoll() {
  return (
    <section className="h-screen w-screen bg-white font-outfit">
      <NavigationBar />
      <main className="container mx-auto px-4">
        <div className="absolute w-3/6 h-2/6 bg-red-700 blur-[500px] top-1/2 translate-x-1/2"></div>
        <div className="w-full px-3 pt-10 pb-4 relative z-10">
          <div className="flex justify-center items-center">
            <CreatePollForm />
          </div>
        </div>
      </main>
    </section>
  );
}
