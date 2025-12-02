import AppLayout from "@/components/layout/AppLayout";
import TrainingPrograms from "@/components/training/TrainingPrograms";
import RequireAuth from "@/components/RequireAuth";

export default function TrainingProgramsPage() {
  return (
    <RequireAuth roles={["instructor", "admin", "super_admin"]}>
      <AppLayout>
        <TrainingPrograms />
      </AppLayout>
    </RequireAuth>
  );
}
