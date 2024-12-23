import resourcesApi from "@/apis/resources.api";
import Error from "@/components/error";
import FileOwnerAvatar from "@/components/file-owner-avatar";
import FilePreview from "@/components/file-preview";
import { TError } from "@/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PublicFilePage = () => {
  const { uuid } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fileData, setFileData] = useState<any>({
    filename: "",
    url: "",
  });
  const [error, setError] = useState<TError["type"] | null>(null);

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
        setFileData({
          filename: response.headers["x-filename"] ?? "(untitled)",
          url,
          type: response.headers["content-type"],
          owner: response.headers["x-file-owner-email"],
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error?.status === 404) {
          setError("not-found");
        } else if (error?.status === 403) {
          setError("no-access");
        } else {
          setError("server-error");
        }
      }
    };

    fetchFileDetails();

    return () => {
      URL.revokeObjectURL(fileData.url);
    };
  }, [uuid]);

  if (error) return <Error type={error} />;

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center space-x-2">
        {fileData.owner && <FileOwnerAvatar value={fileData.owner} />}{" "}
        <h1 className="text-2xl font-bold">{fileData.filename}</h1>
      </div>
      <FilePreview file={fileData} />
    </div>
  );
};

export default PublicFilePage;
