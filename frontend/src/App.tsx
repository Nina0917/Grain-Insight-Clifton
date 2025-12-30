// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ❌ 登录页：没有 Navbar */}
        <Route path="/login" element={<Login />} />

        {/* ✅ 其他页面：有 Navbar */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
