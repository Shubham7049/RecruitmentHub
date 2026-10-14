import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Briefcase, ChevronLeft, ChevronRight, LogOut, Shield } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { NAVIGATION_CONFIG } from "../../constants/navigation";
import { ROLE_NAMES, ROLES } from "../../constants/roles";
import { Avatar } from "../common/Avatar";
import { Badge } from "../common/Badge";
import { useLogoutMutation } from "../../store/api/authApi";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSidebarCollapsed,
  toggleSidebar,
} from "../../store/slices/uiSlice";
import { cn } from "../../utils/cn";

export const Sidebar = () => {
  const { user, role } = useAuth();
  const [logoutApi] = useLogoutMutation();
  const collapsed = useSelector(selectSidebarCollapsed);
  const dispatch = useDispatch();

  const navItems = (role && NAVIGATION_CONFIG[role]) || [];

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Ignored: store handles logout in finally
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

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-slate-200/80 bg-white transition-all duration-200 z-30",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Top Header / Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm shadow-primary-600/20">
            <Briefcase className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold text-slate-900 truncate">
              Recruitment<span className="text-primary-600">Hub</span>
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Role Pill */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Portal Role</span>
            <Badge variant={getRoleBadgeVariant(role)} size="sm">
              {role || "User"}
            </Badge>
          </div>
        </div>
      )}

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors select-none",
                  isActive
                    ? "bg-primary-50 text-primary-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  collapsed && "justify-center px-0"
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom User Area */}
      <div className="p-3 border-t border-slate-100">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2 bg-slate-50 border border-slate-100",
            collapsed && "justify-center p-1"
          )}
        >
          <Avatar
            src={user?.avatar}
            name={user?.fullname || user?.username}
            size={collapsed ? "sm" : "md"}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user?.fullname || user?.username}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
