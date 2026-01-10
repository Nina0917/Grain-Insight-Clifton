import axios from "axios";

export const fetchDocuments = async () => {
  const response = await axios.get("/api/documents");
  return response.data;
};
