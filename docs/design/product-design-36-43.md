---
epoch: 2025.10.E1
doc: docs/design/product-design-36-43.md
owner: designer
created: 2025-10-11
---

# Product Design Features (Tasks 36-43)

## Task 36: Advanced Dashboard Customization

**Drag-Drop Widget System**:
```typescript
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="dashboard">
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {tiles.map((tile, index) => (
          <Draggable key={tile.id} draggableId={tile.id} index={index}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <TileCard {...tile} />
              </div>
            )}
          </Draggable>
        ))}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

**Features**: Reorder tiles, show/hide, resize, save preferences

---

## Task 37: Workspace Personalization

**Settings Panel**:
```typescript
<Card>
  <BlockStack gap="400">
    <Text variant="headingMd" as="h2">Dashboard Preferences</Text>
    
    <Checkbox label="Show AI Agent Pulse tile" checked={showAI} onChange={setShowAI} />
    <Checkbox label="Auto-refresh every 30s" checked={autoRefresh} onChange={setAutoRefresh} />
    
    <Select
      label="Default view"
      options={[
        { label: 'Compact', value: 'compact' },
        { label: 'Comfortable', value: 'comfortable' },
        { label: 'Spacious', value: 'spacious' },
      ]}
      value={density}
      onChange={setDensity}
    />
    
    <Button variant="primary" onClick={save}>Save Preferences</Button>
  </BlockStack>
</Card>
```

---

## Task 38: Multi-View Layouts

**View Switcher**:
```typescript
<ButtonGroup variant="segmented">
  <Button pressed={view === 'grid'} onClick={() => setView('grid')}>Grid</Button>
  <Button pressed={view === 'list'} onClick={() => setView('list')}>List</Button>
  <Button pressed={view === 'kanban'} onClick={() => setView('kanban')}>Kanban</Button>
</ButtonGroup>

{view === 'grid' && <GridView items={items} />}
{view === 'list' && <ListView items={items} />}
{view === 'kanban' && <KanbanView items={items} />}
```

---

## Task 39: Advanced Filtering and Search

**Filter Panel**:
```typescript
<Filters
  queryValue={searchQuery}
  onQueryChange={setSearchQuery}
  onQueryClear={clearSearch}
  filters={[
    { key: 'status', label: 'Status', filter: <StatusFilter /> },
    { key: 'agent', label: 'Agent', filter: <AgentFilter /> },
    { key: 'risk', label: 'Risk Level', filter: <RiskFilter /> },
    { key: 'date', label: 'Date Range', filter: <DateRangeFilter /> },
  ]}
  appliedFilters={appliedFilters}
  onClearAll={clearAllFilters}
/>
```

---

## Task 40: Bulk Operations UI

**Bulk Action Pattern**:
```typescript
const [selectedItems, setSelectedItems] = useState<string[]>([]);

<Page
  primaryAction={{
    content: `Approve Selected (${selectedItems.length})`,
    onAction: bulkApprove,
    disabled: selectedItems.length === 0,
  }}
  secondaryActions={[
    {
      content: `Reject Selected (${selectedItems.length})`,
      onAction: bulkReject,
      destructive: true,
      disabled: selectedItems.length === 0,
    },
  ]}
>
  <ResourceList
    items={items}
    selectedItems={selectedItems}
    onSelectionChange={setSelectedItems}
    selectable
  />
</Page>
```

---

## Task 41: Keyboard Shortcut Overlay

**Shortcut Panel** (Cmd/Ctrl + K):
```typescript
<Modal open={showShortcuts} onClose={close} title="Keyboard Shortcuts">
  <Modal.Section>
    <List>
      <List.Item><kbd>Tab</kbd> - Navigate items</List.Item>
      <List.Item><kbd>Ctrl+A</kbd> - Approve selected</List.Item>
      <List.Item><kbd>Ctrl+R</kbd> - Reject selected</List.Item>
      <List.Item><kbd>Ctrl+K</kbd> - Command palette</List.Item>
      <List.Item><kbd>Escape</kbd> - Close dialogs</List.Item>
      <List.Item><kbd>/</kbd> - Focus search</List.Item>
    </List>
  </Modal.Section>
</Modal>
```

---

## Task 42: Command Palette (Cmd+K)

**Palette UI**:
```typescript
import { Combobox, Listbox } from '@shopify/polaris';

<Combobox
  activator={<Combobox.TextField placeholder="Search actions..." autoFocus />}
>
  <Listbox>
    <Listbox.Option value="approve">Approve All Pending</Listbox.Option>
    <Listbox.Option value="refresh">Refresh Dashboard</Listbox.Option>
    <Listbox.Option value="export">Export Metrics</Listbox.Option>
    <Listbox.Option value="settings">Open Settings</Listbox.Option>
  </Listbox>
</Combobox>
```

**Trigger**: Ctrl+K or Cmd+K globally

---

## Task 43: Quick Actions Menu

**Floating Action Button** (bottom-right):
```typescript
<Popover
  active={showQuickActions}
  activator={
    <Button icon={PlusIcon} variant="primary" size="large" />
  }
>
  <ActionList
    items={[
      { content: 'New Approval', onAction: () => {} },
      { content: 'Add Note', onAction: () => {} },
      { content: 'Send Feedback', onAction: () => {} },
    ]}
  />
</Popover>
```

---

**All 8 Product Design tasks complete**

