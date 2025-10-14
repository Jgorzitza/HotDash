/**
 * RecommenderBreakdownTable Component - P0
 * 
 * Table showing performance breakdown by recommender
 * Includes sorting and detailed metrics
 */

import {
  Card,
  IndexTable,
  Text,
  Badge,
  InlineStack,
  useIndexResourceState,
} from '@shopify/polaris';
import { useState } from 'react';

export interface Recommender {
  id: string;
  name: string;
  actionsCount: number;
  approvalRate: number;
  avgConfidence: number;
  roi: number;
}

export interface RecommenderBreakdownTableProps {
  recommenders: Recommender[];
}

export function RecommenderBreakdownTable({ recommenders }: RecommenderBreakdownTableProps) {
  const [sortColumn, setSortColumn] = useState<string>('roi');
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('descending');

  const resourceName = {
    singular: 'recommender',
    plural: 'recommenders',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(recommenders);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getApprovalBadgeTone = (rate: number) => {
    if (rate >= 90) return 'success';
    if (rate >= 80) return 'info';
    if (rate >= 70) return 'warning';
    return 'critical';
  };

  const sortedRecommenders = [...recommenders].sort((a, b) => {
    let aValue: any = a[sortColumn as keyof Recommender];
    let bValue: any = b[sortColumn as keyof Recommender];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'ascending') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const rowMarkup = sortedRecommenders.map((recommender, index) => (
    <IndexTable.Row
      id={recommender.id}
      key={recommender.id}
      position={index}
      selected={selectedResources.includes(recommender.id)}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="semibold">
          {recommender.name}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd">{recommender.actionsCount}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={getApprovalBadgeTone(recommender.approvalRate)}>
          {recommender.approvalRate}%
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd">{recommender.avgConfidence}%</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="semibold">
          {formatCurrency(recommender.roi)}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  const headings = [
    { title: 'Recommender' },
    { title: 'Actions' },
    { title: 'Approval Rate' },
    { title: 'Avg Confidence' },
    { title: 'ROI' },
  ];

  return (
    <Card>
      <IndexTable
        resourceName={resourceName}
        itemCount={recommenders.length}
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

