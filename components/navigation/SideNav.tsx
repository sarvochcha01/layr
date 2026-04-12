"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Settings,
  User,
  LayoutDashboard,
  Folder,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  text: string;
  href: string;
}

const navigationItems: NavItem[] = [
  {
    icon: FileText,
    text: "Projects",
    href: "/projects",
  },
  {
    icon: LayoutDashboard,
    text: "Overview",
    href: "/dashboard",
  },
  {
    icon: Folder,
    text: "Templates",
    href: "/templates",
  },
  {
    icon: User,
    text: "Profile",
    href: "/profile",
  },
  {
    icon: Settings,
    text: "Settings",
    href: "/settings",
  },
];

interface SideNavProps {
  className?: string;
}

export function SideNav({ className }: SideNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-card border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="font-bold text-xs text-primary-foreground">
                L
              </span>
            </div>
            <span className="font-bold text-lg">Layr</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className={cn("h-8 w-8 p-0", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.text : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">{item.text}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        {!isCollapsed ? (
          <div className="text-xs text-muted-foreground">
            <p>© 2024 Layr Builder</p>
            <p>Version 1.0.0</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-muted-foreground rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
