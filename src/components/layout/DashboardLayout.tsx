import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  activeItem: string;
  onNavigate: (item: string) => void;
}

export function DashboardLayout({ children, activeItem, onNavigate }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem={activeItem} onItemClick={onNavigate} />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
