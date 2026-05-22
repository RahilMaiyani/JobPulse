import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import DocumentList from "../components/DocumentList.jsx";
import DocumentUploadModal from "../components/DocumentUploadModal.jsx";
import { useTitle } from "../hooks/useTitle.js";

const DocumentVault = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  useTitle("Document Vault")

  return (
    <DashboardLayout>
      <div className="p-10">
        <DocumentList onUploadClick={() => setIsUploadModalOpen(true)} />
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default DocumentVault;
