/**
 * Content Calendar Component
 * 
 * Displays scheduled content in a calendar view with Polaris UI
 */

import { useState } from 'react';
import {
  Card,
  Text,
  Button,
  Badge,
  InlineStack,
  BlockStack,
  Modal,
  TextField,
  Select,
  Banner,
} from '@shopify/polaris';
import type { ScheduledContent } from '~/services/content/scheduling.service';

interface CalendarDay {
  date: string;
  items: ScheduledContent[];
  isToday: boolean;
  isPast: boolean;
}

interface CalendarWeek {
  weekNumber: number;
  days: CalendarDay[];
}

interface ContentCalendarProps {
  calendar: CalendarWeek[];
  month: number;
  year: number;
  stats: any;
  onNavigate: (month: number, year: number) => void;
  onSchedule: (data: any) => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string, newTime: string) => void;
}

export function ContentCalendar({
  calendar,
  month,
  year,
  stats,
  onNavigate,
  onSchedule,
  onCancel,
  onReschedule,
}: ContentCalendarProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ScheduledContent | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePreviousMonth = () => {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    onNavigate(newMonth, newYear);
  };

  const handleNextMonth = () => {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    onNavigate(newMonth, newYear);
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setShowScheduleModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge tone="info">Scheduled</Badge>;
      case 'publishing':
        return <Badge tone="attention">Publishing</Badge>;
      case 'published':
        return <Badge tone="success">Published</Badge>;
      case 'failed':
        return <Badge tone="critical">Failed</Badge>;
      case 'cancelled':
        return <Badge>Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPlatformIcon = (platform?: string) => {
    if (!platform) return '📄';
    switch (platform.toLowerCase()) {
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      default: return '📱';
    }
  };

  return (
    <BlockStack gap="400">
      {/* Header */}
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text as="h2" variant="headingLg">
              Content Calendar
            </Text>
            <Button onClick={() => setShowScheduleModal(true)} variant="primary">
              Schedule Content
            </Button>
          </InlineStack>

          {/* Navigation */}
          <InlineStack align="space-between">
            <Button onClick={handlePreviousMonth}>← Previous</Button>
            <Text as="h3" variant="headingMd">
              {monthNames[month]} {year}
            </Text>
            <Button onClick={handleNextMonth}>Next →</Button>
          </InlineStack>

          {/* Stats */}
          <InlineStack gap="400">
            <div>
              <Text as="p" variant="bodyMd" tone="subdued">Scheduled</Text>
              <Text as="p" variant="headingMd">{stats.total_scheduled}</Text>
            </div>
            <div>
              <Text as="p" variant="bodyMd" tone="subdued">Today</Text>
              <Text as="p" variant="headingMd">{stats.scheduled_today}</Text>
            </div>
            <div>
              <Text as="p" variant="bodyMd" tone="subdued">Published Today</Text>
              <Text as="p" variant="headingMd">{stats.published_today}</Text>
            </div>
            <div>
              <Text as="p" variant="bodyMd" tone="subdued">Failed</Text>
              <Text as="p" variant="headingMd">{stats.failed_today}</Text>
            </div>
          </InlineStack>
        </BlockStack>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <div style={{ padding: '16px' }}>
          {/* Weekday Headers */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                <Text as="span" variant="bodyMd">{day}</Text>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          {calendar.map((week, weekIdx) => (
            <div
              key={weekIdx}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '8px',
                marginBottom: '8px'
              }}
            >
              {week.days.map((day, dayIdx) => (
                <CalendarDayCell
                  key={dayIdx}
                  day={day}
                  onClick={() => handleDayClick(day.date)}
                  onItemClick={(item) => setSelectedItem(item)}
                />
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* Schedule Modal */}
      <Modal
        open={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedDate('');
        }}
        title="Schedule Content"
        primaryAction={{
          content: 'Schedule',
          onAction: () => {
            // Handle schedule
            setShowScheduleModal(false);
          },
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setShowScheduleModal(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <TextField
              label="Title"
              value=""
              onChange={() => {}}
              autoComplete="off"
            />
            <Select
              label="Content Type"
              options={[
                { label: 'Social Post', value: 'social_post' },
                { label: 'Blog Post', value: 'blog_post' },
                { label: 'Email Campaign', value: 'email_campaign' },
              ]}
              value="social_post"
              onChange={() => {}}
            />
            <TextField
              label="Scheduled Date/Time"
              type="datetime-local"
              value={selectedDate}
              onChange={setSelectedDate}
              autoComplete="off"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <InlineStack gap="200">
                {getStatusBadge(selectedItem.status)}
                <Text as="span" variant="bodyMd">
                  {getPlatformIcon(selectedItem.platform)} {selectedItem.platform || 'General'}
                </Text>
              </InlineStack>

              <div>
                <Text as="p" variant="bodyMd" fontWeight="semibold">Content:</Text>
                <Text as="p" variant="bodyMd">{selectedItem.content}</Text>
              </div>

              <div>
                <Text as="p" variant="bodyMd" fontWeight="semibold">Scheduled For:</Text>
                <Text as="p" variant="bodyMd">
                  {new Date(selectedItem.scheduled_for).toLocaleString()}
                </Text>
              </div>

              {selectedItem.status === 'scheduled' && (
                <InlineStack gap="200">
                  <Button onClick={() => onCancel(selectedItem.id)}>Cancel</Button>
                  <Button onClick={() => {
                    // Handle reschedule
                  }}>Reschedule</Button>
                </InlineStack>
              )}

              {selectedItem.status === 'failed' && selectedItem.error_message && (
                <Banner tone="critical">
                  <Text as="p" variant="bodyMd">{selectedItem.error_message}</Text>
                </Banner>
              )}
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </BlockStack>
  );
}

function CalendarDayCell({ 
  day, 
  onClick,
  onItemClick 
}: { 
  day: CalendarDay; 
  onClick: () => void;
  onItemClick: (item: ScheduledContent) => void;
}) {
  const dayNumber = new Date(day.date).getDate();
  
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #e1e3e5',
        borderRadius: '8px',
        padding: '8px',
        minHeight: '100px',
        cursor: 'pointer',
        backgroundColor: day.isToday ? '#f6f6f7' : 'white',
        opacity: day.isPast ? 0.6 : 1,
      }}
    >
      <div style={{ marginBottom: '4px' }}>
        <Text as="span" variant="bodyMd" fontWeight={day.isToday ? 'semibold' : 'regular'}>
          {dayNumber}
        </Text>
        {day.items.length > 0 && (
          <Badge tone="info">{day.items.length}</Badge>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {day.items.slice(0, 2).map((item, idx) => (
          <div
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              onItemClick(item);
            }}
            style={{
              fontSize: '12px',
              padding: '4px',
              backgroundColor: '#f6f6f7',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Text as="span" variant="bodySm">
              {item.platform ? `${item.platform.slice(0, 2).toUpperCase()} ` : ''}
              {item.title.slice(0, 15)}...
            </Text>
          </div>
        ))}
        {day.items.length > 2 && (
          <Text as="span" variant="bodySm" tone="subdued">
            +{day.items.length - 2} more
          </Text>
        )}
      </div>
    </div>
  );
}

