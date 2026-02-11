import { DesktopSidebar, MobileBottomNav } from "./AppNavigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex w-full">
      <DesktopSidebar />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
