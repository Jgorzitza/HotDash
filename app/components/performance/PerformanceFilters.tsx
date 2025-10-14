/**
 * PerformanceFilters Component - P0
 * 
 * Filters for performance dashboard
 * - Date range selector
 * - Type filter
 * - Status filter
 */

import {
  Card,
  InlineStack,
  Select,
} from '@shopify/polaris';
import { useState } from 'react';

export interface PerformanceFiltersProps {
  dateRange: string;
  onDateRangeChange: (value: string) => void;
}

export function PerformanceFilters({ 
  dateRange, 
  onDateRangeChange 
}: PerformanceFiltersProps) {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const dateRangeOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'Last 6 months', value: '6m' },
    { label: 'Last year', value: '1y' },
    { label: 'All time', value: 'all' },
  ];

  const typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'SEO CTR Fix', value: 'seo_ctr_fix' },
    { label: 'Metaobject Generation', value: 'metaobject_gen' },
    { label: 'Merchandising Playbook', value: 'merch_playbook' },
    { label: 'Guided Selling', value: 'guided_selling' },
    { label: 'Core Web Vitals', value: 'cwv_repair' },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Pending', value: 'pending' },
    { label: 'Executed', value: 'executed' },
  ];

  return (
    <Card>
      <InlineStack gap="400" wrap={false}>
        <div style={{ minWidth: '200px' }}>
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={dateRange}
            onChange={onDateRangeChange}
          />
        </div>

        <div style={{ minWidth: '200px' }}>
          <Select
            label="Type"
            options={typeOptions}
            value={selectedType}
            onChange={setSelectedType}
          />
        </div>

        <div style={{ minWidth: '200px' }}>
          <Select
            label="Status"
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </div>
      </InlineStack>
    </Card>
  );
}

