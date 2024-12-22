import * as React from "react";

import DriveSwitcher from "@/components/drive-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { Button } from "../ui";
import usersApi from "@/apis/users.api";
import useAuth from "@/hooks/use-auth";
import { useSelector } from "react-redux";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);
  const { logout } = useAuth();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <DriveSwitcher />
      </SidebarHeader>
      <SidebarContent className="gap-0 p-2">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <Link to={item.url} key={item.title}>
            <h3 className="px-3 py-2 text-base font-semibold rounded hover:bg-muted truncate">
              {item.title === "Profile" ? (
                <>
                  Profile <span className="text-xs">({user?.email})</span>
                </>
              ) : (
                item.title
              )}
            </h3>
          </Link>
        ))}
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
