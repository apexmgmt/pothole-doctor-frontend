"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  ...props
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date) => {
    if (date) {
      onChange(date);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 py-2 bg-bg-3 border border-border text-light hover:bg-bg-4 hover:text-light focus:ring",
            !value && "text-gray-400",
            className
          )}
          disabled={disabled}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "MM/dd/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-bg-2 border border-border shadow-md"
        align="start"
        side="bottom"
        sideOffset={2}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          initialFocus
          className="bg-bg-2 text-light border-none overflow-hidden w-[250px]"
          //   classNames={{
          //     root: "bg-bg-2 text-light",
          //     months: "bg-bg-2 text-light",
          //     month: "bg-bg-2 text-light",
          //     nav: "bg-bg-2 text-light",
          //     button_previous: "bg-bg-3 text-light hover:bg-bg-4 border-border",
          //     button_next: "bg-bg-3 text-light hover:bg-bg-4 border-border",
          //     month_caption: "bg-bg-2 text-light",
          //     caption_label: "bg-bg-2 text-light",
          //     table: "bg-bg-2 text-light",
          //     weekdays: "bg-bg-2 text-light",
          //     weekday: "bg-bg-2 text-gray-400",
          //     week: "bg-bg-2 text-light",
          //     day: "bg-bg-2 text-light hover:bg-bg-4",
          //     today: "bg-bg-3 text-light",
          //     outside: "text-gray-500",
          //     disabled: "text-gray-600",
          //     selected: "bg-primary text-primary-foreground hover:bg-primary/90",
          //   }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  className,
  disabled = false,
  ...props
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (range) => {
    if (range) {
      onChange(range);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 py-2 bg-bg-3 border border-border text-light hover:bg-bg-4 hover:text-light focus:ring focus:ring-offset-1",
            !value?.from && "text-gray-400",
            className
          )}
          disabled={disabled}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "MM/dd/yyyy")} -{" "}
                {format(value.to, "MM/dd/yyyy")}
              </>
            ) : (
              format(value.from, "MM/dd/yyyy")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-bg-2 border border-border shadow-md">
        <Calendar
          mode="range"
          selected={value}
          onSelect={handleSelect}
          initialFocus
          className="bg-bg-2 text-light border-0"
          //   classNames={{
          //     root: "bg-bg-2 text-light",
          //     months: "bg-bg-2 text-light",
          //     month: "bg-bg-2 text-light",
          //     nav: "bg-bg-2 text-light",
          //     button_previous: "bg-bg-3 text-light hover:bg-bg-4 border-border",
          //     button_next: "bg-bg-3 text-light hover:bg-bg-4 border-border",
          //     month_caption: "bg-bg-2 text-light",
          //     caption_label: "bg-bg-2 text-light",
          //     table: "bg-bg-2 text-light",
          //     weekdays: "bg-bg-2 text-light",
          //     weekday: "bg-bg-2 text-gray-400",
          //     week: "bg-bg-2 text-light",
          //     day: "bg-bg-2 text-light hover:bg-bg-4",
          //     today: "bg-bg-3 text-light",
          //     outside: "text-gray-500",
          //     disabled: "text-gray-600",
          //     selected: "bg-primary text-primary-foreground hover:bg-primary/90",
          //     range_start: "bg-primary text-primary-foreground",
          //     range_end: "bg-primary text-primary-foreground",
          //     range_middle: "bg-primary/20 text-primary-foreground",
          //   }}
        />
      </PopoverContent>
    </Popover>
  );
}
