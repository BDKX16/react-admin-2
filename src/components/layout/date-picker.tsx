import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

export function DatePicker() {
  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar className="[&_[role=gridcell].bg-accent]:bg-[hsl(158_75%_21%)] dark:[&_[role=gridcell].bg-accent]:bg-[hsl(143_57%_34%)] [&_[role=gridcell].bg-accent]:text-white [&_[role=gridcell]]:w-[33px]" />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
