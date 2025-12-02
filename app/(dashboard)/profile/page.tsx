import AppLayout from "@/components/layout/AppLayout";
import Profile from "@/components/profile/Profile";
import RequireAuth from "@/components/RequireAuth";

export default function ProfilePage() {
  return (
    <RequireAuth
      roles={["admin", "super_admin", "instructor", "student", "affiliate"]}
    >
      <AppLayout>
        <Profile />
      </AppLayout>
    </RequireAuth>
  );
}
