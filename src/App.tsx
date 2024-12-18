import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./features/AuthContext.tsx";
import { useContext } from "react";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Search from "./pages/Search";
import RegisterTeam from "./pages/RegisterTeam";
import DashBoard from "./pages/DashBoard";
import Schedule from "./pages/Schedule";
import DashBoardTeams from "./pages/DashBoardTeams";
import SignIn from "./pages/SignIn";
import { Toaster } from "@/components/ui/sonner";
import CreateTeam from "./pages/CreateTeam";

function App() {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/" />;
    }
    return children;
  };
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        {/* <Route path="/search/:searchCode" element={<Search />} /> */}
        <Route path="/schedule/:code" element={<Schedule />} />
        {/* <Route path="/team/:teamId" element={<RegisterTeam />} />  */}
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
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
