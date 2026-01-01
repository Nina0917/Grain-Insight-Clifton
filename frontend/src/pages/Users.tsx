// export default function Users() {
//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Users</h1>
//     </div>
//   );
// }

import { useState } from "react";
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
  // use mock data at # 0
  const [users, setUsers] = useState<UserItem[]>(MOCK_USERS);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | "create">("edit");
  const [selected, setSelected] = useState<UserItem | null>(null);

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
                    Actions
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

