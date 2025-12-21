import AppLayout from "@/components/layout/AppLayout";
import Quizzes from "@/components/quizzes/Quizzes";
import RequireAuth from "@/components/RequireAuth";

export default function QuizExamsPage() {
  return (
    <RequireAuth roles={["instructor", "admin", "super_admin"]}>
      <AppLayout>
        <Quizzes />
      </AppLayout>
    </RequireAuth>
  );
}
