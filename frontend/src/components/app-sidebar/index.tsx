import * as React from "react";

import DriveSwitcher from "@/components/drive-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { Button } from "../ui";
import usersApi from "@/apis/users.api";
import useAuth from "@/hooks/use-auth";
import { toast } from "sonner";

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Home",
      url: "/",
    },
    {
      title: "User access",
      url: "/access",
    },
    {
      title: "Profile",
      url: "/profile",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <DriveSwitcher />
      </SidebarHeader>
      <SidebarContent className="gap-0 p-2">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.url} className="font-medium">
                    {item.title === "Profile" ? (
                      <>
                        Profile <small>({user?.email})</small>
                      </>
                    ) : (
                      item.title
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <Button
          className="mt-auto"
          onClick={async () => {
            try {
              await usersApi.logout();
              logout();
              toast.success("Logout successful");
            } catch (error) {
              console.error(error);
              toast.error("Logout failed");
            }
          }}
        >
          Logout
        </Button>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
