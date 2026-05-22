import { useState } from "react";
import DocumentCard from "./DocumentCard.jsx";
import DocumentSkeleton from "./DocumentSkeleton.jsx";
import EmptyState from "./EmptyState.jsx";
import { useDocuments } from "../hooks/useDocuments.js";
import DocumentPreviewModal from "./DocumentPreviewModal.jsx";
import DeleteModal from "./DeleteModal.jsx"; // 1. Import your custom modal

const DocumentList = ({ onUploadClick }) => {
  const {
    documents,
    isLoadingDocuments,
    deleteDocument,
    isDeleting,
  } = useDocuments();

  const [previewDoc, setPreviewDoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); 

  const handleDeleteClick = (doc) => {
    setDeleteTarget(doc);
  };

  // 4. Actual execution logic
  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteDocument(deleteTarget._id);
      setDeleteTarget(null); 
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Document Vault</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your private documents and files
            </p>
          </div>
          <button
            onClick={onUploadClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Upload Document
          </button>
        </div>

        {/* Documents Grid */}
        {isLoadingDocuments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <DocumentSkeleton key={i} />
            ))}
          </div>
        ) : (documents || []).length === 0 ? (
          <EmptyState
            icon="FileBox"
            title="No Documents Yet"
            description="Upload your first document to get started."
            actionText="Upload Document"
            onAction={onUploadClick}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                // Pass the whole doc so we have the title for the modal
                onDelete={() => handleDeleteClick(doc)} 
                isDeleting={isDeleting}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal 
        previewDoc={previewDoc}
        closePreview={closePreview}
      />

      {/* 5. Custom Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title}
        type="Document"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default DocumentList;