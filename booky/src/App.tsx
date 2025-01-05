import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import { AuthContext } from "./features/AuthContext.tsx";
import { useContext } from "react";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import DashBoard from "./pages/DashBoard";
import Schedule from "./pages/Schedule";
import DashBoardTeams from "./pages/DashBoardTeams";
import SignIn from "./pages/SignIn";
import { Toaster } from "@/components/ui/sonner";
import CreateTeam from "./pages/CreateTeam";
import { useHook } from "./hooks.ts";
import { Appointment } from "./pages/Appointment.tsx";
import DashBoardSchedule from "./pages/DashBoardSchedule.tsx";
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
    <Router>
      <NextUIProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
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
            path="/dashboard/:team/settings"
            element={
              <ProtectedRoute>
                <TeamSettings />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </NextUIProvider>
    </Router>
  );
}

export default App;
