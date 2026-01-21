import { Bell, Search, User, Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/hooks/useSidebar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function ResponsiveHeader() {
  const { isCollapsed, toggle, isMobile } = useSidebar();
  const { profile, role } = useAuth();

  return (
    <header className={cn(
      "sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 md:px-6 gap-4 transition-all duration-300",
      isMobile ? "ml-0" : (isCollapsed ? "ml-20" : "ml-64")
    )}>
      {/* Toggle button for desktop */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="shrink-0"
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </Button>
      )}

      {/* Spacer for mobile (menu button is in sidebar) */}
      {isMobile && <div className="w-10" />}

      {/* Search */}
      <div className="flex-1 max-w-xl hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search vehicles, drivers, routes..." 
            className="pl-10 bg-secondary/50 border-transparent focus:border-primary h-10"
          />
        </div>
      </div>

      {/* Mobile search button */}
      <Button variant="ghost" size="icon" className="sm:hidden">
        <Search className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-muted-foreground font-medium">Live</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        </Button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground capitalize">{role || 'Fleet Manager'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
