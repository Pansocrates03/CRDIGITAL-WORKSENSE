// src/App.tsx
import React from "react"; // Make sure React is imported
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // Import useAuth
import { MainLayout } from "./layouts/MainLayout"; // Import the layout
import LoginPage from "./pages/login/login";
import CreateProject from "./pages/CreateProject/CreateProject";
import { ProjectPage } from "./pages/ProjectView/ProjectPage";
import Settings from "./pages/Settings/Settings";
import BacklogTablePage from "./pages/BacklogTable/BacklogTablePage";
import MembersPage from "./pages/Members/MembersPage";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import SprintPage from "./pages/Sprints/SprintPage";
const queryClient = new QueryClient();

console.log("Running");

// Updated PrivateRoute to wrap content with MainLayout
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  console.log(
    `[PrivateRoute] Loading: ${loading}, Authenticated: ${isAuthenticated}`
  );

  if (loading) {
    console.log("[PrivateRoute] Rendering loading indicator.");
    return <div>Loading Authentication...</div>; // Or a better loading spinner
  }

  if (!isAuthenticated) {
    console.log("[PrivateRoute] Not Authenticated. Redirecting to /login.");
    return <Navigate to="/login" replace />;
  }

  console.log(
    "[PrivateRoute] Authenticated. Rendering children within MainLayout."
  );

  // Wrap the authenticated route's content with the MainLayout
  return <MainLayout>{children}</MainLayout>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Login Page - Does NOT use MainLayout */}
            <Route path="/login" element={<LoginPage />} />

            {/* Routes that REQUIRE Authentication and the Sidebar Layout */}

            <Route
              path="/create"
              element={
                <PrivateRoute>
                  {" "}
                  <CreateProject />{" "}
                </PrivateRoute>
              }
            />
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Navigate to="/settings?tab=account" replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  {" "}
                  <Settings />{" "}
                </PrivateRoute>
              }
            />
            <Route
              path="/project/:id/overview"
              element={
                <PrivateRoute>
                  {" "}
                  <ProjectPage />{" "}
                </PrivateRoute>
              }
            />
            <Route
              path="/project/:id/product-backlog" // Nueva ruta para el backlog
              element={
                <PrivateRoute>
                  <BacklogTablePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/project/:id/sprint"
              element={
                <PrivateRoute>
                  <SprintPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/project/:id/users"
              element={
                <PrivateRoute>
                  <MembersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/project/:id/bugs"
              element={
                <PrivateRoute>
                  {" "}
                  <ProjectPage />{" "}
                  {/* Replace with specific BugsPage if you have one */}{" "}
                </PrivateRoute>
              }
            />
            <Route
              path="/project/:id/stories"
              element={
                <PrivateRoute>
                  {" "}
                  <ProjectPage />{" "}
                  {/* Replace with specific StoriesPage if you have one */}{" "}
                </PrivateRoute>
              }
            />
            <Route
              path="/project/:id/leaderboard"
              element={
                <PrivateRoute>
                  {" "}
                  <ProjectPage />{" "}
                  {/* Replace with specific LeaderboardPage if you have one */}{" "}
                </PrivateRoute>
              }
            />

            {/* Redirect base project path if needed, still within layout */}
            <Route
              path="/project/:id"
              element={
                <PrivateRoute>
                  {" "}
                  <Navigate to="overview" replace />{" "}
                </PrivateRoute>
              }
            />

            {/* Documentation Routes - Also use MainLayout */}
            <Route
              path="/guides"
              element={
                <PrivateRoute>
                  {" "}
                  <div>Guides Page Content</div>{" "}
                </PrivateRoute>
              }
            />
            <Route
              path="/api"
              element={
                <PrivateRoute>
                  {" "}
                  <div>API Reference Page Content</div>{" "}
                </PrivateRoute>
              }
            />

            {/* Fallback Route */}
            {/* Redirects authenticated users to /create, unauthenticated handled by PrivateRoute */}
            <Route
              path="*"
              element={
                <PrivateRoute>
                  <Navigate to="/create" replace />
                </PrivateRoute>
              }
            />

            {/* Alternative Fallback: Check auth status explicitly */}
            {/* <Route path="*" element={<RootFallback />} /> */}
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Optional: Explicit fallback component if needed
// function RootFallback() {
//   const { isAuthenticated, loading } = useAuth();
//   if (loading) return <div>Loading...</div>;
//   return <Navigate to={isAuthenticated ? "/create" : "/login"} replace />;
// }

export default App;
