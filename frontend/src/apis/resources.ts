// user related apis

import { api } from "./index";

const resourcesApi = {
  getFiles: async function () {
    const response = await api.get("resources/files/");
    return response.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadFile: async (data: any) => {
    const response = await api.post("resources/files/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  downloadFile: async function (fileId: string) {
    const response = await api.get(`resources/files/${fileId}/download/`, {
      responseType: "blob",
    });
    return response;
  },
  deleteFile: async function (fileId: string) {
    const response = await api.delete(`resources/files/${fileId}/delete/`);
    return response.data;
  },
};

export default resourcesApi;
