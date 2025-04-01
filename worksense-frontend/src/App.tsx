<<<<<<< HEAD
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/login/login";
import Dashboard from "./pages/dashboard/Dashboard";
import { useAuth } from "./contexts/AuthContext";

// Componente para proteger rutas
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
=======
import { Routes, Route } from "react-router-dom";
import CreateProject from "./pages/CreateProject/CreateProject";

function App() {
  return (
    <Routes>
      <Route path="/create" element={<CreateProject />} />
    </Routes>
>>>>>>> 4deadda2a8b4b6c73e05b00bce0ef90ef551b2b3
  );
}

export default App;
