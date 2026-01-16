import { useState } from "react";
import { tokenManager } from "../utils/tokenManager";

interface Document {
  id: string;
  user_id: string;
  status_id: string;
  status: {
    id: string;
    name: string;
  };
  original_filename: string;
  stored_filename: string;
  file_path: string;
  content_type: string;
  uploaded_at: string;
}

interface DocumentsTableProps {
  documents: Document[];
}

function DocumentsTable({ documents }: DocumentsTableProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadFile = async (url: string, filename: string, token: string) => {
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        alert("Your session has expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Download failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Download failed");
    }
  };

  const getToken = () => {
    return tokenManager.getToken();
  };

  const handleDownloadCSV = async (doc: Document) => {
    const token = getToken();
    if (!token) {
      alert("Please login again");
      return;
    }

    setDownloading(`${doc.id}-csv`);
    try {
      const url = `/api/documents/${doc.id}/download/csv`;
      const filename = `${doc.original_filename.replace(/\.[^/.]+$/, "")}_results.csv`;
      await downloadFile(url, filename, token);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadMask = async (doc: Document) => {
    const token = getToken();
    if (!token) {
      alert("Please login again");
      return;
    }

    setDownloading(`${doc.id}-mask`);
    try {
      const url = `/api/documents/${doc.id}/download/mask`;
      const filename = `${doc.original_filename.replace(/\.[^/.]+$/, "")}_mask.png`;
      await downloadFile(url, filename, token);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async (doc: Document) => {
    const token = getToken();
    if (!token) {
      alert("Please login again");
      return;
    }

    setDownloading(`${doc.id}-all`);
    try {
      const url = `/api/documents/${doc.id}/download/all`;
      const filename = `${doc.original_filename.replace(/\.[^/.]+$/, "")}_results.zip`;
      await downloadFile(url, filename, token);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-auto border border-gray-300 rounded-lg">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Uploaded At</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.original_filename}</td>

              <td>
                {doc.status.name === "Processing" && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                {doc.status.name === "Processed" && (
                  <span className="text-success">✔ Completed</span>
                )}
                {doc.status.name === "Error" && (
                  <span className="text-error">✘ Failed</span>
                )}
              </td>

              <td>{new Date(doc.uploaded_at).toLocaleString()}</td>

              <td>
                {doc.status.name === "Processed" ? (
                  <div className="dropdown dropdown-end">
                    <button
                      tabIndex={0}
                      className="btn btn-sm btn-outline"
                      disabled={downloading?.startsWith(doc.id)}
                    >
                      {downloading?.startsWith(doc.id) ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download
                        </>
                      )}
                    </button>

                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10 max-h-60 overflow-y-auto"
                    >
                      <li>
                        <button type="button" onClick={() => handleDownloadCSV(doc)}>
                          📊 CSV Results
                        </button>
                      </li>
                      <li>
                        <button type="button" onClick={() => handleDownloadMask(doc)}>
                          🖼️ Mask Image
                        </button>
                      </li>
                      <li className="border-t border-gray-200 mt-1 pt-1">
                        <button type="button" onClick={() => handleDownloadAll(doc)}>
                          📦 Download All (ZIP)
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <button className="btn btn-sm btn-outline btn-disabled" disabled>
                    Download
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DocumentsTable;
