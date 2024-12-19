import resourcesApi from "@/apis/resources";
import usersApi from "@/apis/users";
import { AppSidebar } from "@/components/app-sidebar";
import { FileCard } from "@/components/cards/file-card";
import { Button } from "@/components/ui";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Home = () => {
  const { logout } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [files, setFiles] = useState<any[]>([]);

  const getFiles = async () => {
    try {
      const files = await resourcesApi.getFiles();
      setFiles(files.files);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getFiles();
  }, []);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file") as File;
    if (!file) {
      toast.error("No file selected");
    }

    try {
      await resourcesApi.uploadFile(formData);
      toast.success("File uploaded successfully");
      getFiles();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await usersApi.logout();
                logout();
              } catch (error) {
                console.error(error);
              }
            }}
            className="ml-auto"
          >
            Logout
          </Button>
        </header>
        <form onSubmit={handleFormSubmit}>
          <input type="file" name="file" />
          <Button type="submit">Upload</Button>
        </form>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {files?.map((file) => (
            <FileCard
              key={file.id}
              id={file.id}
              name={file.name}
              size={file.size}
              updatedAt={file.updated_at}
              onDelete={() => {
                getFiles();
              }}
            />
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Home;
