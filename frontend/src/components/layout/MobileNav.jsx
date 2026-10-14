import React, { useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { X, Briefcase, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { NAVIGATION_CONFIG } from "../../constants/navigation";
import { Avatar } from "../common/Avatar";
import { Badge } from "../common/Badge";
import { useLogoutMutation } from "../../store/api/authApi";
import { useSelector, useDispatch } from "react-redux";
import {
  selectMobileNavOpen,
  closeMobileNav,
} from "../../store/slices/uiSlice";
import { cn } from "../../utils/cn";

export const MobileNav = () => {
  const { user, role } = useAuth();
  const isOpen = useSelector(selectMobileNavOpen);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();

  const navItems = (role && NAVIGATION_CONFIG[role]) || [];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    dispatch(closeMobileNav());
    try {
      await logoutApi().unwrap();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch(closeMobileNav())}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
          <Link
            to="/"
            onClick={() => dispatch(closeMobileNav())}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-slate-900">
              Recruitment<span className="text-primary-600">Hub</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => dispatch(closeMobileNav())}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User preview */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.avatar}
              name={user?.fullname || user?.username}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.fullname || user?.username}
              </p>
              <Badge variant="primary" size="sm" className="mt-0.5">
                {role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => dispatch(closeMobileNav())}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
