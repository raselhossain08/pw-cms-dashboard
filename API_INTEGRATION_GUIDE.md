# Lessons API Integration Guide

This document maps the backend API endpoints to the frontend service methods for the Lessons feature.

## Backend API Endpoints

### Lesson CRUD Operations

| Method   | Endpoint                     | Description                     | Frontend Method                                  |
| -------- | ---------------------------- | ------------------------------- | ------------------------------------------------ |
| `GET`    | `/courses/:id/lessons`       | Get all lessons for a course    | `lessonsService.getCourseLessons(courseId)`      |
| `GET`    | `/courses/lessons/:lessonId` | Get a single lesson by ID       | `lessonsService.getLessonById(lessonId)`         |
| `POST`   | `/courses/:id/lessons`       | Create a new lesson in a course | `lessonsService.createLesson(courseId, payload)` |
| `PATCH`  | `/courses/lessons/:lessonId` | Update a lesson                 | `lessonsService.updateLesson(lessonId, payload)` |
| `DELETE` | `/courses/lessons/:lessonId` | Delete a lesson                 | `lessonsService.deleteLesson(lessonId)`          |

### Lesson Management

| Method  | Endpoint                                   | Description                            | Frontend Method                                                 |
| ------- | ------------------------------------------ | -------------------------------------- | --------------------------------------------------------------- |
| `PATCH` | `/courses/:id/lessons/reorder`             | Reorder lessons in a course            | `lessonsService.reorderLessons(courseId, lessonIds, moduleId?)` |
| `PATCH` | `/courses/lessons/:lessonId/toggle-status` | Toggle lesson status (published/draft) | `lessonsService.toggleLessonStatus(lessonId)`                   |
| `POST`  | `/courses/lessons/:lessonId/duplicate`     | Duplicate a lesson                     | `lessonsService.duplicateLesson(lessonId)`                      |

### Bulk Operations

| Method | Endpoint                              | Description               | Frontend Method                         |
| ------ | ------------------------------------- | ------------------------- | --------------------------------------- |
| `POST` | `/courses/lessons/bulk-delete`        | Bulk delete lessons       | `lessonsService.bulkDeleteLessons(ids)` |
| `POST` | `/courses/lessons/bulk-toggle-status` | Bulk toggle lesson status | `lessonsService.bulkToggleStatus(ids)`  |

### Analytics & Reporting

| Method | Endpoint                               | Description                               | Frontend Method                                 |
| ------ | -------------------------------------- | ----------------------------------------- | ----------------------------------------------- |
| `GET`  | `/courses/lessons/:lessonId/analytics` | Get analytics for a specific lesson       | `lessonsService.getLessonAnalytics(lessonId)`   |
| `GET`  | `/courses/:id/analytics`               | Get analytics for all lessons in a course | `lessonsService.getCourseAnalytics(courseId)`   |
| `GET`  | `/courses/lessons/export/:format`      | Export lessons to CSV/XLSX/PDF            | `lessonsService.exportLessons(format, params?)` |

## Data Structures

### LessonDto (Response)

```typescript
interface LessonDto {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  type: LessonType; // 'video' | 'text' | 'quiz' | 'assignment' | 'download'
  status: LessonStatus; // 'draft' | 'published'
  order: number;
  videoUrl?: string;
  content?: string;
  duration: number; // in seconds
  isFree: boolean;
  thumbnail?: string;
  quizQuestions?: string[];
  downloads?: string[];
  course:
    | string
    | {
        _id: string;
        title: string;
        instructor?: string;
      };
  module?:
    | string
    | {
        _id: string;
        title: string;
      };
  passingScore: number;
  completionCount: number;
  averageScore: number;
  createdAt?: string;
  updatedAt?: string;
}
```

### CreateLessonPayload (Request)

```typescript
interface CreateLessonPayload {
  title: string; // required
  description?: string;
  type: LessonType | string; // required
  content?: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: number; // in seconds
  order?: number;
  isFree?: boolean;
  status?: LessonStatus | string;
  moduleId?: string;
}
```

### UpdateLessonPayload (Request)

```typescript
interface UpdateLessonPayload {
  title?: string;
  description?: string;
  type?: LessonType | string;
  content?: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: number; // in seconds
  order?: number;
  isFree?: boolean;
  status?: LessonStatus | string;
  moduleId?: string;
}
```

### LessonAnalytics (Response)

```typescript
interface LessonAnalytics {
  lessonId: string;
  title: string;
  type: LessonType;
  status: LessonStatus;
  views: number;
  completions: number;
  averageProgress: number;
  averageTimeSpent: number;
  averageScore: number;
  lastAccessed?: string;
}
```

### CourseAnalytics (Response)

```typescript
interface CourseAnalytics {
  courseId: string;
  title: string;
  totalStudents: number;
  totalRevenue: number;
  completionRate: number;
  averageRating: number;
  totalReviews: number;
  totalLessons: number;
  publishedLessons: number;
  totalDuration: number;
  lessonsByType: {
    video: number;
    text: number;
    quiz: number;
    assignment: number;
  };
  totalCompletions: number;
  avgCompletionRate: number;
  enrollmentTrend: any[];
  revenueByMonth: any[];
  studentEngagement: {
    active: number;
    completed: number;
    dropped: number;
  };
}
```

## Authentication

All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

Most endpoints also require specific roles:

- **INSTRUCTOR**: Can manage their own course lessons
- **ADMIN**: Can manage all course lessons
- **SUPER_ADMIN**: Can manage all course lessons

Students can only view published lessons in courses they're enrolled in (enforced by `CourseAccessGuard`).

## Error Responses

All endpoints return standard error responses:

```typescript
{
    statusCode: number;
    message: string | string[];
    error?: string;
}
```

Common status codes:

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Usage Examples

### Creating a Lesson

```typescript
const newLesson = await lessonsService.createLesson("course-id-123", {
  title: "Introduction to React Hooks",
  description: "Learn about useState, useEffect, and custom hooks",
  type: LessonType.VIDEO,
  videoUrl: "https://youtube.com/watch?v=abc123",
  thumbnail: "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
  duration: 1800, // 30 minutes in seconds
  isFree: true,
  status: LessonStatus.PUBLISHED,
  moduleId: "module-id-456",
  order: 1,
});
```

### Updating a Lesson

```typescript
const updatedLesson = await lessonsService.updateLesson("lesson-id-789", {
  title: "Updated Title",
  status: LessonStatus.PUBLISHED,
  duration: 2400, // 40 minutes
});
```

### Reordering Lessons

```typescript
await lessonsService.reorderLessons(
  "course-id-123",
  ["lesson-id-1", "lesson-id-2", "lesson-id-3"],
  "module-id-456"
);
```

### Getting Analytics

```typescript
const lessonAnalytics = await lessonsService.getLessonAnalytics(
  "lesson-id-789"
);
const courseAnalytics = await lessonsService.getCourseAnalytics(
  "course-id-123"
);
```

### Bulk Operations

```typescript
// Delete multiple lessons
await lessonsService.bulkDeleteLessons([
  "lesson-id-1",
  "lesson-id-2",
  "lesson-id-3",
]);

// Toggle status for multiple lessons
await lessonsService.bulkToggleStatus(["lesson-id-4", "lesson-id-5"]);
```

### Exporting Lessons

```typescript
// Export all lessons in a course
const blob = await lessonsService.exportLessons("csv", {
  courseId: "course-id-123",
});

// Export lessons in a specific module
const blob = await lessonsService.exportLessons("xlsx", {
  courseId: "course-id-123",
  moduleId: "module-id-456",
});

// Download the file
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `lessons-export.csv`;
a.click();
URL.revokeObjectURL(url);
```

## Important Notes

1. **Populated Fields**: The backend automatically populates `module` and `course` fields with their respective objects containing `_id` and `title`.

2. **Module Assignment**: Use `moduleId` in payloads, not `module`. The backend converts this internally.

3. **Duration**: Always in seconds. Convert to/from minutes in the UI as needed.

4. **Status**: Only `draft` and `published` are valid statuses.

5. **Order**: Used for sorting lessons within a course/module. Should be positive integers.

6. **Access Control**:

   - Instructors can only manage lessons in their own courses
   - Admins can manage all lessons
   - Students can only view published lessons in enrolled courses

7. **Export Formats**: Supports `csv`, `xlsx`, and `pdf` formats.

## Frontend Integration Checklist

- [x] ✅ LessonDto interface updated to match backend response
- [x] ✅ LessonAnalytics interface updated with all fields
- [x] ✅ CreateLessonPayload interface defined
- [x] ✅ UpdateLessonPayload interface defined
- [x] ✅ All CRUD operations implemented
- [x] ✅ Bulk operations implemented
- [x] ✅ Analytics endpoints integrated
- [x] ✅ Export functionality implemented
- [x] ✅ Reorder functionality implemented
- [x] ✅ Toggle status functionality implemented
- [x] ✅ Duplicate lesson functionality implemented
- [x] ✅ Error handling in place
- [x] ✅ Authentication headers configured

## Recent Updates

### 2025-01-04

- Updated `LessonDto` to include `thumbnail`, `module` with population, and `course` with population
- Added `LessonAnalytics` with complete fields including `title`, `type`, `status`, and `averageScore`
- Fixed `duplicateLesson` to use correct backend endpoint `/courses/lessons/:lessonId/duplicate`
- Updated analytics endpoints to use correct paths:
  - Lesson analytics: `/courses/lessons/:lessonId/analytics`
  - Course analytics: `/courses/:id/analytics`
- Verified all bulk operations endpoints
- Confirmed reorder endpoint path: `PATCH /courses/:id/lessons/reorder`
- Verified export endpoint with query parameters

All API integrations are now synchronized with the backend implementation.
