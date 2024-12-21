import resourcesApi from "@/apis/resources.api";
import usersApi from "@/apis/users.api";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Home = () => {
  const { logout } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [files, setFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("my-files");

  const getFiles = async () => {
    try {
      let files = {
        files: [],
      };
      if (activeTab === "my-files") {
        files = await resourcesApi.getFiles();
      } else if (activeTab === "shared-files") {
        files = await resourcesApi.getSharedFiles();
      }
      setFiles(files.files || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getFiles();
  }, [activeTab]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const files = formData.get("files") as File;
    if (!files) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderFileCards = (files: any[]) => {
    return files.map((file) => (
      <FileCard
        key={file.id}
        id={file.id}
        name={file.filename}
        size={file.size}
        updatedAt={file.updated_at}
        onDelete={() => {
          getFiles();
        }}
      />
    ));
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

        <div className="p-4 space-y-4">
          <form onSubmit={handleFormSubmit}>
            <input type="file" name="files" multiple />
            <Button type="submit">Upload</Button>
          </form>
          <Tabs defaultValue="my-files" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-files">My Files</TabsTrigger>
              <TabsTrigger value="shared-files">Shared with Me</TabsTrigger>
            </TabsList>
            <TabsContent value="my-files">
              <h2 className="text-2xl font-bold mb-4">My Files</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {renderFileCards(files)}
              </div>
            </TabsContent>
            <TabsContent value="shared-files">
              <h2 className="text-2xl font-bold mb-4">Files Shared with Me</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {renderFileCards(files)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Home;
