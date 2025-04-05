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
  // Get all necessary values from context
  const { isAuthenticated, loading, user } = useAuth(); // <-- Get loading state

  // Add logging to see its state during render
  console.log(
    `%%% [PrivateRoute] Rendering. Loading: ${loading}, Authenticated: ${isAuthenticated}, User:`,
    user
  );

  // 1. Check if the authentication status is still loading
  if (loading) {
    console.log(
      "%%% [PrivateRoute] Condition: LOADING. Rendering loading indicator."
    );
    // Render a loading indicator, or null, while checking auth status
    return <div>Loading...</div>; // Or your preferred loading component/null
  }

  if (!isAuthenticated) {
    console.log(
      "%%% [PrivateRoute] Condition: NOT Authenticated (Loading is false). REDIRECTING."
    );
    // If not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // 3. If loading is false and authenticated, render the actual route's component
  console.log(
    "%%% [PrivateRoute] Condition: Authenticated. Rendering children."
  );
  return children;
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
