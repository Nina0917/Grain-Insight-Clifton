// useEffect to auto fill
// useState to store the content to transfer
import { useEffect, useState } from "react";

// UserItem contrains the attributes of database table "users"
export type UserItem = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status_id: 1 | 0; /* 1: active, 0: disable */
  role_id: 1 | 2; /* 1: admin, 2: regular */
  created_at: string;
  updated_at: string;
};


type Props = {
  open: boolean;
  mode: "edit" | "create";
  user: UserItem | null;
  onClose: () => void;
  onSave: (user: UserItem) => void;
};

export default function UserModal({ open, mode, user, onClose, onSave }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState<UserItem["role_id"]>(2);
  const [statusId, setStatusId] = useState<UserItem["status_id"]>(1);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // autofill with original values when mode == edit
  useEffect(() => {
    if (!open) return;

    setPassword("");
    setError("");
    setLoading(false);

    if (mode === "create") {
      setFirstName("");
      setLastName("");
      setEmail("");
      setRoleId(2);
      setStatusId(1);
      return;
    }

    if (user) {
      setFirstName(user.first_name ?? "");
      setLastName(user.last_name ?? "");
      setEmail(user.email ?? "");
      setRoleId(user.role_id);
      setStatusId(user.status_id);
    }
  }, [open, mode, user]);

  if (!open) return null;

  function handleSave() {
    setError("");

    if (!firstName.trim()) 
      return setError("First Name is required.");
    if (!lastName.trim()) 
      return setError("Last Name is required.");
    if (!email.trim()) 
      return setError("Email is required.");

    if (mode === "create" && !password.trim()) {
      return setError("Password is required for new user.");
    }

    setLoading(true);

    const now = new Date().toISOString();
    const newUser: UserItem & { password?: string } = {
      id: user?.id ?? Date.now(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      role_id: roleId,
      status_id: statusId,
      created_at: mode === "create" ? now : (user?.created_at ?? now),
      updated_at: now,
      ...(password.trim() ? { password: password.trim() } : {}),
  };

  setTimeout(() => {
    onSave(newUser as any);
    setLoading(false);
  }, 300);
}

// modal layout
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg">
            {mode === "create" ? "Create User" : "Edit User"}
          </h3>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                className="input input-bordered w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Mike"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                className="input input-bordered w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Smith"
              />
            </div>
          </div>
          <div>
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              className="input input-bordered w-full"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. nina@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={roleId}
                onChange={(e) => setRoleId(Number(e.target.value) as UserItem["role_id"])}
              >
                <option value={1}>Admin</option>
                <option value={2}>Regular</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={statusId}
                onChange={(e) => setStatusId(Number(e.target.value) as UserItem["status_id"])}
              >
                <option value={1}>Active</option>
                <option value={0}>Disabled</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">
                  {mode === "create" ? "Password (required)" : "New Password (optional)"}
                </span>
              </label>
              <input
                className="input input-bordered w-full"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "create" ? "Set initial password" : "Leave blank to keep unchanged"}
              />
            </div>
            
            {error && (
              <div className="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info h-6 w-6 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                <span>{error}</span>
              </div>
            )}
          

          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>

        </div>
      </div>
    </div>
  );
}
