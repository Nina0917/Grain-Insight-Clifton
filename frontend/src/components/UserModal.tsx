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

  // autofill with original values when mode == edit
  useEffect(() => {
    if (!open) return;

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

  // to save all info of user
  function handleSave() {
    const now = new Date().toISOString();
    const newUser: UserItem = {
      id: user?.id ?? Date.now(), // mock id if new
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),

      role_id: roleId,
      status_id: statusId,

      // when create：create = update = now；edit: only update updated_at
      created_at: mode === "create" ? now : (user?.created_at ?? now),
      updated_at: now,
    };
    onSave(newUser);
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
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
