import { Toaster } from "@/components/ui/sonner";
import { NextUIProvider } from "@nextui-org/react";
import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthContext } from "./features/AuthContext.tsx";
import { useHook } from "./hooks.ts";
import { Appointment } from "./pages/Appointment.tsx";
import CreateMeetingPage from "./pages/CreateMeetingPage.tsx";
import CreatePoll from "./pages/CreatePoll.tsx";
import CreateTeam from "./pages/CreateTeam";
import DashBoard from "./pages/DashBoard";
import DashBoardSchedule from "./pages/DashBoardSchedule.tsx";
import DashBoardTeams from "./pages/DashBoardTeams";
import EditMeetingTeamPage from "./pages/EditMeetingTeamPage.tsx";
import Home from "./pages/Home";
import MeetingDetails from "./pages/MeetingDetails.tsx";
import MeetingMinutePage from "./pages/MeetingMinutePage.tsx";
import ParticipatePoll from "./pages/ParticipatePoll.tsx";
import Schedule from "./pages/Schedule";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import TeamSettings from "./pages/TeamSettings.tsx";

function App() {
  const { loading } = useContext(AuthContext);
  const { loggedInUser } = useHook();

  const ProtectedRoute = ({ children }) => {
    if (!loggedInUser) {
      return <Navigate to="/" />;
    }
    return children;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <NextUIProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/poll" element={<CreatePoll />} />
        <Route path="/poll/:id" element={<ParticipatePoll />} />
        {/* <Route path="/search/:searchCode" element={<Search />} /> */}
        <Route path="/schedule/:code" element={<Schedule />} />
        {/* <Route path="/team/:teamId" element={<RegisterTeam />} />  */}
        <Route path="/:team/:code" element={<Appointment />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teams"
          element={
            <ProtectedRoute>
              <DashBoardTeams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/teams/create-team"
          element={
            <ProtectedRoute>
              <CreateTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:team"
          element={
            <ProtectedRoute>
              <DashBoardSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:teamId/create-meeting"
          element={
            <ProtectedRoute>
              <CreateMeetingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:teamId/edit-meetingTeam/:meetingTeamId"
          element={
            <ProtectedRoute>
              <EditMeetingTeamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:teamId/:meetingTeamId/:meetingId"
          element={
            <ProtectedRoute>
              <MeetingDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:team/settings"
          element={
            <ProtectedRoute>
              <TeamSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/document/:meetingId/"
          element={
            <ProtectedRoute>
              <MeetingMinutePage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </NextUIProvider>
  );
}

export default App;