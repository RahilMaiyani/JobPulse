import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useUserDocuments } from "../hooks/useDocuments.js";
import DocumentSkeleton from "./DocumentSkeleton.jsx";
import DocumentCard from "./DocumentCard.jsx";
import EmptyState from "./EmptyState.jsx";

const AdminDocumentViewer = ({ userId, userName }) => {
  const { user } = useAuth();
  const { documents, isLoadingUserDocuments } = useUserDocuments(userId);
  const [previewDoc, setPreviewDoc] = useState(null);

  // We'll use a dummy delete handler for admins viewing documents
  const handleDelete = () => {
    // This should not be called from here, but included for consistency
  };

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
  };

  const closePreview = () => {
    setPreviewDoc(null);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Documents for {userName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Viewing {documents.length} document(s)
          </p>
        </div>

        {/* Documents Grid */}
        {isLoadingUserDocuments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <DocumentSkeleton key={i} />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon="FileBox"
            title="No Documents Found"
            description="This user has not uploaded any documents yet."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onDelete={handleDelete}
                isDeleting={false}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {previewDoc.title}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {previewDoc.fileType === "pdf" ? (
                <iframe
                  src={previewDoc.fileUrl}
                  className="w-full h-96"
                  title={previewDoc.title}
                />
              ) : ["jpg", "jpeg", "png", "gif"].includes(
                  previewDoc.fileType
                ) ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">
                    Cannot preview this file type
                  </p>
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDocumentViewer;
