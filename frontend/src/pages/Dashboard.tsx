import Navbar from "../components/Navbar"; // Add this import
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Add Navbar component */}
      <Navbar />

      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              Welcome, {user?.first_name} {user?.last_name}!
            </h2>
            <p>Email: {user?.email}</p>
            <div className="mt-4">
              <span>Role: </span>
              <span
                className={
                  "badge " + (isAdmin() ? "badge-error" : "badge-info")
                }
              >
                {isAdmin() ? "Admin" : "User"}
              </span>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/documents")}
              >
                Manage Files
              </button>

              {isAdmin() && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/users")}
                >
                  Manage Users
                </button>
              )}
            </div>

            {/* Admin-only content */}
            {isAdmin() && (
              <div className="mt-4 p-4 bg-error/10 rounded-lg">
                <h3 className="font-bold text-error">Admin Features</h3>
                <p className="text-sm">
                  You have full access to manage users and settings.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
