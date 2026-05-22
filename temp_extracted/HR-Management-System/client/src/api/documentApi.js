import API from "./axios.js";


export const uploadDocumentApi = (formData) => {
  return API.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


export const getMyDocumentsApi = () => {
  return API.get("/documents/my-documents");
};

export const getUserDocumentsApi = (userId) => {
  return API.get(`/documents/user/${userId}`);
};


export const getDocumentByIdApi = (id) => {
  return API.get(`/documents/${id}`);
};

export const deleteDocumentApi = (id) => {
  return API.delete(`/documents/${id}`);
};


export const updateDocumentApi = (id, data) => {
  return API.put(`/documents/${id}`, data);
};
