import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileText,
  Calendar,
  Bell,
  User,
  Building2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { ROLES } from "./roles";

export const NAVIGATION_CONFIG = {
  [ROLES.STUDENT]: [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Find Jobs", href: "/student/jobs", icon: Briefcase },
    { name: "Saved Jobs", href: "/student/saved-jobs", icon: Bookmark },
    { name: "Applications", href: "/student/applications", icon: FileText },
    { name: "Interviews", href: "/student/interviews", icon: Calendar },
    { name: "Notifications", href: "/student/notifications", icon: Bell },
    { name: "Profile", href: "/student/profile", icon: User },
  ],
  [ROLES.RECRUITER]: [
    { name: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
    { name: "Companies", href: "/recruiter/companies", icon: Building2 },
    { name: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
    { name: "Applicants", href: "/recruiter/applications", icon: FileText },
    { name: "Interviews", href: "/recruiter/interviews", icon: Calendar },
    { name: "Notifications", href: "/recruiter/notifications", icon: Bell },
    { name: "Profile", href: "/recruiter/profile", icon: User },
  ],
  [ROLES.ADMIN]: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Companies", href: "/admin/companies", icon: Building2 },
    { name: "Jobs", href: "/admin/jobs", icon: Briefcase },
    { name: "Applications", href: "/admin/applications", icon: FileText },
    { name: "Interviews", href: "/admin/interviews", icon: Calendar },
  ],
};
