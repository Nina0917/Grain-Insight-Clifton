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
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-auto border border-gray-300 rounded-lg">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Uploaded At</th>
            <th></th>
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
              </td>

              <td>{new Date(doc.uploaded_at).toLocaleString()}</td>

              <td>
                {/* To DO: implement download functionality */}
                <button className="btn btn-sm btn-outline">Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DocumentsTable;
