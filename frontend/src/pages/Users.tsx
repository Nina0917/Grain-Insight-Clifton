import Navbar from "../components/Navbar";

export default function Users() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-4">This page is only accessible to Admins.</p>
      </div>
    </div>
  );
}
