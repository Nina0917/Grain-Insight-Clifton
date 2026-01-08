import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchDocuments as fetchDocumentsApi } from "../api/documents";
import DocumentsTable from "../components/DocumentsTable";

export default function Documents() {
  const [open, setOpen] = useState(false); // determines if the upload modal is open
  const [file, setFile] = useState<File | null>(null);

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    fetchDocumentsApi()
      .then(setDocuments)
      .finally(() => setLoading(false));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const pollDocumentStatus = async (id: number) => {
    const res = await axios.get(`/api/documents/${id}`);
    return res.data;
  };

  const startPolling = (documentId: number) => {
    const interval = setInterval(async () => {
      try {
        const data = await pollDocumentStatus(documentId);

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  status: data.status,
                  result_csv_url: data.result_csv_url,
                  result_mask_url: data.result_mask_url,
                  error_message: data.error_message,
                }
              : doc
          )
        );

        if (data.status.name === "Processed" || data.status.name === "Error") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling failed", err);
        clearInterval(interval);
      }
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // Use axios to send request
    const res = await axios.post("/api/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const newDoc = {
      id: res.data.id,
      filename: file.name,
      status: { id: null, name: "Processing" },
    };

    // update documents immediately
    fetchDocuments();

    startPolling(res.data.id);

    setOpen(false);
    setFile(null);
  };

  if (loading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Documents</h1>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          Upload Document
        </button>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Documents</h1>
        <DocumentsTable documents={documents} />
      </div>

      {/* Modal */}
      {open && (
        <dialog className="modal modal-open">
          <form className="modal-box" onSubmit={handleSubmit}>
            <h3 className="font-bold text-lg mb-4">Upload Document</h3>
            <input
              type="file"
              className="file-input file-input-bordered w-full mb-4"
              onChange={handleFileChange}
            />
            <div className="modal-action">
              <button
                className="btn"
                type="button"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
              <button className="btn btn-primary" type="submit">
                Upload
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
}
