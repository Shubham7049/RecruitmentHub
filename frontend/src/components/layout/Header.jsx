import React from "react";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { UserMenu } from "./UserMenu";
import { useGetMyNotificationsQuery } from "../../store/api/notificationApi";
import { useDispatch } from "react-redux";
import { toggleMobileNav } from "../../store/slices/uiSlice";
import { Link } from "react-router-dom";

export const Header = () => {
  const { user, role } = useAuth();
  const dispatch = useDispatch();

  const { data: notificationsData } = useGetMyNotificationsQuery(undefined, {
    skip: !user,
    pollingInterval: 30000, // Poll notifications every 30s
  });

  const unreadCount = notificationsData?.data?.unreadCount || 0;
  const notificationsLink = `/${role}/notifications`;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur">
      {/* Left Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(toggleMobileNav())}
          className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-sm font-medium text-slate-500">
            Signed in as{" "}
            <span className="font-semibold text-slate-900 capitalize">
              {role}
            </span>
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon */}
        <Link
          to={notificationsLink}
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Reusable Authenticated User Dropdown Menu */}
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
