/**
 * AuditLogTable Component - P0
 * 
 * Shows audit log of all auto-approval configuration changes
 */

import {
  Card,
  IndexTable,
  Text,
  Badge,
  useIndexResourceState,
} from '@shopify/polaris';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface AuditLogTableProps {
  auditLog: AuditLogEntry[];
}

export function AuditLogTable({ auditLog }: AuditLogTableProps) {
  const resourceName = {
    singular: 'entry',
    plural: 'entries',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(auditLog);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getActionBadgeTone = (action: string) => {
    if (action.includes('Enabled')) return 'success';
    if (action.includes('Disabled')) return 'warning';
    if (action.includes('Updated')) return 'info';
    return undefined;
  };

  const rowMarkup = auditLog.map((entry, index) => (
    <IndexTable.Row
      id={entry.id}
      key={entry.id}
      position={index}
      selected={selectedResources.includes(entry.id)}
    >
      <IndexTable.Cell>
        <Text variant="bodySm" tone="subdued">
          {formatTimestamp(entry.timestamp)}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={getActionBadgeTone(entry.action)}>
          {entry.action}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodySm">{entry.user}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodySm">{entry.details}</Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  const headings = [
    { title: 'Timestamp' },
    { title: 'Action' },
    { title: 'User' },
    { title: 'Details' },
  ];

  return (
    <Card>
      <IndexTable
        resourceName={resourceName}
        itemCount={auditLog.length}
        selectedItemsCount={
          allResourcesSelected ? 'All' : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={headings}
        selectable={false}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}

