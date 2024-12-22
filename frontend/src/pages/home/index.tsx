import { useEffect, useState } from "react";
import resourcesApi from "@/apis/resources.api";
import FileCard from "@/components/cards/file-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadFileModal from "@/components/modals/upload-file-modal";
import usePermissions from "@/hooks/use-permissions";
import Loader from "@/components/loader";

const Home = () => {
  const {
    role,
    canViewSharedFiles,
    canDownload,
    canShare,
    canUpload,
    canView,
    canDelete,
  } = usePermissions();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [files, setFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("my-files");
  const [isLoading, setIsLoading] = useState(false);

  const fileViewButtonsObject = {
    view: canView,
    download: canDownload,
    share: canShare && activeTab === "my-files",
    delete: canDelete && activeTab === "my-files",
  };

  const getFiles = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFiles();
  }, [activeTab]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderFileCards = (files: any[]) => {
    if (files.length === 0) {
      return <div className="text-muted-foreground">No files found</div>;
    }

    return files.map((file) => (
      <FileCard
        key={file.id}
        id={file.id}
        name={file.filename}
        size={file.size}
        updatedAt={file.updated_at}
        accessType={file?.access_type}
        onDelete={() => {
          getFiles();
        }}
        viewButtons={fileViewButtonsObject}
        hideActions={activeTab === "shared-files" || role === "viewer"}
      />
    ));
  };

  return (
    <>
      {isLoading && (
        <div
          id="loader-overlay"
          className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50"
        >
          <Loader />
          {/* <div class="loader border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div> */}
        </div>
      )}
      <Tabs defaultValue="my-files" onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="my-files" className="py-2">
            My Files
          </TabsTrigger>
          <TabsTrigger
            value="shared-files"
            className="py-2"
            disabled={!canViewSharedFiles}
          >
            Shared with Me
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-files" className="space-y-2 py-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-2xl font-bold mb-4">My Files</h2>
            {canUpload && <UploadFileModal fetchData={getFiles} />}
          </div>
          <div className="flex flex-wrap gap-4">{renderFileCards(files)}</div>
        </TabsContent>
        <TabsContent value="shared-files" className="space-y-2 py-2">
          <h2 className="text-2xl font-bold mb-4">Shared with Me</h2>
          <div className="flex flex-wrap gap-4">{renderFileCards(files)}</div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Home;
