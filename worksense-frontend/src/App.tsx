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
import { AccountPage } from "./pages/Account/AccountPage";
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
          {/* Account Route */}
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <AccountPage />
              </PrivateRoute>
            }
          />
          {/* Project Routes */}
          <Route
            path="/project/:id"
            element={
              <PrivateRoute>
                <Navigate to="overview" replace />
              </PrivateRoute>
            }
          />
          <Route
            path="/project/:id/overview"
            element={
              <PrivateRoute>
                <ProjectPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/project/:id/sprint"
            element={
              <PrivateRoute>
                <ProjectPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/project/:id/users"
            element={
              <PrivateRoute>
                <ProjectPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/project/:id/bugs"
            element={
              <PrivateRoute>
                <ProjectPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/project/:id/stories"
            element={
              <PrivateRoute>
                <ProjectPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/project/:id/backlog"
            element={
              <PrivateRoute>
                <ProjectPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/project/:id/leaderboard"
            element={
              <PrivateRoute>
                <ProjectPage />
              </PrivateRoute>
            }
          />
          {/* Documentation Routes */}
          <Route
            path="/guides"
            element={
              <PrivateRoute>
                <div>Guides Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/api"
            element={
              <PrivateRoute>
                <div>API Reference Page</div>
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
