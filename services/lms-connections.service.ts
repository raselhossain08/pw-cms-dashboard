import { apiClient } from "@/lib/api-client";

export interface LMSHierarchy {
    categories: Array<{
        name: string;
        courses: any[];
        coursesCount: number;
    }>;
    totalCourses: number;
    totalLessons: number;
    hierarchy: {
        categories: number;
        courses: number;
        lessons: number;
    };
}

export interface CourseStructure {
    course: any;
    lessons: any[];
    statistics: {
        totalLessons: number;
        publishedLessons: number;
        videoLessons: number;
        quizLessons: number;
        assignmentLessons: number;
        totalDuration: number;
        totalDurationHours: number;
        completionRate: number;
        studentCount: number;
        rating: number;
        reviewCount: number;
    };
    relationships: {
        category: string;
        categories: string[];
        instructorId: string | null;
        hasModules: boolean;
        hasCertificate: boolean;
    };
}

export interface StudentProgress {
    userId: string;
    courseId: string;
    courseName: string;
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    lessons: Array<{
        id: string;
        title: string;
        type: string;
        order: number;
        duration: number;
        completed: boolean;
        completedAt: string | null;
    }>;
    assignments: {
        total: number;
        completed: number;
        pending: number;
    };
    quizzes: {
        total: number;
        completed: number;
        averageScore: number;
    };
    certificateEligible: boolean;
    nextLesson: {
        id: string;
        title: string;
    } | null;
}

export interface Breadcrumb {
    label: string;
    path: string;
    type: string;
    current?: boolean;
}

export interface CertificateEligibility {
    userId: string;
    courseId: string;
    courseName: string;
    eligible: boolean;
    requirements: {
        courseCompleted: boolean;
        allAssignmentsCompleted: boolean;
        allQuizzesPassedMinimumScore: boolean;
        attendanceRequirementMet: boolean;
    };
    certificateAvailable: boolean;
    completionPercentage: number;
    missingRequirements: string[];
}

class LMSConnectionsService {
    /**
     * Get complete LMS hierarchy with all entities
     */
    async getCompleteHierarchy(): Promise<LMSHierarchy> {
        try {
            const { data } = await apiClient.get("/lms/hierarchy");
            return data as LMSHierarchy;
        } catch (error) {
            console.error("Failed to fetch LMS hierarchy:", error);
            throw error;
        }
    }

    /**
     * Get complete course structure with all related entities
     */
    async getCourseStructure(courseId: string): Promise<CourseStructure> {
        try {
            const { data } = await apiClient.get(`/lms/course/${courseId}/structure`);
            return data as CourseStructure;
        } catch (error) {
            console.error(`Failed to fetch course structure for ${courseId}:`, error);
            throw error;
        }
    }

    /**
     * Get all courses in a category
     */
    async getCategoryCourses(
        categoryId: string,
        includeModules = false
    ): Promise<{ category: string; courses: any[]; total: number }> {
        try {
            const { data } = await apiClient.get(
                `/lms/category/${categoryId}/courses`,
                {
                    params: { includeModules },
                }
            );
            return data as { category: string; courses: any[]; total: number };
        } catch (error) {
            console.error(
                `Failed to fetch courses for category ${categoryId}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Get module with all content
     */
    async getModuleContent(moduleId: string): Promise<any> {
        try {
            const { data } = await apiClient.get(`/lms/module/${moduleId}/content`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch module content for ${moduleId}:`, error);
            throw error;
        }
    }

    /**
     * Get student progress for a course
     */
    async getStudentProgress(courseId: string): Promise<StudentProgress> {
        try {
            const { data } = await apiClient.get(
                `/lms/student/progress/${courseId}`
            );
            return data as StudentProgress;
        } catch (error) {
            console.error(
                `Failed to fetch student progress for ${courseId}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Get instructor dashboard data
     */
    async getInstructorDashboard(): Promise<any> {
        try {
            const { data } = await apiClient.get("/lms/instructor/dashboard");
            return data;
        } catch (error) {
            console.error("Failed to fetch instructor dashboard:", error);
            throw error;
        }
    }

    /**
     * Get breadcrumb navigation for any entity
     */
    async getBreadcrumb(
        entityType: string,
        entityId: string
    ): Promise<{ breadcrumb: Breadcrumb[]; entityType: string; entityId: string }> {
        try {
            const { data } = await apiClient.get(
                `/lms/navigation/breadcrumb/${entityType}/${entityId}`
            );
            return data as { breadcrumb: Breadcrumb[]; entityType: string; entityId: string };
        } catch (error) {
            console.error(
                `Failed to fetch breadcrumb for ${entityType}/${entityId}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Check if student is eligible for course certificate
     */
    async checkCertificateEligibility(
        courseId: string
    ): Promise<CertificateEligibility> {
        try {
            const { data } = await apiClient.get(
                `/lms/certificate/eligible/${courseId}`
            );
            return data as CertificateEligibility;
        } catch (error) {
            console.error(
                `Failed to check certificate eligibility for ${courseId}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Navigate to related entity
     */
    getNavigationPath(entityType: string, entityId: string): string {
        const basePath = "/dashboard/lms";
        switch (entityType.toLowerCase()) {
            case "course":
                return `${basePath}/courses?courseId=${entityId}`;
            case "lesson":
                return `${basePath}/lessons?lessonId=${entityId}`;
            case "module":
                return `${basePath}/modules?moduleId=${entityId}`;
            case "assignment":
                return `${basePath}/assignments?assignmentId=${entityId}`;
            case "quiz":
                return `${basePath}/quiz-exams?quizId=${entityId}`;
            case "certificate":
                return `${basePath}/certificates?certificateId=${entityId}`;
            case "category":
                return `${basePath}/course-categories?category=${entityId}`;
            default:
                return basePath;
        }
    }

    /**
     * Get course selector options for dropdowns
     */
    async getCourseOptions(): Promise<Array<{ value: string; label: string }>> {
        try {
            const { data } = await apiClient.get("/courses", {
                params: { limit: 100 },
            });
            return (
                (data as any).courses?.map((course: any) => ({
                    value: course._id || course.id,
                    label: course.title,
                })) || []
            );
        } catch (error) {
            console.error("Failed to fetch course options:", error);
            return [];
        }
    }

    /**
     * Get category selector options for dropdowns
     */
    async getCategoryOptions(): Promise<Array<{ value: string; label: string }>> {
        try {
            const { data } = await apiClient.get("/course-categories");
            return (
                (data as any).categories?.map((category: any) => ({
                    value: category._id || category.id,
                    label: category.name,
                })) || []
            );
        } catch (error) {
            console.error("Failed to fetch category options:", error);
            return [];
        }
    }
}

export const lmsConnectionsService = new LMSConnectionsService();
