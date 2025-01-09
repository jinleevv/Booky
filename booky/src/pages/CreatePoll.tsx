import CreatePollForm from "@/features/CreatePoll/CreatePollForm";
import NavigationBar from "@/features/NavigationBar";

export default function CreatePoll() {
  return (
    <section className="min-h-screen bg-white">
      <NavigationBar />
      <main className="container mx-auto px-4">
        <div className="absolute w-3/6 h-2/6 bg-red-200 blur-[600px] top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4"></div>
        <div className="w-full px-3 py-4 relative z-10">
          <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
            <CreatePollForm />
          </div>
        </div>
      </main>
    </section>
  );
}
