import { Bell, UserPlus, MessageCircle, Check, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface NotificationsPanelProps {
  onClose?: () => void;
}

export const NotificationsPanel = ({ onClose }: NotificationsPanelProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case "friend_request":
        return <UserPlus className="w-4 h-4 text-primary" />;
      case "friend_accepted":
        return <Check className="w-4 h-4 text-green-500" />;
      case "direct_message":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "event_reminder":
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case "club_invite":
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleClick = async (notification: typeof notifications[0]) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    const data = notification.data as Record<string, string> | null;
    switch (notification.type) {
      case "friend_request":
      case "friend_accepted":
        if (data?.sender_id) navigate(`/profile/${data.sender_id}`);
        if (data?.user_id) navigate(`/profile/${data.user_id}`);
        break;
      case "direct_message":
        if (data?.sender_id) navigate(`/messages/${data.sender_id}`);
        break;
    }

    onClose?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">Notifications</h3>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors hover:bg-muted/50 ${
                !notification.read ? "bg-primary/5" : ""
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                !notification.read ? "bg-primary/10" : "bg-muted"
              }`}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {notification.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>

              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
