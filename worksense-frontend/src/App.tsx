import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/login/login";
import CreateProject from "./pages/CreateProject/CreateProject";
import { ProjectPage } from "./pages/ProjectView/ProjectPage";
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
            path="/create"
            element={
              <PrivateRoute>
                <CreateProject />
              </PrivateRoute>
            }
          />
          <Route
            path="/project/:id"
            element={
              <PrivateRoute>
                <ProjectPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/create" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
