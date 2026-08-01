import { ReactNode } from "react";
import { MobileSidebar } from "./MobileSidebar";
import { ResponsiveHeader } from "./ResponsiveHeader";
import { Footer } from "./Footer";
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
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-x-hidden">
          <div className="page-column">{children}</div>
        </main>
        <Footer className="mt-auto" />
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
