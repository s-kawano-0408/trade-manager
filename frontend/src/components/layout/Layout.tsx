import { AppSidebar, SidebarProvider, SidebarTrigger } from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex flex-col w-full">
        <div className="p-2 border-b">
          <SidebarTrigger />
        </div>

        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Layout;
