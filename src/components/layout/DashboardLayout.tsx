import { ReactNode } from "react";
import { MobileSidebar } from "./MobileSidebar";
import { ResponsiveHeader } from "./ResponsiveHeader";
import { SidebarProvider, useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  activeItem: string;
  onNavigate: (item: string) => void;
}

function DashboardLayoutContent({ children, activeItem, onNavigate }: DashboardLayoutProps) {
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <MobileSidebar 
        activeItem={activeItem} 
        onItemClick={onNavigate} 
        alertCount={3}
      />
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isMobile ? "ml-0" : (isCollapsed ? "ml-20" : "ml-64")
      )}>
        <ResponsiveHeader onNavigate={onNavigate} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
        <footer className="py-4 px-4 md:px-6 border-t border-border mt-auto">
          <p className="text-center text-sm text-muted-foreground">
            Developed by Sakthi Tech Groups
          </p>
        </footer>
      </div>
    </div>
  );
}

export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent {...props} />
    </SidebarProvider>
  );
}
