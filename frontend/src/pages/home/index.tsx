import { useEffect, useState } from "react";
import resourcesApi from "@/apis/resources.api";
import { FileCard } from "@/components/cards/file-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadFileModal from "@/components/modals/upload-file-modal";

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
      setFiles([]);
    }
  };

  useEffect(() => {
    getFiles();
  }, [activeTab]);

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
    <Tabs defaultValue="my-files" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="my-files" className="py-2">My Files</TabsTrigger>
        <TabsTrigger value="shared-files" className="py-2">Shared with Me</TabsTrigger>
      </TabsList>
      <TabsContent value="my-files" className="space-y-2 py-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-2xl font-bold mb-4">My Files</h2>
          <UploadFileModal fetchData={getFiles} />
        </div>
        <div className="flex flex-wrap gap-4">{renderFileCards(files)}</div>
      </TabsContent>
      <TabsContent value="shared-files" className="space-y-2 py-2">
        <h2 className="text-2xl font-bold mb-4">Shared with Me</h2>
        <div className="flex flex-wrap gap-4">{renderFileCards(files)}</div>
      </TabsContent>
    </Tabs>
  );
};

export default Home;
