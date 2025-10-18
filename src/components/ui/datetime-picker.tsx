import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Selecciona fecha y hora",
  className,
  disabled = false,
  minDate,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [time, setTime] = React.useState(
    date ? format(date, "HH:mm") : "12:00"
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes] = time.split(":");
      selectedDate.setHours(parseInt(hours), parseInt(minutes));
      onDateChange(selectedDate);
    } else {
      onDateChange(undefined);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date) {
      const [hours, minutes] = newTime.split(":");
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      onDateChange(newDate);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP 'a las' HH:mm", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-auto p-0"
        align="start"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="p-3 border-b">
          <Label className="text-sm font-medium">Selecciona fecha</Label>
        </div>
        <div className="p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => {
              if (minDate) {
                return date < minDate;
              }
              return date < new Date();
            }}
            initialFocus
          />
        </div>
        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Label className="text-sm font-medium">Hora:</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
        <div className="p-3 pt-0">
          <Button onClick={() => setIsOpen(false)} className="w-full" size="sm">
            Confirmar
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
