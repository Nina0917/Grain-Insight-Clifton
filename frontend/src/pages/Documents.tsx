import React, { useState } from "react";
import axios from "axios";

export default function Documents() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // Use axios to send request
    await axios.post("/api/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setOpen(false);
    setFile(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Documents</h1>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        Upload Document
      </button>

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
