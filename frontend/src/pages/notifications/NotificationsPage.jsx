import React, { useState, useMemo } from "react";
import { Bell, CheckCheck, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetMyNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
} from "../../store/api/notificationApi";
import { NotificationItem } from "../../components/notifications/NotificationItem";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { cn } from "../../utils/cn";

export const NotificationsPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const {
    data: notificationsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMyNotificationsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsAsReadMutation();

  const notifications = notificationsResponse?.data?.notifications || [];
  const unreadCount = notificationsResponse?.data?.unreadCount || 0;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    if (activeFilter === "read") {
      return notifications.filter((n) => n.isRead);
    }
    return notifications;
  }, [notifications, activeFilter]);

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllAsRead().unwrap();
      toast.success(
        res?.message || "All notifications have been marked as read."
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      toast.error(err?.data?.message || "Failed to mark notifications as read.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-100 px-3 py-0.5 text-xs font-semibold text-primary-700 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary-600" />
            <span>Activity Center</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated with real-time application status changes, interview invitations, and platform activities.
          </p>
        </div>

        {/* Mark All Read CTA */}
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={CheckCheck}
            onClick={handleMarkAllRead}
            isLoading={isMarkingAll}
            disabled={isMarkingAll}
            className="self-start sm:self-auto text-xs font-semibold"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 w-fit text-xs">
        {[
          { id: "all", label: "All", count: notifications.length },
          { id: "unread", label: "Unread", count: unreadCount },
          {
            id: "read",
            label: "Read",
            count: Math.max(0, notifications.length - unreadCount),
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all",
              activeFilter === tab.id
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                activeFilter === tab.id
                  ? "bg-primary-50 text-primary-700"
                  : "bg-slate-200/80 text-slate-600"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Unable to load notifications"
          message={error?.data?.message || "Failed to retrieve your notification inbox."}
          onRetry={refetch}
        />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={
            activeFilter === "unread"
              ? "You're all caught up!"
              : activeFilter === "read"
              ? "No read notifications"
              : "No notifications yet"
          }
          message={
            activeFilter === "unread"
              ? "You have zero unread notifications. All application updates and interview alerts will appear here."
              : "When you receive status updates, interview schedules, or system alerts, they will appear in this inbox."
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((notif) => (
            <NotificationItem key={notif._id} notification={notif} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
