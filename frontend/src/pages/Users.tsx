import Navbar from "../components/Navbar";

import { useEffect, useState } from "react";
import UserModal, { UserItem } from "../components/UserModal";
import "../index.css"
import { tokenManager } from "../utils/tokenManager";

export default function Users() {
  // // add access control
  // const raw = localStorage.getItem("auth_user");
  // const userParsed = raw ? JSON.parse(raw) : null;

  // // status #1 not logged in
  // if (!userParsed) {
  //   console.log("here")
  //   // return <div className="p-6">Please login first.</div>;
  //   return <div role="alert" className="alert alert-vertical sm:alert-horizontal">
  //     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info h-6 w-6 shrink-0">
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  //     </svg>
  //     <div>
  //       <h3 className="font-bold">Login Required!</h3>
  //       <div className="text-xs">Please Login to continue</div>
  //     </div>
  //     <button className="btn btn-sm">Log in</button>
  //   </div>
  // }
  // // status #2 logged in with regular user
  // if (userParsed.role_id !== 1) {
  //   // return <div className="p-6">403: Admins only.</div>;
  //   return <div role="alert" className="alert alert-vertical sm:alert-horizontal">
  //     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info h-6 w-6 shrink-0">
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  //     </svg>
  //     <div>
  //       <h3 className="font-bold">No Authorization!</h3>
  //       <div className="text-xs">Admins only</div>
  //     </div>
  //     <button className="btn btn-sm">Log in</button>
  //   </div>
  // }

  // status #3 logged in with admin

  // use mock data at # 0
  // const [users, setUsers] = useState<UserItem[]>(MOCK_USERS);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading,setLoading] = useState(true);
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
      const res = await fetch("http://localhost:8000/api/users/", {
        headers: getAuthHeaders(),
      });
      if (!res.ok) 
        throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    // //FOR TESTE: mock admin
    // localStorage.setItem(
    //   "auth_user",
    //   JSON.stringify({
    //     id: 1,
    //     email: "admin@example.com",
    //     role_id: 1
    //   })
    // );
    //FOR TEST: mock admin
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
        const res = await fetch("http://localhost:8000/api/users/", {
          method: "POST",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            first_name: payload.first_name,
            last_name: payload.last_name,
            email: payload.email,
            password: payload.password,
            role_id: payload.role_id,
            status_id: payload.status_id,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.detail || `HTTP ${res.status}`);
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

        // passsword is optional
        if (payload.password && payload.password.trim()) {
          body.password = payload.password.trim();
        }

        const res = await fetch(`http://localhost:8000/api/users/${payload.id}`, {
          method: "PATCH",
          headers: getAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.detail || `HTTP ${res.status}`);
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

      {/* <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-4">This page is only accessible to Admins.</p>
      </div> */}

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
              {/* this the application for the select all checkbox */}
              {/*<th>
                <label className="inline-flex items-center gap-2">
                  <input 
                    type="checkbox"
                    className="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                  />
                  <span>All</span>
                </label>
              </th>*/}
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
                {/* this the application for the select all checkbox */}
                {/* <td>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedIds.has(u.id)}
                    onChange={() => toggleOne(u.id)}
                  />
                  </td> */}
                <td>{u.first_name}{" "}{u.last_name}</td>
                <td>{u.email}</td>
                <td>
                  <span className="badge badge-outline">{u.role_id === 1 ? "Admin" : "Regular"}</span>
                </td>
                <td>
                  <span className={`badge ${u.status_id === 1 ? "badge-success" : "badge-ghost"}`}>
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

