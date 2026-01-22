import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";

function DashboardProvider({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="w-full p-10">{children}</div>
    </SidebarProvider>
  );
}

export default DashboardProvider;
