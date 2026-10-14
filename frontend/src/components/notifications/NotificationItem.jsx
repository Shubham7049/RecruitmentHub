import React from "react";
import { Bell, Check, Trash2, Clock } from "lucide-react";
import { formatTimeAgo, formatDateTime } from "../../utils/formatters";
import { cn } from "../../utils/cn";
import {
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
} from "../../store/api/notificationApi";

export const NotificationItem = ({ notification }) => {
  const [markAsRead, { isLoading: isMarkingRead }] =
    useMarkNotificationAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  if (!notification) return null;

  const { _id, message, isRead, createdAt } = notification;

  const handleCardClick = () => {
    if (!isRead && !isMarkingRead) {
      markAsRead(_id);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!isDeleting) {
      deleteNotification(_id);
    }
  };

  const handleMarkReadClick = (e) => {
    e.stopPropagation();
    if (!isRead && !isMarkingRead) {
      markAsRead(_id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative flex items-start gap-3 sm:gap-4 p-4 rounded-xl border transition-all duration-150 cursor-pointer",
        isRead
          ? "bg-white border-slate-200/80 hover:bg-slate-50/70"
          : "bg-primary-50/30 border-primary-200/80 hover:bg-primary-50/50 shadow-2xs border-l-4 border-l-primary-500"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
          isRead
            ? "bg-slate-100 text-slate-500"
            : "bg-primary-100 text-primary-700"
        )}
      >
        <Bell className="h-4 w-4" />
      </div>

      {/* Message & Timestamp Content */}
      <div className="flex-1 min-w-0 pr-2">
        <p
          className={cn(
            "text-xs sm:text-sm leading-relaxed",
            isRead ? "text-slate-700" : "text-slate-900 font-semibold"
          )}
        >
          {message}
        </p>

        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
          <Clock className="h-3 w-3 shrink-0" />
          <span title={formatDateTime(createdAt)}>
            {formatTimeAgo(createdAt) || "Recently"}
          </span>
          {!isRead && (
            <>
              <span>•</span>
              <span className="font-bold text-primary-600">Unread</span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0 self-center">
        {!isRead && (
          <button
            type="button"
            onClick={handleMarkReadClick}
            disabled={isMarkingRead}
            className="rounded-lg p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-100/50 transition-colors"
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
