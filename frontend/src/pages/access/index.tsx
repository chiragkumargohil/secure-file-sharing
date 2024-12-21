import usersApi from "@/apis/users.api";
import { AppSidebar } from "@/components/app-sidebar";
import UserAccess from "@/components/tables/user-access";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TUserAccess } from "@/types";
import { useEffect, useState } from "react";

const AccessPage = () => {
  const [users, setUsers] = useState<TUserAccess[]>([]);

  const getUsers = async () => {
    try {
      const data = await usersApi.getDriveAccessEmails();
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>

        <div className="p-4 space-y-4">
          <UserAccess users={users} setUsers={setUsers} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AccessPage;
