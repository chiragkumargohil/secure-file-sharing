import resourcesApi from "@/apis/resources";
import FilePreview from "@/components/file-preview";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SharedFilePage = () => {
  const { uuid } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fileData, setFileData] = useState<any>({
    filename: "",
  });
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;
    const fetchFileDetails = async () => {
      try {
        const response = await resourcesApi.viewFile(uuid as string);
        const data = response.data;
        const blob = new Blob([data], {
          type: response.headers["content-type"],
        });
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
        setFileData({
          filename: "chisel.pdf",
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchFileDetails();
  }, [uuid]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">File Preview: {fileData.filename}</h1>
      <FilePreview
        file={{
          filename: fileData.filename,
          fileUrl,
        }}
      />
    </div>
  );
};

export default SharedFilePage;
