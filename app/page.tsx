import Dashboard from "@/components/Dashboard";
import RequireAuth from "@/components/RequireAuth";

export default function Home() {
  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <Dashboard />
    </RequireAuth>
  );
}
