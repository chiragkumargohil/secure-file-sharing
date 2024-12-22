import { useSelector } from "react-redux";
import { TAuthState } from "@/types";

const usePermissions = () => {
  const { user } = useSelector((state: TAuthState) => state.auth);
  
  if (!user) {
    return {
      role: "admin",
      canView: false,
      canDownload: false,
      canUpload: false,
      canShare: false,
      canDelete: false,
      canViewSharedFiles: false,
    };
  }

  if (!user.drive) {
    return {
      role: user.role,
      canView: true,
      canDownload: true,
      canUpload: true,
      canShare: true,
      canDelete: true,
      canViewSharedFiles: true,
    };
  }

  switch (user.role) {
    case "admin":
      return {
        role: user.role,
        canView: true,
        canDownload: true,
        canUpload: true,
        canShare: true,
        canDelete: true,
        canViewSharedFiles: true,
      };
    case "editor":
      return {
        role: user.role,
        canView: true,
        canDownload: true,
        canUpload: true,
        canShare: false,
        canDelete: false,
        canViewSharedFiles: true,
      };
    case "viewer":
      return {
        role: user.role,
        canView: true,
        canDownload: false,
        canUpload: false,
        canShare: false,
        canDelete: false,
        canViewSharedFiles: false,
      };
    default:
      return {
        role: user.role,
        canView: false,
        canDownload: false,
        canUpload: false,
        canShare: false,
        canDelete: false,
        canViewSharedFiles: false,
      };
  }
};

export default usePermissions;
