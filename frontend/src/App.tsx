// Main App component with routing configuration

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";

function App() {
  return (
    <BrowserRouter>
      {/* Wrap app with AuthProvider to provide auth state globally */}
      <AuthProvider>
        <Routes>
          {/* Public route - Login page */}
          <Route path="/login" element={<Login />} />

          {/* Protected route - Dashboard (requires authentication) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected route - Users page (requires admin role) */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
