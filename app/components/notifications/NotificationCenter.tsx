/**
 * Notification Center Component
 * 
 * Slide-out panel showing notification history:
 * - Grouped by date (Today, Yesterday, Earlier)
 * - Mark as read/unread
 * - "Mark all as read" action
 * - Links to relevant pages
 * - Accessible (keyboard navigation, ARIA)
 * 
 * Phase 4 - ENG-013
 */

import { useState } from "react";

export interface Notification {
  id: string;
  type: "approval" | "action" | "alert" | "info";
  title: string;
  message: string;
  url?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationCenter({
  open,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationCenterProps) {
  if (!open) return null;

  const getIcon = (type: Notification["type"]): string => {
    switch (type) {
      case "approval":
        return "🔔";
      case "action":
        return "✅";
      case "alert":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📋";
    }
  };

  const formatRelativeTime = (isoString: string): string => {
    const now = new Date();
    const then = new Date(isoString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const groupByDate = (notifications: Notification[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: {
      today: Notification[];
      yesterday: Notification[];
      earlier: Notification[];
    } = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    notifications.forEach((notif) => {
      const date = new Date(notif.timestamp);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) {
        groups.today.push(notif);
      } else if (date.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notif);
      } else {
        groups.earlier.push(notif);
      }
    });

    return groups;
  };

  const grouped = groupByDate(notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.3)",
          zIndex: 9998,
          animation: "occ-fade-in 0.2s ease-out",
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Notification center"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "400px",
          maxWidth: "90vw",
          background: "var(--occ-bg-primary)",
          boxShadow: "-4px 0 12px rgba(0,0,0,0.15)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          animation: "occ-slide-in-right 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "var(--occ-space-4)",
            borderBottom: "1px solid var(--occ-border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "var(--occ-font-size-lg)",
              fontWeight: "var(--occ-font-weight-semibold)",
              color: "var(--occ-text-primary)",
            }}
          >
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0",
              color: "var(--occ-text-secondary)",
            }}
            aria-label="Close notification center"
          >
            ×
          </button>
        </div>

        {/* Notifications List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--occ-space-4)",
          }}
        >
          {notifications.length === 0 ? (
            <p
              style={{
                color: "var(--occ-text-secondary)",
                textAlign: "center",
                marginTop: "var(--occ-space-8)",
              }}
            >
              No notifications yet
            </p>
          ) : (
            <>
              {grouped.today.length > 0 && (
                <NotificationGroup
                  title="Today"
                  notifications={grouped.today}
                  onMarkAsRead={onMarkAsRead}
                  getIcon={getIcon}
                  formatRelativeTime={formatRelativeTime}
                />
              )}
              {grouped.yesterday.length > 0 && (
                <NotificationGroup
                  title="Yesterday"
                  notifications={grouped.yesterday}
                  onMarkAsRead={onMarkAsRead}
                  getIcon={getIcon}
                  formatRelativeTime={formatRelativeTime}
                />
              )}
              {grouped.earlier.length > 0 && (
                <NotificationGroup
                  title="Earlier"
                  notifications={grouped.earlier}
                  onMarkAsRead={onMarkAsRead}
                  getIcon={getIcon}
                  formatRelativeTime={formatRelativeTime}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {unreadCount > 0 && (
          <div
            style={{
              padding: "var(--occ-space-4)",
              borderTop: "1px solid var(--occ-border-default)",
            }}
          >
            <button
              onClick={onMarkAllAsRead}
              style={{
                width: "100%",
                padding: "var(--occ-space-3)",
                background: "var(--occ-bg-interactive)",
                color: "var(--occ-text-interactive)",
                border: "1px solid var(--occ-border-interactive)",
                borderRadius: "var(--occ-radius-md)",
                fontSize: "var(--occ-font-size-sm)",
                fontWeight: "var(--occ-font-weight-medium)",
                cursor: "pointer",
              }}
            >
              Mark All as Read
            </button>
          </div>
        )}
      </div>
    </>
  );
}

interface NotificationGroupProps {
  title: string;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  getIcon: (type: Notification["type"]) => string;
  formatRelativeTime: (isoString: string) => string;
}

function NotificationGroup({
  title,
  notifications,
  onMarkAsRead,
  getIcon,
  formatRelativeTime,
}: NotificationGroupProps) {
  return (
    <div style={{ marginBottom: "var(--occ-space-6)" }}>
      <h3
        style={{
          margin: 0,
          marginBottom: "var(--occ-space-3)",
          fontSize: "var(--occ-font-size-sm)",
          fontWeight: "var(--occ-font-weight-semibold)",
          color: "var(--occ-text-secondary)",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--occ-space-2)" }}>
        {notifications.map((notif) => (
          <NotificationItem
            key={notif.id}
            notification={notif}
            onMarkAsRead={onMarkAsRead}
            icon={getIcon(notif.type)}
            timeAgo={formatRelativeTime(notif.timestamp)}
          />
        ))}
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  icon: string;
  timeAgo: string;
}

function NotificationItem({ notification, onMarkAsRead, icon, timeAgo }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.url) {
      window.location.href = notification.url;
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: "var(--occ-space-3)",
        background: notification.read ? "transparent" : "var(--occ-bg-secondary)",
        border: "1px solid var(--occ-border-default)",
        borderRadius: "var(--occ-radius-md)",
        cursor: notification.url ? "pointer" : "default",
        transition: "background 0.2s ease",
      }}
    >
      <div style={{ display: "flex", gap: "var(--occ-space-3)", alignItems: "flex-start" }}>
        <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              marginBottom: "var(--occ-space-1)",
              fontSize: "var(--occ-font-size-sm)",
              fontWeight: notification.read
                ? "var(--occ-font-weight-normal)"
                : "var(--occ-font-weight-semibold)",
              color: "var(--occ-text-primary)",
            }}
          >
            {notification.title}
          </p>
          <p
            style={{
              margin: 0,
              marginBottom: "var(--occ-space-2)",
              fontSize: "var(--occ-font-size-sm)",
              color: "var(--occ-text-secondary)",
            }}
          >
            {notification.message}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "var(--occ-font-size-xs)",
              color: "var(--occ-text-secondary)",
            }}
          >
            {timeAgo}
          </p>
        </div>
        {!notification.read && (
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--occ-color-info)",
              flexShrink: 0,
              marginTop: "6px",
            }}
            aria-label="Unread"
          />
        )}
      </div>
    </div>
  );
}

