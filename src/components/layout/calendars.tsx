import * as React from "react";
import { Check, ChevronRight, Trash2 } from "lucide-react";

import useCalendar from "@/hooks/useCalendar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { checkSchedule, deleteSchedule } from "@/services/private";
import { Button } from "../ui/button";
import { daysUntilDate } from "@/utils/daysUntilDate";
export function Calendars({
  calendars,
}: {
  calendars: {
    name: string;
    items: string[];
  }[];
}) {
  const { selectedDate } = useCalendar();
  const { loading, callEndpoint } = useFetchAndLoad();
  const [calendarItems, setCalendarItems] = React.useState([]);
  const [activeItem, setActiveItem] = React.useState(null);

  React.useEffect(() => {
    setCalendarItems([...calendars]);
  }, [calendars]);

  const toggleCheck = async (id, status) => {
    let res = await callEndpoint(checkSchedule({ id, read: !status }));
    if (res.data.status === "success") {
      let newCalendars = calendarItems.map((calendar) => {
        return {
          ...calendar,
          items: calendar.items.map((item) => {
            if (item.id === id) {
              return { ...item, checked: !status };
            }
            return item;
          }),
        };
      });
      setCalendarItems(newCalendars);
    }
  };

  const handleItemClick = (id) => {
    setActiveItem(activeItem === id ? null : id);
  };

  const handleDelete = async (id) => {
    let res = await callEndpoint(deleteSchedule(id));
    if (res.data.status === "success") {
      let newCalendars = calendarItems.map((calendar) => {
        return {
          ...calendar,
          items: calendar.items.filter((item) => item.id !== id),
        };
      });
      setCalendarItems(newCalendars);
    }
  };

  if (calendarItems.length == 0) return <p>Loading...</p>;
  return (
    <>
      {calendarItems.map((calendar, index) => (
        <React.Fragment key={calendar.name}>
          <SidebarGroup key={calendar.name} className="py-0">
            <Collapsible
              defaultOpen={index === 0}
              className="group/collapsible"
            >
              <SidebarGroupLabel
                asChild
                className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  {calendar.name}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {calendar.items.map((item, index) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => handleItemClick(item.id)}
                        >
                          <div
                            data-active={item.checked}
                            onClick={() => toggleCheck(item.id, item.checked)}
                            className="group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary"
                          >
                            <Check className="hidden size-3 group-data-[active=true]/calendar-item:block" />
                          </div>
                          <div
                            className="flex flex-row justify-between 
                          items-center w-full
                          overflow-hidden
                          whitespace-nowrap
                          ml-2"
                          >
                            <p>{item.title}</p>
                            <p className="text-gray-500">
                              {daysUntilDate(item.date)}
                            </p>
                          </div>
                          {activeItem === item.id && (
                            <>
                              <Button
                                variant="ghost"
                                className="m-0 p-1 ml-auto"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 size={18} />
                              </Button>
                            </>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
          <SidebarSeparator className="mx-0" />
        </React.Fragment>
      ))}
    </>
  );
}
