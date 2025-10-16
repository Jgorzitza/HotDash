import { useState } from "react";
import { Popover, Button, DatePicker } from "@shopify/polaris";

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [{ month, year }, setDate] = useState({ month: value.start.getMonth(), year: value.start.getFullYear() });
  const togglePopover = () => setPopoverActive(!popoverActive);
  const handleMonthChange = (month: number, year: number) => setDate({ month, year });
  return (
    <Popover
      active={popoverActive}
      activator={<Button onClick={togglePopover}>{value.start.toLocaleDateString()} - {value.end.toLocaleDateString()}</Button>}
      onClose={togglePopover}
    >
      <DatePicker
        month={month}
        year={year}
        onChange={(range) => {
          onChange({ start: range.start, end: range.end });
          setPopoverActive(false);
        }}
        onMonthChange={handleMonthChange}
        allowRange
      />
    </Popover>
  );
}
