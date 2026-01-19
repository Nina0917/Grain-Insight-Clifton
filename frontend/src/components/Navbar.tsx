import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
// src/components/Navbar.tsx
export default function Navbar() {
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="navbar bg-base-100 shadow-sm">
      {/* Navbar left */}
      <div className="navbar-start">
        {/* For small screen */}
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
          </div>
          <ul
            tabIndex={-1}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li><button onClick={() => navigate("/documents")}>Documents</button></li>
            {isAdmin() && (<li><button onClick={() => navigate("/users")}>Users</button></li>)}
          </ul>
        </div>
        {/* Logo */}
        <img
          alt="company logo"
          src="/transparent-logo-cropped.svg"
          className="h-10 ml-2"
        />
        {/* Function buttons */}

        <ul className="menu menu-horizontal px-1 hidden lg:flex">

          <li><button onClick={() => navigate("/documents")}>Documents</button></li>
          {isAdmin() && (<li><button onClick={() => navigate("/users")}>Users</button></li>)}
        </ul>
        
      </div>

      {/* Navbar right: User Avatar and Dropdown Menu */}
      <div className="navbar-end">
       <div className="dropdown dropdown-end">
         <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
