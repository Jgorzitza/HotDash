import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface NotificationData {
  id: string;
  type: string;
  queue_item_id: number;
  conversation_id: number;
  priority: string;
  created_at: string;
}

export function useApprovalNotifications(onNewApproval?: () => void) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      console.error('Supabase configuration missing for realtime notifications');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Subscribe to new approval queue items
    const queueChannel = supabase
      .channel('approval_queue_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_approvals',
          filter: 'status=eq.pending',
        },
        (payload) => {
          console.log('New approval queue item:', payload);
          
          // Call the callback if provided
          if (onNewApproval) {
            onNewApproval();
          }
          
          // Show browser notification if supported and permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            const data = payload.new as any;
            new Notification('New Customer Message', {
              body: `Conversation #${data.chatwoot_conversation_id} - Confidence: ${data.confidence_score}%`,
              icon: '/favicon.ico',
              tag: `approval-${data.id}`,
            });
          }
        }
      )
      .subscribe();
    
    // Subscribe to urgent notifications
    const urgentChannel = supabase
      .channel('urgent_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_sdk_notifications',
          filter: 'priority=eq.urgent',
        },
        (payload) => {
          console.log('Urgent notification:', payload);
          
          const data = payload.new as NotificationData;
          setNotifications(prev => [data, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🚨 URGENT Review Needed', {
              body: `Conversation #${data.conversation_id} requires immediate attention`,
              icon: '/favicon.ico',
              tag: `urgent-${data.id}`,
              requireInteraction: true, // Keep notification visible until user interacts
            });
          }
          
          // Play sound (optional)
          try {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(e => console.log('Could not play notification sound:', e));
          } catch (e) {
            // Ignore audio errors
          }
        }
      )
      .subscribe();
    
    // Request notification permission on first load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
    
    // Cleanup on unmount
    return () => {
      queueChannel.unsubscribe();
      urgentChannel.unsubscribe();
    };
  }, [onNewApproval]);
  
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };
}

