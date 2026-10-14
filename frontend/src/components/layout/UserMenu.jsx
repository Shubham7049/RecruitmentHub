import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Avatar } from "../common/Avatar";
import { Badge } from "../common/Badge";
import { useLogoutMutation } from "../../store/api/authApi";
import { DEFAULT_ROLE_REDIRECTS, ROLES } from "../../constants/roles";
import { cn } from "../../utils/cn";

export const UserMenu = ({ className }) => {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logoutApi().unwrap();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const getRoleBadgeVariant = (userRole) => {
    switch (userRole) {
      case ROLES.ADMIN:
        return "danger";
      case ROLES.RECRUITER:
        return "primary";
      default:
        return "success";
    }
  };

  const dashboardPath = role ? DEFAULT_ROLE_REDIRECTS[role] : "/";
  const profilePath = `/${role}/profile`;

  return (
    <div className={cn("relative inline-block text-left", className)} ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full p-1 hover:bg-slate-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        aria-expanded={isOpen}
      >
        <Avatar
          src={user?.avatar}
          name={user?.fullname || user?.username}
          size="sm"
        />
        <span className="hidden md:block text-xs font-semibold text-slate-700 max-w-[120px] truncate">
          {user?.fullname || user?.username}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
      </button>

      {/* Dropdown Menu Card */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black/5 border border-slate-100 py-2 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
          {/* User Profile Header Card */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Avatar
                src={user?.avatar}
                name={user?.fullname || user?.username}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.fullname}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || `@${user?.username}`}
                </p>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(role)} size="sm">
                    {role}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-1">
            <Link
              to={dashboardPath}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
            >
              <LayoutDashboard className="h-4 w-4 text-slate-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              to={profilePath}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>My Profile</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-1" />

          {/* Sign Out Button */}
          <div className="px-1 py-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium text-left"
            >
              <LogOut className="h-4 w-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
