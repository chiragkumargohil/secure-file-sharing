import resourcesApi from "@/apis/resources.api";
import { FileCard } from "@/components/cards/file-card";
import PrimaryLayout from "@/components/layouts/primary-layout";
import { Button } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Home = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [files, setFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("my-files");

  const getFiles = async () => {
    try {
      let data = {
        files: [],
      };
      if (activeTab === "my-files") {
        data = await resourcesApi.getFiles();
      } else if (activeTab === "shared-files") {
        data = await resourcesApi.getSharedFiles();
      }
      setFiles(data.files || []);
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
    <PrimaryLayout>
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
    </PrimaryLayout>
  );
};

export default Home;
