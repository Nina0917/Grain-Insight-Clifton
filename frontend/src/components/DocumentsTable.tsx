import { useState, useRef, useEffect } from "react";
import { tokenManager } from "../utils/tokenManager";

// Material Icons imports
import DownloadIcon from "@mui/icons-material/Download";
import ImageIcon from "@mui/icons-material/Image";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableChartIcon from "@mui/icons-material/TableChart";
import MapIcon from "@mui/icons-material/Map";
import GridOnIcon from "@mui/icons-material/GridOn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import CloseIcon from "@mui/icons-material/Close";

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState<number>(1);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleDownload = async (
    doc: Document,
    fileType: string,
    filename: string
  ) => {
    const token = tokenManager.getToken();
    if (!token) {
      alert("Please login again");
      return;
    }

    setDownloading(`${doc.id}-${fileType}`);
    try {
      const url = `/api/documents/${doc.id}/download/${fileType}`;
      await downloadFile(url, filename, token);
    } finally {
      setDownloading(null);
    }
  };

  const handlePreviewOriginal = async (doc: Document) => {
    const token = tokenManager.getToken();
    if (!token) {
      alert("Please login again");
      return;
    }

    try {
      const response = await fetch(
        `/api/documents/${doc.id}/download/original`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to load image");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewImage(url);
    } catch (error) {
      alert("Failed to load image");
    }
  };

  const closePreview = () => {
    if (previewImage) {
      window.URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
      setImageScale(1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setImageScale((prevScale) => {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = prevScale + delta;
      return Math.min(Math.max(newScale, 0.5), 5);
    });
  };

  const getBaseName = (filename: string) => {
    return filename.replace(/\.[^/.]+$/, "");
  };

  const isCompleted = (status: string) => {
    return status === "Processed";
  };

  const toggleMenu = (docId: string) => {
    setOpenMenuId(openMenuId === docId ? null : docId);
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
              <td>
                <button
                  onClick={() => handlePreviewOriginal(doc)}
                  className="link link-primary hover:link-secondary cursor-pointer text-left bg-transparent border-0 p-0"
                >
                  {doc.original_filename}
                </button>
              </td>

              <td>
                {doc.status.name === "Processing" && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                {isCompleted(doc.status.name) && (
                  <span className="text-success">✔ Completed</span>
                )}
                {doc.status.name === "Error" && (
                  <span className="text-error">✘ Failed</span>
                )}
              </td>

              <td>{new Date(doc.uploaded_at).toLocaleString()}</td>

              <td>
                {isCompleted(doc.status.name) ? (
                  <div className="relative">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => toggleMenu(doc.id)}
                      disabled={downloading?.startsWith(doc.id)}
                    >
                      {downloading?.startsWith(doc.id) ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <>
                          <DownloadIcon fontSize="small" />
                          Download
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-sm btn-outline btn-disabled"
                    disabled
                  >
                    Download
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closePreview}
          onWheel={handleWheel}
        >
          <button
            className="absolute top-4 right-4 btn btn-circle btn-ghost text-white hover:bg-white/20 z-10"
            onClick={closePreview}
          >
            <CloseIcon fontSize="large" />
          </button>

          <img
            src={previewImage}
            alt="Preview"
            style={{
              transform: `scale(${imageScale})`,
              transition: "transform 0.1s ease-out",
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Download Modal - Renders above everything */}
      {openMenuId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div
            ref={menuRef}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 w-80 max-h-[80vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">Download Files</h3>
              <button
                onClick={() => setOpenMenuId(null)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-2">
              {(() => {
                const doc = documents.find((d) => d.id === openMenuId);
                if (!doc) return null;
                const baseName = getBaseName(doc.original_filename);

                return (
                  <>
                    {/* Visualization Section */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Visualization
                    </div>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => {
                        handleDownload(doc, "grains", `${baseName}_grains.jpg`);
                        setOpenMenuId(null);
                      }}
                    >
                      <ImageIcon className="text-blue-500" />
                      <span>Grains Overlay</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => {
                        handleDownload(
                          doc,
                          "histogram",
                          `${baseName}_histogram.jpg`
                        );
                        setOpenMenuId(null);
                      }}
                    >
                      <BarChartIcon className="text-green-500" />
                      <span>Size Histogram</span>
                    </button>

                    {/* Data Section */}
                    <div className="px-3 py-2 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Data
                    </div>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => {
                        handleDownload(doc, "csv", `${baseName}_summary.csv`);
                        setOpenMenuId(null);
                      }}
                    >
                      <TableChartIcon className="text-orange-500" />
                      <span>Summary CSV</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => {
                        handleDownload(
                          doc,
                          "geojson",
                          `${baseName}_grains.geojson`
                        );
                        setOpenMenuId(null);
                      }}
                    >
                      <MapIcon className="text-purple-500" />
                      <span>GeoJSON</span>
                    </button>

                    {/* Masks Section */}
                    <div className="px-3 py-2 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Masks
                    </div>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => {
                        handleDownload(doc, "mask", `${baseName}_mask.png`);
                        setOpenMenuId(null);
                      }}
                    >
                      <GridOnIcon className="text-gray-600" />
                      <span>Mask (PNG)</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => {
                        handleDownload(
                          doc,
                          "mask-preview",
                          `${baseName}_mask_preview.jpg`
                        );
                        setOpenMenuId(null);
                      }}
                    >
                      <VisibilityIcon className="text-teal-500" />
                      <span>Mask Preview</span>
                    </button>

                    {/* Download All */}
                    <div className="border-t border-gray-200 mt-2 pt-2 p-2">
                      <button
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors font-semibold"
                        onClick={() => {
                          handleDownload(doc, "all", `${baseName}_results.zip`);
                          setOpenMenuId(null);
                        }}
                      >
                        <FolderZipIcon />
                        <span>Download All (ZIP)</span>
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentsTable;
