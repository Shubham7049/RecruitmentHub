export const ROLES = {
  STUDENT: "student",
  RECRUITER: "recruiter",
  ADMIN: "admin",
};

export const ROLE_NAMES = {
  [ROLES.STUDENT]: "Candidate / Student",
  [ROLES.RECRUITER]: "Hiring Recruiter",
  [ROLES.ADMIN]: "Platform Administrator",
};

export const DEFAULT_ROLE_REDIRECTS = {
  [ROLES.STUDENT]: "/student/dashboard",
  [ROLES.RECRUITER]: "/recruiter/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
};
