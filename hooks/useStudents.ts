"use client";

import { useState, useEffect } from "react";
import { studentsService, Student as StudentType, CreateStudentDto as CreateDto, UpdateStudentDto as UpdateDto, StudentStats as StatsType } from "@/services/students.service";
import { useToast } from "@/context/ToastContext";

// Re-export types from service
export type Student = StudentType;
export type StudentStats = StatsType;
export type CreateStudentDto = CreateDto;
export type UpdateStudentDto = UpdateDto;

export function useStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const { push } = useToast();

    // Fetch all students with filters
    const fetchStudents = async (params: {
        page?: number;
        limit?: number;
        search?: string;
        course?: string;
        status?: string;
    } = {}) => {
        setLoading(true);
        try {
            const data = await studentsService.getAllStudents(params);

            // Transform data to match Student interface
            const transformedStudents = data.students.map((user: any) => {
                // Format date properly
                let joinedDate = "N/A";
                try {
                    if (user.createdAt) {
                        const date = new Date(user.createdAt);
                        if (!isNaN(date.getTime())) {
                            joinedDate = date.toLocaleDateString("en-US", { 
                                year: "numeric", 
                                month: "short", 
                                day: "numeric" 
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error formatting date:", error);
                }

                return {
                    ...user,
                    avatarUrl: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=random&color=fff&size=128`,
                    progressPercent: user.progressPercent || 0,
                    scorePercent: user.scorePercent || 0,
                    enrolledText: `Enrolled: ${joinedDate}`,
                    joinedDate: joinedDate,
                    rating: user.rating || 0,
                    location: user.country || "Unknown",
                    courseCount: user.enrolledCourses || 0,
                    course: user.course || "",
                    courseDetail: user.courseDetail || "",
                };
            });

            setStudents(transformedStudents);
            setTotal(data.total);
            return data;
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to fetch students",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Fetch student stats
    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const data = await studentsService.getStats();
            setStats(data);
            return data;
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to fetch stats",
            });
            throw error;
        } finally {
            setStatsLoading(false);
        }
    };

    // Create student
    const createStudent = async (studentData: CreateDto) => {
        setLoading(true);
        try {
            const newStudent = await studentsService.createStudent(studentData) as any;

            // Format date properly
            let joinedDate = "N/A";
            try {
                if (newStudent.createdAt) {
                    const date = new Date(newStudent.createdAt);
                    if (!isNaN(date.getTime())) {
                        joinedDate = date.toLocaleDateString("en-US", { 
                            year: "numeric", 
                            month: "short", 
                            day: "numeric" 
                        });
                    }
                }
            } catch (error) {
                console.error("Error formatting date:", error);
            }

            const transformedStudent: Student = {
                ...newStudent,
                avatarUrl: newStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newStudent.name || newStudent.email)}&background=random&color=fff&size=128`,
                progressPercent: 0,
                scorePercent: 0,
                enrolledText: `Enrolled: ${joinedDate}`,
                joinedDate: joinedDate,
                rating: 0,
                location: newStudent.country || "Unknown",
                courseCount: 0,
                course: "General Course",
                courseDetail: "Course Details",
            };

            setStudents((prev) => [transformedStudent, ...prev]);
            setTotal((prev) => prev + 1);
            push({
                type: "success",
                message: `Student ${studentData.name} created successfully`,
            });
            return transformedStudent;
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to create student",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Update student
    const updateStudent = async (id: string, studentData: UpdateDto) => {
        setLoading(true);
        try {
            const updatedStudent = await studentsService.updateStudent(id, studentData) as any;
            setStudents((prev) =>
                prev.map((student) => (student._id === id ? { ...student, ...updatedStudent } : student))
            );
            push({
                type: "success",
                message: "Student updated successfully",
            });
            return updatedStudent;
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to update student",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Delete student
    const deleteStudent = async (id: string) => {
        setLoading(true);
        try {
            await studentsService.deleteStudent(id);
            setStudents((prev) => prev.filter((student) => student._id !== id));
            setTotal((prev) => prev - 1);
            push({
                type: "success",
                message: "Student deleted successfully",
            });
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to delete student",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Update student status
    const updateStudentStatus = async (id: string, status: "active" | "inactive" | "suspended" | "pending") => {
        setLoading(true);
        try {
            const updatedStudent = await studentsService.updateStatus(id, status);
            setStudents((prev) =>
                prev.map((student) => (student._id === id ? { ...student, status } : student))
            );
            push({
                type: "success",
                message: `Student status updated to ${status}`,
            });
            return updatedStudent;
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to update student status",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Bulk delete students
    const bulkDeleteStudents = async (ids: string[]) => {
        setLoading(true);
        try {
            await studentsService.bulkDeleteStudents(ids);
            setStudents((prev) => prev.filter((student) => !ids.includes(student._id)));
            setTotal((prev) => prev - ids.length);
            push({
                type: "success",
                message: `${ids.length} students deleted successfully`,
            });
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to delete students",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Export students
    const exportStudents = async () => {
        try {
            push({
                type: "info",
                message: "Preparing export...",
            });

            const data = await studentsService.exportStudents();

            const headers = ["ID", "First Name", "Last Name", "Email", "Status", "Country", "Enrolled Courses", "Completed Courses", "Avg Progress", "Joined Date"];
            const rows = data.students.map((student: any) => [
                student.id,
                student.firstName,
                student.lastName,
                student.email,
                student.status,
                student.country,
                student.enrolledCourses,
                student.completedCourses,
                student.avgProgress,
                new Date(student.joinedDate).toLocaleDateString(),
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map((row: any[]) => row.join(",")),
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `students-export-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            push({
                type: "success",
                message: "Students exported successfully",
            });
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to export students",
            });
            throw error;
        }
    };

    // Initial load
    useEffect(() => {
        fetchStudents();
        fetchStats();
    }, []);

    // ==================== NEW STUDENT-SPECIFIC FUNCTIONS ====================

    /**
     * Get detailed student progress with enrollments and quiz scores
     */
    const getStudentProgress = async (studentId: string) => {
        setLoading(true);
        try {
            const data = await studentsService.getStudentProgress(studentId);
            push({
                type: "success",
                message: "Student progress loaded successfully",
            });
            return data;
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to fetch student progress",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Import students from CSV/Excel file
     */
    const importStudents = async (students: any[], sendWelcomeEmail: boolean = false) => {
        setLoading(true);
        try {
            const result = await studentsService.importStudents(students, sendWelcomeEmail) as any;

            // Refresh students list after import
            await fetchStudents();
            await fetchStats();

            push({
                type: "success",
                message: `Successfully imported ${result.imported || 0} students. ${result.skipped || 0} skipped, ${result.failed || 0} failed.`,
            });
            return result;
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to import students",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Send broadcast email to students
     */
    const sendBroadcast = async (params: {
        subject: string;
        message: string;
        studentIds?: string[];
        courseId?: string;
    }) => {
        setLoading(true);
        try {
            const result = await studentsService.sendBroadcastToStudents(params) as any;
            push({
                type: "success",
                message: `Broadcast email sent to ${result.queued || 0} students`,
            });
            return result;
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to send broadcast email",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Send individual message to student
     */
    const sendMessage = async (
        studentId: string,
        subject: string,
        message: string,
        type: 'email' | 'notification' | 'both' = 'email'
    ) => {
        setLoading(true);
        try {
            const result = await studentsService.sendMessageToStudent(studentId, subject, message, type) as any;
            push({
                type: "success",
                message: result.message || "Message sent successfully",
            });
            return result;
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to send message",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Bulk activate students
     */
    const bulkActivateStudents = async (ids: string[]) => {
        setLoading(true);
        try {
            await studentsService.bulkActivateStudents(ids);
            setStudents((prev) =>
                prev.map((student) =>
                    ids.includes(student._id) ? { ...student, status: "active" as const, isActive: true } : student
                )
            );
            push({
                type: "success",
                message: `${ids.length} students activated successfully`,
            });
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to activate students",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Bulk deactivate students
     */
    const bulkDeactivateStudents = async (ids: string[]) => {
        setLoading(true);
        try {
            await studentsService.bulkDeactivateStudents(ids);
            setStudents((prev) =>
                prev.map((student) =>
                    ids.includes(student._id) ? { ...student, status: "inactive" as const, isActive: false } : student
                )
            );
            push({
                type: "success",
                message: `${ids.length} students deactivated successfully`,
            });
        } catch (error: any) {
            push({
                type: "error",
                message: error.response?.data?.message || "Failed to deactivate students",
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        students,
        stats,
        loading,
        statsLoading,
        total,
        fetchStudents,
        fetchStats,
        createStudent,
        updateStudent,
        deleteStudent,
        updateStudentStatus,
        bulkDeleteStudents,
        exportStudents,
        // New functions
        getStudentProgress,
        importStudents,
        sendBroadcast,
        sendMessage,
        bulkActivateStudents,
        bulkDeactivateStudents,
    };
}
