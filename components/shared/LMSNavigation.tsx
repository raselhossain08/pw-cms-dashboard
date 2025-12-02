"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  FileText,
  Award,
  Target,
  Grid,
  List,
  ChevronRight,
  Plane,
} from "lucide-react";

interface LMSNavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  children?: LMSNavItem[];
}

const lmsNavigation: LMSNavItem[] = [
  {
    title: "Course Categories",
    href: "/dashboard/lms/course-categories",
    icon: <Grid className="w-5 h-5" />,
    description: "Organize courses into categories",
  },
  {
    title: "Courses",
    href: "/dashboard/lms/courses",
    icon: <BookOpen className="w-5 h-5" />,
    description: "Manage all courses",
    children: [
      {
        title: "Modules",
        href: "/dashboard/lms/modules",
        icon: <List className="w-5 h-5" />,
        description: "Course modules and structure",
      },
      {
        title: "Lessons",
        href: "/dashboard/lms/lessons",
        icon: <FileText className="w-5 h-5" />,
        description: "Individual lessons and content",
      },
    ],
  },
  {
    title: "Training Programs",
    href: "/dashboard/lms/training-programs",
    icon: <Plane className="w-5 h-5" />,
    description: "Aviation training programs",
  },
  {
    title: "Assessments",
    href: "#",
    icon: <Target className="w-5 h-5" />,
    description: "Evaluate student progress",
    children: [
      {
        title: "Quiz & Exams",
        href: "/dashboard/lms/quiz-exams",
        icon: <Target className="w-5 h-5" />,
        description: "Create and manage quizzes",
      },
      {
        title: "Assignments",
        href: "/dashboard/lms/assignments",
        icon: <FileText className="w-5 h-5" />,
        description: "Student assignments",
      },
    ],
  },
  {
    title: "Certificates",
    href: "/dashboard/lms/certificates",
    icon: <Award className="w-5 h-5" />,
    description: "Issue course certificates",
  },
];

export function LMSNavigationMenu() {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">LMS Navigation</h2>
          <p className="text-xs text-slate-600">Learning Management System</p>
        </div>
      </div>

      <nav className="space-y-2">
        {lmsNavigation.map((item) => (
          <div key={item.href}>
            <Link
              href={
                item.href === "#" ? item.children?.[0]?.href || "#" : item.href
              }
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex items-center justify-center ${
                  pathname === item.href ? "text-blue-600" : "text-slate-600"
                }`}
              >
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-slate-500">{item.description}</div>
              </div>
              {item.children && (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </Link>

            {item.children && (
              <div className="ml-10 mt-2 space-y-1 border-l-2 border-slate-100 pl-4">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      pathname === child.href
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={
                        pathname === child.href
                          ? "text-blue-600"
                          : "text-slate-500"
                      }
                    >
                      {child.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{child.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                LMS Workflow
              </h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Categories → Courses → Modules → Lessons → Assignments/Quizzes →
                Certificates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickLinksProps {
  courseId?: string;
  categoryId?: string;
  className?: string;
}

export function LMSQuickLinks({
  courseId,
  categoryId,
  className = "",
}: QuickLinksProps) {
  const links: Array<{ label: string; href: string; icon: React.ReactNode }> =
    [];

  if (categoryId) {
    links.push({
      label: "View Courses in Category",
      href: `/dashboard/lms/courses?category=${categoryId}`,
      icon: <BookOpen className="w-4 h-4" />,
    });
  }

  if (courseId) {
    links.push(
      {
        label: "View Course Modules",
        href: `/dashboard/lms/modules?courseId=${courseId}`,
        icon: <List className="w-4 h-4" />,
      },
      {
        label: "View Course Lessons",
        href: `/dashboard/lms/lessons?courseId=${courseId}`,
        icon: <FileText className="w-4 h-4" />,
      },
      {
        label: "View Course Assignments",
        href: `/dashboard/lms/assignments?courseId=${courseId}`,
        icon: <FileText className="w-4 h-4" />,
      },
      {
        label: "View Course Quizzes",
        href: `/dashboard/lms/quiz-exams?courseId=${courseId}`,
        icon: <Target className="w-4 h-4" />,
      }
    );
  }

  if (links.length === 0) return null;

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-4 ${className}`}
    >
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Links</h3>
      <div className="space-y-2">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
          >
            {link.icon}
            <span>{link.label}</span>
            <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
