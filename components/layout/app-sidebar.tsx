"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  CalendarDays,
  BarChart3,
  Settings,
  Timer,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useTimeStore } from "@/hooks/use-time-store";
import { Theme } from "@/types";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Clock },
  { href: "/backlog", label: "Legg til tid", icon: CalendarDays },
  { href: "/months", label: "Måneder", icon: BarChart3 },
  { href: "/settings", label: "Innstillinger", icon: Settings },
];

const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Lys" },
  { value: "dark", icon: Moon, label: "Mørk" },
  { value: "system", icon: Monitor, label: "System" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const activeSession = useTimeStore((s) => s.activeSession);
  const theme = useTimeStore((s) => s.settings.theme);
  const saveSettings = useTimeStore((s) => s.saveSettings);
  const settings = useTimeStore((s) => s.settings);

  const setTheme = (t: Theme) => {
    saveSettings({ ...settings, theme: t });
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/15 text-primary">
            <Timer className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm leading-none">Timerapportering</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.href === "/" && activeSession && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 space-y-3">
        {/* Theme toggle */}
        <div className="flex items-center gap-1 rounded-md border border-border/50 p-1 bg-muted/30">
          {themeOptions.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              title={label}
              className={cn(
                "flex-1 flex items-center justify-center h-6 rounded text-xs transition-all",
                theme === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground/50 tracking-wider uppercase">
          {new Date().getFullYear()} · Timerapportering
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
