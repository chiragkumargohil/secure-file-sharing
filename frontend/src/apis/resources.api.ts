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
    const response = await api.get(`resources/files/download/${fileId}/`, {
      responseType: "blob",
    });
    console.log(response.headers);
    return response;
  },
  deleteFile: async function (fileId: string) {
    const response = await api.delete(`resources/files/${fileId}/`);
    return response.data;
  },

  // public files
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configPublicFile: async function (fileId: string, data: any) {
    const response = await api.post(
      `resources/public/files/settings/${fileId}/`,
      data
    );
    return response.data;
  },
  getPublicFileSettings: async function (fileId: string) {
    const response = await api.get(
      `resources/public/files/settings/${fileId}/`
    );
    return response.data;
  },
  viewFile: async function (fileUuid: string) {
    const response = await api.get(`resources/public/files/download/${fileUuid}/`, {
      responseType: "blob",
    });
    return response;
  },

  // shared files
  getSharedWith: async function (fileId: string) {
    const response = await api.get(`resources/shared/files/${fileId}/`);
    return response.data;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shareFile: async function (fileId: string, data: any) {
    const response = await api.post(`resources/shared/files/${fileId}/`, data);
    return response.data;
  },
  getSharedFiles: async function () {
    const response = await api.get("resources/shared/files/");
    return response.data;
  },
};

export default resourcesApi;
