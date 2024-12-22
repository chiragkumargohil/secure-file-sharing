import resourcesApi from "@/apis/resources.api";
import Error from "@/components/error";
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
          filename: response.headers["content-disposition"],
          url,
          type: response.headers["content-type"],
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
  }, [uuid]);

  if (error) return <Error type={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        File Preview: {fileData.filename}
      </h1>
      <FilePreview file={fileData} />
    </div>
  );
};

export default PublicFilePage;
