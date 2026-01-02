// export default function Users() {
//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Users</h1>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import UserModal, { UserItem } from "../components/UserModal";
import "../index.css"

// mock data for testing
const MOCK_USERS_SIMPLE: UserItem[] = [
  { id: 1, first_name: "Nina", last_name: "Ma", email: "nina@example.com", role_id: 1, status_id: 1, created_at:"2025", updated_at: "2025"},
  { id: 2, first_name: "Jia", last_name: "Tong", email: "jia@example.com", role_id: 2, status_id: 0, created_at:"2026", updated_at: "2025"},
  { id: 3, first_name: "Run", last_name: "Lin", email: "run@example.com", role_id: 2, status_id: 0, created_at:"2024", updated_at: "2028"},
];
const MOCK_USERS: UserItem[] = [
  {
    id: 1,
    first_name: "Alice",
    last_name: "Wang",
    email: "alice.wang@example.com",
    status_id: 1, // 1 = active
    role_id: 1,   // 1 = admin
    created_at: "2024-01-10 09:15:00",
    updated_at: "2024-01-10 09:15:00",
  },
  {
    id: 2,
    first_name: "Bob",
    last_name: "Li",
    email: "bob.li@example.com",
    status_id: 1, // active
    role_id: 2,   // user
    created_at: "2024-02-03 14:30:00",
    updated_at: "2024-02-05 10:12:00",
  },
  {
    id: 3,
    first_name: "Cathy",
    last_name: "Zhang",
    email: "cathy.zhang@example.com",
    status_id: 0, // disabled
    role_id: 2,   // user
    created_at: "2024-03-01 08:45:00",
    updated_at: "2024-03-20 16:20:00",
  },
];


export default function Users() {
  // add access control
  const raw = localStorage.getItem("auth_user");
  const userParsed = raw ? JSON.parse(raw) : null;

  if (!userParsed) {
    // return <div className="p-6">Please login first.</div>;
    return <div role="alert" className="alert alert-vertical sm:alert-horizontal">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info h-6 w-6 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div>
        <h3 className="font-bold">Login Required!</h3>
        <div className="text-xs">Please Login to continue</div>
      </div>
      <button className="btn btn-sm">Log in</button>
    </div>
  }

  if (userParsed.role_id !== 1) {
    // return <div className="p-6">403: Admins only.</div>;
        return <div role="alert" className="alert alert-vertical sm:alert-horizontal">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info h-6 w-6 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div>
        <h3 className="font-bold">No Authorization!</h3>
        <div className="text-xs">Admins only</div>
      </div>
      <button className="btn btn-sm">Log in</button>
    </div>
  }
  // use mock data at # 0
  // const [users, setUsers] = useState<UserItem[]>(MOCK_USERS);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading,setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | "create">("edit");
  const [selected, setSelected] = useState<UserItem | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/users/");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load users");
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

  function handleSave(newUser: UserItem) {
    // edit frontend mock data first
    if (mode === "create") {
      setUsers([newUser, ...users]);
    } else {
      setUsers(users.map((u) => (u.id === newUser.id ? newUser : u)));
    }
    setOpen(false);
  }

  // users page layout
  return (
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
  );
}

