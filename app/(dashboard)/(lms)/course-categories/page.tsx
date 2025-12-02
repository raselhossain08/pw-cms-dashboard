import AppLayout from "@/components/layout/AppLayout";
import CourseCategories from "@/components/course-categories/CourseCategories";
import RequireAuth from "@/components/RequireAuth";

export default function CourseCategoriesPage() {
  return (
    <RequireAuth roles={["admin", "super_admin", "instructor"]}>
      <AppLayout>
        <CourseCategories />
      </AppLayout>
    </RequireAuth>
  );
}
