/**
 * Format salary into standard Indian Lakhs Per Annum (LPA) or standard currency string
 */
export const formatSalary = (salary) => {
  if (salary === undefined || salary === null || isNaN(Number(salary))) {
    return "Competitive";
  }

  const num = Number(salary);

  // If already in LPA representation (e.g. 8 or 12)
  if (num > 0 && num <= 100) {
    return `₹${num} LPA`;
  }

  // If in absolute annual rupees (e.g. 800000 -> 8 LPA)
  if (num >= 100000) {
    const lpa = num / 100000;
    return `₹${Number(lpa.toFixed(1))} LPA`;
  }

  // Monthly or smaller absolute numbers
  return `₹${num.toLocaleString("en-IN")}`;
};

/**
 * Format experience in years
 */
export const formatExperience = (experience) => {
  if (experience === undefined || experience === null || isNaN(Number(experience))) {
    return "Not specified";
  }

  const num = Number(experience);
  if (num === 0) {
    return "Fresher / 0 yrs";
  }
  if (num === 1) {
    return "1 year exp";
  }
  return `${num}+ yrs exp`;
};

/**
 * Format relative time (e.g., '2 days ago')
 */
export const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

/**
 * Calculate dynamic greeting based on current hour
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/**
 * Format full date and time (e.g., '14 Sep 2026, 04:30 PM')
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Format date only (e.g., '14 Sep 2026')
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatDate = formatDateOnly;

/**
 * Get configuration for Application Status badges
 * Valid backend statuses: 'applied', 'shortlisted', 'interview', 'rejected', 'hired'
 */
export const getApplicationStatusConfig = (status) => {
  const normalized = (status || "").toLowerCase().trim();
  switch (normalized) {
    case "applied":
      return {
        label: "Applied",
        variant: "primary",
        dotColor: "bg-blue-500",
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        description: "Your application was received and is awaiting recruiter review.",
      };
    case "shortlisted":
      return {
        label: "Shortlisted",
        variant: "warning",
        dotColor: "bg-amber-500",
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
        description: "Congratulations! Your profile was shortlisted by the hiring team.",
      };
    case "interview":
      return {
        label: "Interview Scheduled",
        variant: "purple",
        dotColor: "bg-purple-500",
        badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
        description: "An interview round has been scheduled for this position.",
      };
    case "rejected":
      return {
        label: "Not Selected",
        variant: "danger",
        dotColor: "bg-rose-500",
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
        description: "The recruiter has decided to move forward with other candidates.",
      };
    case "hired":
      return {
        label: "Hired",
        variant: "success",
        dotColor: "bg-emerald-500",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        description: "Congratulations! You have received an offer for this role.",
      };
    default:
      return {
        label: status || "Submitted",
        variant: "default",
        dotColor: "bg-slate-400",
        badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
        description: "Application is in progress.",
      };
  }
};
