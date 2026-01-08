import Navbar from "../components/Navbar";

import { useEffect, useState } from "react";
import UserModal, { UserItem } from "../components/UserModal";
import "../index.css";
import { tokenManager } from "../utils/tokenManager";

import axios from "axios";

export default function Users() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | "create">("edit");
  const [selected, setSelected] = useState<UserItem | null>(null);

  function getAuthHeaders(extra?: Record<string, string>) {
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error("No access token. Please login again.");
    }

    return {
      Authorization: `Bearer ${token}`,
      ...(extra ?? {}),
    };
  }

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/users/", {
        headers: getAuthHeaders(),
      });
      setUsers(res.data.users || []);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail || e?.message || "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openCreate() {
    setMode("create");
    setSelected(null);
    setOpen(true);
  }

  function openEdit(user: UserItem) {
    setMode("edit");
    setSelected(user);
    setOpen(true);
  }

  async function handleSave(payload: any) {
    try {
      if (mode === "create") {
        try {
          const res = await axios.post(
            "/api/users/",
            {
              first_name: payload.first_name,
              last_name: payload.last_name,
              email: payload.email,
              password: payload.password,
              role_id: payload.role_id,
              status_id: payload.status_id,
            },
            {
              headers: getAuthHeaders({
                "Content-Type": "application/json",
              }),
            }
          );
        } catch (e: any) {
          const message =
            e?.response?.data?.detail || e?.message || "Failed to create user";
          throw new Error(message);
        }
      }

      if (mode === "edit") {
        const body: any = {
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          role_id: payload.role_id,
          status_id: payload.status_id,
        };

        // password： fill to change otherwise remains the same
        if (payload.password && payload.password.trim()) {
          body.password = payload.password.trim();
        }

        try {
          const res = await axios.patch(`/api/users/${payload.id}`, body, {
            headers: getAuthHeaders({
              "Content-Type": "application/json",
            }),
          });
        } catch (e: any) {
          const message =
            e?.response?.data?.detail || e?.message || "Failed to update user";
          throw new Error(message);
        }
      }

      setOpen(false);
      await loadUsers();
    } catch (e: any) {
      alert(e?.message || "Save failed");
    }
  }

  // users page layout
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Users</h1>
          <button className="btn btn-primary" onClick={openCreate}>
            + Create User
          </button>
        </div>
        {loading && <div className="alert mb-4">Loading users...</div>}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role(s)</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.first_name} {u.last_name}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge badge-outline">
                      {u.role_id === 1 ? "Admin" : "Regular"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${u.status_id === 1 ? "badge-success" : "badge-ghost"}`}
                    >
                      {u.status_id === 1 ? "Active" : "Disable"}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-sm" onClick={() => openEdit(u)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <UserModal
          open={open}
          mode={mode}
          user={selected}
          onClose={() => setOpen(false)}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
