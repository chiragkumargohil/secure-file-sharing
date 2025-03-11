import { Check, ChevronsUpDown, GalleryVerticalEnd } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useDispatch, useSelector } from "react-redux";
import { TDriveAccess } from "@/types";
import { Tooltip } from "../ui/tooltip";
import { toast } from "sonner";
import usersApi from "@/apis/users.api";
import { setUser } from "@/redux/slices/auth-slice";

const DriveSwitcher = () => {
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);
  const drives = user?.drives ?? [];

  const selectedDrive = user?.drive
    ? drives.find((d: TDriveAccess) => d.id === user?.drive)
    : null;

  const handleSwitchDrive = async (drive: TDriveAccess | null) => {
    try {
      await usersApi.switchDriveAccess(drive?.id ?? null);
      dispatch(
        setUser({
          ...user,
          drive: drive?.id ?? null,
        })
      );
      window.location.reload();
    } catch {
      toast.error("Failed to switch drive");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <Tooltip title={selectedDrive?.owner ?? "My Drive"}>
                <div className="flex flex-col gap-0.5 truncate">
                  <span className="truncate">
                    {selectedDrive?.owner ?? "My Drive"}
                  </span>
                  {selectedDrive?.role && (
                    <span className="text-xs text-muted-foreground">
                      {selectedDrive.role}
                    </span>
                  )}
                </div>
              </Tooltip>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            <DropdownMenuItem
              onSelect={() => handleSwitchDrive(null)}
              className="cursor-pointer"
            >
              My Drive {selectedDrive === null && <Check className="ml-auto" />}
            </DropdownMenuItem>
            {drives.map((item: TDriveAccess) => (
              <DropdownMenuItem
                key={item.id}
                onSelect={() => handleSwitchDrive(item)}
                className="cursor-pointer"
              >
                <span className="truncate">{item.owner}</span>
                {item.id === selectedDrive?.id && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default DriveSwitcher;
